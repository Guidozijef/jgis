import { Feature } from 'ol'
import { createMap, addMarker, flyTo, flyToByExtent, flyToByFeature, getProjection, setZoom, getZoom, destroyMap } from './core'
import { registerMap, onMapReady as onMapReadyed, getMapContext as getMapContexted } from './store'
import { createBaseLayer, createLayer, removeLayer, createBlankLayer, getLayerByName, visibleLayer } from './layer'
import { getSourceByName } from './source'
import { createSelect, SelectOptions, UseSelectResult, createHover, HoverOptions, UseHoverResult } from './interaction'
import { customFeature, FlashOptions, flyOptions, HighLightOptions, LayerOptions, mapConfigOptions, MapContext } from './types'
import { FeatureLike } from 'ol/Feature'
import { getLonLat, queryFeature, lightFeature, flashFeature } from './utils'

/**
 * 创建地图
 * @param el 绑定地图元素Id
 * @param config 配置
 * @returns 地图方法和地图实例
 */
export const useMap = (el: string, config: mapConfigOptions) => {
  const map = createMap(el, config)
  createBaseLayer(map, config.baseLayers)

  const context: MapContext = {
    targetId: el,
    instance: map, // 暴露原始实例以备不时之需
    addMarker: (layerName: string, data: any, options?: LayerOptions) => addMarker(map, layerName, data, options),
    createLayer: (layerName: string, data: any, options?: LayerOptions) => createLayer(map, layerName, data, options),
    createBlankLayer: (layerName: string, options?: LayerOptions) => createBlankLayer(map, layerName, options),
    visibleLayer: (layerName: string, visible: boolean) => visibleLayer(map, layerName, visible),
    removeLayer: (layerName: string) => removeLayer(map, layerName),
    getLonLat: (data: any) => getLonLat(data),
    getLayerByName: (layerName: string) => getLayerByName(map, layerName),
    getSourceByName: (layerName: string) => getSourceByName(map, layerName),
    createSelect: (options: SelectOptions): UseSelectResult => createSelect(map, options),
    createHover: (options: HoverOptions): UseHoverResult => createHover(map, options),
    queryFeature: (layerName: string, properties: any): FeatureLike => queryFeature(map, layerName, properties),
    lightFeature: (layerName: string, feature: FeatureLike, options: HighLightOptions, zoomFlag: boolean) =>
      lightFeature(layerName, feature, options, zoomFlag),
    flashFeature: (layerName: string, feature: FeatureLike & customFeature, options: FlashOptions) => flashFeature(layerName, feature, options),
    flyTo: (coordinate: [number, number], options: flyOptions): Promise<boolean> => flyTo(map, coordinate, options),
    flyToByExtent: (options: flyOptions): Promise<boolean> => flyToByExtent(map, options),
    flyToByFeature: (feature: Feature, options: flyOptions): Promise<boolean> => flyToByFeature(map, feature, options),
    getProjection: () => getProjection(map),
    getZoom: () => getZoom(map),
    setZoom: (zoom: number) => setZoom(map, zoom),
    getMapContext: (id: string): Promise<MapContext> => getMapContexted(id),
    onMapReady: (id: string, callback: (ctx: MapContext) => void) => onMapReadyed(id, callback),
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
 * @returns Promise<MapContext>
 */
export function getMapContext(id: string): Promise<MapContext> {
  return getMapContexted(id)
}
