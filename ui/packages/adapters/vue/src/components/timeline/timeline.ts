import type { TimelinePlacement, TimelineProps } from '@xihan-ui/headless'
import type { Orientation } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import { connectTimeline } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideTimeline, provideTimelineItem, useTimelineContext, useTimelineItem } from './context'

/** 根渲染为 ol：事件本来就有先后，列表标记由皮肤抹掉、列表语义由 role 兜住。 */
export const XhTimelineRoot = defineComponent({
  name: 'XhTimelineRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    orientation: { type: String as PropType<Orientation>, default: undefined },
    placement: { type: String as PropType<TimelinePlacement>, default: undefined },
    size: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const api = computed(() => connectTimeline(props as TimelineProps, vueNormalize))
    provideTimeline({ api })
    return () => h('ol', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 一条事件。tone 只在这一条内生效，下传给它自己的圆点。 */
export const XhTimelineItem = defineComponent({
  name: 'XhTimelineItem',
  props: {
    tone: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useTimelineContext()
    provideTimelineItem(() => ({ tone: props.tone }))
    return () => h('li', ctx.api.value.getItemProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimelineIndicator = defineComponent({
  name: 'XhTimelineIndicator',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    const item = useTimelineItem()
    return () => h('span', ctx.api.value.getIndicatorProps(item()) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimelineConnector = defineComponent({
  name: 'XhTimelineConnector',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('span', ctx.api.value.getConnectorProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimelineContent = defineComponent({
  name: 'XhTimelineContent',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('div', ctx.api.value.getContentProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimelineTitle = defineComponent({
  name: 'XhTimelineTitle',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('div', ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTimelineDescription = defineComponent({
  name: 'XhTimelineDescription',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('div', ctx.api.value.getDescriptionProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 渲染为 time：机读时间由作者写 datetime，属性原样透传到这个节点上。 */
export const XhTimelineTime = defineComponent({
  name: 'XhTimelineTime',
  setup(_, { slots }) {
    const ctx = useTimelineContext()
    return () => h('time', ctx.api.value.getTimeProps() as Record<string, unknown>, slots.default?.())
  },
})
