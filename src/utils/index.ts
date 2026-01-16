/**
 * 防抖函数
 * @param fn 函数
 * @param wait 等待时间
 * @returns 函数
 */
export function throttle(fn, delay = 500) {
  let lastTime = 0

  return function (...args) {
    const now = Date.now()

    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}
