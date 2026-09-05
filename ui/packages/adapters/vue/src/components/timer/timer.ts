import type { TimerApi, TimerLive, TimerSchema, TimerTranslations, TimerUnit } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { slotPaints } from '../../runtime/slot-content'
import { provideTimer, useTimerContext } from './context'
import { useTimer } from './use-timer'

type TimerProps = TimerSchema['props']

/** 默认插槽的载荷：当前状态与显示值、拆开的每一段，以及起停归零四个动作。 */
export type TimerRootSlotProps = Pick<
  TimerApi,
  'phase' | 'value' | 'text' | 'elapsed' | 'running' | 'paused' | 'completed' | 'countdown' | 'controlled'
  | 'segments' | 'segmentText' | 'controlAction' | 'controlLabel'
  | 'start' | 'pause' | 'resume' | 'reset'
>

/** 没写默认插槽时铺开的那几段：时、分、秒。要天或毫秒就自己写部件。 */
const DEFAULT_UNITS: readonly TimerUnit[] = ['hours', 'minutes', 'seconds']

export const XhTimerRoot = defineComponent({
  name: 'XhTimerRoot',
  // 全部 default: undefined，缺省值由机器与 connect 决定
  props: {
    startMs: { type: Number, default: undefined },
    targetMs: { type: Number, default: undefined },
    countdown: { type: Boolean, default: undefined },
    value: { type: Number, default: undefined },
    active: { type: Boolean, default: undefined },
    autoStart: { type: Boolean, default: undefined },
    interval: { type: Number, default: undefined },
    format: { type: String, default: undefined },
    precision: { type: Number, default: undefined },
    live: { type: String as PropType<TimerLive>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<TimerTranslations>>, default: undefined },
  },
  // tick 携带 { value, elapsed }；complete 同形，只在到点那一刻发一次
  emits: {
    tick: (_details: PayloadOf<TimerProps, 'onTick'>) => true,
    complete: (_details: PayloadOf<TimerProps, 'onComplete'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TimerRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useTimer(withXhConfig('timer', props) as TimerProps, {
      onTick: details => emit('tick', details),
      onComplete: details => emit('complete', details),
    })
    provideTimer(ctx)

    return () => {
      const api = ctx.api.value
      const content = slots.default?.({
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
      return h(
        'div',
        api.getRootProps() as Record<string, unknown>,
        // 插槽为空（含 v-if 落空只剩注释节点）时退回组件自己铺的时分秒
        slotPaints(content) ? content : [renderDefaultTree()],
      )
    }
  },
})

export const XhTimerDisplay = defineComponent({
  name: 'XhTimerDisplay',
  setup(_, { slots }) {
    const ctx = useTimerContext()
    return () => h('div', ctx.api.value.getDisplayProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimerItem = defineComponent({
  name: 'XhTimerItem',
  props: {
    unit: { type: String as PropType<TimerUnit>, required: true },
  },
  setup(props) {
    const ctx = useTimerContext()
    return () => {
      const api = ctx.api.value
      // 这一段的数字恒由组件写，作者只声明它是哪一段：写在条目里的内容留不住，
      // 下一拍就会被新的数字盖掉，Web Components 侧也是元素接管这段文本
      return h(
        'span',
        api.getItemProps({ unit: props.unit }) as Record<string, unknown>,
        api.segmentText(props.unit),
      )
    }
  },
})

export const XhTimerSeparator = defineComponent({
  name: 'XhTimerSeparator',
  setup(_, { slots }) {
    const ctx = useTimerContext()
    return () => {
      const content = slots.default?.()
      // 缺省是冒号，换成别的记号写进插槽即可
      return h(
        'span',
        ctx.api.value.getSeparatorProps() as Record<string, unknown>,
        slotPaints(content) ? content : ':',
      )
    }
  },
})

export const XhTimerControl = defineComponent({
  name: 'XhTimerControl',
  setup(_, { slots }) {
    const ctx = useTimerContext()
    return () => {
      const api = ctx.api.value
      const content = slots.default?.()
      // 用原生 button，激活交给平台；没写内容时把当前动作的名字写上去
      return h(
        'button',
        api.getControlProps() as Record<string, unknown>,
        slotPaints(content) ? content : api.controlLabel,
      )
    }
  },
})

/**
 * 没写默认插槽时铺开的整套结构：一个时间区，里面是时、分、秒三段与两个冒号。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 */
function renderDefaultTree(): VNode {
  const children: VNode[] = []
  for (const [index, unit] of DEFAULT_UNITS.entries()) {
    if (index > 0)
      children.push(h(XhTimerSeparator, { key: `separator-${unit}` }))
    children.push(h(XhTimerItem, { key: unit, unit }))
  }
  return h(XhTimerDisplay, null, () => children)
}
