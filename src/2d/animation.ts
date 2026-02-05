import { Map } from 'ol'
import { Point, LineString } from 'ol/geom'
import Feature from 'ol/Feature'
import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import { Style, Icon, Stroke, Fill } from 'ol/style'
import { TrackAnimationOptions } from './types'

function calcLengths(path: number[][]) {
  const segLengths: number[] = []
  let total = 0
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]
    const b = path[i + 1]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const l = Math.hypot(dx, dy)
    segLengths.push(l)
    total += l
  }
  const cum: number[] = [0]
  for (let i = 0; i < segLengths.length; i++) cum.push(cum[i] + segLengths[i])
  return { segLengths, total, cum }
}

/**
 * 创建轨迹动画
 * @param map 地图实例
 * @param path 线路数据
 * @param options 配置项
 * @returns
 */
export function trackAnimation(map: Map, path: number[][], options: TrackAnimationOptions) {
  const { duration = 2000, style = {}, showPath = false, loop = false } = options
  if (!path || path.length === 0) throw new Error('path is required')
  if (!map) throw new Error('map is required')
  if (path.length === 1) {
    const feature = new Feature({ geometry: new Point(path[0]) })
    const markerLayer = new VectorLayer({ source: new VectorSource({ features: [feature] }) })
    map.addLayer(markerLayer)
    return {
      stop() {
        map.removeLayer(markerLayer)
      }
    }
  }

  const { icon, offset, autoRotate } = style

  const marker = new Feature({ geometry: new Point(path[0]) })
  const features: Feature[] = [marker]

  let pathFeature: Feature | undefined
  if (showPath) {
    pathFeature = new Feature({ geometry: new LineString([path[0]]) })
    pathFeature.setStyle(new Style({ stroke: new Stroke({ color: '#3399CC', width: 2 }), fill: new Fill({ color: 'rgba(51,153,204,0.2)' }) }))
    features.push(pathFeature)
  }

  const markerStyle = new Style({ image: new Icon({ src: icon, offset: offset }) })
  marker.setStyle(markerStyle)

  const layer = new VectorLayer({ source: new VectorSource({ features }) })
  map.addLayer(layer)

  const { segLengths, total, cum } = calcLengths(path)

  let rafId: number | null = null
  let startTime: number | null = null
  let stopped = false

  function setMarkerAtCoord(coord: number[]) {
    marker.setGeometry(new Point(coord))
  }

  function setMarkerRotation(angle: number) {
    marker.setStyle(new Style({ image: new Icon({ src: icon, offset: offset, rotation: angle }) }))
  }

  function interpolateAt(t: number) {
    const dist = t * total
    // find segment
    let i = 0
    while (i < segLengths.length && cum[i + 1] < dist) i++
    const segDist = dist - cum[i]
    const segLen = segLengths[i] || 0
    const ratio = segLen === 0 ? 0 : segDist / segLen
    const a = path[i]
    const b = path[i + 1]
    const x = a[0] + (b[0] - a[0]) * ratio
    const y = a[1] + (b[1] - a[1]) * ratio
    setMarkerAtCoord([x, y])
    // 更新已走路径：从起点到当前插值点
    if (pathFeature) {
      const partial: number[][] = []
      for (let k = 0; k <= i; k++) partial.push(path[k])
      // 替换当前段的终点为插值点
      partial.push([x, y])
      pathFeature.setGeometry(new LineString(partial))
    }
    if (autoRotate) {
      const angle = Math.atan2(b[1] - a[1], b[0] - a[0])
      setMarkerRotation(angle)
    }
  }

  function frame(now: number) {
    if (stopped) return
    if (!startTime) startTime = now
    const elapsed = now - startTime
    let t = Math.min(1, elapsed / duration)
    interpolateAt(t)
    if (t < 1) {
      rafId = requestAnimationFrame(frame)
    } else {
      if (loop) {
        startTime = null
        rafId = requestAnimationFrame(frame)
      } else {
        rafId = null
      }
    }
  }

  rafId = requestAnimationFrame(frame)

  return {
    stop() {
      stopped = true
      if (rafId != null) cancelAnimationFrame(rafId)
      map.removeLayer(layer)
    }
  }
}
