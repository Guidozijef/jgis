import { Map } from 'ol'
import axios from 'axios'
import { boundingExtent, getCenter } from 'ol/extent.js'
import { altKeyOnly, click, pointerMove } from 'ol/events/condition.js'
import Select from 'ol/interaction/Select'

import type {
  JGisInstance,
  JGisConfig,
  MoveEventOptions,
  ClickEventOptions,
  FeatureCallbackParams,
  LayerOptions,
  customFeature,
  HighLightOptions,
  FlashOptions,
  JGisInitOptions
} from './types'
import type { Feature } from 'ol'
import type { FeatureLike } from 'ol/Feature'
import type { Layer } from 'ol/layer'
import { Geometry } from 'ol/geom'
import { TileWMS, ImageWMS } from 'ol/source'

export default class JGis implements JGisInstance {
  protected Map: Map
  protected config: JGisConfig
  constructor(map: Map, options: JGisConfig) {
    this.Map = map
    this.config = options
    this.init(options)
  }
  init(options: JGisInitOptions) {
    if (options.moveEvent) {
      this.moveEvent(options.moveEvent)
    }
    if (options.clickEvent) {
      this.clickEvent(options.clickEvent)
      this.handleClick(options.clickEvent)
    }
  }

  /**
   * 移动事件
   * @param options
   */
  private moveEvent(options: MoveEventOptions) {
    const selectPointerMove = new Select({
      condition: pointerMove,
      style: null, // options.style,
      filter: (feature: FeatureLike, layer) => {
        return feature?.getGeometry()?.getType() === 'Point'
      }
    })
    this.Map.addInteraction(selectPointerMove)

    let overlay: any
    if (options.isTips) {
      overlay = this.createLayer('overlay-tips', [], { type: 'Overlay' })
    }

    selectPointerMove.on('select', (evt) => {
      const deselectedFeatures = evt.deselected as FeatureLike[]
      const selectedFeatures = evt.selected as FeatureLike[]
      if (selectedFeatures.length > 0) {
        const feature = selectedFeatures[0] as Feature<Geometry>
        const deFeature = deselectedFeatures[0] as Feature<Geometry>
        if (feature.getProperties().data) {
          const { layerName } = feature.getProperties().data
          options.callback({
            layerName,
            feature,
            overlay,
            deFeature,
            event: evt
          })
        } else {
          options.callback({
            layerName: '',
            feature: null,
            overlay,
            deFeature: null,
            event: evt
          })
        }
      } else {
        options.callback({
          layerName: '',
          feature: null,
          overlay,
          deFeature: null,
          event: evt
        })
      }
    })
  }

  /**
   * 点击事件
   * @param options
   */
  private clickEvent(options: ClickEventOptions) {
    const selectPointerClick = new Select({
      condition: click,
      style: null, // options.style,
      filter: (feature: FeatureLike, layer) => {
        return feature?.getGeometry()?.getType() === 'Point'
      }
    })
    this.Map.addInteraction(selectPointerClick)

    selectPointerClick.on('select', (evt) => {
      console.log('selectClick', evt)
      const selectedFeatures = evt.selected as FeatureLike[]
      const deselectedFeatures = evt.deselected as FeatureLike[]
      if (selectedFeatures.length > 0) {
        const feature = selectedFeatures[0] as Feature<Geometry>
        const deFeature = deselectedFeatures[0] as Feature<Geometry>
        const { layerName } = feature.getProperties().data
        options.callback({
          layerName,
          feature,
          deFeature,
          event: evt
        })
      }
      setTimeout(() => {
        this.clearSelectFeature()
      }, 100)
    })
  }

  private handleClick(options: ClickEventOptions) {
    this.Map.on('click', async (evt) => {
      const res = await this.getSelectedFtByWms(evt)
      options.callback({
        layerName: res?.layerName as string,
        feature: res?.feature as Feature<Geometry>,
        deFeature: null,
        event: evt
      })
    })
  }

  /**
   * 清除选中要素
   */
  clearSelectFeature(): void {
    this.Map.getInteractions().forEach((interaction) => {
      if (interaction instanceof Select) {
        interaction.getFeatures().forEach((feature: FeatureLike) => {
          ;(feature as Feature<Geometry>).setStyle(undefined)
        })
        interaction.getFeatures().clear()
      }
    })
  }
}
