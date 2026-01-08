// 交互模块
import { GeoJSON } from 'ol/format'
import { Map } from 'ol'
import { altKeyOnly, click, pointerMove } from 'ol/events/condition.js'
import Feature, { FeatureLike } from 'ol/Feature'
import Select from 'ol/interaction/Select'
import { Layer } from 'ol/layer'
import { StyleLike } from 'ol/style/Style'
import { ImageWMS, TileWMS } from 'ol/source'
import { Geometry } from 'ol/geom'

// 定义配置项
export interface SelectOptions {
  /** 参与交互的图层 (包含 Vector 和 WMS) */
  layers?: Layer<any, any>[]
  /** 高亮样式 */
  getStyle?: Function
  style?: StyleLike
  /** 是否支持多选 */
  multi?: boolean
}

// 定义回调返回的数据结构
export interface SelectResult {
  feature: any // OL 的 Feature 对象
  properties: any // 核心业务数据 (GeoJSON properties)
  layer: Layer<any, any> | null // 所在的图层
  event: any // 事件对象
}

export interface UseSelectResult {
  onSelect: (result: (SelectResult) => void) => void
  clear: () => void
  destroy: () => void
}

let selectInteraction: Select | null = null

export function useSelect(map: Map, options: SelectOptions = {}): UseSelectResult {
  const geoJSONFormat = new GeoJSON()

  // 1. 创建原生的 Select 交互
  // 这负责处理所有的 Vector 点击、样式切换和选中集合管理
  selectInteraction = new Select({
    condition: click,
    multi: options.multi || false,
    style: (feature: FeatureLike) => {
      if (typeof options.getStyle === 'function') {
        const layerName = feature.get('layerName')
        return options.getStyle(layerName, feature)
      } else {
        return options.style
      }
    }, // 高亮选中样式
    // 过滤：只允许配置中的图层被选中 (仅对 Vector 有效)
    layers: options.layers ? (l) => options.layers!.includes(l) : undefined
  })

  map.addInteraction(selectInteraction)

  // 获取 Select 内部维护的选中要素集合
  const selectedFeatures = selectInteraction.getFeatures()

  // 2. 监听 Select 的清空行为
  // 当用户点击地图空白处，Select 会自动清空集合。
  // 但对于 WMS，我们需要监听地图点击来发起请求。

  const handleMapClick = async (evt: any) => {
    // 如果不是多选模式，且 Select 已经选中了 Vector，
    // 这里需要决策：是“共存”还是“互斥”？
    // 通常 WMS 和 Vector 可能重叠，建议共存。

    // 筛选 WMS 图层
    const wmsLayers = (options.layers || map.getLayers().getArray()).filter((layer: Layer<any, any>) => {
      const source = layer.getSource()
      return layer.getVisible() && (source instanceof TileWMS || source instanceof ImageWMS)
    })

    if (wmsLayers.length === 0) return

    const view = map.getView()

    // 并发请求所有 WMS
    const wmsPromises = wmsLayers.map(async (layer: Layer<any, any>) => {
      const source = layer.getSource() as TileWMS | ImageWMS
      const url = source.getFeatureInfoUrl(evt.coordinate, view.getResolution()!, view.getProjection(), {
        INFO_FORMAT: 'application/json', // 必须是 JSON 才能转 Feature
        FEATURE_COUNT: 1
      })

      if (url) {
        try {
          const res = await fetch(url)
          const data = await res.json()
          if (data.features && data.features.length > 0) {
            // 解析 Feature
            const features = geoJSONFormat.readFeatures(data)

            // 💡 技巧：给 Feature 绑定原始图层信息，方便回调里区分
            features.forEach((f) => {
              f.set('wms_layer_source', layer)
              f.set('wms_event_source', evt)
              f.set('layerName', layer.get('name'))
            })

            return features
          }
        } catch (e) {
          console.warn(e)
        }
      }
      return []
    })

    const wmsResults = await Promise.all(wmsPromises)
    const newWmsFeatures = wmsResults.flat()

    // -----------------------------------------------------------
    // 🟢 核心魔法：将 WMS 要素注入到 Select 的集合中
    // -----------------------------------------------------------
    if (newWmsFeatures.length > 0) {
      if (!options.multi) {
        // 如果是单选，且刚才 Select 没选中 Vector，或者策略是 WMS 优先
        // 我们可以选择清空之前的 (取决于你的业务逻辑)
        // selectedFeatures.clear();
      }

      // 将 WMS 解析出的要素加入集合
      // Select Interaction 监测到集合变化，会自动应用高亮样式！
      selectedFeatures.extend(newWmsFeatures as any)

      // 手动触发一次 select 事件，通知外部监听者（因为 .extend 不会触发 select 事件）
      selectInteraction.dispatchEvent({
        type: 'select',
        selected: newWmsFeatures,
        deselected: [],
        mapBrowserEvent: evt
      } as any)
    }
  }

  // 监听地图点击（用于处理 WMS）
  map.on('singleclick', handleMapClick)

  // -----------------------------------------------------------
  // 3. 统一对外暴露接口
  // -----------------------------------------------------------
  const callbacks = new Set<Function>()

  selectInteraction.on('select', (e) => {
    // 这里的 e.selected 可能包含 Vector (原生选中) 和 WMS (手动注入)
    const allSelected = selectedFeatures.getArray()

    if (allSelected.length > 0) {
      // 统一格式化输出
      const result = allSelected.map((feature) => ({
        feature: feature,
        properties: feature.getProperties(),
        // 如果是 WMS 注入的，我们在上面 set 过了；如果是 Vector，用 native 方法获取
        layer: feature.get('wms_layer_source') || selectInteraction.getLayer(feature),
        event: feature.get('wms_event_source') || e
      }))

      notify(result)
    } else {
      notify(null)
    }
  })

  const notify = (res: SelectResult[] | null) => callbacks.forEach((cb) => cb(res))

  return {
    onSelect: (cb: (res: SelectResult) => void) => {
      callbacks.add(cb)
      return () => callbacks.delete(cb)
    },
    clear: () => {
      callbacks.clear()
      selectedFeatures.clear()
    },
    destroy: () => {
      map.removeInteraction(selectInteraction)
      map.un('singleclick', handleMapClick)
      callbacks.clear()
    }
  }
}
