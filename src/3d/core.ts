import * as Cesium from "cesium";

/**
 * 创建Viewer
 *
 * @param {String} [divStr] Cesium.viewer对应的DOM元素名：<div id="cesiumContainer"></div>
 * @param {String} [terrainUrl] 地形链接
 */
export async function CreateViewer(el: HTMLElement, terrainUrl?: string) {
  let _terrainProvider;
  if (Cesium.defined(terrainUrl)) {
    _terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(terrainUrl, {
      requestVertexNormals: true,
      requestWaterMask: true,
    });
  }

  if (!Cesium.defined(_terrainProvider)) {
    _terrainProvider = new Cesium.EllipsoidTerrainProvider();
  }

  const viewer = new Cesium.Viewer(el, {
    requestRenderMode: true, //减少应用程序的 CPU/GPU 使用率
    maximumRenderTimeChange: Infinity, //默认时间变化请求一个新帧
    selectionIndicator: false, //选中元素显示,默认true
    animation: false,
    timeline: false, //时间线,默认true
    geocoder: false, //地名查找,默认true
    homeButton: false, //控制右上角home按钮显示
    baseLayerPicker: false, //地图切换控件(底图以及地形图)是否显示,默认显示true
    imageryProvider: new Cesium.GridImageryProvider(),
    sceneModePicker: false,
    navigationHelpButton: false,
    infoBox: false, //点击要素之后显示的信息,默认true
    fullscreenButton: false, //全屏按钮,默认显示true
    shouldAnimate: true, // Enable animations
    terrainProvider: _terrainProvider,
    contextOptions: {
      webgl: {
        preserveDrawingBuffer: true, //允许截图
      },
    },
  });

  //去除cesium版权信息
  viewer._cesiumWidget._creditContainer.style.display = "none";

  return viewer;
}
