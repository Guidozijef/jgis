import * as Cesium from 'cesium'
import { addTDTImageryProvider } from './baseMap'
import { LayerOptions } from './types'
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
export function createLayer(viewer: Cesium.Viewer, layerName: string, data: any, options: any) {
  if (!options || !options.type) {
    options = Object.assign({}, data, options)
  }
  const type = options.type || 'Point'
  let layer
  switch (type) {
    case 'Point':
      layer = createPointLayer(viewer, layerName, data, options)
      break
    case 'LineString':
      layer = createLineLayer(viewer, layerName, data, options)
      break
    case 'MultiLineString':
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
export function createPointLayer(
  viewer: Cesium.Viewer,
  layerName: string,
  data: any[],
  options: Cesium.Billboard.ConstructorOptions & { style?: any; getStyle?: (item: any) => any }
) {
  const billboards = viewer.scene.primitives.add(new Cesium.BillboardCollection())
  billboards._layerName = layerName

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
      image: options.style || options.getStyle(item),
      id: item.id || `point_${index}`
    }
    const b = billboards.add({ ...defaultOptions, ...options, ...customOptions })
    b.properties = item
  })
  // 要请求渲染 因为使用了配置 requestRenderMode: true 不然地图会不响应 要操作地图点位才会出现
  viewer.scene.requestRender()
  return billboards
}

export function createLineLayer(viewer: any, layerName: string, data: any[], options: any) {
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
}

function createPolylineGeometry(data: any[], options: any) {
  const geometryInstances = []

  const positions = data.map((item) => Cesium.Cartesian3.fromDegrees(...getLonLat(item), 0))
  const polylineGeometry = new Cesium.GroundPolylineGeometry({
    positions: positions,
    width: options.width || 4.0,
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

export function getLayerByName(viewer, layerName) {
  const primitives = viewer.scene.primitives
  const length = primitives.length

  for (let i = 0; i < length; i++) {
    const primitive = primitives.get(i)
    // 检查是否有我们之前绑定的标识
    if (primitive._layerName === layerName) {
      return primitive
    }
  }
  return null
}
