import * as Cesium from 'cesium'
import {
  createViewer,
  addMarker,
  flyTo,
  flyHome,
  flyToBoundingSphere,
  findGraphic,
  setView,
  destroyMap,
  getCameraView,
  getCenter,
  getExtent,
  getViewBounds,
  setWeather
} from './core'
import { createSelect, UseSelectResult, createHover, UseHoverResult, HoverOptions, SelectOptions } from './interaction'
import {
  createBaseLayer,
  createBlankLayer,
  createLayer,
  createOverlay,
  customBaseLayer,
  create3DTileLayer,
  getLayerByName,
  removeLayer,
  visibleLayer
} from './layer'
import {
  Asyncify,
  billboardOptions,
  Bounds,
  CameraInfo,
  Coordinates,
  Coordinates2,
  Extent,
  flyOptions,
  LayerOptions,
  mapConfigOptions,
  MapContext,
  mapType,
  optionsMap,
  OverlayResult,
  WeatherType
} from './types'
import { getMapContext as getMapContexted, getMapContextAsync as getMapContextAsynced, onMapReady as onMapReadyed, registerMap } from './store'
import { setBaseLayer } from './baseMap'

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
    setBaseLayer: (options?: { token?: string; mapType: mapType }) => setBaseLayer(viewer, options),
    customBaseLayer: (layerName: string, options: { url: string }) => customBaseLayer(viewer, layerName, options),
    create3DTileLayer: (
      layerName: string,
      options: Cesium.Cesium3DTileset.ConstructorOptions & { url: string; isFlyTo?: boolean }
    ): Promise<Cesium.Cesium3DTileset> => create3DTileLayer(viewer, layerName, options),
    visibleLayer: (layerName: string, visible: boolean) => visibleLayer(viewer, layerName, visible),
    getLayerByName: (layerName: string): Cesium.BillboardCollection | Cesium.EntityCollection => getLayerByName(viewer, layerName),
    findGraphic: (layerName: string, data: Record<string, any>, tolerance?: number): Cesium.Billboard | Cesium.Entity =>
      findGraphic(viewer, layerName, data, tolerance),
    createBlankLayer: (layerName: string): Cesium.Primitive => createBlankLayer(viewer, layerName),
    createSelect: (options: SelectOptions): UseSelectResult => createSelect(viewer, options),
    createHover: (options: HoverOptions): UseHoverResult => createHover(viewer, options),
    createOverlay: (layerName: string): OverlayResult => createOverlay(viewer, layerName),
    flyTo: (coordinate: Coordinates, options?: flyOptions): Promise<boolean> => flyTo(viewer, coordinate, options),
    flyHome: (duration?: number): void => flyHome(viewer, duration),
    flyToBoundingSphere: (boundingSphere: Cesium.BoundingSphere, options?: flyOptions): Promise<boolean> =>
      flyToBoundingSphere(viewer, boundingSphere, options),
    getCameraView: (): CameraInfo => getCameraView(viewer),
    getCenter: (): Omit<Coordinates2, 'lng' | 'lat'> => getCenter(viewer),
    getExtent: (): Extent => getExtent(viewer),
    getViewBounds: (): Bounds => getViewBounds(viewer),
    setWeather: (options: WeatherType): { destroy: () => void; changeOptions: (options: WeatherType) => void } => setWeather(viewer, options),
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
