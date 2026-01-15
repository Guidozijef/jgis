import { Map } from 'ol'
import type { Feature } from 'ol'
import type { FeatureLike } from 'ol/Feature'
import type { Layer } from 'ol/layer'
import { Geometry } from 'ol/geom'
import { TileWMS, ImageWMS } from 'ol/source'
import { customFeature, FlashOptions, HighLightOptions } from './types'
import { boundingExtent } from 'ol/extent'
import { getSourceByName } from './source'

type dataType = { lttd?: number; lgtd?: number } & { jd?: number; wd?: number } & {
  latitude?: number
  longitude?: number
} & {
  lon?: number
  lat?: number
}
/**
 * 解析出数据中的经纬度
 * @param data 数据
 * @returns [经度, 纬度]
 */
export function getLonLat(data: dataType, options?: { lonLabel: string; latLabel: string }): [number, number] {
  if (typeof data !== 'object' || data === null) return null
  if (options && options.lonLabel && options.latLabel) {
    return [Number(data[options.lonLabel]), Number(data[options.latLabel])]
  } else if (data.lttd && data.lgtd) {
    return [Number(data.lgtd), Number(data.lttd)]
  } else if (data.jd && data.wd) {
    return [Number(data.jd), Number(data.wd)]
  } else if (data.latitude && data.longitude) {
    return [Number(data.longitude), Number(data.latitude)]
  } else if (data.lon && data.lat) {
    return [Number(data.lon), Number(data.lat)]
  }
  return null
}

/**
 * 根据图层名称删除图层
 * @param map 地图实例
 * @param layerName 图层名称
 */
export function removeLayerByName(map: Map, layerName: string) {
  const layers = map.getLayers().getArray()
  layers.forEach((layer) => {
    if (layer.get('name') == layerName) {
      // 只有VectorLayer等才有setSource
      if ('setSource' in layer) {
        ;(layer as any).setSource(null)
      }
      if ('dispose' in layer) {
        ;(layer as any).dispose()
      }
      map.removeLayer(layer)
    }
  })
}

/**
 * 高亮要素
 * @param layerName 图层名称
 * @param feature 要素
 * @param options 配置
 * @param zoomFlag 是否高亮 默认false
 */
export function lightFeature(
  layerName: string,
  feature: FeatureLike,
  options: HighLightOptions,
  zoomFlag = false
): void {
  const style = zoomFlag ? options.style || options.getStyle(layerName, feature as Feature<Geometry>) : undefined
  const index = zoomFlag ? 999 : -1
  if (style && typeof (style as any).setZIndex === 'function') {
    ;(style as any).setZIndex(index)
  }
  ;(feature as Feature<Geometry>).setStyle(style)
}

/**
 * 闪烁要素
 * @param layerName 图层名称
 * @param feature 要素
 * @param options 配置
 */
export function flashFeature(layerName: string, feature: FeatureLike & customFeature, options: FlashOptions) {
  if (!feature) return
  const flashInterval = options.time || 300 // 300ms闪烁一次
  let lastFlashTime = Date.now()
  let flashOn = false
  let timer = 0
  feature.running = true
  function animate() {
    if (!feature.running) return
    const now = Date.now()
    const elapsed = now - lastFlashTime
    if (elapsed >= flashInterval) {
      flashOn = !flashOn
      lastFlashTime = now
      lightFeature(layerName, feature, options, flashOn)
      ;(feature as Feature<Geometry>).changed()
    }
    timer = requestAnimationFrame(animate)
  }
  animate()
  feature.clearFlash = () => {
    feature.running = false
    cancelAnimationFrame(timer)
    ;(feature as Feature<Geometry>).setStyle(undefined)
  }
}

/**
 * 根据数据查询要素
 * @param layerName 图层名称
 * @param properties 数据
 * @returns Feature 要素
 */
