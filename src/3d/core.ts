import * as Cesium from 'cesium'
import {
  billboardOptions,
  Coordinates,
  flyOptions,
  mapConfigOptions,
  optionsMap,
  CameraInfo,
  Coordinates2,
  Extent,
  Bounds,
  WeatherType
} from './types'
import { createLayer, getLayerByName } from './layer'
import { unregisterMap } from './store'
import { formatPositon, getLonLat } from './utils'
import WeatherEffects from './weatherEffects'

/**
 * 创建Viewer
 *
 * @param {String} [el] Cesium.viewer对应的DOM元素名：<div id="cesiumContainer"></div>
 * @param {String} [terrainUrl] 地形链接
 */
export function createViewer(el: string, options: Omit<mapConfigOptions, 'baseLayers'>) {
  const viewer = new Cesium.Viewer(el, {
    requestRenderMode: true, //减少应用程序的 CPU/GPU 使用率
    maximumRenderTimeChange: Infinity, //默认时间变化请求一个新帧
    selectionIndicator: false, //选中元素显示,默认true
    animation: false,
    timeline: false, //时间线,默认true
    geocoder: false, //地名查找,默认true
    homeButton: false, //控制右上角home按钮显示
    baseLayerPicker: false, //地图切换控件(底图以及地形图)是否显示,默认显示true
    // imageryProvider: new Cesium.GridImageryProvider({}),
    sceneModePicker: false,
    navigationHelpButton: false,
    infoBox: false, //点击要素之后显示的信息,默认true
    fullscreenButton: false, //全屏按钮,默认显示true
    shouldAnimate: true, // Enable animations
    contextOptions: {
      webgl: {
        preserveDrawingBuffer: true, //允许截图
        alpha: true //允许透明
      }
    }
  })

  let _terrainProvider
  if (Cesium.defined(options.terrainUrl)) {
    Cesium.CesiumTerrainProvider.fromUrl(options.terrainUrl, {
      requestVertexNormals: true,
      requestWaterMask: true
    }).then((terrainProvider) => {
      _terrainProvider = terrainProvider
      viewer.terrainProvider = _terrainProvider
    })
  } else {
    _terrainProvider = new Cesium.EllipsoidTerrainProvider()
  }
  viewer.terrainProvider = _terrainProvider

  //去除cesium版权信息
  ;(viewer as any)._cesiumWidget._creditContainer.style.display = 'none'
  viewer.scene.globe.baseColor = new Cesium.Color(0.0, 0.0, 0.0, 0)
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = options.minZoom || 1 // 设置相机的高度的最小值
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = options.maxZoom || 10000000 // 设置相机的高度的最大值
  viewer.resolutionScale = window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio
  viewer.scene.debugShowFramesPerSecond = options.showFrameRate === true // 显示帧率
  return viewer
}

/**
 * 添加标记
 * @param {Cesium.Viewer} viewer
 * @param {stringr} layerName
 * @param points 数据
 * @returns {void}
 */
export function addMarker(viewer: Cesium.Viewer, layerName: string, points: any[], options: optionsMap['Point']): void {
  createLayer<'Point'>(viewer, layerName, points, { ...options, type: 'Point' })
}

/**
 * 定位
 * @param map 地图实例
 * @param coordinate [经度, 纬度]
 * @param options {flyOptions} 配置项
 */
