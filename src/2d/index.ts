import { Feature } from 'ol'
import { createMap, addMarker, flyTo, flyToByExtent, flyToByFeature, getProjection, setZoom, getZoom, destroyMap } from './core'
import { registerMap, onMapReady as onMapReadyed, getMapContext as getMapContexted, getMapContextAsync as getMapContextAsynced } from './store'
import {
  createBaseLayer,
  createLayer,
  removeLayer,
  createBlankLayer,
  changeBaseLayer,
  getLayerByName,
  visibleLayer,
  createWmsLayer,
  createOverlay
} from './layer'
import { getSourceByName } from './source'
import { createSelect, SelectOptions, UseSelectResult, createHover, HoverOptions, UseHoverResult } from './interaction'
import {
  Asyncify,
  customFeature,
  FlashOptions,
  flyOptions,
  getFirstParams,
  HighLightOptions,
  LayerInput,
  LayerOptions,
  mapConfigOptions,
  MapContext,
  MapInstance,
  styleOptions,
  WmsOptions,
  OverlayOptions,
  XYZOptions,
  OverlayResult
} from './types'
import { FeatureLike } from 'ol/Feature'
import { getLonLat, findFeature, lightFeature, flashFeature } from './utils'
import { TileWMS, XYZ } from 'ol/source'
import TileLayer from 'ol/layer/Tile'
import { Positioning } from 'ol/Overlay'

/**
 * 创建地图
 * @param el 绑定地图元素Id
 * @param config 配置
 * @returns 地图方法和地图实例
 */
export function useMap(el: string, config: mapConfigOptions): MapContext {
  const map = createMap(el, config)
  createBaseLayer(map, config.baseLayers)

  const context: MapContext = {
    getTargetId: (): string => el,
    getInstance: (): MapInstance => map, // 暴露原始实例以备不时之需
    addMarker: (layerName: string, data: any, options?: LayerOptions['Point']) => addMarker(map, layerName, data, options),
    createLayer: (layerName: string, data: any, options?: LayerInput) => createLayer(map, layerName, data, options),
    createWmsLayer: (layerName: string, data: any, options?: WmsOptions): TileLayer<TileWMS> => createWmsLayer(map, layerName, options),
    createOverlay: (layerName: string, data: any, options?: OverlayOptions): OverlayResult => createOverlay(map, layerName, options),
    createBlankLayer: (layerName: string, options?: styleOptions) => createBlankLayer(map, layerName, options),
    visibleLayer: (layerName: string, visible: boolean) => visibleLayer(map, layerName, visible),
    changeBaseLayer: (layerName: string, options: XYZOptions): TileLayer<XYZ> => changeBaseLayer(map, layerName, options),
    removeLayer: (layerName: string | string[]) => removeLayer(map, layerName),
    getLonLat: (data: any) => getLonLat(data),
    getLayerByName: (layerName: string) => getLayerByName(map, layerName),
    getSourceByName: (layerName: string) => getSourceByName(map, layerName),
    createSelect: (options: SelectOptions): UseSelectResult => createSelect(map, options),
    createHover: (options: HoverOptions): UseHoverResult => createHover(map, options),
    findFeature: (layerName: string, properties: any): FeatureLike => findFeature(map, layerName, properties),
    lightFeature: (layerName: string, feature: FeatureLike, options: HighLightOptions, zoomFlag: boolean) =>
      lightFeature(layerName, feature, options, zoomFlag),
    flashFeature: (layerName: string, feature: FeatureLike & customFeature, options: FlashOptions) => flashFeature(layerName, feature, options),
    flyTo: (coordinate: [number, number], options: flyOptions): Promise<boolean> => flyTo(map, coordinate, options),
    flyToByExtent: (options: flyOptions): Promise<boolean> => flyToByExtent(map, options),
    flyToByFeature: (feature: Feature, options: flyOptions): Promise<boolean> => flyToByFeature(map, feature, options),
    getProjection: () => getProjection(map),
    getZoom: () => getZoom(map),
    setZoom: (zoom: number) => setZoom(map, zoom),
    destroyMap: () => destroyMap(map, el)
  }

  registerMap(el, context)

  return context
}

/**
 * 保证能获取到方法
 * @param id
 * @param callback
 */
export function onMapReady(id: string, callback: (ctx: MapContext) => void) {
  onMapReadyed(id, callback)
}

/**
 * 获取地图返回的上下文
 * @param id
 * @returns {Asyncify<MapContext>}
 */
export function getMapContext(id: string): Asyncify<MapContext> {
  return getMapContexted(id)
}

/**
 * 异步获取地图返回的上下文
 * @param id
 * @returns {Promise<MapContext>}
 */
export function getMapContextAsync(id: string): Promise<MapContext> {
  return getMapContextAsynced(id)
}
