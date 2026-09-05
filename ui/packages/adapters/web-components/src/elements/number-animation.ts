import type { NumberAnimationCompleteDetails, NumberAnimationEasing, NumberAnimationLive, NumberAnimationSchema } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import { connectNumberAnimation, numberAnimationAnatomy, numberAnimationMachine, numberAnimationMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 空串也当缺席：`to=""` 经 Number() 会变成 0，那是一个货真价实的终点，不是"没写"
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 缺省为真的开关（active）得能被 ="false" 关掉；三态：缺席 = undefined（用默认值），="false" = false，其余 = true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-number-animation>` —— Light-DOM 行为宿主：作者写一个 root 角色节点，
 * 元素跑 number-animation 机器，逐帧把补间算出的数字格式化后写进那个节点。
 *
 * 参数改写分两路：改 `from` 是"换起点"，数字当场落到新起点再重跑；
 * 改 `to` / `duration` / `easing` 是"换目标"，从当前数字接着走，不跳回起点。
 * 已经跑完停在 idle 时改 `to` 同样会重新跑起来，所以"数字跟着数据走"不必额外拨 `active`。
 *
 * 根是 role="status" 但 aria-live 缺省写死 off：status 的隐含 aria-live 就是 polite，
 * 一个每帧都在变的数字用 polite 会把读屏刷爆，要播报由作者把 live 开到 polite 或 assertive。
 *
 * @customElement xh-number-animation
 * @attr {number} from - 起点，缺省 0
 * @attr {number} to - 终点，缺省 0
 * @attr {number} duration - 时长毫秒，缺省 1000；<=0 即一步到位
 * @attr {string} easing - 缓动：曲线名（linear / standard / easeIn / easeOut / easeInOut …）或 cubic-bezier 串，缺省线性
 * @attr {number} precision - 小数位，缺省 0
 * @attr {string} separator - 千位分隔符，缺省不分隔
 * @attr {boolean} active - 是否在跑，缺省真；`active="false"` 停在当前值
 * @attr {'sm'|'md'|'lg'} size - 尺寸，只改字号
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气，决定数字用哪族颜色
 * @attr {'off'|'polite'|'assertive'} live - 读屏播报档位，缺省 off
 * @fires complete - 走到终点；detail 为 `{ value: number }`
 * @csspart root - 数字本身（承载 status 语义、data-state 与两个视觉轴）；文字归元素写
 */
export class XhNumberAnimationElement extends XhElement {
  static override partContract = { anatomy: numberAnimationAnatomy, meta: numberAnimationMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    from: { converter: NUMBER_CONVERTER },
    to: { converter: NUMBER_CONVERTER },
    duration: { converter: NUMBER_CONVERTER },
    easing: { converter: STRING_CONVERTER },
    precision: { converter: NUMBER_CONVERTER },
    separator: { converter: STRING_CONVERTER },
    active: { converter: BOOLEAN_CONVERTER },
    size: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    live: { converter: STRING_CONVERTER },
  }

  declare from?: number
  declare to?: number
  declare duration?: number
  declare easing?: NumberAnimationEasing
  declare precision?: number
  declare separator?: string
  declare active?: boolean
  declare size?: Size
  declare tone?: Tone
  declare live?: NumberAnimationLive

  private readonly notify = (details: NumberAnimationCompleteDetails): void => {
    this.dispatchEvent(new CustomEvent('complete', { detail: details, bubbles: true, composed: true }))
  }

  // 机器的副作用只有一个逐帧循环（自身自足）：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<NumberAnimationSchema>(this, numberAnimationMachine, () => this.machineProps())

  private machineProps(): Partial<NumberAnimationSchema['props']> {
    return {
      from: this.from,
      to: this.to,
      duration: this.duration,
      easing: this.easing,
      precision: this.precision,
      separator: this.separator,
      // 布尔属性经三态转换器进来：不在即 undefined，把缺省交回机器
      active: this.active,
      size: this.size,
      tone: this.tone,
      live: this.live,
      onComplete: this.notify,
    }
  }

  protected wire(): void {
    const api = connectNumberAnimation(this.ctrl.service, wcNormalize)
    const root = this.getPart('root')
    if (!root)
      return
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    // 数字归元素写：spreader 只管属性与事件，写不了文本。
    // 比一次再写：值没动时的赋值会白白惊动一次变更记录，而这里每帧都会走一遍
    if (root.textContent !== api.text)
      root.textContent = api.text
  }
}
