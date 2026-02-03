import type { StyleLike, StyleFunction } from 'ol/style/Style'
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style'
import { styleOptions } from './types'

export function generateStyle(layerName: string, options: styleOptions, type: string = 'Point'): StyleLike | null {
  let styleFn: StyleLike | null = null
  if (options.style) {
    styleFn = options.style
  } else if (options.getStyle) {
    styleFn = (feature, resolution) => options.getStyle(layerName, feature, resolution)
  } else {
    if (type === 'LineString' || type === 'MultiLineString' || type === 'Polygon' || type === 'MultiPolygon') {
      styleFn = generateLinesStyle()
    } else if (type === 'Circle') {
      styleFn = generateCircleStyle()
    } else {
      styleFn = generatePointsStyle()
    }
  }
  return styleFn
}

function generatePointsStyle() {
  const styleFn = (feature, resolution) => {
    return new Style({
      image: new CircleStyle({
        radius: 5,
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

function generateCircleStyle() {
  const styleFn = (feature, resolution) => {
    return new Style({
      fill: new Fill({
        color: 'rgba(0, 247, 255, 0.5)'
      }),
      stroke: new Stroke({
        color: 'rgb(0, 247, 255)',
        width: 2
      })
    })
  }
  return styleFn
}
