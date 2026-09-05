import type { Size } from '@xihan-ui/core'
import type { InputGroupProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectInputGroup } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideInputGroup, useInputGroupContext } from './context'

export const XhInputGroupRoot = defineComponent({
  name: 'XhInputGroupRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    size: { type: String as PropType<Size>, default: undefined },
  },
  setup(props, { slots }) {
    const api = computed(() => connectInputGroup(withXhConfig('input-group', props) as InputGroupProps, vueNormalize))
    provideInputGroup({ api })
    // 组内每一段是作者放进插槽的控件，直接当直接子节点摆
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhInputGroupItem = defineComponent({
  name: 'XhInputGroupItem',
  setup(_, { slots }) {
    const ctx = useInputGroupContext()
    // 前后缀文本由作者写进插槽
    return () => h('span', ctx.api.value.getItemProps() as Record<string, unknown>, slots.default?.())
  },
})
