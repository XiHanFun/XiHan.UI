import type { ThreadSchema, ThreadStatus, ThreadTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { provideThread, useThreadContext } from './context'
import { useThread } from './use-thread'

type ThreadProps = ThreadSchema['props']

export const XhThreadRoot = defineComponent({
  name: 'XhThreadRoot',
  // 一律 default: undefined，缺省值由机器、connect 与粘底句柄给出
  props: {
    status: { type: String as PropType<ThreadStatus>, default: undefined },
    threshold: { type: Number, default: undefined },
    translations: { type: Object as PropType<Partial<ThreadTranslations>>, default: undefined },
  },
  // stick-change 携带 { atBottom, sticking }，无对应的 v-model
  emits: {
    'stick-change': (_details: PayloadOf<ThreadProps, 'onStickChange'>) => true,
  },
  setup(props, { slots, emit }) {
    const notify: ThreadProps['onStickChange'] = details => emit('stick-change', details)
    const ctx = useThread(props as ThreadProps, notify)
    provideThread(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      status: ctx.api.value.status,
      atBottom: ctx.api.value.atBottom,
      sticking: ctx.api.value.sticking,
      showScrollButton: ctx.api.value.showScrollButton,
      scrollToBottom: ctx.api.value.scrollToBottom,
    }))
  },
})

export const XhThreadViewport = defineComponent({
  name: 'XhThreadViewport',
  setup(_, { slots }) {
    const ctx = useThreadContext()
    // 把视口节点交给机器，由粘底句柄监听滚动
    return () => h('div', {
      ...ctx.api.value.getViewportProps() as Record<string, unknown>,
      ref: ctx.viewportRef,
    }, slots.default?.())
  },
})

export const XhThreadContent = defineComponent({
  name: 'XhThreadContent',
  setup(_, { slots }) {
    const ctx = useThreadContext()
    // 把内容节点交给机器，由粘底句柄观察尺寸
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: ctx.contentRef,
    }, slots.default?.())
  },
})

export const XhThreadScrollButton = defineComponent({
  name: 'XhThreadScrollButton',
  setup(_, { slots }) {
    const ctx = useThreadContext()
    // 收起时走 hidden 属性，节点不卸载
    return () => h('button', ctx.api.value.getScrollButtonProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhThreadLiveRegion = defineComponent({
  name: 'XhThreadLiveRegion',
  setup(_, { slots }) {
    const ctx = useThreadContext()
    // 内容由宿主在一轮流结束时一次性写入
    return () => h('div', ctx.api.value.getLiveRegionProps() as Record<string, unknown>, slots.default?.())
  },
})
