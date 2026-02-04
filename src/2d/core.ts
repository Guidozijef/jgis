import { Feature, Map, View } from 'ol'
import { createLayer } from './layer'
import { flyOptions, LayerOptions, mapConfigOptions } from './types'
import { registerMap, unregisterMap } from './store'
import { defaults as defaultControls } from 'ol/control'

/***
 * 创建地图
 * @param el 地图容器
 * @param options 地图配置
 * @returns {Map}
 */
export function createMap(el, options: mapConfigOptions = {}): Map {
  if (!el && !el.target) {
    throw new Error('is not a valid element')
  }
  if (arguments.length === 1 && typeof el === 'object') {
    options = el
    el = options.target
  }
  const defaultOptions = {
    zoom: 10,
    center: [104.064839, 30.548857],
    minZoom: 1,
    maxZoom: 20,
    projection: 'EPSG:4326'
  }
  const mapOptions = Object.assign(defaultOptions, options)
  const map = new Map({
    //地图容器div的ID
    target: el,
    //地图容器中加载的图层
    layers: [],
    //地图视图设置
    view: new View({
      projection: mapOptions.projection, // 坐标系，有EPSG:4326和EPSG:3857
      //地图初始中心点
      center: mapOptions.center, // 坐标
      //地图初始显示级别
      zoom: mapOptions.zoom,
      minZoom: mapOptions.minZoom,
      maxZoom: mapOptions.maxZoom
    }),
    controls: defaultControls({
      zoom: false,
      rotate: false,
      attribution: false
    })
  })
  ;(map as any).targetId = el
  return map
}

/**
 * 创建图层
 * @param layerName 图层名称
 * @param data 数据
 * @param options 配置项
 * @returns 图层
 */
export function addMarker(map: Map, layerName: string, data: any, options?: LayerOptions['Point']) {
  return createLayer(map, layerName, data, { ...options, type: 'Point' })
}

/**
 * 定位
 * @param map 地图实例
 * @param coordinate [经度, 纬度]
 * @param options {flyOptions} 配置项
 */
export function flyTo(map: Map, coordinate: [number, number], options?: flyOptions): Promise<boolean> {
  return new Promise((resolve, reject) => {
    map.getView().animate(
      {
        center: coordinate,
        duration: options.duration || 1000,
        zoom: options.zoom || getZoom(map),
        rotation: options.rotation || 0,
        easing: options.easing
      },
      resolve
    )
  })
}

/**
 * 通过当前框定位
 * @param map 地图实例
 * @param options {flyOptions} 配置项
 * @returns 经纬度
 */
export function flyToByExtent(map: Map, options: flyOptions): Promise<boolean> {
  const lon = (options.extend[0] + options.extend[2]) / 2
  const lat = (options.extend[1] + options.extend[3]) / 2
  return flyTo(map, [lon, lat], options)
}

/**
 * 根据要素定位
 * @param map 地图实例
 * @param feature 要素
 * @param options {flyOptions} 配置项
 */
export function flyToByFeature(map: Map, feature: Feature, options: flyOptions): Promise<boolean> {
  const extend = feature.getGeometry().getExtent()
  return flyToByExtent(map, { ...options, extend })
}

/**
 * 获取地图缩放级别
 * @param map 地图实例
 * @returns 地图缩放级别
 */
export function getProjection(map: Map) {
  return map.getView().getProjection()
}

/**
 * 获取地图中心点位
 * @param map 地图实例
 * @returns 地图缩放级别
 */
export function getCenter(map: Map) {
  return map.getView().getCenter()
}

/**
 * 设置地图中心点位
 * @param map 地图实例
 * @returns 地图缩放级别
 */
export function setCenter(map: Map, coordinate: [number, number]) {
  return map.getView().setCenter(coordinate)
}

/**
 * 获取地图缩放级别
 * @param map 地图实例
 * @returns 地图缩放级别
 */
export function getZoom(map: Map) {
  return map.getView().getZoom()
}

/**
 * 设置地图缩放级别
 * @param map 地图实例
 * @returns 地图缩放级别
 */
export function setZoom(map: Map, zoom: number) {
  map.getView().setZoom(zoom)
}

/**
 * @param map 地图实例
 * 销毁绑定事件
 */
export function destroyMap(map: Map, targetId: string): void {
  map.un('click', () => {})
  map.un('pointermove', () => {})
  unregisterMap(targetId)
}
