import * as Cesium from 'cesium'

export function useSelect(viewer, options: any) {
  const callbacks = new Set<Function>()
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  let lastPickedPrimitive = null

  handler.setInputAction((movement) => {
    const pickedObject = viewer.scene.pick(movement.position)
    if (lastPickedPrimitive) {
      Object.assign(lastPickedPrimitive, lastPickedPrimitive._originStyle)
      lastPickedPrimitive = null
      viewer.scene.requestRender()
    }
    if (Cesium.defined(pickedObject) && pickedObject.primitive instanceof Cesium.Billboard) {
      const billboard = pickedObject.primitive
      const data = {
        billboard: billboard,
        properties: billboard.properties,
        event: movement,
        pick: pickedObject
      }
      lastPickedPrimitive = billboard
      notify(data)
      Object.assign(billboard, options.style || options.getStyle(billboard))
      viewer.scene.requestRender()
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  const notify = (res: any) => callbacks.forEach((cb) => cb(res))

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
