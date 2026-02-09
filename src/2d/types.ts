// JGis 地图相关类型定义
import { Map, Feature, Overlay } from 'ol'
import { Select } from 'ol/interaction'
import { StyleLike } from 'ol/style/Style'
import { Layer } from 'ol/layer'
import type { FeatureLike } from 'ol/Feature'
import Style from 'ol/style/Style'
import { HoverOptions, SelectOptions, UseHoverResult, UseSelectResult } from './interaction'
import { Source, TileWMS, XYZ } from 'ol/source'
import { Projection } from 'ol/proj'
import TileLayer from 'ol/layer/Tile'
import { Positioning } from 'ol/Overlay'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import BaseLayer from 'ol/layer/Base'

export interface TrackAnimationOptions {
  path: number[][]
  duration?: number
  style?: {
    icon?: string
    offset?: [number, number]
    autoRotate?: boolean
  }
  showPath?: boolean
  loop?: boolean
}

export interface BaseLayerOptions {
  token?: string
  maxZoom?: number
  minZoom?: number
  zIndex?: number
  baseType?: mapType
}

export interface mapConfigOptions {
  target?: string
  projection?: string
  center?: number[]
  zoom?: number
  minZoom?: number
  maxZoom?: number
  baseLayers?: BaseLayerOptions
}

export interface FeatureCallbackParams {
  layerName: string
  feature: Feature | null
  overlay?: Layer | null
  deFeature?: Feature | null
  event: any
}

export interface styleOptions {
  style?: Style
  getStyle?: (layerName: string, feature: FeatureLike, resolution: number) => void | Style | Style[]
  zIndex?: number
  visible?: boolean
}

export interface WmsOptions {
  url: string
  cqlFilter?: string
  layers: string
  zIndex?: number
  opacity?: number
  visible?: boolean
}

export interface WfsOptions {
  url: string | ((extent: number[]) => string)
  projection?: string
  zIndex?: number
  opacity?: number
  visible?: boolean
}

export type OverlayOptions = { offset?: [number, number]; positioning?: Positioning }

interface CircleOptions {
  radius: number
}

export interface LayerOptions {
  GeoJSON: styleOptions
  Point: styleOptions & { isCluster?: boolean; distance?: number; minDistance?: number }
  LineString: styleOptions
  MultiLineString: styleOptions
  Polygon: styleOptions
  MultiPolygon: styleOptions
  Circle: CircleOptions & styleOptions
}

export type LayerConfig = {
  [K in keyof LayerOptions]: { type: K; lonLabel?: string; latLabel?: string } & LayerOptions[K]
}[keyof LayerOptions]

// 为了兼容 "不传 type 默认为 Point" 的情况，定义入参类型
// 允许 type 为空（后续处理），或者必须匹配上面的 Union
export type LayerInput = LayerConfig | (LayerOptions['Point'] & { type?: undefined })

export interface HighLightOptions {
  style?: StyleLike
  getStyle: (layerName: string, feature: Feature) => StyleLike
  time?: number
}

export type getFirstParams<T extends abstract new (...args: any) => any> = ConstructorParameters<T>[0]

export type XYZOptions = getFirstParams<typeof XYZ> & { zIndex?: number }

export interface FlashOptions extends HighLightOptions {}

export type MapLike = any // 可根据实际情况细化
export type MapInstance = Map // 可根据实际情况细化
export type GeoJsonLike = any // 可根据实际情况细化
export type customFeature = { running: boolean; clearFlash: () => void }

export interface OverlayResult {
  overlay: import('ol/Overlay').default
  element: HTMLDivElement
  setPosition: (coordinate: [number, number]) => void
  setOffset: (offset: [number, number]) => void
}

export interface flyOptions {
  zoom?: number
  duration?: number
  extend?: number[]
  rotation?: number
  easing?: (t: number) => number
}

export type mapType = 'vec' | 'img' | 'ter'

export type Asyncify<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? T[K] extends <K2 extends any>(...args: any) => any
      ? T[K] // 泛型函数直接保留原型，不包装
      : (...args: A) => Promise<R>
    : () => Promise<T[K]>
}

export interface MapContext {
  getTargetId: () => string
  getInstance: () => MapInstance
  getTargetElement: () => HTMLElement
  addMarker: (layerName: string, data: Record<string, any>[], options?: LayerOptions['Point']) => Layer
  createLayer: (layerName: string, data: any, options?: LayerInput) => Layer
  createWmsLayer: (layerName: string, options?: WmsOptions) => TileLayer<TileWMS>
  createWfsLayer: (layerName: string, options?: WfsOptions) => VectorLayer<VectorSource>
  createOverlay: (layerName: string, options?: OverlayOptions) => OverlayResult
  createBlankLayer: (layerName: string, options?: styleOptions) => Layer
  customBaseLayer: (layerName: string, options: XYZOptions) => TileLayer<XYZ>
  setBaseLayer: (mapType: mapType, options?: BaseLayerOptions) => void
  removeLayer: (layerName: string | string[]) => void
  visibleLayer: (layerName: string, visible: boolean) => Layer
  getLayerByName: (layerName: string) => Layer
  getSourceByName: (layerName: string) => Source
  getLonLat: (data: any) => [number, number]
  lightFeature: (layerName: string, feature: FeatureLike, options: HighLightOptions, zoomFlag: boolean) => void
  flashFeature: (layerName: string, feature: FeatureLike & customFeature, options: FlashOptions) => void
  findFeature: (layerName: string, properties: any) => FeatureLike
  createSelect: (options: SelectOptions) => UseSelectResult
  createHover: (options: HoverOptions) => UseHoverResult
  getAllLayer: (map: MapInstance) => (BaseLayer | Overlay)[]
  getAllOverlay: (map: MapInstance) => Overlay[]
  getFeatures: (layerName: string) => FeatureLike[]
  trackAnimation: (path: number[][], options: TrackAnimationOptions) => void
  flyTo: (coordinate: [number, number], options: flyOptions) => Promise<boolean>
  flyToByExtent: (options: flyOptions) => Promise<boolean>
  flyToByFeature: (feature: Feature, options: flyOptions) => Promise<boolean>
  getProjection: () => Projection
  getZoom: () => number
  setZoom: (zoom: number) => void
  destroyMap: (map: MapInstance, id: string) => void
}
