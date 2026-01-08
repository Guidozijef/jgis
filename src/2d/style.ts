import type { StyleLike, StyleFunction } from 'ol/style/Style'
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style'

export function generateStyle(layerName: string, options: any): StyleLike | null {
  let styleFn: StyleLike | null = null
  if (options.style) {
    styleFn = options.style
  } else if (options.getStyle) {
    styleFn = (feature, resolution) => options.getStyle(layerName, feature, resolution)
  } else {
    styleFn = generatePointsStyle()
  }
  return styleFn
}

function generatePointsStyle() {
  const styleFn = (feature, resolution) => {
    return new Style({
      image: new CircleStyle({
        radius: 10,
        fill: new Fill({ color: 'red' })
      })
    })
  }
  return styleFn
}

function generateLinesStyle() {
  const styleFn = (feature, resolution) => {
    return new Style({
      fill: new Fill({
        color: 'rgba(255, 0, 0, 1)'
      }),
      stroke: new Stroke({
        color: 'rgba(255, 0, 0, 1)',
        width: 2
      })
    })
  }
  return styleFn
}
