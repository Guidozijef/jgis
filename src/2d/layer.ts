// 图层模块
import { Point, LineString, MultiLineString, Circle as OLCircle, MultiPolygon, Polygon, Geometry } from 'ol/geom'
import { Map } from 'ol'
import { Layer, Tile as TileLayer, Vector as VectorLayer, VectorTile as VectorTileLayer } from 'ol/layer'
import { circular } from 'ol/geom/Polygon'
import Feature, { FeatureLike } from 'ol/Feature'
import { Cluster, Vector as VectorSource, TileWMS, XYZ } from 'ol/source'
import { GeoJSON } from 'ol/format'
import Overlay, { Positioning } from 'ol/Overlay'
import type {
  LayerOptions,
  MapInstance,
  GeoJsonLike,
  OverlayResult,
  WmsOptions,
  XYZOptions,
  styleOptions,
  LayerInput,
  LayerConfig,
  OverlayOptions,
  WfsOptions
} from './types'
import { circle as tCircle } from '@turf/turf'
import { createSourceByWfs, createSourceByWms, createSources } from './source'
import { getLonLat } from './utils'
import { FeatureType } from 'ol/format/WFS'
import { generateStyle } from './style'
import { removeLayerByName } from './utils'
import { BaseLayerOptions, mapType } from './types'

/**
 * 创建底图
 * @param map  地图实例
 * @param options 图层配置
 * @returns {TileLayer} 图层实例
 */
export function createBaseLayer(map: Map, options: BaseLayerOptions = {}): TileLayer<XYZ> {
  const TOKEN = options.token || 'dadcbbdb5206b626a29ca739686b3087'
  const baseTypeMap = {
    img: ['img', 'cia'],
    vec: ['vec', 'cva'],
    ter: ['ter', 'cta']
  }
  const baseType = baseTypeMap[options.baseType || 'vec']
  const layer = new TileLayer({
    className: 'tdt-base-layer',
    source: new XYZ({
      url: `http://t0.tianditu.com/DataServer?T=${baseType[0]}_w&x={x}&y={y}&l={z}&tk=${TOKEN}`,
      maxZoom: options.maxZoom || 18,
      minZoom: options.minZoom || 2
    }),
    zIndex: options.zIndex || 1
  })
  layer.set('name', 'tdt-base-layer')
  const layerNote = new TileLayer({
    className: 'tdt-baseNote-layer',
    source: new XYZ({
      url: `http://t0.tianditu.com/DataServer?T=${baseType[1]}_w&x={x}&y={y}&l={z}&tk=${TOKEN}`,
      maxZoom: options.maxZoom || 18,
      minZoom: options.minZoom || 2
    }),
    zIndex: options.zIndex ? options.zIndex + 1 : 2
  })
  layerNote.set('name', 'tdt-baseNote-layer')
  map.addLayer(layer)
  map.addLayer(layerNote)
  return layer
}

export function setBaseLayer(map: Map, baseType: mapType, options?: BaseLayerOptions) {
  removeLayer(map, ['tdt-base-layer', 'tdt-baseNote-layer'])
  createBaseLayer(map, { ...options, baseType })
}

/**
 * 修改图层
 * @param map 地图实例
 * @param layerName 图层名称
 * @param options 配置项
 * @returns {TileLayer<XYZ>}
 */
export function customBaseLayer(map: Map, layerName: string, options: XYZOptions): TileLayer<XYZ> {
  removeLayer(map, ['tdt-base-layer', 'tdt-baseNote-layer'])
  const layer = new TileLayer({
    className: `${layerName}-base-layer`,
    source: new XYZ({
      url: options.url,
      tileGrid: options.tileGrid,
      tileUrlFunction: options.tileUrlFunction,
      wrapX: options.wrapX || true,
      crossOrigin: 'anonymous',
      projection: options.projection || 'EPSG:4326',
      maxZoom: options.maxZoom || 18,
      minZoom: options.minZoom || 2
    }),
    zIndex: options.zIndex || 1
  })
  layer.set('name', layerName)
  map.addLayer(layer)
  return layer
}

/**
 * 创建图层
 * @param map {Map} 地图
 * @param layerName 图层名称
 * @param data 数据
 * @param options 配置项
 * @returns 图层
 */
export function createLayer(map: Map, layerName: string, data: any, opts: LayerInput): Layer {
  const options = {
    type: 'Point', // 默认值
    ...opts // 用户选项覆盖
  } as LayerConfig // 这里使用一次断言，明确告诉 TS 这是一个合法的配置对象
  const type = options.type
  let layer
  switch (type) {
    case 'GeoJSON':
      layer = createJSONLayer(layerName, data, map, options)
      break
    case 'Point':
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
    case 'MultiPolygon':
      layer = createVectorLayer(layerName, data, map, options)
      break
    case 'Circle':
      layer = createBufferCircle(layerName, data, map, options)
      break
  }
  return layer
}

/**
 * 移除图层
 * @param map 地图实例
 * @param layerName 图层名称
 * @returns void
 */
export function removeLayer(map: Map, layerName: string | string[]): void {
  if (Array.isArray(layerName)) {
    layerName.forEach((name) => {
      removeLayerByName(map, name)
    })
  } else {
    removeLayerByName(map, layerName)
  }
}

/**
 * 根据GEOJSON数据创建图层
 * @param layerName 图层名称
 * @param geoJson GeoJson数据
 * @param Map 地图实例
 * @param options 图层配置
 * @returns {VectorLayer} 矢量图层
 */
