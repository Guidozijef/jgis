import { createViewer, addMarker, flyTo, flyHome } from './core'
import { useSelect } from './interaction'
import { createBaseLayer, createLayer } from './layer'
import { flyOptions, LayerOptions } from './types'

/**
 * 创建地图
 * @param el 绑定地图元素Id
 * @param options 配置项
 * @returns 地图方法和地图实例
 */
export function useMap(el: string, options: any) {
  // TODO 创建3D地图

  const viewer = createViewer(el, options)
  createBaseLayer(viewer, options)

  return {
    instance: viewer,
    addMarker: (layerName: string, points: any[], options: any) => addMarker(viewer, layerName, points, options),
    createLayer: (layerName: string, data: any, options?: LayerOptions) =>
      createLayer(viewer, layerName, data, options),
    useSelect: () => useSelect(viewer),
    flyTo: (coordinate: [number, number, number], options?: flyOptions): Promise<boolean> =>
      flyTo(viewer, coordinate, options),
    flyHome: (duration: number): void => flyHome(viewer, duration)
  }
}
