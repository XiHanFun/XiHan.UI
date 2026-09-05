import type { Size, Tone } from '@xihan-ui/core'
import type { StatisticProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectStatistic } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideStatistic, useStatisticContext } from './context'

export const XhStatisticRoot = defineComponent({
  name: 'XhStatisticRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    size: { type: String as PropType<Size>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
  },
  setup(props, { slots }) {
    const api = computed(() => connectStatistic(withXhConfig('statistic', props) as StatisticProps, vueNormalize))
    provideStatistic({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

// 标签渲染为 span 而不是 label：它不关联任何表单控件
export const XhStatisticLabel = defineComponent({
  name: 'XhStatisticLabel',
  setup(_, { slots }) {
    const ctx = useStatisticContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

// 数值由作者格式化好再塞进来，组件只负责排版
export const XhStatisticValue = defineComponent({
  name: 'XhStatisticValue',
  setup(_, { slots }) {
    const ctx = useStatisticContext()
    return () => h('span', ctx.api.value.getValueProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhStatisticPrefix = defineComponent({
  name: 'XhStatisticPrefix',
  setup(_, { slots }) {
    const ctx = useStatisticContext()
    return () => h('span', ctx.api.value.getPrefixProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhStatisticSuffix = defineComponent({
  name: 'XhStatisticSuffix',
  setup(_, { slots }) {
    const ctx = useStatisticContext()
    return () => h('span', ctx.api.value.getSuffixProps() as Record<string, unknown>, slots.default?.())
  },
})
