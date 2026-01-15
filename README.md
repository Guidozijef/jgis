# JGIS

<p align="left">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/build-vite-646CFF" alt="Vite">
  <img src="https://img.shields.io/badge/typescript-100%25-blue" alt="TypeScript">
</p>

**JGIS** 是一个基于函数式编程思维构建的轻量级 GIS 工具库。它采用多入口架构，严格分离二维（OpenLayers）与三维（Cesium）依赖，提供开箱即用的高阶交互钩子和统一的 API 设计。

## ✨ 核心特性

*   **📦 多入口架构 (Multi-Entry)**：
    *   按需引入 `jgis/2d` 或 `jgis/3d`。
    *   使用 2D 功能时绝不会打包 Cesium 代码，保持体积轻量。
*   **🚀 函数式编程 (Functional)**：
    *   摒弃复杂的类继承，使用 Hooks 风格（如 `useSelect`, `useMap`）。
    *   支持**隐式上下文**：初始化地图后，功能函数自动绑定当前地图实例，无需重复传参。
*   **⚡️ 全能拾取器 (Universal Picker)**：
    *   **Hybrid Select**：一套 API 同时支持本地 Vector 图层和远程 WMS 服务（自动解析 GetFeatureInfo）。
    *   **Unified Styling**：WMS 图层也能像 Vector 一样拥有动态高亮样式。
*   **🎨 灵活的样式系统**：
    *   支持根据图层、属性动态渲染高亮样式，完全控制权交给用户。
*   **🗺️ 二三维API风格一致**：
    *   二三维API风格一致，方便会一种框架的开发者快速理解和上手开发。
*   **🗺️ 完全兼容openlayers/cesium**：
    *   导出`instance`地图实例，可自己操作原生API。
    *   如果有特殊需求，完全可以自己用原生实现，没有任何违和感。


---

## 📦 安装

JGIS 依赖 `ol` (OpenLayers) 和 `cesium` 作为对等依赖 (Peer Dependencies)，请确保你的项目中已安装它们。

```bash
# 安装 jgis
npm install jgis

# 安装核心依赖
npm install ol
npm install cesium
```


---

## 🗺️ 快速开始 (2D)

### 1. 初始化地图

```vue
<template>
  <!-- ⚠️ 注意：必须给容器设置高度，否则地图无法显示 -->
  <div id="map-container" style="height: 100vh; width: 100%;"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import 'ol/ol.css'; // ⚠️ 别忘了引入 OpenLayers 样式
import { useMap } from 'jgis/2d';

onMounted(() => {
  // 初始化地图，会自动注册为全局激活实例
  const { instance, addMarker, createLayer } = useMap('map-container', {
    center: [116.4, 39.9],
    zoom: 10
  });

  addMarker('创建点位图层', [{ lon: 104.064839, lat: 30.548857 }], {
    style: new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color: 'blue' })
      })
    })
  })

  createLayer('创建wms服务图层', { url: 'https://ahocevar.com/geoserver/wms', type: 'Wms', layers: 'topp:states' })

});
</script>
```

### 2. 使用交互功能 (Select / Hover)

JGIS 的核心优势在于**同时处理 Vector 和 WMS 图层**，并提供统一的样式回调。

```javascript
const { useSelect } = useMap('map-container');

// 假设你有两个图层：一个是本地 Vector，一个是 Geoserver WMS
const vectorLayer = ...;
const wmsLayer = ...;

// 开启选择交互 (无需传入 map 实例)
const select = useSelect({
  // 监听这些图层 (不传则监听所有)
  layers: [vectorLayer, wmsLayer],
  
  // 支持多选 (Shift + 点击)
  multi: false,

  // 自定义高亮样式 (支持函数或对象)
  style: (layerName, feature) => {
    // 自动识别数据来源
    const layer = feature.get('wms_layer_source'); // WMS 注入的标记
    const type = feature.get('type');
    
    // 根据业务逻辑返回不同样式
    if (layer === wmsLayer) {
       return new Style({ 
         stroke: new Stroke({ color: 'red', width: 3 }),
         fill: new Fill({ color: 'rgba(255,0,0,0.1)' })
       });
    }
    // 默认样式
    return undefined; 
  }
});

// 监听回调
select.onSelect((res) => {
  if (res && res.length > 0) {
    // res 是一个数组，包含 feature, layer 和 properties
    const item = res[0];
    console.log('选中要素属性:', item.properties);
    console.log('所属图层:', item.layer);
  } else {
    console.log('取消选中');
  }
});

// 页面销毁时可调用
// select.destroy();
```


### 3. 异步调用

如果创建地图的`useMap`在一个文件，而选择交互在另一个文件，可以使用异步调用。在文件中使用`onMapReady`和`getMapContext`方法来获取地图方法，而不需要传递跟地图相关的任何参数，但是必须指定地图容器的 id。例如：

