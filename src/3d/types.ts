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

export interface BaseLayerOptions {
  token?: string
  baseType?: string
  noteType?: string
}

export interface mapConfigOptions {
  terrainUrl?: string
  minZoom?: number
  maxZoom?: number
  showFrameRate?: boolean
  baseLayers: BaseLayerOptions
}

export interface CameraInfo {
  longitude: number
  latitude: number
  height: number
  heading: number
  pitch: number
  roll: number
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
  EntityPoint: billboardOptions & {
    getImage?: Function
    labelStyle?: Cesium.LabelGraphics.ConstructorOptions & {
      getText?: Function
    }
  }
  LineString: ILineOptions
  MultiLineString: ILineOptions
  Polygon: any
  MultiPolygon: any
  Circle: any
  Wms: WmsOptions
  Overlay: any
}

export interface OverlayResult {
  viewer: Cesium.Viewer
  element: HTMLElement
  setPosition: (position: Cesium.Cartesian3) => void
}

export type billboardOptions = Omit<Cesium.Billboard.ConstructorOptions, 'position'>

export type Coordinates = [number, number, number]

export type Coordinates2 = {
  lng: number
  lat: number
  x: number
  y: number
  z: number
  cameraZ: number
}

export type Extent = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export type Bounds = {
  southwest: Pick<Coordinates2, 'lng' | 'lat'>
  northeast: Pick<Coordinates2, 'lng' | 'lat'>
}

// 定义你的映射关系
type WeatherMap = {
  rain: '雨'
  snow: '雪'
  fog: '雾'
}

// 封装一个工具类型将 Record 转换为 { type, name } 的联合
type MapToUnion<T> = {
  [K in keyof T]: { type: K; name: T[K] }
}[keyof T]

export type WeatherType = MapToUnion<WeatherMap>

export type mapType = 'ver' | 'img' | 'ter'

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
  addMarker: (layerName: string, data: Record<string, any>, options: optionsMap['Point']) => void
  createLayer: <K extends keyof optionsMap>(layerName: string, data: any, options?: optionsMap[K] & { type?: K }) => Cesium.Primitive
  setBaseLayer: (options?: { token?: string; mapType: mapType }) => void
  customBaseLayer: (layerName: string, options: { url: string }) => void
  create3DTileLayer: (
    layerName: string,
    options: Cesium.Cesium3DTileset.ConstructorOptions & { url: string; isFlyTo?: boolean }
  ) => Promise<Cesium.Cesium3DTileset>
  removeLayer: (layerName: string) => void
  visibleLayer: (layerName: string, visible: boolean) => void
  getLayerByName: (layerName: string) => Cesium.BillboardCollection | Cesium.EntityCollection
  createBlankLayer: (layerName: string, options: LayerOptions) => Cesium.Primitive
  findGraphic: (layerName: string, data: Record<string, any>, tolerance?: number) => Cesium.Entity | Cesium.Billboard
  createSelect: (options: SelectOptions) => UseSelectResult
  createOverlay: (layerName: string) => OverlayResult
  createHover: (options: HoverOptions) => UseHoverResult
  flyTo: (coordinate: Coordinates, options: flyOptions) => Promise<boolean>
  flyHome: (duration?: number) => void
  flyToBoundingSphere: (boundingSphere: Cesium.BoundingSphere, options?: flyOptions) => Promise<boolean>
  getCameraView: () => CameraInfo
  getCenter: () => Omit<Coordinates2, 'lng' | 'lat'>
  getExtent: () => Extent
  getViewBounds: () => Bounds
  setWeather: (options: WeatherType) => { destroy: () => void; changeOptions: (options: WeatherType) => void }
  setView: (coordinate: Coordinates, options?: flyOptions) => void
  destroyMap: (id: string) => void
}
