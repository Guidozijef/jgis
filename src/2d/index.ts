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
import { createBaseLayer, createLayer, removeLayer } from './layer'
import { useSelect, SelectOptions, UseSelectResult, useHover, HoverOptions, UseHoverResult } from './interaction'
import { flyOptions, LayerOptions } from './types'

export const useMap = (el: HTMLElement, config: any = {}) => {
  const map = createMap(el, config)
  createBaseLayer(map, config)

  return {
    instance: map, // 暴露原始实例以备不时之需
    addMarker: (layerName: string, data: any, options?: LayerOptions) => addMarker(map, layerName, data, options),
    createLayer: (layerName: string, data: any, options?: LayerOptions) => createLayer(map, layerName, data, options),
    removeLayer: (layerName: string) => removeLayer(map, layerName),
    useSelect: (options: SelectOptions): UseSelectResult => useSelect(map, options),
    useHover: (options: HoverOptions): UseHoverResult => useHover(map, options),
    flyTo: (coordinate: [number, number], options: flyOptions) => flyTo(map, coordinate, options),
    flyToByExtent: (options: flyOptions) => flyToByExtent(map, options),
    flyToByFeature: (feature: Feature, options: flyOptions) => flyToByFeature(map, feature, options),
    getProjection: () => getProjection(map),
    getZoom: () => getZoom(map),
    setZoom: (zoom: number) => setZoom(map, zoom),
    destroyMap: () => destroyMap(map)
  }
}
