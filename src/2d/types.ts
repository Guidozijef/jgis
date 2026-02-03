// JGis 地图相关类型定义
import { Map, Feature, MapBrowserEvent } from 'ol'
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

export interface BaseLayerOptions {
  token?: string
  maxZoom?: number
  minZoom?: number
  zIndex?: number
  baseType?: string
  noteType?: string
}

export interface mapConfigOptions {
  projection?: string
  center?: number[]
  zoom?: number
  minZoom?: number
  maxZoom?: number
  baseLayers: BaseLayerOptions
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

export type OverlayOptions = { positioning?: Positioning }

interface CircleOptions {
  radius: number
}

export interface LayerOptions {
  GeoJSON: styleOptions
  Point: styleOptions
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
  overlayer: import('ol/Overlay').default
  content: HTMLDivElement
}

export interface flyOptions {
  zoom?: number
  duration?: number
  extend?: number[]
  rotation?: number
  easing?: (t: number) => number
}

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
  createWmsLayer: (layerName: string, data: any, options?: WmsOptions) => TileLayer<TileWMS>
  createWfsLayer: (layerName: string, data: any, options?: WfsOptions) => VectorLayer<VectorSource>
  createOverlay: (layerName: string, data: any, options?: OverlayOptions) => OverlayResult
  createBlankLayer: (layerName: string, options?: styleOptions) => Layer
  changeBaseLayer: (layerName: string, options: XYZOptions) => TileLayer<XYZ>
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
  flyTo: (coordinate: [number, number], options: flyOptions) => Promise<boolean>
  flyToByExtent: (options: flyOptions) => Promise<boolean>
  flyToByFeature: (feature: Feature, options: flyOptions) => Promise<boolean>
  getProjection: () => Projection
  getZoom: () => number
  setZoom: (zoom: number) => void
  destroyMap: (map: MapInstance, id: string) => void
}
