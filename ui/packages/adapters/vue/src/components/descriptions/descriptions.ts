import type { Size } from '@xihan-ui/core'
import type { DescriptionsColumns, DescriptionsPlacement } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectDescriptions } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideDescriptions, useDescriptionsContext } from './context'

export const XhDescriptionsRoot = defineComponent({
  name: 'XhDescriptionsRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    columns: { type: Number as PropType<DescriptionsColumns>, default: undefined },
    bordered: Boolean,
    placement: { type: String as PropType<DescriptionsPlacement>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    /** 根渲染成哪个标签，默认 dl。 */
    as: { type: String, default: 'dl' },
  },
  setup(props, { slots }) {
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理
    const configured = withXhConfig('descriptions', props)
    const api = computed(() => connectDescriptions({
      columns: configured.columns,
      bordered: configured.bordered,
      placement: configured.placement,
      size: configured.size,
    }, vueNormalize))
    provideDescriptions({ api })
    return () => h(props.as, api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

// 一组「标签 + 取值」包一层，让它成为网格里的一格；dl 允许 div 包裹成对的 dt/dd
export const XhDescriptionsItem = defineComponent({
  name: 'XhDescriptionsItem',
  props: {
    /** 每一格渲染成哪个标签，默认 div。 */
    as: { type: String, default: 'div' },
  },
  setup(props, { slots }) {
    const ctx = useDescriptionsContext()
    return () => h(props.as, ctx.api.value.getItemProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDescriptionsLabel = defineComponent({
  name: 'XhDescriptionsLabel',
  props: {
    /** 标签渲染成哪个标签，默认 dt。 */
    as: { type: String, default: 'dt' },
  },
  setup(props, { slots }) {
    const ctx = useDescriptionsContext()
    return () => h(props.as, ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDescriptionsValue = defineComponent({
  name: 'XhDescriptionsValue',
  props: {
    /** 取值渲染成哪个标签，默认 dd。 */
    as: { type: String, default: 'dd' },
  },
  setup(props, { slots }) {
    const ctx = useDescriptionsContext()
    return () => h(props.as, ctx.api.value.getValueProps() as Record<string, unknown>, slots.default?.())
  },
})