export function createJSONLayer(layerName: string, geoJson: GeoJsonLike, Map: MapInstance, options: LayerOptions['GeoJSON']): VectorLayer {
  console.log(typeof geoJson, geoJson) // 检查类型和内容
  const features = new GeoJSON().readFeatures(geoJson, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:4326' // 或 'EPSG:3857'，看你的地图
  })
  const source = new VectorSource()
  source.addFeatures(features)
  const layer = new VectorLayer({
    source,
    style: generateStyle(layerName, options),
    zIndex: options.zIndex || 10,
    visible: options.visible !== false
  })
  layer.set('name', layerName)
  layer.set('type', 'webgl')
  Map.addLayer(layer)
  return layer
}

/**
 * 根据WMS服务创建图层
 * @param layerName 图层名称
 * @param Map 地图实例
 * @param options 图层配置
 * @returns {TileLayer} 矢量图层
 */
export function createWmsLayer(Map: MapInstance, layerName: string, options: WmsOptions): TileLayer<TileWMS> {
  const layer = new TileLayer<TileWMS>({
    opacity: options.opacity || 1,
    source: createSourceByWms(layerName, options),
    zIndex: options.zIndex || 10,
    visible: options.visible !== false
  })
  layer.set('name', layerName)
  Map.addLayer(layer)
  return layer
}

/**
 * 根据WFS服务创建图层
 * @param layerName 图层名称
 * @param Map 地图实例
 * @param options 图层配置
 * @returns {VectorLayer} 矢量图层
 */
export function createWfsLayer(Map: MapInstance, layerName: string, options: WfsOptions): VectorLayer<VectorSource> {
  const layer = new VectorLayer<VectorSource>({
    opacity: options.opacity || 1,
    source: createSourceByWfs(layerName, options),
    style: generateStyle(layerName, options),
    zIndex: options.zIndex || 10,
    visible: options.visible !== false
  })
  layer.set('name', layerName)
  Map.addLayer(layer)
  return layer
}

/**
 * 根据数据创建矢量图层
 * @param layerName 图层名称
 * @param data 图层数据
 * @param Map 地图实例
 * @param options 图层配置
 * @returns {TileLayer} 矢量图层
 */
export function createVectorLayer<T extends 'Point' | 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon'>(
  layerName: string,
  data: any[],
  Map: MapInstance,
  options: LayerOptions[T]
): VectorLayer {
  if (!data || data.length === 0) return null
  const layer = new VectorLayer({
    source: createSources<T>(layerName, data, options),
    style: generateStyle(layerName, options),
    zIndex: options.zIndex || 10,
    visible: options.visible !== false
  })
  layer.set('name', layerName)
  layer.set('type', 'webgl')
  Map.addLayer(layer)
  return layer
}

/**
 * 根据数据创建矢量图层
 * @param layerName 图层名称
 * @param data 图层数据
 * @param Map 地图实例
 * @param options 图层配置
 * @returns {TileLayer} 矢量图层
 */
export function createBufferCircle(layerName: string, data: any, Map: MapInstance, options: LayerOptions['Circle']): VectorLayer {
  const coordinate = getLonLat(data)
  const circleFeature = tCircle(coordinate, options.radius, { steps: 300, units: 'meters' })

  const turfCircleFeatureNorth = new GeoJSON().readFeature(circleFeature, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:4490'
  })
  // const circle = circular(coordinate, options.radius, 300, 6375137);
  // const c = getCenter(circle.getExtent());
  // const r = getWidth(circle.getExtent()) / 2;
  // const geometry = new OLCircle(c, r);
  // const circleFeature = new Feature({
  //   geometry: geometry,
  //   name: 'buff',
  //   data: { ...data, layerName },
  // });
  const source = new VectorSource({ wrapX: false })
  source.addFeature(turfCircleFeatureNorth as Feature<Geometry>)
  const layer = new VectorLayer({
    source: source,
    style: generateStyle(layerName, options, 'Circle'),
    zIndex: options.zIndex ? options.zIndex : 10
  })
  layer.set('name', layerName)
  layer.set('type', 'webgl')
  Map.addLayer(layer)
  return layer
}

/**
 * 创建Overlay图层
 * @param layerName 图层名称
 * @param Map 地图实例
 * @param options 图层配置
 * @returns OverlayResult
 */
export function createOverlay(Map: MapInstance, layerName: string, options: OverlayOptions): OverlayResult {
  const div = document.createElement('div')
  const overlay = new Overlay({
    element: div,
    stopEvent: false,
    positioning: options.positioning || 'bottom-center'
  })
  overlay.set('name', layerName)
  overlay.set('type', 'webgl')
  Map.addOverlay(overlay)
  return { overlayer: overlay, content: div }
}

/**
 * 创建空白图层
 * @param layerName 图层名
 * @param options 配置项
 * @returns VectorLayer
 */
export function createBlankLayer(map: Map, layerName: string, options?: styleOptions): VectorLayer {
  const layer = new VectorLayer({
    source: new VectorSource({ wrapX: false }),
    zIndex: options?.zIndex ? options.zIndex : 10,
    style: generateStyle(layerName, options)
  })
  layer.set('name', layerName)
  layer.set('type', 'webgl')
  map.addLayer(layer)
  return layer
}

/**
 * 根据图层名称获取图层
 * @param map 地图实例
 * @param layerName 图层名称
 */
export function getLayerByName(map: Map, layerName: string): any {
  const layers = map.getAllLayers()
  const layer = layers.find((item) => item.get('name') === layerName)
  return layer
}

/**
 * 根据图层名称获取图层
 * @param map 地图实例
 * @param layerName 图层名称
 */
export function visibleLayer(map: Map, layerName: string, visible: boolean): Layer {
  const layer = getLayerByName(map, layerName)
  layer.setVisible(visible)
  return layer
}
