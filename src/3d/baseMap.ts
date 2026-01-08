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
    img_w: true,
    ibo_w: true,
    cia_w: true,
    token: 'dadcbbdb5206b626a29ca739686b3087'
  }
  const { img_w, ibo_w, cia_w, token } = Object.assign(defaultOptions, options)
  // const token = Cesium.defaultValue(tokenString, "dadcbbdb5206b626a29ca739686b3087");
  // 服务域名
  const tdtUrl = 'https://t{s}.tianditu.gov.cn/'
  // 服务负载子域
  const subdomains = ['0', '1', '2', '3', '4', '5', '6', '7']
  // 叠加影像服务
  if (img_w) {
    const imgMap = new Cesium.UrlTemplateImageryProvider({
      url: tdtUrl + 'DataServer?T=img_w&x={x}&y={y}&l={z}&tk=' + token,
      subdomains: subdomains,
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      maximumLevel: 18
    })
    let layer = viewer.imageryLayers.addImageryProvider(imgMap)
    layer.gamma = 1
  } else {
    const imageryProviderOsm = new Cesium.UrlTemplateImageryProvider({
      url: 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c', 'd'],
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      maximumLevel: 18
    })
    viewer.imageryLayers.addImageryProvider(imageryProviderOsm)
  }

  // 叠加国界服务
  if (ibo_w) {
    const iboMap = new Cesium.UrlTemplateImageryProvider({
      url: tdtUrl + 'DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=' + token,
      subdomains: subdomains,
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      maximumLevel: 10
    })
    viewer.imageryLayers.addImageryProvider(iboMap)
  }

  //调用影像中文注记服务
  if (cia_w) {
    const cia = new Cesium.UrlTemplateImageryProvider({
      url: tdtUrl + 'DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=' + token,
      subdomains: subdomains,
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      maximumLevel: 18
    })

    viewer.imageryLayers.addImageryProvider(cia) //添加到cesium图层上
  }
}
