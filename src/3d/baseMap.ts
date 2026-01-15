import * as Cesium from 'cesium'

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
  const defaultOptions = {
    baseType: 'img',
    noteType: 'cia',
    token: 'dadcbbdb5206b626a29ca739686b3087'
  }
  const { baseType, noteType, token } = Object.assign(defaultOptions, options)
  // const token = Cesium.defaultValue(tokenString, "dadcbbdb5206b626a29ca739686b3087");
  // 服务域名
  const tdtUrl = 'https://t{s}.tianditu.gov.cn'
  // 服务负载子域
  const subdomains = ['0', '1', '2', '3', '4', '5', '6', '7']
  // 叠加影像服务
  const imgMap = new Cesium.UrlTemplateImageryProvider({
    url: `${tdtUrl}/DataServer?T=${baseType}_w&x={x}&y={y}&l={z}&tk=${token}`,
    subdomains: subdomains,
    tilingScheme: new Cesium.WebMercatorTilingScheme()
  })
  let layer = viewer.imageryLayers.addImageryProvider(imgMap)
  layer.gamma = 1

  // 叠加国界服务
  const iboMap = new Cesium.UrlTemplateImageryProvider({
    url: `${tdtUrl}/DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=${token}`,
    subdomains: subdomains,
    tilingScheme: new Cesium.WebMercatorTilingScheme()
  })
  viewer.imageryLayers.addImageryProvider(iboMap)

  //调用影像中文注记服务
  const cia = new Cesium.UrlTemplateImageryProvider({
    url: `${tdtUrl}/DataServer?T=${noteType}_w&x={x}&y={y}&l={z}&tk=${token}`,
    subdomains: subdomains,
    tilingScheme: new Cesium.WebMercatorTilingScheme()
    // maximumLevel: 18
  })
  viewer.imageryLayers.addImageryProvider(cia) //添加到cesium图层上

  // const imageryProviderOsm = new Cesium.UrlTemplateImageryProvider({
  //   url: 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  //   subdomains: ['a', 'b', 'c', 'd'],
  //   tilingScheme: new Cesium.WebMercatorTilingScheme()
  // })
  // viewer.imageryLayers.addImageryProvider(imageryProviderOsm)
}
