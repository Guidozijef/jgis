import { CreateViewer, createBaseLayer, addMarker } from './core'

export function useMap(el: HTMLElement, options: any) {
  // TODO 创建3D地图

  const viewer = CreateViewer(el)
  createBaseLayer(viewer, options)

  return {
    instance: viewer,
    addMarker: (points: any[], markerOptions: any) => addMarker(viewer, points, markerOptions)
  }
}
