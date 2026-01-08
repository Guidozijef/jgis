// JGis 地图相关类型定义
import { Map, Feature, MapBrowserEvent } from 'ol'
import { Select } from 'ol/interaction'
import { StyleLike } from 'ol/style/Style'
import { Layer } from 'ol/layer'
import type { FeatureLike } from 'ol/Feature'
import Style from 'ol/style/Style'

export interface JGisConfig {
  // 这里可以根据实际需要扩展
  [key: string]: any
}

export interface MoveEventOptions {
  isTips?: boolean
  style?: StyleLike
  callback: (params: FeatureCallbackParams) => void
}

export interface ClickEventOptions {
  style?: StyleLike
  callback: (params: FeatureCallbackParams) => void
}

export interface FeatureCallbackParams {
  layerName: string
  feature: Feature | null
  overlay?: Layer | null
  deFeature?: Feature | null
  event: any
}

export interface LayerOptions {
  type:
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
  flashTime?: number
}

export interface FlashOptions extends HighLightOptions {}

export interface JGisInitOptions {
  moveEvent?: MoveEventOptions
  clickEvent?: ClickEventOptions
  [key: string]: any
}

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

export interface JGisInstance {
  init: (options: JGisInitOptions) => void
  createLayer: (layerName: string, data: any[], options: LayerOptions) => any
  getLayerByName: (layerName: string) => any
  removeLayer: (layerName: string | string[]) => void
  createBlankLayer: (layerName: string, options?: any) => any
  getSourceByName: (layerName: string) => any
  highLightFeature: (layerName: string, feature: FeatureLike, options: HighLightOptions, zoomFlag?: boolean) => void
  flashFeature: (layerName: string, feature: FeatureLike & customFeature, options: FlashOptions) => void
  queryFeatures: (layerName: string, properties: any) => FeatureLike | undefined
  getLonLat: (data: any) => [Number, Number]
  getZoom: () => number | undefined
  zoomToFeature: (feature: FeatureLike, zoom?: number) => void
  centerToMap: (lon: number, lat: number, zoom?: number) => void
  destroy: () => void
}
