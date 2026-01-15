import * as Cesium from 'cesium'
import { createViewer, addMarker, flyTo, flyHome, flyToBoundingSphere, setView, destroyMap } from './core'
import { useSelect } from './interaction'
import { createBaseLayer, createLayer, getLayerByName } from './layer'
import { Coordinates, flyOptions, LayerOptions, MapContext, UseSelectResult } from './types'
import { getMapContext, onMapReady, registerMap } from './store'

/**
 * 创建地图
 * @param el 绑定地图元素Id
 * @param options 配置项
 * @returns 地图方法和地图实例
 */
export function useMap(el: string, options: any) {
  // TODO 创建3D地图

  const viewer = createViewer(el, options)
  createBaseLayer(viewer, options)

  const context: MapContext = {
    targetId: el,
    instance: viewer,
    addMarker: (layerName: string, points: any[], options: any) => addMarker(viewer, layerName, points, options),
    createLayer: (layerName: string, data: any, options?: LayerOptions) => createLayer(viewer, layerName, data, options),
    getLayerByName: (layerName: string) => getLayerByName(viewer, layerName),
    useSelect: (options: any): UseSelectResult => useSelect(viewer, options),
    flyTo: (coordinate: Coordinates, options?: flyOptions): Promise<boolean> => flyTo(viewer, coordinate, options),
    flyHome: (duration?: number): void => flyHome(viewer, duration),
    flyToBoundingSphere: (boundingSphere: Cesium.BoundingSphere, options?: flyOptions): Promise<boolean> =>
      flyToBoundingSphere(viewer, boundingSphere, options),
    setView: (coordinate: Coordinates, options?: flyOptions): void => setView(viewer, coordinate, options),
    getMapContext: (id: string): Promise<MapContext> => getMapContext(id),
    onMapReady: (id: string, callback: () => void): void => onMapReady(id, callback),
    destroyMap: (id: string): void => destroyMap(viewer, id)
  }

  registerMap(el, context)

  return context
}
