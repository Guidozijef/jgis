import { Feature } from 'ol'
import {
  createMap,
  addMarker,
  flyTo,
  flyToByExtent,
  flyToByFeature,
  getProjection,
  setZoom,
  getZoom,
  destroyMap
} from './core'
import { registerMap, onMapReady as onMapReadyed, getMapContext as getMapContexted } from './store'
import { createBaseLayer, createLayer, removeLayer } from './layer'
import { useSelect, SelectOptions, UseSelectResult, useHover, HoverOptions, UseHoverResult } from './interaction'
import { flyOptions, LayerOptions, mapConfigOptions, MapContext } from './types'

export const useMap = (el: string, config: mapConfigOptions) => {
  const map = createMap(el, config)
  createBaseLayer(map, config.baseLayers)

  const context: MapContext = {
    targetId: el,
    instance: map, // 暴露原始实例以备不时之需
    addMarker: (layerName: string, data: any, options?: LayerOptions) => addMarker(map, layerName, data, options),
    createLayer: (layerName: string, data: any, options?: LayerOptions) => createLayer(map, layerName, data, options),
    removeLayer: (layerName: string) => removeLayer(map, layerName),
    useSelect: (options: SelectOptions): UseSelectResult => useSelect(map, options),
    useHover: (options: HoverOptions): UseHoverResult => useHover(map, options),
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