export function queryFeature(map: Map, layerName: string, properties: any): FeatureLike {
  if (!properties) return
  let coordinate = getLonLat(properties)
  const allFeatures = getSourceByName(map, layerName)?.getFeatures?.()
  if (!allFeatures) return
  let clickedFeature = allFeatures.find(function (feature: FeatureLike) {
    const geom = feature.getGeometry()
    if (geom && geom instanceof Geometry && typeof geom.intersectsCoordinate === 'function') {
      return geom.intersectsCoordinate(coordinate)
    }
    return false
  })
  return clickedFeature
}

export function getSelectedFtByEvt(event: any): { layerName?: string; feature?: FeatureLike; properties?: any } {
  const pixel = this.Map.getEventPixel(event.originalEvent)
  const res = this.Map.forEachFeatureAtPixel(pixel, (feature: FeatureLike, layer: any) => {
    return {
      feature: feature,
      layer: layer
    }
  })
  if (!res) {
    return {}
  }
  let layer = res.layer,
    feature = res.feature,
    properties

  if (layer && layer.getProperties) {
    const layerProperties = layer.getProperties()
    const feaProperties = feature.getProperties()
    if (!layerProperties.visible) {
      return {}
    }
    if (feaProperties.features && feaProperties.features.length > 1) {
      if (feaProperties.features.length > 1) {
        if (event.type === 'click') {
          if (layerProperties.name === 'ggzy_jksp') return {}
          const extent = boundingExtent(
            feaProperties.features.map((r: FeatureLike) => {
              const geom = r.getGeometry()
              if (geom && geom instanceof Geometry && typeof (geom as any).getCoordinates === 'function') {
                return (geom as any).getCoordinates()
              }
              return undefined
            })
          )
          this.centerToMapByExtent(extent)
        }
        return {}
      }
      const firstFt = feaProperties.features[0]
      feature = firstFt
      properties = firstFt.getProperties()
      if (properties.properties) {
        properties = properties.properties
      }
    } else {
      properties = feaProperties.properties || feaProperties
    }
    return {
      layerName: layerProperties.name,
      feature,
      properties
    }
  } else {
    return {}
  }
}

export function getSelectedFtByWms(evt: any) {
  var view = this.Map.getView()
  var layers = this.Map.getLayers(),
    wmsLayers: Record<string, any> = {}
  function isWMSLayer(layer) {
    const source = layer.getSource()
    return source instanceof TileWMS || source instanceof ImageWMS
  }
  layers.forEach((item) => {
    const layerName = item.get('layerName') || item.get('name')
    if (isWMSLayer(item)) {
      wmsLayers[layerName] = item
    }
  })
  var requestArr: any = [],
    layerIndexArr: any = [],
    layerNameArr: any = []
  for (const i in wmsLayers) {
    if (!Object.prototype.hasOwnProperty.call(wmsLayers, i)) continue
    const wmsLayer = wmsLayers[i]
    if (wmsLayer.getVisible()) {
      const url = wmsLayer.getSource().getFeatureInfoUrl(evt.coordinate, view.getResolution(), view.getProjection(), {
        INFO_FORMAT: 'application/json'
      })
      requestArr.push(axios.get(url))
      layerIndexArr.push(wmsLayer.getZIndex())
      layerNameArr.push(i)
    }
  }
  return axios.all(requestArr).then(
    axios.spread((...resData: unknown[]) => {
      //遍历获取最高层级图层
      var selectIndex = -1,
        layerIndex = -1
      resData.forEach((item: unknown, index: number) => {
        if (typeof item === 'object' && item && 'data' in item) {
          const features = (item as any).data.features
          if (features && features.length > 0) {
            if (layerIndex < layerIndexArr[index]) {
              selectIndex = index
            }
          }
        }
      })
      let layerName: string | null = null,
        data: any = null
      if (selectIndex > -1) {
        layerName = layerNameArr[selectIndex]
        data = resData[selectIndex]
      }
      if (!data || typeof data !== 'object' || !('data' in data)) return
      let features = (data as any).data.features
      if (features && features.length > 0) {
        let feature = features[0]
        if (!layerName) {
          let name = feature.id.split('.')[0]
          layerName = name.replace(name.split('_')[0] + '_', '')
        }
        return {
          layerName: layerName,
          feature: feature,
          properties: feature.properties
        }
      }
    })
  )
}
