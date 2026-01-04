import { CreateViewer } from "./core";

export function useMap3D(el, options) {
  // TODO 创建3D地图

  const viewer = CreateViewer(el);

  return {
    instance: viewer,
    addMarker: (marker) => {
      console.log("添加3D标记", marker);
    },
  };
}