```js
import { onMapReady, getMapContext } from 'jgis/2d';

// 'map-container' 是地图容器的 id
onMapReady('map-container', ({ createLayer, flyTo }) => {
  
})


getMapContext('map-container').then(({ createLayer, flyTo }) => {
  
})

```


---

## 🌍 快速开始 (3D)

三维模块完全隔离，不会污染二维项目。

### 1. 初始化地图

```vue
<template>
  <!-- ⚠️ 注意：必须给容器设置高度，否则地图无法显示 -->
  <div id="map-container" style="height: 100vh; width: 100%;"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useMap } from 'jgis/3d';

onMounted(() => {
  // 初始化地图，会自动注册为全局激活实例
  const { instance, flyTo, addMarker } = useMap('map-container', {
    center: [116.4, 39.9],
    zoom: 10
  });

  addMarker(
    '创建点位图层',
    [
      { lon: 104.397428, lat: 30.90923 },
      { lon: 104.45343, lat: 30.83233 }
    ],
    {
      style: (item) => new URL('./img.png', import.meta.url).href,
      scale: 0.4,
      // color: Cesium.Color.YELLOW,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      scaleByDistance: new Cesium.NearFarScalar(1, 1, 100000, 0.2)
    }
  )

 flyTo([104.397428, 30.90923, 10000], { duration: 1, pitch: -Math.PI / 2 })

});
</script>
```

### 2. 使用交互功能 (Select / Hover)


```javascript
import { useMap } from 'jgis/3d';
const { useSelect } = useMap('map-container');


const { onSelect } = useSelect({
  style: {
    color: Cesium.Color.YELLOW,
    scale: 0.5
  }
})

onSelect((data) => {
  console.log('获取的数据', data)
})

```



### 3. 异步调用

如果创建地图的`useMap`在一个文件，而选择交互在另一个文件，可以使用异步调用。在文件中使用`onMapReady`和`getMapContext`方法来获取地图方法，而不需要传递跟地图相关的任何参数，但是必须指定地图容器的 id。例如：

```js
import { onMapReady, getMapContext } from 'jgis/3d';

// 'map-container' 是地图容器的 id
onMapReady('map-container', ({ createLayer, flyTo }) => {
  
})


getMapContext('map-container').then(({ createLayer, flyTo }) => {
  
})

```


---

## 🛠️ 项目配置指南 (Vite & TS)

### 1. 解决 OpenLayers/Cesium 双重实例报错 (Instance Mismatch)

如果你在控制台看到 `instanceof` 检查失败、样式不生效或报错，通常是因为依赖被重复打包。请在宿主项目的 `vite.config.ts` 中强制合并依赖。

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    // 🟢 关键配置：强制指向项目根目录的 node_modules
    dedupe: ['ol', 'cesium'],
    // 配合 yalc 或 npm link 使用时建议开启
    preserveSymlinks: true 
  }
});
```

### 2. TypeScript 提示找不到模块

如果报错 `Cannot find module 'jgis/2d'`，是因为 TS 默认不解析 `package.json` 的 `exports` 字段。

请修改 `tsconfig.json`：

```json
{
  "compilerOptions": {
    // 推荐设置为 bundler 以完美支持多入口库
    "moduleResolution": "bundler"
  }
}
```

---

## 📂 目录结构

```text
jgis/
├── dist/                # 打包产物
├── src/
│   ├── 2d/              # 基于 OpenLayers 的封装
│   │   ├── core/        # 地图初始化与 Context 管理
│   │   ├── layer/       # 图层操作
│   │   ├── select.ts    # 全能选择器 (Hybrid Select)
│   │   └── hover.ts     # 悬停交互 (带防抖)
│   ├── 3d/              # 基于 Cesium 的封装
│   ├── utils/           # 通用几何/数学工具
│   └── index.ts         # 公共类型导出
├── package.json         # 定义 exports 多入口
└── vite.config.ts       # 构建配置 (external正则配置)
```

---

## ❓ 常见问题 FAQ

**Q: 地图不显示，页面一片白？**
A: 请检查地图容器 `div` 是否设置了 `height`。块级元素默认高度为 0，必须显式设置（如 `height: 100vh`）。

**Q: 样式错乱，缩放控件显示异常？**
A: 必须在项目入口或组件中引入 `import 'ol/ol.css'`。

**Q: WMS 图层点击没反应？**
A: 
1. 检查 WMS 服务是否开启跨域 (CORS)。
2. 检查 WMS 服务是否支持 `INFO_FORMAT=application/json`。
3. 检查控制台 Network 面板，确认 `GetFeatureInfo` 请求 URL 是否正确。

**Q: Prettier/ESLint 报错 Cannot find module?**
A: 这是一个 ESM/CJS 混用问题。请将 `.prettierrc.js` 重命名为 `.prettierrc.json`，并清理 `node_modules` 重新安装。

---

## License

MIT