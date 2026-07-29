import type { ThreadSchema, ThreadStatus, ThreadTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideThread, useThreadContext } from './context'
import { useThread } from './use-thread'

type ThreadProps = ThreadSchema['props']

export const XhThreadRoot = defineComponent({
  name: 'XhThreadRoot',
  // 缺省值的唯一事实源在机器、connect 与粘底句柄里 —— 凡是那边有兜底的一律 default: undefined。
  // threshold 尤其：落成 0 会把"距底 64px 内算在底"改成"必须严丝合缝贴底"，最后一行没露全就判脱锚
  props: {
    status: { type: String as PropType<ThreadStatus>, default: undefined },
    threshold: { type: Number, default: undefined },
    translations: { type: Object as PropType<Partial<ThreadTranslations>>, default: undefined },
  },
  // stick-change 携带 { atBottom, sticking }。粘底没有"受控"一说（几何是浏览器算的），
  // 所以只报事实，没有对应的 v-model
  emits: ['stick-change'],
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
    // 视口节点交给机器：滚动位置与尺寸只在句柄的回调那一刻现量，连接期一律不碰 DOM
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
    // 内容层的高度就是粘底的输入信号，节点同样要留给句柄去观察
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
    // 不在底部时才露出来，收起走 hidden 属性而不是卸载：作者常在里面放图标与过渡
    return () => h('button', ctx.api.value.getScrollButtonProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhThreadLiveRegion = defineComponent({
  name: 'XhThreadLiveRegion',
  setup(_, { slots }) {
    const ctx = useThreadContext()
    // 内容由宿主在一轮流结束时一次性写进来。中途逐段写等于让读屏把同一段话越念越长
    return () => h('div', ctx.api.value.getLiveRegionProps() as Record<string, unknown>, slots.default?.())
  },
})
