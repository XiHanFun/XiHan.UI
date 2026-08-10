import type { LogProps, LogTranslations, ThreadSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { provideLog, useLogContext } from './context'
import { useLog } from './use-log'

export const XhLogRoot = defineComponent({
  name: 'XhLogRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    rows: { type: Number, default: undefined },
    loading: Boolean,
    translations: { type: Object as PropType<Partial<LogTranslations>>, default: undefined },
  },
  // stick-change 携带 { atBottom, sticking }，无对应的 v-model
  emits: {
    'stick-change': (_details: PayloadOf<ThreadSchema['props'], 'onStickChange'>) => true,
  },
  setup(props, { slots, emit }) {
    const notify: ThreadSchema['props']['onStickChange'] = details => emit('stick-change', details)
    const ctx = useLog(props as LogProps, notify)
    provideLog(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      rows: ctx.api.value.rows,
      loading: ctx.api.value.loading,
      atBottom: ctx.api.value.atBottom,
      sticking: ctx.api.value.sticking,
      scrollToBottom: ctx.api.value.scrollToBottom,
    }))
  },
})

export const XhLogViewport = defineComponent({
  name: 'XhLogViewport',
  setup(_, { slots }) {
    const ctx = useLogContext()
    // 把视口节点交给机器，由粘底句柄监听滚动
    return () => h('div', {
      ...ctx.api.value.getViewportProps() as Record<string, unknown>,
      ref: ctx.viewportRef,
    }, slots.default?.())
  },
})

export const XhLogContent = defineComponent({
  name: 'XhLogContent',
  setup(_, { slots }) {
    const ctx = useLogContext()
    // 把内容节点交给机器，由粘底句柄观察尺寸
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: ctx.contentRef,
    }, slots.default?.())
  },
})

export const XhLogLine = defineComponent({
  name: 'XhLogLine',
  setup(_, { slots }) {
    const ctx = useLogContext()
    // 一行的文本与级别标注由作者写在插槽里
    return () => h('div', ctx.api.value.getLineProps() as Record<string, unknown>, slots.default?.())
  },
})
