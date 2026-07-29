import type { LoadingBarSchema, LoadingBarTranslations, LoadingBarValueChangeDetails } from '@xihan-ui/headless'
import { connectLoadingBar, loadingBarMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 空串也当缺席：`value=""` 经 Number() 会变成 0，那是一个货真价实的进度值，不是"没写"
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 缺省为真的开关（trickle）得能被 ="false" 关掉；三态：缺席 = undefined（用默认值），="false" = false，其余 = true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 厚度两用：`height="3"` 按像素，`height="0.25rem"` 按 CSS 长度原样交给 connect
const HEIGHT_CONVERTER = {
  fromAttribute: (v: string | null): string | number | undefined => {
    if (v == null || v === '')
      return undefined
    const px = Number(v)
    return Number.isFinite(px) ? px : v
  },
}

/**
 * `<xh-loading-bar>` —— Light-DOM 行为宿主：作者写 root/track/range 角色节点，
 * 元素跑 loading-bar 机器并把 connect 产出打上去。
 *
 * 两种模式泾渭分明：给了 `value` 就是确定进度，宽度照它显示、读屏拿得到 aria-valuenow；
 * 不给就走假进度——`loading` 置真时先跳到 `minimum`，随后按 `trickle-speed` 一拍一拍地爬，
 * 步长按剩余量取，因此越接近满格越慢且永远到不了 100；此时按规范**不报** aria-valuenow，
 * 属性缺席本身就是"进度未知"的表达。`loading` 转假时先冲到 100，走完淡出窗口才归零收起。
 *
 * 收起态只给 root 加 hidden 并压一条内联 display，作者写的结构一个都不卸载。
 *
 * @customElement xh-loading-bar
 * @attr {number} value - 受控进度值（0-100）；给了即确定进度，内部爬升整个让位
 * @attr {number} default-value - 非受控初值，默认 0
 * @attr {boolean} loading - 加载开关：属性在即开始，`loading="false"` 或摘掉即结束
 * @attr {string|number} height - 条子厚度：纯数字按像素，其余按 CSS 长度；默认 2px
 * @attr {string} color - 进度段颜色（任意 CSS 颜色）；不给就用皮肤的品牌色
 * @attr {boolean} trickle - 不确定进度时自行往前爬，默认开；`trickle="false"` 关掉
 * @attr {number} trickle-speed - 爬升节拍毫秒，默认 200；<=0 等同于关掉爬升
 * @attr {number} minimum - 起步值，默认 8
 * @attr {number} fade-duration - 冲到 100 之后的淡出窗口毫秒，默认 200
 * @fires value-change - 进度值变化；detail 为 `{ value: number }`
 * @csspart root - progressbar 本身（承载名字、值域、data-state 与收起态）
 * @csspart track - 背景槽
 * @csspart range - 进度段；宽度由元素写进内联样式，样式层别碰那条轴
 */
export class XhLoadingBarElement extends XhElement {
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: NUMBER_CONVERTER },
    defaultValue: { converter: NUMBER_CONVERTER, attribute: 'default-value' },
    loading: { converter: BOOLEAN_CONVERTER },
    height: { converter: HEIGHT_CONVERTER },
    color: { converter: STRING_CONVERTER },
    trickle: { converter: BOOLEAN_CONVERTER },
    trickleSpeed: { converter: NUMBER_CONVERTER, attribute: 'trickle-speed' },
    minimum: { converter: NUMBER_CONVERTER },
    fadeDuration: { converter: NUMBER_CONVERTER, attribute: 'fade-duration' },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
    translations: { attribute: false },
  }

  declare value?: number
  declare defaultValue?: number
  declare loading?: boolean
  declare height?: string | number
  declare color?: string
  declare trickle?: boolean
  declare trickleSpeed?: number
  declare minimum?: number
  declare fadeDuration?: number
  declare translations?: Partial<LoadingBarTranslations>

  private readonly notify = (details: LoadingBarValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  // loading-bar 机器的副作用只有两个计时器（自身自足）：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<LoadingBarSchema>(this, loadingBarMachine, () => this.machineProps())

  private machineProps(): Partial<LoadingBarSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      // 布尔属性经三态转换器进来：不在即 undefined，把缺省交回机器
      loading: this.loading,
      height: this.height,
      color: this.color,
      trickle: this.trickle,
      trickleSpeed: this.trickleSpeed,
      minimum: this.minimum,
      fadeDuration: this.fadeDuration,
      translations: this.translations,
      onValueChange: this.notify,
    }
  }

  protected wire(): void {
    const api = connectLoadingBar(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('track', api.getTrackProps() as Record<string, unknown>)
    put('range', api.getRangeProps() as Record<string, unknown>)

    // 收起只写 hidden 属性是不够的：作者层给 root 声明的任何一条 display
    // 都会盖过 UA 的 [hidden]{display:none}，只有内联 style.display 压得住
    this.setPartHidden(this.getPart('root'), !api.visible)
  }
}
