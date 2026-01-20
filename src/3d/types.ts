import * as Cesium from 'cesium'
import { HoverOptions, SelectOptions, UseHoverResult, UseSelectResult } from './interaction'
export interface flyOptions {
  heading?: number
  pitch?: number
  roll?: number
  duration?: number
  maxHeight?: number
  easing?: (t: number) => number
}

export interface LayerOptions {
  // 图层名称
  name?: string
  // 图层类型
  type?: string
  // 图层数据
  data?: any
  // 图层样式
  style?: any
  // 图层可见性
  visible?: boolean
  // 图层透明度
  opacity?: number
  // 图层是否可交互
  interactive?: boolean
}

export interface WmsOptions {
  url: string
  layers?: string
  alpha?: number
  brightness?: number
  gamma?: number
  contrast?: number
}

export type ILineOptions = {
  width: number
  color: string
  material: Cesium.Material
  granularity: number
}

export interface optionsMap {
  Point: billboardOptions & { getImage?: Function }
  LineString: ILineOptions
  MultiLineString: ILineOptions
  Polygon: any
  MultiPolygon: any
  Circle: any
  Wms: WmsOptions
  Overlay: any
}

export type billboardOptions = Omit<Cesium.Billboard.ConstructorOptions, 'position'>

export type Coordinates = [number, number, number]

export type Asyncify<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? T[K] extends <K2 extends any>(...args: any) => any
      ? T[K] // 泛型函数直接保留原型，不包装
      : (...args: A) => Promise<R>
    : () => Promise<T[K]>
}

export interface MapContext {
  getTargetId: () => string
  getInstance: () => Cesium.Viewer
  addMarker: (layerName: string, data: any, options: optionsMap['Point']) => void
  createLayer: <K extends keyof optionsMap>(layerName: string, data: any, options?: optionsMap[K] & { type?: K }) => Cesium.Primitive
  removeLayer: (layerName: string) => void
  visibleLayer: (layerName: string, visible: boolean) => void
  getLayerByName: (layerName: string) => Cesium.PrimitiveCollection | Cesium.Primitive
  createBlankLayer: (layerName: string, options: LayerOptions) => Cesium.Primitive
  // lightFeature: (layerName: string, feature: FeatureLike, options: HighLightOptions, zoomFlag: boolean) => void
  // flashFeature: (layerName: string, feature: FeatureLike & customFeature, options: FlashOptions) => void
  // queryFeature: (layerName: string, properties: any) => FeatureLike
  createSelect: (options: SelectOptions) => UseSelectResult
  createHover: (options: HoverOptions) => UseHoverResult
  flyTo: (coordinate: Coordinates, options: flyOptions) => Promise<boolean>
  flyHome: (duration?: number) => void
  flyToBoundingSphere: (boundingSphere: Cesium.BoundingSphere, options?: flyOptions) => Promise<boolean>
  setView: (coordinate: Coordinates, options?: flyOptions) => void
  destroyMap: (id: string) => void
}
