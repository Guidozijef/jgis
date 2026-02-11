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
//  log = prettyLog()
//  log.warning("注意！", "版权所属：贾宛龙！需要去除版权请微信联系：trampjwl！ ");
export function prettyLog() {
  const isEmpty = (value) => {
    return value == null || value === undefined || value === ''
  }
  const prettyPrint = (title, text, color) => {
    console.log(
      `%c ${title} %c ${text} %c`,
      `background:${color};border:1px solid ${color}; padding: 1px; border-radius: 2px 0 0 2px; color: #fff;`,
      `border:1px solid ${color}; padding: 1px; border-radius: 0 2px 2px 0; color: ${color};`,
      'background:transparent'
    )
  }
  const info = (textOrTitle, content = '') => {
    const title = isEmpty(content) ? 'Info' : textOrTitle
    const text = isEmpty(content) ? textOrTitle : content
    prettyPrint(title, text, '#909399')
  }
  const error = (textOrTitle, content = '') => {
    const title = isEmpty(content) ? 'Error' : textOrTitle
    const text = isEmpty(content) ? textOrTitle : content
    prettyPrint(title, text, '#F56C6C')
  }
  const warning = (textOrTitle, content = '') => {
    const title = isEmpty(content) ? 'Warning' : textOrTitle
    const text = isEmpty(content) ? textOrTitle : content
    prettyPrint(title, text, '#E6A23C')
  }
  const success = (textOrTitle, content = '') => {
    const title = isEmpty(content) ? 'Success ' : textOrTitle
    const text = isEmpty(content) ? textOrTitle : content
    prettyPrint(title, text, '#67C23A')
  }
  return {
    info,
    error,
    warning,
    success
  }
}
