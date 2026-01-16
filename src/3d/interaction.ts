import * as Cesium from 'cesium'
import { billboardOptions } from './types'
import { throttle } from '../utils'

export interface SelectResult {
  primitive: Cesium.Primitive
  properties: any
  event: Cesium.Cartesian2
  pick: any
  layerName: string
}

export interface UseSelectResult {
  onSelect: (result: (SelectResult) => void) => void
  clear: () => void
  destroy: () => void
}

export interface SelectOptions {
  style?: billboardOptions
  getStyle?: (primitive: Cesium.Primitive) => billboardOptions
}

/**
 * 创建选择功能
 * @param {Cesium.Viewer} viewer 视图
 * @param {SelectOptions} options 配置项
 * @returns {UseSelectResult}
 */
export function createSelect(viewer: Cesium.Viewer, options: SelectOptions): UseSelectResult {
  const callbacks = new Set<Function>()
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  let lastPickedPrimitive = null

  handler.setInputAction((movement) => {
    const pickedObject = viewer.scene.pick(movement.position)
    if (lastPickedPrimitive) {
      Object.assign(lastPickedPrimitive, lastPickedPrimitive._originStyle)
      lastPickedPrimitive.isSelected = false
      lastPickedPrimitive = null
      viewer.scene.requestRender()
    }
    if (Cesium.defined(pickedObject) && pickedObject.primitive instanceof Cesium.Billboard) {
      const primitive = pickedObject.primitive
      primitive.isSelected = true
      const data: SelectResult = {
        primitive: primitive,
        properties: primitive._properties,
        event: movement,
        pick: pickedObject,
        layerName: primitive._layerName
      }
      lastPickedPrimitive = primitive
      notify(data)
      Object.assign(primitive, options.style || options.getStyle(primitive))
      viewer.scene.requestRender()
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  const notify = (res: SelectResult) => callbacks.forEach((cb) => cb(res))

  return {
    onSelect: (cb: (e: any) => void) => {
      callbacks.add(cb)
      return () => callbacks.delete(cb)
    },
    clear() {
      callbacks.clear()
    },
    destroy() {
      callbacks.clear()
    }
  }
}

export interface HoverEvent {
  primitive: Cesium.Primitive
  properties: any
  event: Cesium.Cartesian2
  pick: any
  layerName: string
}

export interface HoverOptions {
  delay?: number
  style?: billboardOptions
  getStyle?: (primitive: Cesium.Primitive) => billboardOptions
}

export interface UseHoverResult {
  onHover: (result: (HoverEvent) => void) => void
  clear: () => void
  destroy: () => void
}

/**
 * 创建hover事件
 * @param {Cesium.Viewer} viewer 视图
 * @param {HoverOptions} options 配置项
 * @returns {UseHoverResult}
 */
export function createHover(viewer: Cesium.Viewer, options: HoverOptions): UseHoverResult {
  const callbacks = new Set<(res: HoverEvent) => void>()

  const notify = (res: HoverEvent) => callbacks.forEach((cb) => cb(res))

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  let lastPickedPrimitive = null
  const notifyThrottle = throttle(notify, options.delay || 500)

  handler.setInputAction((movement) => {
    const pickedObject = viewer.scene.pick(movement.endPosition)
    // TODO: 没选中才恢复样式
    if (lastPickedPrimitive && !lastPickedPrimitive.isSelected) {
      Object.assign(lastPickedPrimitive, lastPickedPrimitive._originStyle)
      lastPickedPrimitive = null
      viewer.scene.requestRender()
    }
    if (Cesium.defined(pickedObject) && pickedObject.primitive instanceof Cesium.Billboard) {
      const primitive = pickedObject.primitive
      const data: HoverEvent = {
        primitive: primitive,
        properties: primitive._properties,
        event: movement,
        pick: pickedObject,
        layerName: primitive._layerName
      }
      notifyThrottle(data)
      lastPickedPrimitive = primitive
      // TODO: 没选中才改变样式
      if (!primitive.isSelected) {
        Object.assign(primitive, options.style || options.getStyle(primitive))
        viewer.scene.requestRender()
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  return {
    onHover: (cb: (e: HoverEvent) => void) => {
      callbacks.add(cb)
      return () => callbacks.delete(cb)
    },
    clear: () => {
      callbacks.clear()
    },
    destroy: () => {
      callbacks.clear()
    }
  }
}
