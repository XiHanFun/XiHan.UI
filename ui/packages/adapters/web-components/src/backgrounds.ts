// @xihan-ui/web-components/backgrounds —— 背景层的 Web Components 适配。
//
// 与主入口和 /define 都分开：@xihan-ui/backgrounds 是可选 peer，不用视觉效果的应用不会
// 因为装了本包而多出一个 WebGL 引擎。用之前先装 @xihan-ui/backgrounds。
//
// ```html
// <xh-background effect="aurora" quality="balanced" style="height: 180px">
//   <h3>卡片标题</h3>
// </xh-background>
// ```

import type {
  BackgroundEffect,
  BackgroundQuality,
  BackgroundSurface,
  MorphOptions,
  ParamValue,
  PointCloud,
} from '@xihan-ui/backgrounds'
import type { PropertyValues } from './reactive'
import { createBackgroundSurface, registerBuiltinEffects } from '@xihan-ui/backgrounds'
import { DIAGNOSTIC_CODES, reportDiagnostic } from '@xihan-ui/kernel'
import { version as VERSION } from '../package.json'
import { XhReactiveElement } from './reactive'
import { defineElement } from './runtime/registry'

/** 属性缺席翻成 undefined（走引擎默认值），写成 "false" 才是关。 */
const optionalBool = {
  fromAttribute: (value: string | null): boolean | undefined =>
    value === null ? undefined : value !== 'false',
}

/**
 * `<xh-background>` —— 视觉画面宿主。
 *
 * 元素自身就是画布的容器：内容照常写在里面，效果铺在内容底下，
 * 画布是 pointer-events: none，不会挡住里面的交互。
 *
 * @customElement xh-background
 * @attr {string} effect - 效果名，须先注册（defineXhBackground 会把内置效果一并注册）
 * @attr {'auto'|'high'|'balanced'|'eco'} quality - 画质档位
 * @attr {object} params - 效果参数，JSON 对象
 * @attr {boolean} paused - 暂停绘制
 * @attr {boolean} pointer - 是否绑定指针事件，写 "false" 关闭
 * @attr {boolean} reduced-motion - 是否尊重系统的减弱动态效果，写 "false" 关闭
 * @attr {boolean} pause-offscreen - 滚出视口是否暂停，写 "false" 关闭
 */
export class XhBackgroundElement extends XhReactiveElement {
  static override properties = {
    effect: {},
    quality: {},
    params: { type: Object },
    paused: { type: Boolean },
    pointer: { converter: optionalBool },
    reducedMotion: { attribute: 'reduced-motion', converter: optionalBool },
    pauseOffscreen: { attribute: 'pause-offscreen', converter: optionalBool },
  }

  declare effect?: string | BackgroundEffect
  declare quality?: BackgroundQuality
  declare params?: Record<string, ParamValue>
  declare paused?: boolean
  declare pointer?: boolean
  declare reducedMotion?: boolean
  declare pauseOffscreen?: boolean

  private surface: BackgroundSurface | null = null
  private appliedEffect: string | BackgroundEffect | undefined
  /** 记住上次生效的画质：setQuality 会重建着色器程序，不能每次更新都调一遍。 */
  private appliedQuality: BackgroundQuality | undefined
  /** 画面还没建起来时先收着，建好后补发。 */
  private pendingCloud: { cloud: PointCloud, options?: MorphOptions } | null = null

  /** 换点云。属性传不了二进制，只能用 JS 调。 */
  setCloud(cloud: PointCloud, options?: MorphOptions): void {
    if (this.surface === null)
      this.pendingCloud = { cloud, options }
    else
      this.surface.setCloud(cloud, options)
  }

  /** 拿底层画面实例，用于自定义调度或调参。 */
  getSurface(): BackgroundSurface | null {
    return this.surface
  }

  override connectedCallback(): void {
    // 自定义元素默认是行内元素，行内元素量不出高度，画布会一直是 0×0
    if (getComputedStyle(this).display === 'inline')
      this.style.display = 'block'
    super.connectedCallback()
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.surface?.destroy()
    this.surface = null
    this.appliedEffect = undefined
  }

  protected override updated(_changed: PropertyValues): void {
    if (this.effect === undefined)
      return

    if (this.surface === null) {
      try {
        this.surface = createBackgroundSurface(this, {
          effect: this.effect,
          params: this.params,
          quality: this.quality,
          pointer: this.pointer,
          autoplay: this.paused !== true,
          respectReducedMotion: this.reducedMotion,
          pauseOffscreen: this.pauseOffscreen,
        })
      }
      catch (error) {
        // 效果名没注册就把整页带崩不划算，报出来即可
        reportDiagnostic({
          code: DIAGNOSTIC_CODES.warn,
          level: 'error',
          message: `[backgrounds] <xh-background> 创建失败：${(error as Error).message}`,
        })
        return
      }
      this.appliedEffect = this.effect
      this.appliedQuality = this.quality
      if (this.pendingCloud !== null) {
        this.surface.setCloud(this.pendingCloud.cloud, this.pendingCloud.options)
        this.pendingCloud = null
      }
      return
    }

    if (this.effect !== this.appliedEffect) {
      this.surface.setEffect(this.effect)
      this.appliedEffect = this.effect
    }
    if (this.quality !== undefined && this.quality !== this.appliedQuality) {
      this.surface.setQuality(this.quality)
      this.appliedQuality = this.quality
    }
    if (this.params !== undefined)
      this.surface.setParams(this.params)
    if (this.paused === true)
      this.surface.pause()
    else
      this.surface.play()
  }
}

/**
 * 注册 `<xh-background>`，并把内置效果一并注册进效果注册表——
 * 元素只认效果名字，注册表空着的话任何 effect 属性都解析不出来。
 */
export function defineXhBackground(): void {
  registerBuiltinEffects()
  defineElement('xh-background', XhBackgroundElement, VERSION)
}
