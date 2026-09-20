/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 timer 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { TimerApi, TimerControlAction, TimerSchema, TimerSegments } from './timer.types'
import { dataAttr } from '@xihan-ui/core'
import { pressHandlers } from '../shared/press'
import { timerAnatomy } from './timer.anatomy'
import { formatTimerText, isTimerControlled, quantizeTimer, resolveTimerPrecision, splitTimer, timerRunOf, timerSegmentText, timerValueAt } from './timer.format'

const parts = timerAnatomy.build()

/** 起停按钮这一下该送哪个事件。 */
const CONTROL_EVENT: Record<TimerControlAction, TimerSchema['event']> = {
  start: { type: 'RUN.START' },
  pause: { type: 'RUN.PAUSE' },
  resume: { type: 'RUN.RESUME' },
  reset: { type: 'RUN.RESET' },
}

/** 一个数配它的英文单位，1 用单数其余用复数。 */
function plural(count: number, unit: string): string {
  return `${count} ${count === 1 ? unit : `${unit}s`}`
}

/**
 * 时间区的内建名字，恒按时、分、秒念（天数为 0 时不念它，读屏不必每次都听一句「0 天」）。
 * 这里看不见作者摆了哪几段，只显示其中几段时请用 translations.time 自己给名字。
 */
function defaultTimeLabel(segments: TimerSegments): string {
  const words = [plural(segments.hours, 'hour'), plural(segments.minutes, 'minute'), plural(segments.seconds, 'second')]
  return segments.days > 0 ? [plural(segments.days, 'day'), ...words].join(' ') : words.join(' ')
}

export function connectTimer<T extends PropTypes>(
  service: Service<TimerSchema>,
  normalize: NormalizeProps<T>,
): TimerApi<T> {
  const { context, prop, send, state } = service

  const phase = state.get()
  const run = timerRunOf({
    value: prop('value'),
    startMs: prop('startMs'),
    targetMs: prop('targetMs'),
    countdown: prop('countdown'),
  })
  const countdown = run.countdown
  const controlled = isTimerControlled(prop('value'), prop('active'))
  const elapsed = context.get('elapsed')
  // 量化一次，拆分与铺字都读这一个数，免得两处各自取整取出不一样的秒
  const value = quantizeTimer(
    timerValueAt(elapsed, run.startMs, run.targetMs, countdown),
    resolveTimerPrecision(prop('precision')),
  )
  const segments = splitTimer(value)
  // 按压通道：真源在机器 context，跟踪器只把 Space / Enter 与触屏按住翻成事件；指针按住由 :active 表出
  const pressed = context.get('pressed')
  const press = pressHandlers(service)

  const translations = prop('translations')
  const label = {
    time: translations?.time ?? defaultTimeLabel,
    start: translations?.start ?? 'Start',
    pause: translations?.pause ?? 'Pause',
    resume: translations?.resume ?? 'Resume',
    reset: translations?.reset ?? 'Reset',
  }

  // 起停按钮这一下要做的事由当前状态定：走着的暂停、停在半路的接着走、走完的归零、其余开跑
  const controlAction: TimerControlAction
    = phase === 'running'
      ? 'pause'
      : phase === 'paused'
        ? 'resume'
        : phase === 'completed' ? 'reset' : 'start'

  return {
    phase,
    value,
    text: formatTimerText(value, prop('format')),
    controlled,
    elapsed,
    running: phase === 'running',
    paused: phase === 'paused',
    completed: phase === 'completed',
    countdown,
    segments,
    segmentText: unit => timerSegmentText(segments, unit),
    controlAction,
    controlLabel: label[controlAction],
    start: () => send({ type: 'RUN.START' }),
    pause: () => send({ type: 'RUN.PAUSE' }),
    resume: () => send({ type: 'RUN.RESUME' }),
    reset: () => send({ type: 'RUN.RESET' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': phase,
      'data-size': prop('size'),
      'data-countdown': dataAttr(countdown),
      'data-controlled': dataAttr(controlled),
    }),

    getDisplayProps: () => normalize.element({
      ...parts.display.attrs,
      'role': 'timer',
      // role=timer 的隐含播报本就是 off，这里显式写出来只为各家 UA 一律不播：
      // 每秒都在变的数字若按 polite 播报，一分钟就是六十条打断。
      // 要播报的场景（会话到期提醒这类）由作者把 live 开到 polite 或 assertive
      'aria-live': prop('live') ?? 'off',
      // 屏幕上只有几组数字与分隔符，名字得把哪段是分、哪段是秒说清楚
      'aria-label': label.time(segments),
      'data-state': phase,
    }),

    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      // 整段时间的读法归 display 的名字管，这里的裸数字不必再被逐个念一遍
      'aria-hidden': true,
      'data-unit': item.unit,
    }),

    getSeparatorProps: () => normalize.element({
      ...parts.separator.attrs,
      // 冒号一类的记号只是排版，念出来是噪音
      'aria-hidden': true,
    }),

    // 起停钮是一颗带文案（或图标）的离散动作钮：盒几何、悬停 / 按下与 0.97 按压、粗指针热区、焦点环由
    // Action Control 家族按 text outline 档给——中性描边、透明底，白底承载 hover 100 → pressed 200；
    // 档位随 size 走（缺省 md），皮肤只映射既有使用者槽
    getControlProps: () => normalize.button({
      ...parts.control.attrs,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-variant': 'outline',
      'data-xh-action-display': 'always',
      'data-xh-action-size': prop('size') ?? 'md',
      // 原生按钮的 Enter/Space 激活由平台负责；少了 type，按钮落在 form 里会变成 submit
      'type': 'button',
      // 按钮里常常只有一个图标，名字得随这一下要做的事一起换
      'aria-label': label[controlAction],
      'data-action': controlAction,
      // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active；与起停翻转互相独立
      'data-pressed': dataAttr(pressed),
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': press.onPointerDown,
      'onPointerUp': press.onPointerUp,
      'onPointerCancel': press.onPointerCancel,
      // 受控时状态归 value / active 两个 prop，这一下不改状态；受控用法本就不该铺这颗钮
      'onClick': () => {
        if (!controlled)
          send(CONTROL_EVENT[controlAction])
      },
    }),
  }
}
