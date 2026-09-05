import type { Tone } from '@xihan-ui/core'
import type { LoadingBarApi, LoadingBarSchema, LoadingBarTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideLoadingBar, useLoadingBarContext } from './context'
import { useLoadingBar } from './use-loading-bar'

type LoadingBarProps = LoadingBarSchema['props']

/** 默认插槽的载荷：条子的阶段、进度值、是否露面与是否不确定进度。 */
export type LoadingBarRootSlotProps = Pick<LoadingBarApi, 'phase' | 'value' | 'visible' | 'indeterminate'>

export const XhLoadingBarRoot = defineComponent({
  name: 'XhLoadingBarRoot',
  // 缺省值由机器与 connect 给出，这里一律 default: undefined
  props: {
    value: { type: Number, default: undefined },
    defaultValue: { type: Number, default: undefined },
    loading: { type: Boolean, default: undefined },
    height: { type: [String, Number] as PropType<string | number>, default: undefined },
    color: { type: String, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    trickle: { type: Boolean, default: undefined },
    trickleSpeed: { type: Number, default: undefined },
    minimum: { type: Number, default: undefined },
    fadeDuration: { type: Number, default: undefined },
    translations: { type: Object as PropType<Partial<LoadingBarTranslations>>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸数值
  emits: {
    'value-change': (_details: PayloadOf<LoadingBarProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<LoadingBarProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: LoadingBarRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: LoadingBarProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useLoadingBar(withXhConfig('loading-bar', props) as LoadingBarProps, notify)
    provideLoadingBar(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      phase: ctx.api.value.phase,
      value: ctx.api.value.value,
      visible: ctx.api.value.visible,
      indeterminate: ctx.api.value.indeterminate,
    }))
  },
})

export const XhLoadingBarTrack = defineComponent({
  name: 'XhLoadingBarTrack',
  setup(_, { slots }) {
    const ctx = useLoadingBarContext()
    return () => h('div', ctx.api.value.getTrackProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhLoadingBarRange = defineComponent({
  name: 'XhLoadingBarRange',
  setup(_, { slots }) {
    const ctx = useLoadingBarContext()
    // 宽度由 connect 写进内联样式
    return () => h('div', ctx.api.value.getRangeProps() as Record<string, unknown>, slots.default?.())
  },
})
