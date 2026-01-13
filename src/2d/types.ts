// JGis 地图相关类型定义
import { Map, Feature, MapBrowserEvent } from 'ol'
import { Select } from 'ol/interaction'
import { StyleLike } from 'ol/style/Style'
import { Layer } from 'ol/layer'
import type { FeatureLike } from 'ol/Feature'
import Style from 'ol/style/Style'
import { HoverOptions, SelectOptions, UseHoverResult, UseSelectResult } from './interaction'

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
  type?:
    | 'GeoJSON'
    | 'Wms'
    | 'Point'
    | 'LineString'
    | 'MultiLineString'
    | 'Polygon'
    | 'MultiPolygon'
    | 'Circle'
    | 'Overlay'
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

export interface MapContext {
  targetId: string
  instance: MapInstance
  addMarker: (layerName: string, data: any, options?: LayerOptions) => void
  createLayer: (layerName: string, data: any, options?: LayerOptions) => Layer
  removeLayer: (layerName: string) => void
  useSelect: (options: SelectOptions) => UseSelectResult
  useHover: (options: HoverOptions) => UseHoverResult
  flyTo: (coordinate: [number, number], options: flyOptions) => void
  flyToByExtent: (options: flyOptions) => void
  flyToByFeature: (feature: Feature, options: flyOptions) => void
  getProjection: () => void
  getZoom: () => number
  setZoom: (zoom: number) => void
  getMapContext: (id: string) => Promise<MapContext>
  onMapReady: (id: string, callback: () => void) => void
  destroyMap: (id: string) => void
}
