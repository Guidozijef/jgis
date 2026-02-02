import { Point, LineString, MultiLineString, Circle as OLCircle, MultiPolygon, Polygon, Geometry } from 'ol/geom'
import Feature from 'ol/Feature'
import { Cluster, Vector as VectorSource, TileWMS } from 'ol/source'
import type { LayerOptions, MapLike, MapInstance, GeoJsonLike, OverlayResult, WmsOptions } from './types'
import { getLonLat } from './utils'
import { getLayerByName } from './layer'
import { Map } from 'ol'

/**
 * 创建数据源
 * @param layerName 图层名称
 * @param data 数据
 * @param options 配置项
 * @returns 数据源
 */
export function createSources<T extends keyof LayerOptions>(layerName: string, data: any[], options: LayerOptions[T] & { type?: T }): VectorSource {
  const features: Feature<Geometry>[] = []
  let geometry: Geometry | undefined
  const type = options.type || 'Point'
  data.forEach((item) => {
    switch (type) {
      case 'Point':
        geometry = createPoint(item, options)
        break
      case 'LineString':
        geometry = createLineString(item)
        break
      case 'MultiLineString':
        geometry = createMultiLineString(item)
        break
      case 'MultiPolygon':
        geometry = createMultiPolygon(item)
        break
      case 'Polygon':
        geometry = createPolygon(item)
        break
    }
    if (!geometry) return
    const feature: Feature<Geometry> = new Feature({
      geometry: geometry,
      data: item
    })
    feature.set('layerName', layerName)
    features.push(feature)
  })

  const vectorSource = new VectorSource()
  if (features.length > 0) {
    vectorSource.addFeatures(features)
  }
  return vectorSource
}

/**
 * 创建WMS数据源
 * @param data 数据
 * @param options 配置项
 * @returns TileWMS数据源
 */
export function createSourceByWms(data: any, options: WmsOptions): TileWMS {
  let CQL_FILTER = ''
  if (options.cqlFilter) {
    if (options.cqlFilter) {
      CQL_FILTER += ` and ${options.cqlFilter}`
    } else {
      CQL_FILTER = options.cqlFilter
    }
  }
  return new TileWMS({
    url: options.url,
    params: {
      LAYERS: options.layers,
      CQL_FILTER: CQL_FILTER
    },
    serverType: 'geoserver',
    crossOrigin: 'anonymous'
  })
}

/**
 * 根据图层名称获取图层数据源
 * @param map 地图实例
 * @param layerName 图层名称
 */
export function getSourceByName(map: Map, layerName: string): any {
  const layer = getLayerByName(map, layerName)
  return layer?.getSource()
}

function createPoint(data: any, options?: any): Point | undefined {
  const lonLat = getLonLat(data, options)
  if (lonLat) {
    return new Point(lonLat)
  }
}

function createLineString(data: any): LineString {
  return new LineString(data.coordinates)
}

function createMultiLineString(data: any): MultiLineString {
  return new MultiLineString(data.coordinates)
}

function createMultiPolygon(data: any): MultiPolygon {
  return new MultiPolygon(data.coordinates)
}

function createPolygon(data: any): Polygon {
  return new Polygon(data.coordinates)
}
