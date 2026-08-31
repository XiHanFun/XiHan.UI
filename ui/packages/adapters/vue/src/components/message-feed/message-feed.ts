import type { MessageFeedApi, MessageFeedItemProps, MessageFeedSchema, MessageFeedStatus, MessageFeedTranslations } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'
import { withXhConfig } from '../../config/config'
import {
  provideMessageFeed,
  provideMessageFeedItem,
  useMessageFeedContext,
  useMessageFeedItemContext,
} from './context'
import { useMessageFeed } from './use-message-feed'

type Props = MessageFeedSchema['props']

/** 默认插槽的载荷：粘底状态、锚点，以及三个命令式入口。 */
export type MessageFeedRootSlotProps = Pick<
  MessageFeedApi,
  | 'status'
  | 'atBottom'
  | 'sticking'
  | 'focusedId'
  | 'showScrollButton'
  | 'scrollToBottom'
  | 'scrollToItem'
  | 'focusItem'
>

export const XhMessageFeedRoot = defineComponent({
  name: 'XhMessageFeedRoot',
  // 一律 default: undefined，缺省值由机器、connect 与粘底句柄给出
  props: {
    count: { type: Number, default: undefined },
    status: { type: String as PropType<MessageFeedStatus>, default: undefined },
    threshold: { type: Number, default: undefined },
    loop: { type: Boolean, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<MessageFeedTranslations>>, default: undefined },
  },
  emits: {
    'stick-change': (_details: PayloadOf<Props, 'onStickChange'>) => true,
    'item-focus': (_details: PayloadOf<Props, 'onItemFocus'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: MessageFeedRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useMessageFeed(withXhConfig('message-feed', props) as Props, {
      onStickChange: details => emit('stick-change', details),
      onItemFocus: details => emit('item-focus', details),
    })
    provideMessageFeed(ctx)
    return () => h('div', {
      ...ctx.api.value.getRootProps() as Record<string, unknown>,
      ref: ctx.rootRef,
    }, slots.default?.({
      status: ctx.api.value.status,
      atBottom: ctx.api.value.atBottom,
      sticking: ctx.api.value.sticking,
      focusedId: ctx.api.value.focusedId,
      showScrollButton: ctx.api.value.showScrollButton,
      scrollToBottom: ctx.api.value.scrollToBottom,
      scrollToItem: ctx.api.value.scrollToItem,
      focusItem: ctx.api.value.focusItem,
    }))
  },
})

export const XhMessageFeedViewport = defineComponent({
  name: 'XhMessageFeedViewport',
  setup(_, { slots }) {
    const ctx = useMessageFeedContext()
    // 把视口节点交给机器，由粘底句柄监听滚动
    return () => h('div', {
      ...ctx.api.value.getViewportProps() as Record<string, unknown>,
      ref: ctx.viewportRef,
    }, slots.default?.())
  },
})

export const XhMessageFeedList = defineComponent({
  name: 'XhMessageFeedList',
  setup(_, { slots }) {
    const ctx = useMessageFeedContext()
    // 把内容节点交给机器，由粘底句柄观察尺寸；条目必须是它的直接子节点
    return () => h('div', {
      ...ctx.api.value.getListProps() as Record<string, unknown>,
      ref: ctx.contentRef,
    }, slots.default?.())
  },
})

export const XhMessageFeedItem = defineComponent({
  name: 'XhMessageFeedItem',
  // 属性名一律带 item- 前缀：id 与 role 是 HTML 全局属性，落到节点上会与 role=article 打架
  props: {
    itemId: { type: String, required: true },
    // 收字符串是为了让作者能直接写在标记上（`item-index="0"`），与自定义元素那侧同形
    itemIndex: { type: [Number, String] as PropType<number | string>, required: true },
    itemRole: { type: String as PropType<MessageFeedItemProps['role']>, default: undefined },
    itemStreaming: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useMessageFeedContext()
    const labelCount = ref(0)
    provideMessageFeedItem({ id: () => props.itemId, labelCount })
    return () => h('article', ctx.api.value.getItemProps({
      id: props.itemId,
      index: Number(props.itemIndex),
      role: props.itemRole,
      streaming: props.itemStreaming,
      labelled: labelCount.value > 0,
    }) as Record<string, unknown>, slots.default?.())
  },
})

export const XhMessageFeedItemLabel = defineComponent({
  name: 'XhMessageFeedItemLabel',
  setup(_, { slots }) {
    const ctx = useMessageFeedContext()
    const item = useMessageFeedItemContext()
    // 渲出来了才登记：条目的 aria-labelledby 只在这个节点真在场时才指过来
    onMounted(() => {
      item.labelCount.value++
    })
    onBeforeUnmount(() => {
      item.labelCount.value--
    })
    return () => h(
      'span',
      ctx.api.value.getItemLabelProps({ id: item.id() }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhMessageFeedScrollButton = defineComponent({
  name: 'XhMessageFeedScrollButton',
  setup(_, { slots }) {
    const ctx = useMessageFeedContext()
    return () => h('button', ctx.api.value.getScrollButtonProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhMessageFeedLiveRegion = defineComponent({
  name: 'XhMessageFeedLiveRegion',
  setup(_, { slots }) {
    const ctx = useMessageFeedContext()
    // 播报文本由宿主在一轮流结束时写进来
    return () => h('div', ctx.api.value.getLiveRegionProps() as Record<string, unknown>, slots.default?.())
  },
})
