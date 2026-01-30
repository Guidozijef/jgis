import * as Cesium from 'cesium'
import { createViewer, addMarker, flyTo, flyHome, flyToBoundingSphere, findGraphic, setView, destroyMap } from './core'
import { createSelect, UseSelectResult, createHover, UseHoverResult, HoverOptions, SelectOptions } from './interaction'
import { createBaseLayer, createBlankLayer, createLayer, changeBaseLayer, getLayerByName, removeLayer, visibleLayer } from './layer'
import { Asyncify, billboardOptions, Coordinates, flyOptions, LayerOptions, mapConfigOptions, MapContext, optionsMap } from './types'
import { getMapContext as getMapContexted, getMapContextAsync as getMapContextAsynced, onMapReady as onMapReadyed, registerMap } from './store'

/**
 * 创建地图
 * @param el 绑定地图元素Id
 * @param options 配置项
 * @returns 地图方法和地图实例
 */
export function useMap(el: string, options: mapConfigOptions): MapContext {
  // TODO 创建3D地图

  const viewer = createViewer(el, options)
  createBaseLayer(viewer, options.baseLayers)

  const context: MapContext = {
    getTargetId: (): string => el,
    getInstance: (): Cesium.Viewer => viewer,
    addMarker: (layerName: string, points: any[], options: billboardOptions & { getImage?: Function }) =>
      addMarker(viewer, layerName, points, options),
    createLayer: <K extends keyof optionsMap>(layerName: string, data: any, options?: optionsMap[K] & { type?: K }): Cesium.Primitive =>
      createLayer(viewer, layerName, data, options),
    removeLayer: (layerName: string) => removeLayer(viewer, layerName),
    changeBaseLayer: (layerName: string, options: { url: string }) => changeBaseLayer(viewer, layerName, options),
    visibleLayer: (layerName: string, visible: boolean) => visibleLayer(viewer, layerName, visible),
    getLayerByName: (layerName: string): Cesium.BillboardCollection | Cesium.EntityCollection => getLayerByName(viewer, layerName),
    findGraphic: (layerName: string, data: Record<string, any>, tolerance?: number): Cesium.Billboard | Cesium.Entity =>
      findGraphic(viewer, layerName, data, tolerance),
    createBlankLayer: (layerName: string): Cesium.Primitive => createBlankLayer(viewer, layerName),
    createSelect: (options: SelectOptions): UseSelectResult => createSelect(viewer, options),
    createHover: (options: HoverOptions): UseHoverResult => createHover(viewer, options),
    flyTo: (coordinate: Coordinates, options?: flyOptions): Promise<boolean> => flyTo(viewer, coordinate, options),
    flyHome: (duration?: number): void => flyHome(viewer, duration),
    flyToBoundingSphere: (boundingSphere: Cesium.BoundingSphere, options?: flyOptions): Promise<boolean> =>
      flyToBoundingSphere(viewer, boundingSphere, options),
    setView: (coordinate: Coordinates, options?: flyOptions): void => setView(viewer, coordinate, options),
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
