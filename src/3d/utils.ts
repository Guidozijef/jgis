import * as Cesium from 'cesium'

export function getCenterOfPoints(points: [number, number][]): [number, number] {
  const x = points.map((p) => p[0]).reduce((a, b) => a + b, 0) / points.length
  const y = points.map((p) => p[1]).reduce((a, b) => a + b, 0) / points.length
  return [x, y]
}

export function getDistanceOfPoints(points: [number, number][]): number {
  const center = getCenterOfPoints(points)
  const distances = points.map((p) => {
    const dx = p[0] - center[0]
    const dy = p[1] - center[1]
    return Math.sqrt(dx * dx + dy * dy)
  })
  return Math.max(...distances)
}

export function getBoundsOfPoints(points: [number, number][]): [number, number, number, number] {
  const x = points.map((p) => p[0])
  const y = points.map((p) => p[1])
  return [Math.min(...x), Math.min(...y), Math.max(...x), Math.max(...y)]
}

export function getsdfg(viewer: any, pickedObj: any) {
  const infoPosition = pickedObj.id.position._value
  // 计算屏幕位置
  const screenPosition = viewer.scene.cartesianToCanvasCoordinates(infoPosition)
  return screenPosition
}

export function formatPositon(position) {
  const carto = Cesium.Cartographic.fromCartesian(position)
  const result = {
    x: Number(Cesium.Math.toDegrees(carto.longitude).toFixed(6)),
    y: Number(Cesium.Math.toDegrees(carto.latitude).toFixed(6)),
    z: Number(carto.height.toFixed(1))
  }

  return result
}

type dataType = { lttd?: number; lgtd?: number } & { jd?: number; wd?: number } & {
  latitude?: number
  longitude?: number
} & {
  lon?: number
  lat?: number
}

/**
 * 解析出数据中的经纬度
 * @param data 数据
 * @returns [经度, 纬度]
 */
export function getLonLat(data: dataType, options?: { lonLabel: string; latLabel: string }): [number, number] {
  if (typeof data !== 'object' || data === null) return null
  if (options && options.lonLabel && options.latLabel) {
    return [Number(data[options.lonLabel]), Number(data[options.latLabel])]
  } else if (data.lttd && data.lgtd) {
    return [Number(data.lgtd), Number(data.lttd)]
  } else if (data.jd && data.wd) {
    return [Number(data.jd), Number(data.wd)]
  } else if (data.latitude && data.longitude) {
    return [Number(data.longitude), Number(data.latitude)]
  } else if (data.lon && data.lat) {
    return [Number(data.lon), Number(data.lat)]
  }
  return null
}
