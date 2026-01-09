// src/2d/store.ts

// 定义 useMap 返回的类型（根据你之前的封装）
import { MapContext } from './types'

// 内部存储容器
const mapRegistry = new Map<string, MapContext>()

const readyCallbacks: Record<string, Function[]> = {}

/**
 * 注册地图
 * @param id 地图容器的 ID (target)
 */
export const registerMap = (id: string, context: MapContext) => {
  if (mapRegistry.has(id)) {
    console.warn(`Map with target '${id}' already exists. Overwriting...`)
    // 可选：如果已存在，先销毁旧的
    // mapRegistry.get(id)?.destroy();
  }
  mapRegistry.set(id, context)

  // 触发等待的回调
  if (readyCallbacks[id]) {
    readyCallbacks[id].forEach((cb) => cb(context))
    delete readyCallbacks[id] // 清空队列
  }
}
/**
 * 获取已创建的地图上下文
 * @param id 地图容器的 ID (target)
 */
export const getMapContext = (id: string): MapContext | undefined => {
  const context = mapRegistry.get(id)
  if (!context) {
    console.warn(`Map '${id}' not found. Make sure useMap() is called first.`)
    return undefined
  }
  return context
}

/**
 * 销毁并移除
 */
export const unregisterMap = (id: string) => {
  if (mapRegistry.has(id)) {
    mapRegistry.delete(id)
    delete readyCallbacks[id]
  }
}

export const onMapReady = (id: string, callback: (ctx: MapContext) => void) => {
  const ctx = mapRegistry.get(id)
  // 1. 如果地图已经存在，立即执行
  if (ctx) {
    callback(ctx)
    return
  }

  // 2. 如果不存在，存入队列，等 registerMap 时调用
  if (!readyCallbacks[id]) {
    readyCallbacks[id] = []
  }
  readyCallbacks[id].push(callback)
}
