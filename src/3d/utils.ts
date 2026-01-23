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