export function flyTo(viewer: Cesium.Viewer, coordinate: Coordinates, options?: flyOptions): Promise<boolean> {
  return new Promise((resolve, reject) => {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(...coordinate),
      duration: options.duration || 1.2, // 飞行动画时间（秒）
      orientation: {
        heading: options.heading || 0,
        pitch: options.pitch || -Math.PI / 2,
        roll: options.roll || 0
      },
      easingFunction: options.easing || Cesium.EasingFunction.LINEAR_NONE, // 飞行动画缓动函数
      maximumHeight: options.maxHeight || 1000000, // 相机最大飞行高度
      complete: () => {
        resolve(true)
      },
      cancel: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 飞行到初始位置
 * @param viewer 视图对象
 * @param duration 飞行时间
 */
export function flyHome(viewer: Cesium.Viewer, duration: number = 1) {
  return viewer.camera.flyHome(duration)
}

/**
 * 飞行到包围球
 * @param viewer 视图对象
 * @param boundingSphere
 * @param options 配置项
 */
export function flyToBoundingSphere(viewer: Cesium.Viewer, boundingSphere: Cesium.BoundingSphere, options: flyOptions): Promise<boolean> {
  return new Promise((resolve, reject) => {
    viewer.camera.flyToBoundingSphere(boundingSphere, {
      duration: options.duration || 1000, // 飞行动画时间（秒）
      offset: new Cesium.HeadingPitchRange(options.heading || 0, options.pitch || -Math.PI / 4, options.roll || 0),
      easingFunction: options.easing, // 飞行动画缓动函数
      maximumHeight: options.maxHeight || 1000000, // 相机最大飞行高度
      complete: () => {
        resolve(true)
      },
      cancel: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 设置天气效果
 * @param { Cesium.Viewer } viewer 视图
 * @param { WaterType } options 配置项
 * @returns { destroy: Function, changeOptions: Function } 销毁函数，修改配置函数
 */
export function setWeather(viewer: Cesium.Viewer, options: WeatherType): { destroy: () => void; changeOptions: (options: WeatherType) => void } {
  const weather = new WeatherEffects(viewer, options)
  return {
    destroy() {
      weather.destroy()
    },
    changeOptions(options: WeatherType) {
      weather.changeOptions(options)
    }
  }
}

// 0、常用的坐标系
// 笛卡尔坐标：new Cesium.Cartesian3(x, y, z)  443621.9353276883
// 弧度坐标：new Cesium.Cartographic(longitude, latitude, height) -1.657287975770561
// 经纬度： Cesium.Cartesian3.fromDegrees(longitude, latitude, height)  120

// 1、heading、pitch、roll
// 偏航（heading），即机头朝左右摇摆
// 俯仰(pitch)，机头上下摇摆
// 滚转(roll)，机身绕中轴线旋转

// 2、角度转弧度互相转换
// 【1】角度转弧度：var radius = Cesium.Math.toRadians(90);
// 【2】弧度转角度：var angle = Cesium.Math.toDegrees(1.5707963267948966);

function pickCenterPoint(scene) {
  var canvas = scene.canvas
  var center = new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2)

  var ray = scene.camera.getPickRay(center)
  var target = scene.globe.pick(ray, scene)
  return target || scene.camera.pickEllipsoid(center)
}

/**
 * 获取中心点
 * @param viewer 视图对象
 * @returns
 */
export function getCenter(viewer: Cesium.Viewer): Omit<Coordinates2, 'lng' | 'lat'> {
  const scene = viewer.scene
  const target = pickCenterPoint(scene)
  let bestTarget = target
  if (!bestTarget) {
    const globe = scene.globe
    const carto = scene.camera.positionCartographic.clone()
    const height = globe.getHeight(carto)
    carto.height = height || 0
    bestTarget = Cesium.Ellipsoid.WGS84.cartographicToCartesian(carto)
  }

  const result = formatPositon(bestTarget)

  // 获取地球中心点世界位置  与  摄像机的世界位置  之间的距离
  const distance = Cesium.Cartesian3.distance(bestTarget, viewer.scene.camera.positionWC)

  return { ...result, cameraZ: distance }
}

/**
 * 提取地球视域边界
 * @param {Cesium.Viewer} viewer
 * */
export function getExtent(viewer: Cesium.Viewer): Extent {
  // 范围对象
  const extent = {
    minX: 70,
    maxX: 140,
    minY: 0,
    maxY: 55
  } //默认值：中国区域

  // 得到当前三维场景
  const scene = viewer.scene

  // 得到当前三维场景的椭球体
  const ellipsoid = scene.globe.ellipsoid
  const canvas = scene.canvas

  // canvas左上角
  const car3_lt = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(0, 0), ellipsoid)
  if (car3_lt) {
    // 在椭球体上
    const carto_lt = ellipsoid.cartesianToCartographic(car3_lt)
    extent.minX = Cesium.Math.toDegrees(carto_lt.longitude)
    extent.maxY = Cesium.Math.toDegrees(carto_lt.latitude)
  } else {
    // 不在椭球体上
    const xMax = canvas.width / 2
    const yMax = canvas.height / 2

    let car3_lt2
    // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
    for (let yIdx = 0; yIdx <= yMax; yIdx += 10) {
      const xIdx = yIdx <= xMax ? yIdx : xMax
      car3_lt2 = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(xIdx, yIdx), ellipsoid)
      if (car3_lt2) break
    }
    if (car3_lt2) {
      const carto_lt = ellipsoid.cartesianToCartographic(car3_lt2)
      extent.minX = Cesium.Math.toDegrees(carto_lt.longitude)
      extent.maxY = Cesium.Math.toDegrees(carto_lt.latitude)
    }
  }

  // canvas右下角
  const car3_rb = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(canvas.width, canvas.height), ellipsoid)
  if (car3_rb) {
    // 在椭球体上
    const carto_rb = ellipsoid.cartesianToCartographic(car3_rb)
    extent.maxX = Cesium.Math.toDegrees(carto_rb.longitude)
    extent.minY = Cesium.Math.toDegrees(carto_rb.latitude)
  } else {
    // 不在椭球体上
    const xMax = canvas.width / 2
    const yMax = canvas.height / 2

    let car3_rb2
    // 这里每次10像素递减，一是10像素相差不大，二是为了提高程序运行效率
    for (let yIdx = canvas.height; yIdx >= yMax; yIdx -= 10) {
      const xIdx = yIdx >= xMax ? yIdx : xMax
      car3_rb2 = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(xIdx, yIdx), ellipsoid)
      if (car3_rb2) break
    }
    if (car3_rb2) {
      const carto_rb = ellipsoid.cartesianToCartographic(car3_rb2)
      extent.maxX = Cesium.Math.toDegrees(carto_rb.longitude)
      extent.minY = Cesium.Math.toDegrees(carto_rb.latitude)
    }
  }

  //交换
  if (extent.maxX < extent.minX) {
    const temp = extent.maxX
    extent.maxX = extent.minX
    extent.minX = temp
  }
  if (extent.maxY < extent.minY) {
    const temp = extent.maxY
    extent.maxY = extent.minY
    extent.minY = temp
  }

  return extent
}

/**
 * 提取视域边界
 * @param {Cesium.Viewer} viewer
 * @return {Bounds} 视域边界对象，包含西南角和东北角的经纬度坐标
 * */
export function getViewBounds(viewer: Cesium.Viewer): Bounds {
  const rectangle = viewer.camera.computeViewRectangle()
  // 弧度转为经纬度，west为左（西）侧边界的经度，以下类推
  const west = (rectangle.west / Math.PI) * 180
  const north = (rectangle.north / Math.PI) * 180
  const east = (rectangle.east / Math.PI) * 180
  const south = (rectangle.south / Math.PI) * 180
  const bounds = {
    southwest: {
      lng: west,
      lat: south
    },
    northeast: {
      lng: east,
      lat: north
    }
  }
  return bounds
}

/**
 * 获取视角信息
 * @param viewer 视图对象
 */
export function getCameraView(viewer: Cesium.Viewer): CameraInfo {
  const ellipsoid = viewer.scene.globe.ellipsoid
  const cameraPosition = viewer.camera.position
  const cartographic = ellipsoid.cartesianToCartographic(cameraPosition)
  const longitude = Cesium.Math.toDegrees(cartographic.longitude)
  const latitude = Cesium.Math.toDegrees(cartographic.latitude)
  const height = cartographic.height
  const heading = Cesium.Math.toDegrees(viewer.camera.heading)
  const pitch = Cesium.Math.toDegrees(viewer.camera.pitch)
  const roll = Cesium.Math.toDegrees(viewer.camera.roll)

  return {
    longitude,
    latitude,
    height,
    heading,
    pitch,
    roll
  }
}

/**
 * 设置视角
 * @param viewer 视图对象
 * @param coordinate [经度, 纬度, 高度]
 * @param options 配置项
 */
export function setView(viewer: Cesium.Viewer, coordinate: Coordinates, options: flyOptions) {
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(...coordinate),
    orientation: {
      heading: options.heading || 0,
      pitch: options.pitch || -Math.PI / 2,
      roll: options.roll || 0
    }
  })
}

/**
 * 在多个图层中查找与 data 匹配的 primitive
 * @param viewer 视图对象
 * @param layerName 图层名称
 * @param data 待匹配的数据对象，字段动态
 * @returns 找到的第一个匹配 primitive 或 null
 */
export function findGraphic(
  viewer: Cesium.Viewer,
  layerName: string,
  data: Record<string, any>,
  tolerance: number = 0.1
): Cesium.Billboard | Cesium.Entity {
  const layers = getLayerByName(viewer, layerName)
  if (!layers) {
    console.warn(`Layer [${layerName}] not found.`)
    return undefined
  }

  // 2. 将目标经纬度转换为笛卡尔坐标 (Cartesian3)
  const targetPosition = Cesium.Cartesian3.fromDegrees(...getLonLat(data), data.height || 0)

  // 3. 定义匹配逻辑函数 (复用逻辑)
  const isMatch = (itemPosition: Cesium.Cartesian3 | undefined): boolean => {
    if (!itemPosition) return false
    // 计算两点距离，如果在容差范围内，则视为匹配
    const distance = Cesium.Cartesian3.distance(itemPosition, targetPosition)
    return distance <= tolerance
  }

  if (layers instanceof Cesium.BillboardCollection) {
    for (let i = 0; i < layers.length; i++) {
      const billboard = layers.get(i)
      if (isMatch(billboard.position)) {
        return billboard
      }
    }
  } else if (layers instanceof Cesium.EntityCollection) {
    const entities = layers.values // EntityCollection.values 是一个数组
    const currentTime = viewer.clock.currentTime // 获取当前时间用于计算 Entity 位置

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]
      // Entity 的 position 是一个 Property，需要根据时间获取具体坐标
      const position = entity.position?.getValue(currentTime)
      if (isMatch(position)) {
        return entity
      }
    }
  }
}

/**
 * 销毁地图
 * @param viewer 视图对象
 * @param id 地图id
 */
export function destroyMap(viewer: Cesium.Viewer, id: string) {
  viewer.destroy()
  unregisterMap(id)
}
