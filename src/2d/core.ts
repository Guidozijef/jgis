import { Feature, Map, View } from 'ol'
import { createLayer } from './layer'
import { flyOptions, LayerOptions } from './types'

/***
 * 创建地图
 * @param el 地图容器
 * @param options 地图配置
 * @returns {Map}
 */
export function createMap(el, options = {}): Map {
  const defaultOptions = {
    zoom: 10,
    center: [104.064839, 30.548857],
    minZoom: 2,
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
    })
  })
  return map
}

/**
 * 创建图层
 * @param layerName 图层名称
 * @param data 数据
 * @param options 配置项
 * @returns 图层
 */
export function addMarker(map: Map, layerName: string, data: any, options?: LayerOptions) {
  createLayer(map, layerName, data, { ...options, type: 'Point' })
}

/**
 * 定位
 * @param lon 经度
 * @param lat 纬度
 * @param zoom 缩放级别
 */
export function flyToMap(map: Map, coordinate: [number, number], options?: flyOptions): Promise<Boolean> {
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
 * @param extent 当前框范围
 * @param zoom 地图层级
 * @returns 经纬度
 */
export function flyToMapByExtent(map: Map, options: flyOptions) {
  const lon = (options.extend[0] + options.extend[2]) / 2
  const lat = (options.extend[1] + options.extend[3]) / 2
  flyToMap(map, [lon, lat], options)
  return [lon, lat]
}

/**
 * 定位
 * @param map 地图实例
 * @param feature 要素
 * @param zoom 缩放级别
 */
export function flyToMapByFeature(map: Map, feature: Feature, options: flyOptions) {
  const extend = feature.getGeometry().getExtent()
  flyToMapByExtent(map, { ...options, extend })
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
export function destroyMap(map: Map): void {
  map.un('click', () => {})
  map.un('pointermove', () => {})
}
