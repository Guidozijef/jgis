import { Feature } from 'ol'
import {
  createMap,
  addMarker,
  flyToMap,
  flyToMapByExtent,
  flyToMapByFeature,
  getProjection,
  setZoom,
  getZoom,
  destroyMap
} from './core'
import { createBaseLayer, createLayer, removeLayer } from './layer'

export const useMap = (el: HTMLElement, config: any = {}) => {
  const map = createMap(el, config)
  createBaseLayer(map, config)

  return {
    instance: map, // 暴露原始实例以备不时之需
    addMarker: (layerName: string, data: any, options?: any) => addMarker(map, layerName, data, options),
    createLayer: (layerName: string, data: any, options?: any) => createLayer(map, layerName, data, options),
    removeLayer: (layerName: string) => removeLayer(map, layerName),
    flyToMap: (options: any) => flyToMap(map, options),
    flyToMapByExtent: (options: any) => flyToMapByExtent(map, options),
    flyToMapByFeature: (feature: Feature, options: any) => flyToMapByFeature(map, feature, options),
    getProjection: () => getProjection(map),
    getZoom: () => getZoom(map),
    setZoom: (zoom: number) => setZoom(map, zoom),
    destroyMap: () => destroyMap(map)
  }
}
