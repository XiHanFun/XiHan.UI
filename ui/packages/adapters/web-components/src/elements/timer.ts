import type { TimerCompleteDetails, TimerLive, TimerSchema, TimerTickDetails, TimerUnit } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import { connectTimer, isTimerUnit, timerAnatomy, timerMachine, timerMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 空串也当缺席：`start-ms=""` 经 Number() 会变成 0，那是「从零开始」，不是「没写」
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 布尔三态：缺席 = undefined（用默认值），="false" = false，其余 = true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 条目没写段单位或写错时退回秒：秒是最常显示的那一段。 */
const FALLBACK_UNIT: TimerUnit = 'seconds'

/**
 * `<xh-timer>` —— Light-DOM 行为宿主：作者写 root、display、若干 item 与 separator，
 * 需要起停就再写一个 control。元素跑 timer 机器，把 connect 产出打到角色节点上，
 * 并把每一段的数字写进对应的 item。
 *
 * 时间只从单调时钟的两个时刻相减而来，一拍都不累加；`interval` 只决定数字多久跳一次，
 * 到点另有一个精确落在终点上的定时器判定，终点不落在整拍上也不会走过头。
 *
 * 每个 item 用 `unit` 属性声明自己是哪一段（days / hours / minutes / seconds / milliseconds）。
 * 它是作者的声明、不是机器写回的状态，改它本身不会另排一次接线——停着时改完要等下一次
 * 属性变更或起跑才生效。
 *
 * control 里的文字归作者写（多半是个图标），元素只按当前状态换它的 `data-action` 与读屏名字。
 *
 * @customElement xh-timer
 * @attr {number} start-ms - 起始值毫秒，缺省 0；正着走从它往上，倒着走从它往下
 * @attr {number} target-ms - 终点值毫秒；倒计时缺省 0，正计时不写即没有终点
 * @attr {boolean} countdown - 倒着走，缺省关闭
 * @attr {number} value - 受控剩余毫秒；给了它即进受控通道，起点锁成它、方向锁成倒着走、终点锁成 0
 * @attr {boolean} active - 受控开关，缺省真；给了它即进受控通道，起停按钮不再改状态
 * @attr {boolean} auto-start - 挂载即开跑，缺省关闭；只在挂载那一刻读一次
 * @attr {number} interval - 刷新间隔毫秒，缺省 1000，下限一帧
 * @attr {string} format - 文本模板，缺省 HH:mm:ss；D 天、H 时、m 分、s 秒、S 毫秒
 * @attr {number} precision - 取值粒度：0 到秒、3 到毫秒，缺省 3（不量化）
 * @attr {'off'|'polite'|'assertive'} live - 时间区的读屏播报档位，缺省 off
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires tick - 走过一拍；detail 为 `{ value: number, elapsed: number }`
 * @fires complete - 走到终点；detail 为 `{ value: number, elapsed: number }`
 * @csspart root - 组件根容器（承载 data-state / data-size / data-countdown / data-controlled）
 * @csspart display - 时间区，role=timer 并带着整段时间的读屏名字
 * @csspart item - 一段数字，须自带 unit 属性说明它是哪一段；文字归元素写
 * @csspart separator - 段与段之间的记号，对读屏隐藏
 * @csspart control - 起停按钮，须是原生 `<button>`；按当前状态换 data-action
 */
export class XhTimerElement extends XhElement {
  static override partContract = { anatomy: timerAnatomy, meta: timerMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  // camelCase 字段的属性名必须显式给：默认观察的是全小写形态，不是 kebab
  static override properties = {
    startMs: { converter: NUMBER_CONVERTER, attribute: 'start-ms' },
    targetMs: { converter: NUMBER_CONVERTER, attribute: 'target-ms' },
    countdown: { converter: BOOLEAN_CONVERTER },
    value: { converter: NUMBER_CONVERTER },
    active: { converter: BOOLEAN_CONVERTER },
    autoStart: { converter: BOOLEAN_CONVERTER, attribute: 'auto-start' },
    interval: { converter: NUMBER_CONVERTER },
    format: { converter: STRING_CONVERTER },
    precision: { converter: NUMBER_CONVERTER },
    live: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 文案是对象，属性装不下，只走 property
    translations: { attribute: false },
  }

  declare startMs?: number
  declare targetMs?: number
  declare countdown?: boolean
  declare value?: number
  declare active?: boolean
  declare autoStart?: boolean
  declare interval?: number
  declare format?: string
  declare precision?: number
  declare live?: TimerLive
  declare size?: Size
  declare translations?: TimerSchema['props']['translations']

  private readonly notifyTick = (details: TimerTickDetails): void => {
    this.dispatchEvent(new CustomEvent('tick', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyComplete = (details: TimerCompleteDetails): void => {
    this.dispatchEvent(new CustomEvent('complete', { detail: details, bubbles: true, composed: true }))
  }

  // 机器的副作用只有自己的两个定时器：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<TimerSchema>(this, timerMachine, () => this.machineProps())

  private machineProps(): Partial<TimerSchema['props']> {
    return {
      startMs: this.startMs,
      targetMs: this.targetMs,
      // 布尔一律原样透传：属性不在即 undefined，把缺省交回机器
      countdown: this.countdown,
      value: this.value,
      active: this.active,
      autoStart: this.autoStart,
      interval: this.interval,
      format: this.format,
      precision: this.precision,
      live: this.live,
      size: this.size,
      translations: this.translations,
      onTick: this.notifyTick,
      onComplete: this.notifyComplete,
    }
  }

  /** 没进 DOM 时机器还没起来，此刻谈不上起停，送过去只会被丢弃并在开发期报一声。 */
  private run(event: TimerSchema['event']): void {
    if (this.ctrl.service.getStatus() !== 'Started')
      return
    this.ctrl.service.send(event)
  }

  /** 起停四个动作也给到元素上，作者不必自己去点那个按钮。 */
  start(): void {
    this.run({ type: 'RUN.START' })
  }

  pause(): void {
    this.run({ type: 'RUN.PAUSE' })
  }

  resume(): void {
    this.run({ type: 'RUN.RESUME' })
  }

  reset(): void {
    this.run({ type: 'RUN.RESET' })
  }

  protected wire(): void {
    const api = connectTimer(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('display', api.getDisplayProps() as Record<string, unknown>)

    for (const el of this.getParts('separator'))
      this.spreader.spread(el, api.getSeparatorProps() as Record<string, unknown>)

    // 条目是多实例 part，逐个打：身份取作者写的 unit，认不出就按秒算
    for (const el of this.getParts('item')) {
      const declared = el.getAttribute('unit')
      const unit = isTimerUnit(declared) ? declared : FALLBACK_UNIT
      this.spreader.spread(el, api.getItemProps({ unit }) as Record<string, unknown>)
      // 数字归元素写：spreader 只管属性与事件，写不了文本。
      // 比一次再写：值没动时的赋值会白白惊动一次变更记录，而这里每一拍都会走一遍
      const text = api.segmentText(unit)
      if (el.textContent !== text)
        el.textContent = text
    }

    for (const el of this.getParts('control'))
      this.spreader.spread(el, api.getControlProps() as Record<string, unknown>)
  }
}
