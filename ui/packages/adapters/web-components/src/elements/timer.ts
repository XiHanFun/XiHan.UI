/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 timer 相关实现。

import type { Size } from '@xihan-ui/core'
import type { TimerCompleteDetails, TimerLive, TimerSchema, TimerTickDetails, TimerUnit } from '@xihan-ui/headless'
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
 * `<xh-timer>`：Light-DOM 行为宿主：作者写 root、display、若干 item 与 separator，
 * 需要起停时再写一个 control。元素运行 timer 状态机，把 connect 产出接到角色节点上，
 * 并把每一段的数字写进对应的 item。
 *
 * 时间只由单调时钟的两个时刻相减得出，不逐拍累加；`interval` 只决定数字的跳动间隔，
 * 到期另有一个精确落在终点上的定时器判定，终点不落在整拍上也不会越过。
 *
 * 每个 item 用 `unit` 属性声明所属的段（days / hours / minutes / seconds / milliseconds）。
 * 它是作者的声明、不是状态机写回的状态，修改它本身不会另排一次接线：停止时修改后要等下一次
 * 属性变更或开始运行才生效。
 *
 * control 中的文字由作者编写（通常是一个图标），元素只按当前状态切换它的 `data-action` 与读屏名。
 *
 * @customElement xh-timer
 * @attr {number} start-ms - 起始值毫秒，默认 0；正计时从它向上，倒计时从它向下
 * @attr {number} target-ms - 终点值毫秒；倒计时默认 0，正计时未提供时没有终点
 * @attr {boolean} countdown - 倒计时，默认关闭
 * @attr {number} value - 受控剩余毫秒；提供后即进入受控通道，起点锁定为它、方向锁定为倒计时、终点锁定为 0
 * @attr {boolean} active - 受控开关，默认真；提供后即进入受控通道，起停按钮不再改变状态
 * @attr {boolean} auto-start - 挂载即开始运行，默认关闭；只在挂载时读取一次
 * @attr {number} interval - 刷新间隔毫秒，默认 1000，下限一帧
 * @attr {string} format - 文本模板，默认 HH:mm:ss；D 天、H 时、m 分、s 秒、S 毫秒
 * @attr {number} precision - 取值粒度：0 到秒、3 到毫秒，默认 3（不量化）
 * @attr {'off'|'polite'|'assertive'} live - 时间区的读屏播报档位，默认 off
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires tick - 经过一拍；detail 为 `{ value: number, elapsed: number }`
 * @fires complete - 到达终点；detail 为 `{ value: number, elapsed: number }`
 * @csspart root - 组件根容器（承载 data-state / data-size / data-countdown / data-controlled）
 * @csspart display - 时间区，role=timer 并带整段时间的读屏名
 * @csspart item - 一段数字，须自带 unit 属性说明所属的段；文字由元素写入
 * @csspart separator - 段与段之间的记号，对读屏隐藏
 * @csspart control - 起停按钮，须是原生 `<button>`；按当前状态切换 data-action
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

  /** 未进入 DOM 时状态机尚未建立，此时无从起停，发送过去只会被丢弃并在开发期报告一次。 */
  private run(event: TimerSchema['event']): void {
    if (this.ctrl.service.getStatus() !== 'Started')
      return
    this.ctrl.service.send(event)
  }

  /** 起停四个动作同样暴露在元素上，作者不必自行点击按钮。 */
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
