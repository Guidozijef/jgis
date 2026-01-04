import { createMap2D } from "./core";

export const useMap2D = (config) => {
  const map = createMap2D(config);

  return {
    instance: map, // 暴露原始实例以备不时之需
    addMarker: (pos) => {},
    setZoom: (level) => {},
    // ...其他方法
  };
};
