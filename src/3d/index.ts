import * as Cesium from 'cesium'
import { createViewer, addMarker, flyTo, flyHome, flyToBoundingSphere, setView, destroyMap } from './core'
import { createSelect, UseSelectResult, createHover, UseHoverResult, HoverOptions, SelectOptions } from './interaction'
import { createBaseLayer, createBlankLayer, createLayer, getLayerByName, removeLayer, visibleLayer } from './layer'
import { billboardOptions, Coordinates, flyOptions, LayerOptions, MapContext, optionsMap } from './types'
import { getMapContext as getMapContexted, onMapReady as onMapReadyed, registerMap } from './store'

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
    addMarker: (layerName: string, points: any[], options: billboardOptions & { getImage?: Function }) =>
      addMarker(viewer, layerName, points, options),
    createLayer: <K extends keyof optionsMap>(layerName: string, data: any, options?: optionsMap[K] & { type?: K }): Cesium.Primitive =>
      createLayer(viewer, layerName, data, options),
    removeLayer: (layerName: string) => removeLayer(viewer, layerName),
    visibleLayer: (layerName: string, visible: boolean) => visibleLayer(viewer, layerName, visible),
    getLayerByName: (layerName: string) => getLayerByName(viewer, layerName),
    createBlankLayer: (layerName: string): Cesium.Primitive => createBlankLayer(viewer, layerName),
    createSelect: (options: SelectOptions): UseSelectResult => createSelect(viewer, options),
    createHover: (options: HoverOptions): UseHoverResult => createHover(viewer, options),
    flyTo: (coordinate: Coordinates, options?: flyOptions): Promise<boolean> => flyTo(viewer, coordinate, options),
    flyHome: (duration?: number): void => flyHome(viewer, duration),
    flyToBoundingSphere: (boundingSphere: Cesium.BoundingSphere, options?: flyOptions): Promise<boolean> =>
      flyToBoundingSphere(viewer, boundingSphere, options),
    setView: (coordinate: Coordinates, options?: flyOptions): void => setView(viewer, coordinate, options),
    getMapContext: (id: string): Promise<MapContext> => getMapContexted(id),
    onMapReady: (id: string, callback: (cxt: MapContext) => void): void => onMapReadyed(id, callback),
    destroyMap: (id: string): void => destroyMap(viewer, id)
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
