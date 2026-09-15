/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 timer 相关实现。

import type { Size } from '@xihan-ui/core'
import type { TimerApi, TimerLive, TimerSchema, TimerTranslations, TimerUnit } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { TimerProvider, useTimerContext } from './context'
import { useTimer } from './use-timer'

type TimerProps = TimerSchema['props']

/** 函数式 children 的载荷：当前状态与显示值、拆开的每一段，以及起停归零四个动作。 */
export type TimerRootSlotProps = Pick<
  TimerApi,
  'phase' | 'value' | 'text' | 'elapsed' | 'running' | 'paused' | 'completed' | 'countdown' | 'controlled'
  | 'segments' | 'segmentText' | 'controlAction' | 'controlLabel'
  | 'start' | 'pause' | 'resume' | 'reset'
>

/** 未写 children 时铺设的段：时、分、秒。需要天或毫秒时自行写部件。 */
const DEFAULT_UNITS: readonly TimerUnit[] = ['hours', 'minutes', 'seconds']

export interface XhTimerRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 起始值毫秒，默认 0。 */
  startMs?: number
  /** 终点值毫秒。倒计时默认 0；正计时未提供时一直运行。 */
  targetMs?: number
  /** 倒计时，默认假。 */
  countdown?: boolean
  /** 受控剩余毫秒。提供后即进入受控通道。 */
  value?: number
  /** 受控开关，默认真。提供后即进入受控通道。 */
  active?: boolean
  /** 挂载即开始运行，默认假。 */
  autoStart?: boolean
  /** 刷新间隔毫秒，默认 1000，下限一帧。 */
  interval?: number
  /** 文本模板，默认 `HH:mm:ss`。 */
  format?: string
  /** 取值粒度：0 到秒、3 到毫秒，默认 3。 */
  precision?: number
  /** 读屏播报档位，默认 off。 */
  live?: TimerLive
  size?: Size
  translations?: Partial<TimerTranslations>
  /** 每一拍通知一次。到期的一拍只触发 onComplete。 */
  onTick?: TimerProps['onTick']
  /** 到达终点时通知一次。 */
  onComplete?: TimerProps['onComplete']
  children?: SlotChildren<TimerRootSlotProps>
}

export function XhTimerRoot({
  startMs,
  targetMs,
  countdown,
  value,
  active,
  autoStart,
  interval,
  format,
  precision,
  live,
  size,
  translations,
  onTick,
  onComplete,
  children,
  ...rest
}: XhTimerRootProps): ReactNode {
  const ctx = useTimer(withXhConfig('timer', {
    startMs,
    targetMs,
    countdown,
    value,
    active,
    autoStart,
    interval,
    format,
    precision,
    live,
    size,
    translations,
    onTick,
    onComplete,
  }) as TimerProps)
  const { api } = ctx
  const content = renderSlot(children, {
    phase: api.phase,
    value: api.value,
    text: api.text,
    controlled: api.controlled,
    elapsed: api.elapsed,
    running: api.running,
    paused: api.paused,
    completed: api.completed,
    countdown: api.countdown,
    segments: api.segments,
    segmentText: api.segmentText,
    controlAction: api.controlAction,
    controlLabel: api.controlLabel,
    start: api.start,
    pause: api.pause,
    resume: api.resume,
    reset: api.reset,
  })
  return (
    <TimerProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {/* children 为空（含条件渲染落空）时退回组件自己铺的时分秒 */}
        {slotPaints(content) ? content : <DefaultTree />}
      </div>
    </TimerProvider>
  )
}

XhTimerRoot.xhEvents = ['tick', 'complete'] as const

export interface XhTimerDisplayProps extends ComponentPropsWithRef<'div'> {}

export function XhTimerDisplay({ children, ...rest }: XhTimerDisplayProps): ReactNode {
  const ctx = useTimerContext()
  return (
    <div {...mergeReactProps(ctx.api.getDisplayProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhTimerItemProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** 该段的单位。 */
  unit: TimerUnit
}

/**
 * 一段数字。该段的数字恒由组件写入，作者只声明它是哪一段：写在条目中的内容不会保留，
 * 下一拍就会被新的数字覆盖。
 */
export function XhTimerItem({ unit, ...rest }: XhTimerItemProps): ReactNode {
  const ctx = useTimerContext()
  const { api } = ctx
  return (
    <span {...mergeReactProps(api.getItemProps({ unit }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {api.segmentText(unit)}
    </span>
  )
}

export interface XhTimerSeparatorProps extends ComponentPropsWithRef<'span'> {}

/** 两段之间的记号，默认是冒号。 */
export function XhTimerSeparator({ children, ...rest }: XhTimerSeparatorProps): ReactNode {
  const ctx = useTimerContext()
  return (
    <span {...mergeReactProps(ctx.api.getSeparatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : ':'}
    </span>
  )
}

export interface XhTimerControlProps extends ComponentPropsWithRef<'button'> {}

/** 起停按钮：使用原生 button，激活交给平台；未写内容时写入当前动作的名字。 */
export function XhTimerControl({ children, ...rest }: XhTimerControlProps): ReactNode {
  const ctx = useTimerContext()
  const { api } = ctx
  return (
    <button {...mergeReactProps(api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : api.controlLabel}
    </button>
  )
}

/**
 * 未写 children 时铺设的整套结构：一个时间区，其中是时、分、秒三段与两个冒号。
 * 与手写部件产出的 DOM 完全一致，需要修改结构时自行写部件，行为不变。
 */
function DefaultTree(): ReactNode {
  const nodes: ReactNode[] = []
  for (const [index, unit] of DEFAULT_UNITS.entries()) {
    if (index > 0)
      nodes.push(<XhTimerSeparator key={`separator-${unit}`} />)
    nodes.push(<XhTimerItem key={unit} unit={unit} />)
  }
  return <XhTimerDisplay>{nodes}</XhTimerDisplay>
}
