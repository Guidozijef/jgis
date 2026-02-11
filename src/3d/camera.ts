// 相机模块
import * as Cesium from 'cesium'
import { getCenter } from './core'
import { Coordinates2 } from './types'
import { Roaming } from './roaming'

// 相机绕点飞行，point为相机中心点，distance为相机距离点多少距离飞行，angle为飞行一周所需时间(单位 秒)，time为飞行时间(单位 秒)
export function windingPoint(viewer, point: Omit<Coordinates2, 'lng' | 'lat' | 'cameraZ'>, options?: { distance: number; time: number }) {
  viewer: null
  position: null
  distance: null
  points: null
  angle: null
  time: null
  heading: null
  pitch: null
  isStart: false
  function start(viewer, point: Omit<Coordinates2, 'lng' | 'lat' | 'cameraZ'>, options?: { distance: number; time: number }) {
    if (!point) point = getCenter(viewer)

    this.viewer = viewer
    this.position = Cesium.Cartesian3.fromDegrees(point.x, point.y, point.z)

    this.distance = options.distance || Cesium.Cartesian3.distance(this.position, viewer.camera.positionWC) // 给定相机距离点多少距离飞行
    this.angle = 360 / (options.time || 60) //time：给定飞行一周所需时间(单位 秒)

    this.time = viewer.clock.currentTime.clone()
    this.heading = viewer.camera.heading // 相机的当前heading
    this.pitch = viewer.camera.pitch

    this.viewer.clock.onTick.addEventListener(this.clock_onTickHandler, this)
    this.isStart = true
  }

  function clock_onTickHandler(e) {
    const delTime = Cesium.JulianDate.secondsDifference(this.viewer.clock.currentTime, this.time) // 当前已经过去的时间，单位 秒
    const heading = Cesium.Math.toRadians(delTime * this.angle) + this.heading

    this.viewer.scene.camera.setView({
      destination: this.position, // 点的坐标
      orientation: {
        heading: heading,
        pitch: this.pitch
      }
    })
    this.viewer.scene.camera.moveBackward(this.distance)
  }

  function stop() {
    if (!this.isStart) return

    if (this.viewer) this.viewer.clock.onTick.removeEventListener(this.clock_onTickHandler, this)
    this.isStart = false
  }

  return {
    start: () => start(viewer, point, options),
    stop
  }
}

export function tackRoaming(viewer, points, options) {
  const roaming = new Roaming(viewer, { time: 3 })

  const lines = points.map(([x, y, z]) => Cesium.Cartesian3.fromDegrees(x, y, z))

  function start() {
    roaming.cameraRoaming(lines)
  }
  function pause(flag: boolean) {
    roaming.PauseOrContinue(flag)
  }
  function stop() {
    roaming.EndRoaming()
  }

  return {
    start,
    pause,
    stop
  }
}
