// JGis 地图相关类型定义
import { Map, Feature, MapBrowserEvent } from 'ol'
import { Select } from 'ol/interaction'
import { StyleLike } from 'ol/style/Style'
import { Layer } from 'ol/layer'
import type { FeatureLike } from 'ol/Feature'
import Style from 'ol/style/Style'
import { HoverOptions, SelectOptions, UseHoverResult, UseSelectResult } from './interaction'
import { Source } from 'ol/source'
import { Projection } from 'ol/proj'

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

export interface LayerOptions {
  type?: 'GeoJSON' | 'Wms' | 'Point' | 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon' | 'Circle' | 'Overlay'
  token?: string
  style?: Style
  getStyle?: (layerName: string, feature: FeatureLike, resolution: number) => void | Style | Style[]
  zIndex?: number
  cqlFilter?: string
  [key: string]: any
}

export interface HighLightOptions {
  style?: StyleLike
  getStyle: (layerName: string, feature: Feature) => StyleLike
  time?: number
}

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
  addMarker: (layerName: string, data: any, options?: LayerOptions) => void
  createLayer: (layerName: string, data: any, options?: LayerOptions) => Layer
  removeLayer: (layerName: string) => void
  visibleLayer: (layerName: string, visible: boolean) => Layer
  getLayerByName: (layerName: string) => Layer
  getSourceByName: (layerName: string) => Source
  getLonLat: (data: any) => [number, number]
  createBlankLayer: (layerName: string, options: LayerOptions) => Layer
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
