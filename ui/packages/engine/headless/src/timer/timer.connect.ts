import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { TimerApi, TimerControlAction, TimerSchema, TimerSegments } from './timer.types'
import { dataAttr } from '@xihan-ui/kernel'
import { timerAnatomy } from './timer.anatomy'
import { splitTimer, timerSegmentText, timerValueAt } from './timer.format'

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
  const countdown = !!prop('countdown')
  const elapsed = context.get('elapsed')
  const value = timerValueAt(elapsed, prop('startMs'), prop('targetMs'), countdown)
  const segments = splitTimer(value)

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
    }),

    getAreaProps: () => normalize.element({
      ...parts.area.attrs,
      'role': 'timer',
      // role=timer 的隐含播报本就是 off，这里写死只为各家 UA 一律不播：
      // 每秒都在变的数字若按 polite 播报，一分钟就是六十条打断。
      // 要播报的场景由作者在外层另起一个 live 区，只在关口上说一句
      'aria-live': 'off',
      // 屏幕上只有几组数字与分隔符，名字得把哪段是分、哪段是秒说清楚
      'aria-label': label.time(segments),
      'data-state': phase,
    }),

    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      // 整段时间的读法归 area 的名字管，这里的裸数字不必再被逐个念一遍
      'aria-hidden': true,
      'data-unit': item.unit,
    }),

    getSeparatorProps: () => normalize.element({
      ...parts.separator.attrs,
      // 冒号一类的记号只是排版，念出来是噪音
      'aria-hidden': true,
    }),

    getControlProps: () => normalize.button({
      ...parts.control.attrs,
      // 原生按钮的 Enter/Space 激活由平台负责；少了 type，按钮落在 form 里会变成 submit
      'type': 'button',
      // 按钮里常常只有一个图标，名字得随这一下要做的事一起换
      'aria-label': label[controlAction],
      'data-action': controlAction,
      'onClick': () => send(CONTROL_EVENT[controlAction]),
    }),
  }
}
