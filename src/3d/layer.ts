import * as Cesium from 'cesium'
import { addTDTImageryProvider } from './baseMap'
import { WmsOptions, ILineOptions, optionsMap } from './types'
import { getLonLat } from '../index'

/**
 * 初始化地图
 * @param {Cesium.Viewer} viewer 视图
 * @param {any} options 配置项
 */
export function createBaseLayer(viewer: Cesium.Viewer, options: any): void {
  addTDTImageryProvider(viewer, options)
}

/**
 * 创建图层
 * @param {Cesium.Viewer} viewer {Map} 地图
 * @param {string} layerName 图层名称
 * @param {any} data 数据
 * @param options 配置项
 * @returns 图层
 */
export function createLayer<K extends keyof optionsMap>(viewer: Cesium.Viewer, layerName: string, data: any, options?: optionsMap[K] & { type?: K }) {
  if (!options || !options.type) {
    options = Object.assign({}, data, options)
  }
  const type: K = options.type || 'Point'
  let layer
  switch (type) {
    case 'Point':
      layer = createPointLayer(viewer, layerName, data, options)
      break
    case 'EntityPoint':
      layer = createEntityPointLayer(viewer, layerName, data, options)
      break
    case 'MultiLineString':
    case 'LineString':
      layer = createLineLayer(viewer, layerName, data, options)
      break
    case 'Wms':
      data = data || options
      layer = createWmsLayer(viewer, layerName, data as optionsMap[K])
      break
    case 'Polygon':
    case 'MultiPolygon':
      //   layer = createVectorLayer(layerName, data, map, options)
      break
    case 'Circle':
      //   layer = createBufferCircle(layerName, data, map, options)
      break
    case 'Overlay':
      //   layer = createOverlayLayer(layerName, map, options)
      break
  }
  return layer
}

/**
 * 创建点图层
 * @param viewer 视图
 * @param layerName 图层名称
 * @param data 数据
 * @param options 配置项
 */
export function createPointLayer(viewer: Cesium.Viewer, layerName: string, data: any[], options: optionsMap['Point']): Cesium.BillboardCollection {
  // const primitive = viewer.scene.primitives.add(new Cesium.BillboardCollection())
  const primitives = new Cesium.PrimitiveCollection()
  ;(primitives as any)._layerName = layerName
  const primitive = primitives.add(new Cesium.BillboardCollection())

  data.forEach((item, index) => {
    const defaultOptions = {
      scale: 1, // 缩放比例
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 以底部为定位中心
      show: true,
      disableDepthTestDistance: Number.POSITIVE_INFINITY, // 禁止深度测试距离
      scaleByDistance: new Cesium.NearFarScalar(1, 1, 100000, 0.2) // 根据相机距离缩放
    }
    const customOptions = {
      position: Cesium.Cartesian3.fromDegrees(...getLonLat(item), 1),
      image: options.image || options.getImage(item),
      id: item.id || `${layerName}_point_${index}`
    }
    const b = primitive.add({ ...defaultOptions, ...options, ...customOptions })
    b._originStyle = { ...defaultOptions, ...options, ...customOptions, color: Cesium.Color.WHITE }
    b._properties = item
    b._layerName = layerName
    b._index = index
  })

  viewer.scene.primitives.add(primitives)
  // 要请求渲染 因为使用了配置 requestRenderMode: true 不然地图会不响应 要操作地图点位才会出现
  viewer.scene.requestRender()
  return primitive
}

/**
 * 创建实体点图层
 * @param viewer 视图
 * @param layerName 图层名称
 * @param data 数据
 * @param options 配置项
 * @returns {Cesium.DataSource}
 */
export function createEntityPointLayer(
  viewer: Cesium.Viewer,
  layerName: string,
  data: any[],
  options: optionsMap['EntityPoint']
): Cesium.DataSourceCollection {
  const dataSource = new Cesium.CustomDataSource(layerName)
  ;(dataSource as any)._layerName = layerName

  for (let i = 0; i < data.length; i++) {
    const item = data[i]

    const defaultOptions = {
      scale: 1, // 缩放比例
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 以底部为定位中心
      show: true,
      disableDepthTestDistance: Number.POSITIVE_INFINITY, // 禁止深度测试距离
      scaleByDistance: new Cesium.NearFarScalar(1, 1, 100000, 0.2) // 根据相机距离缩放
    }
    const entitie: any = dataSource.entities.add({
      id: item.id || `${layerName}_entityPoint_${i}`,
      position: Cesium.Cartesian3.fromDegrees(...getLonLat(item), 1),
      billboard: {
        image: options.image || options.getImage(item),
        ...defaultOptions,
        ...options
      }
    })
    entitie._originStyle = { image: options.image || options.getImage(item), ...defaultOptions, ...options, color: Cesium.Color.WHITE }
    entitie._layerName = layerName
    entitie._properties = item
    entitie._index = i
  }

  viewer.dataSources.add(dataSource)
  viewer.scene.requestRender()
  return viewer.dataSources
}

