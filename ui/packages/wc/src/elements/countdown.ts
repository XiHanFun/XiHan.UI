import type { CountdownFinishDetails, CountdownLive, CountdownSchema } from '@xihan-ui/headless'
import { connectCountdown, countdownAnatomy, countdownMachine, countdownMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 空串也当缺席：`value=""` 经 Number() 会变成 0，那是"已经到点"，不是"没写"
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 缺省为真的开关（active）得能被 ="false" 关掉；三态：缺席 = undefined（用默认值），="false" = false，其余 = true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-countdown>` —— Light-DOM 行为宿主：作者写一个 root 角色节点，
 * 元素跑 countdown 机器，逐帧把剩余毫秒按模板铺成时分秒写进那个节点。
 *
 * 剩余量走的是与数值动画同一份补间：起点是这一轮开始时的剩余毫秒、终点是 0、
 * 时长恰好等于起点本身。改写 `value` 即把剩余量落到新值并从那里重新计时，
 * 停在 idle 时改 `value` 同样会重新走起来。
 *
 * `precision` 管的是取值粒度而不是排版：0 取到整秒、3 取到整毫秒；
 * 想显示毫秒得把 precision 提上去，只在 `format` 里写 `SSS` 会一直是 `000`。
 *
 * 根是 role="status" 但 aria-live 缺省写死 off：status 的隐含 aria-live 就是 polite，
 * 一个每秒都在变的数字用 polite 会把读屏刷爆，要播报由作者把 live 开到 polite 或 assertive。
 *
 * @customElement xh-countdown
 * @attr {number} value - 剩余毫秒，缺省 0
 * @attr {string} format - 模板，缺省 `HH:mm:ss`；H 时、m 分、s 秒、S 毫秒，重复字母的个数即最少位数
 * @attr {boolean} active - 是否在走，缺省真；`active="false"` 停在当前剩余量
 * @attr {number} precision - 取值粒度：0 到秒、1 到十分之一秒、2 到百分之一秒、3 到毫秒，缺省 0
 * @attr {'off'|'polite'|'assertive'} live - 读屏播报档位，缺省 off
 * @fires finish - 走到 0；detail 为 `{ value: number }`
 * @csspart root - 时间本身（承载 status 语义、data-state 与 data-finished）；文字归元素写
 */
export class XhCountdownElement extends XhElement {
  static override partContract = { anatomy: countdownAnatomy, meta: countdownMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: NUMBER_CONVERTER },
    format: { converter: STRING_CONVERTER },
    active: { converter: BOOLEAN_CONVERTER },
    precision: { converter: NUMBER_CONVERTER },
    live: { converter: STRING_CONVERTER },
  }

  declare value?: number
  declare format?: string
  declare active?: boolean
  declare precision?: number
  declare live?: CountdownLive

  private readonly notify = (details: CountdownFinishDetails): void => {
    this.dispatchEvent(new CustomEvent('finish', { detail: details, bubbles: true, composed: true }))
  }

  // 机器的副作用只有一个逐帧循环（自身自足）：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<CountdownSchema>(this, countdownMachine, () => this.machineProps())

  private machineProps(): Partial<CountdownSchema['props']> {
    return {
      value: this.value,
      format: this.format,
      // 布尔属性经三态转换器进来：不在即 undefined，把缺省交回机器
      active: this.active,
      precision: this.precision,
      live: this.live,
      onFinish: this.notify,
    }
  }

  protected wire(): void {
    const api = connectCountdown(this.ctrl.service, wcNormalize)
    const root = this.getPart('root')
    if (!root)
      return
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    // 时间归元素写：spreader 只管属性与事件，写不了文本。
    // 比一次再写：值没动时的赋值会白白惊动一次变更记录，而这里每帧都会走一遍
    if (root.textContent !== api.text)
      root.textContent = api.text
  }
}
