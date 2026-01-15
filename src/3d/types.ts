import * as Cesium from 'cesium'
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

export interface SelectResult {
  billboard: Cesium.Billboard
  properties: any
  event: Cesium.Cartesian2
  pick: any
}

export interface UseSelectResult {
  onSelect: (result: (SelectResult) => void) => void
  clear: () => void
  destroy: () => void
}

export type Coordinates = [number, number, number]

export interface MapContext {
  targetId: string
  instance: Cesium.Viewer
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
  queryFeature: (layerName: string, properties: any) => FeatureLike
  useSelect: (options: any) => UseSelectResult
  useHover: (options: HoverOptions) => UseHoverResult
  flyTo: (coordinate: Coordinates, options: flyOptions) => Promise<boolean>
  flyHome: (duration?: number) => void
  flyToBoundingSphere: (boundingSphere: Cesium.BoundingSphere, options?: flyOptions) => Promise<boolean>
  getProjection: () => void
  getZoom: () => number
  setView: (coordinate: Coordinates, options?: flyOptions) => void
  getMapContext: (id: string) => Promise<MapContext>
  onMapReady: (id: string, callback: () => void) => void
  destroyMap: (id: string) => void
}
