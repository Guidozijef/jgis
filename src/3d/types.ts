export interface flyOptions {
  heading?: number
  pitch?: number
  roll?: number
  duration?: number
  maxHeight?: number
  easing?: (t: number) => number
}

export interface LayerOptions {
  // 图层名称
  name?: string
  // 图层类型
  type?: string
  // 图层数据
  data?: any
  // 图层样式
  style?: any
  // 图层可见性
  visible?: boolean
  // 图层透明度
  opacity?: number
  // 图层是否可交互
  interactive?: boolean
}