/**
 * 创建线图层
 * @param viewer 视图
 * @param layerName 图层名称
 * @param data 数据
 * @param options 配置项
 * @returns {Cesium.GroundPolylinePrimitive}
 */
export function createLineLayer(viewer: any, layerName: string, data: any[], options: optionsMap['LineString']): Cesium.GroundPolylinePrimitive {
  if (data.length < 2) return
  const geometryInstances = createPolylineGeometry(data, options)

  const primitive = new Cesium.GroundPolylinePrimitive({
    geometryInstances: geometryInstances,
    appearance: new Cesium.PolylineColorAppearance({
      translucent: true
    }),
    interleave: true,
    allowPicking: true,
    asynchronous: false
  })

  ;(primitive as any)._layerName = layerName
  viewer.scene.groundPrimitives.add(primitive)
  return primitive
}

function createPolylineGeometry(data: any[], options: ILineOptions) {
  const geometryInstances = []

  const positions = data.map((item) => Cesium.Cartesian3.fromDegrees(...getLonLat(item), 0))
  const polylineGeometry = new Cesium.GroundPolylineGeometry({
    positions: positions,
    width: options.width || 2.0,
    granularity: options.granularity || 2000
  })

  const instance = new Cesium.GeometryInstance({
    id: 'pipeLine',
    geometry: polylineGeometry,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(options.color))
    }
  })
  geometryInstances.push(instance)

  return geometryInstances
}

/**
 * 创建wms图层
 * @param viewer 视图
 * @param layerName 图层名称
 * @param options 配置项
 * @returns {Cesium.ImageryLayer}
 */
export function createWmsLayer(viewer: Cesium.Viewer, layerName: string, options: WmsOptions): Cesium.ImageryLayer {
  const imageryProvider = new Cesium.WebMapServiceImageryProvider({
    url: options.url,
    layers: options.layers,
    parameters: {
      service: 'WMS',
      version: '1.1.1',
      request: 'GetMap',
      transparent: true,
      format: 'image/png'
    }
  })
  ;(imageryProvider as any)._layerName = layerName
  const layer = viewer.imageryLayers.addImageryProvider(imageryProvider)
  layer.alpha = options.alpha || 0.5
  layer.brightness = options.brightness || 1.0
  layer.contrast = options.contrast || 1.0
  layer.gamma = options.gamma || 1.0
  return layer
}

/**
 * 创建空白图层
 * @param viewer 视图
 * @param layerName 图层名称
 * @returns {Cesium.DataSource}
 */
export function createBlankLayer(viewer: Cesium.Viewer, layerName: string): Cesium.Primitive {
  const primitive = viewer.scene.primitives.add(new Cesium.BillboardCollection())
  primitive._layerName = layerName
  return primitive
}

/**
 * 根据图层名获取图层
 * @param viewer 视图
 * @param layerName 图层名
 * @returns {Primitive} 图层
 */
export function getLayerByName(viewer: Cesium.Viewer, layerName: string): Cesium.BillboardCollection | Cesium.EntityCollection {
  const primitives = viewer.scene.primitives

  for (let i = 0; i < primitives.length; i++) {
    const primitive = primitives.get(i)
    // 检查是否有我们之前绑定的标识
    if (primitive._layerName === layerName) {
      return primitive.get(0)
    }
  }

  const dataSources = viewer.dataSources
  for (let i = 0; i < dataSources.length; i++) {
    const ds = dataSources.get(i)
    if ((ds as any)._layerName === layerName) {
      return ds.entities
    }
  }

  return null
}

/**
 * 删除图层
 * @param viewer 视图
 * @param layerName 图层名
 */
export function removeLayer(viewer, layerName) {
  const layer = getLayerByName(viewer, layerName)
  if (layer instanceof Cesium.BillboardCollection) {
    layer.removeAll()
  } else if (layer instanceof Cesium.EntityCollection) {
    layer.removeAll()
  } else {
    console.warn('Layer not found:', layerName)
  }
  setTimeout(() => {
    viewer.scene.requestRender()
  })
}

/**
 * 隐藏图层
 * @param {Cesium.Viewer} viewer 视图
 * @param {string} layerName 图层名
 * @param {boolean} visible 图层名
 */
export function visibleLayer(viewer: Cesium.Viewer, layerName: string, visible: boolean) {
  const layer = getLayerByName(viewer, layerName)
  if (layer) {
    layer.show = visible
  } else {
    console.warn('Primitive not found:', layerName)
  }
}
