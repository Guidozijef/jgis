// 使用页面中加载的 OpenLayers UMD 包（全局 `ol`）以避免裸模块解析问题
const { Map, View } = ol
const { fromLonLat } = ol.proj
const Feature = ol.Feature
const Point = ol.geom.Point
const LineString = ol.geom.LineString
const VectorSource = ol.source.Vector
const VectorLayer = ol.layer.Vector
const { Style, Icon, Stroke, Fill } = ol.style

// 简单示例：一条经纬度路径
const rawPath = [
  [116.397, 39.908],
  [116.405, 39.91],
  [116.415, 39.913],
  [116.425, 39.915]
]

const path = rawPath.map((p) => fromLonLat(p))

const map = new Map({
  target: 'map',
  view: new View({ center: path[0], zoom: 14 })
})

function calcLengths(path) {
  const segLengths = []
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
  const cum = [0]
  for (let i = 0; i < segLengths.length; i++) cum.push(cum[i] + segLengths[i])
  return { segLengths, total, cum }
}

function demoTrack(map, path, opts = {}) {
  const { duration = 4000, icon, autoRotate = true, showPath = true } = opts
  const marker = new Feature({ geometry: new Point(path[0]) })
  const features = [marker]
  let pathFeature = null
  if (showPath) {
    pathFeature = new Feature({ geometry: new LineString([path[0]]) })
    pathFeature.setStyle(new Style({ stroke: new Stroke({ color: '#3399CC', width: 2 }) }))
    features.push(pathFeature)
  }
  if (icon) marker.setStyle(new Style({ image: new Icon({ src: icon }) }))
  const layer = new VectorLayer({ source: new VectorSource({ features }) })
  map.addLayer(layer)

  const { segLengths, total, cum } = calcLengths(path)
  let raf = null
  let start = null
  function setMarker(coord) {
    marker.setGeometry(new Point(coord))
  }
  function frame(now) {
    if (!start) start = now
    const t = Math.min(1, (now - start) / duration)
    const dist = t * total
    let i = 0
    while (i < segLengths.length && cum[i + 1] < dist) i++
    const segDist = dist - cum[i]
    const segLen = segLengths[i] || 0
    const ratio = segLen === 0 ? 0 : segDist / segLen
    const a = path[i]
    const b = path[i + 1]
    const x = a[0] + (b[0] - a[0]) * ratio
    const y = a[1] + (b[1] - a[1]) * ratio
    setMarker([x, y])
    // 更新已走路径显示（仅展示到当前点）
    if (pathFeature) {
      const partial = []
      for (let k = 0; k <= i; k++) partial.push(path[k])
      partial.push([x, y])
      pathFeature.setGeometry(new LineString(partial))
    }
    if (t < 1) raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)
  return {
    stop() {
      if (raf) cancelAnimationFrame(raf)
      map.removeLayer(layer)
    }
  }
}

// 运行演示
const ctrl = demoTrack(map, path, { duration: 6000, showPath: true })

// 停止演示示例：5s 后停止
setTimeout(() => {
  ctrl.stop()
}, 8000)
