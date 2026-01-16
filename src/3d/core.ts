import * as Cesium from 'cesium'
import { billboardOptions, Coordinates, flyOptions, optionsMap } from './types'
import { createLayer } from './layer'
import { unregisterMap } from './store'

/**
 * 创建Viewer
 *
 * @param {String} [el] Cesium.viewer对应的DOM元素名：<div id="cesiumContainer"></div>
 * @param {String} [terrainUrl] 地形链接
 */
export function createViewer(el: string, options: any = {}) {
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
 * 销毁地图
 * @param viewer 视图对象
 * @param id 地图id
 */
export function destroyMap(viewer: Cesium.Viewer, id: string) {
  viewer.destroy()
  unregisterMap(id)
}
