export const version = '1.0.0'

export const author = 'zhangjianfeng'

type dataType = { lttd?: number; lgtd?: number } & { jd?: number; wd?: number } & {
  latitude?: number
  longitude?: number
} & {
  lon?: number
  lat?: number
}
/**
 * 解析出数据中的经纬度
 * @param data 数据
 * @returns [经度, 纬度]
 */
export function getLonLat(data: dataType, options?: { lonLabel: string; latLabel: string }): [number, number] {
  if (typeof data !== 'object' || data === null) return null
  if (options && options.lonLabel && options.latLabel) {
    return [Number(data[options.lonLabel]), Number(data[options.latLabel])]
  } else if (data.lttd && data.lgtd) {
    return [Number(data.lgtd), Number(data.lttd)]
  } else if (data.jd && data.wd) {
    return [Number(data.jd), Number(data.wd)]
  } else if (data.latitude && data.longitude) {
    return [Number(data.longitude), Number(data.latitude)]
  } else if (data.lon && data.lat) {
    return [Number(data.lon), Number(data.lat)]
  }
  return null
}
