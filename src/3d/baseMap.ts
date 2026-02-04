import * as Cesium from 'cesium'
import { mapType } from './types'
import { removeLayer } from './layer'

/**
 * 添加天地图
 *
 * @param {Object} [viewer] Cesium.viewer对象
 * @param {Boolean} [addImg_w] 控制添加天地图影像底图
 * @param {Boolean} [addIbo_w] 控制添加天地图影像国界
 * @param {Boolean} [addCia_w] 控制添加天地图影像注记
 * @param {String} [tokenString] 天地图对应token
 */
export function addTDTImageryProvider(viewer, options) {
  const TOKEN = options.token || 'dadcbbdb5206b626a29ca739686b3087'
  const baseTypeMap = {
    img: ['img', 'cia'],
    vec: ['vec', 'cva'],
    ter: ['ter', 'cta']
  }
  const baseType = baseTypeMap[options.baseType || 'vec']
  // const token = Cesium.defaultValue(tokenString, "dadcbbdb5206b626a29ca739686b3087");
  // 服务域名
  const tdtUrl = 'https://t{s}.tianditu.gov.cn'
  // 服务负载子域
  const subdomains = ['0', '1', '2', '3', '4', '5', '6', '7']
  // 叠加影像服务
  const imgMap = new Cesium.UrlTemplateImageryProvider({
    url: `${tdtUrl}/DataServer?T=${baseType[0]}_w&x={x}&y={y}&l={z}&tk=${TOKEN}`,
    subdomains: subdomains,
    tilingScheme: new Cesium.WebMercatorTilingScheme()
  })
  ;(imgMap as any)._layerName = 'base-img-layer'
  let layer = viewer.imageryLayers.addImageryProvider(imgMap)
  layer.gamma = 1

  //调用影像中文注记服务
  const cia = new Cesium.UrlTemplateImageryProvider({
    url: `${tdtUrl}/DataServer?T=${baseType[1]}_w&x={x}&y={y}&l={z}&tk=${TOKEN}`,
    subdomains: subdomains,
    tilingScheme: new Cesium.WebMercatorTilingScheme()
    // maximumLevel: 18
  })
  ;(cia as any)._layerName = 'base-cia-layer'
  viewer.imageryLayers.addImageryProvider(cia) //添加到cesium图层上

  // 叠加国界服务
  const iboMap = new Cesium.UrlTemplateImageryProvider({
    url: `${tdtUrl}/DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=${TOKEN}`,
    subdomains: subdomains,
    tilingScheme: new Cesium.WebMercatorTilingScheme()
  })
  ;(iboMap as any)._layerName = 'base-ibo-layer'
  viewer.imageryLayers.addImageryProvider(iboMap)

  // const imageryProviderOsm = new Cesium.UrlTemplateImageryProvider({
  //   url: 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  //   subdomains: ['a', 'b', 'c', 'd'],
  //   tilingScheme: new Cesium.WebMercatorTilingScheme()
  // })
  // viewer.imageryLayers.addImageryProvider(imageryProviderOsm)
}

export function setBaseLayer(viewer: Cesium.Viewer, baseType: mapType, options?: { token?: string }) {
  removeLayer(viewer, ['base-ibo-layer', 'base-cia-layer', 'base-img-layer'])
  addTDTImageryProvider(viewer, { baseType, token: options?.token })
}
