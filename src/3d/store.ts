// src/3d/store.ts

import { Asyncify, MapContext } from './types'

// 内部存储容器
const mapRegistry = new Map<string, MapContext>()

const readyCallbacks: Record<string, Function[]> = {}

const contentCallbacks: Record<string, Function[]> = {}

/**
 * 注册地图
 * @param id 地图容器的 ID (target)
 * @param {MapContext} context 地图上下文
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

  if (contentCallbacks[id]) {
    contentCallbacks[id].forEach((resolve) => resolve(context))
    delete contentCallbacks[id] // 清空队列
  }
}

/**
 * 异步获取已创建的地图上下文
 * @param id 地图容器的 ID (target)
 * @returns {Promise<MapContext>}
 */
export function getMapContextAsync(id: string): Promise<MapContext> {
  const context = mapRegistry.get(id)
  if (context) return Promise.resolve(context)

  return new Promise((resolve) => {
    contentCallbacks[id] = contentCallbacks[id] || []
    contentCallbacks[id].push(resolve)
  })
}

/**
 * 获取已创建的地图上下文
 * @param id 地图容器的 ID (target)
 * @returns {Asyncify<MapContext>}
 */
export function getMapContext(id: string): Asyncify<MapContext> {
  return new Proxy({} as MapContext, {
    get(_, key: keyof MapContext) {
      return async (...args: any[]) => {
        const ctx = await getMapContextAsync(id)
        const target = ctx[key]
        return typeof target === 'function' ? target.apply(ctx, args) : target
      }
    }
  })
}

/**
 * 销毁并移除
 */
export const unregisterMap = (id: string) => {
  if (mapRegistry.has(id)) {
    mapRegistry.delete(id)
    delete readyCallbacks[id]
    delete contentCallbacks[id]
  }
}

export const onMapReady = (id: string, callback: (ctx: MapContext) => void) => {
  const ctx = mapRegistry.get(id)
  // 1. 如果地图已经存在，立即执行
  if (ctx) {
    callback(ctx)
    return
  }

  // 2. 如果不存在，存入队列，等 `registerMap` 时调用
  if (!readyCallbacks[id]) {
    readyCallbacks[id] = []
  }
  readyCallbacks[id].push(callback)
}
