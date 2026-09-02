import type { LogApi, LogProps, LogSchema, LogTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideLog, useLogContext } from './context'
import { useLog } from './use-log'

/** 默认插槽的载荷：行数与载入态、粘底状态与按钮的露面情况，以及滚到底部的句柄。 */
export type LogRootSlotProps = Pick<
  LogApi,
  | 'rows'
  | 'loading'
  | 'atBottom'
  | 'sticking'
  | 'showScrollButton'
  | 'scrollToBottom'
>

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
    'stick-change': (_details: PayloadOf<LogSchema['props'], 'onStickChange'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: LogRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: LogSchema['props']['onStickChange'] = details => emit('stick-change', details)
    const ctx = useLog(withXhConfig('log', props) as LogProps, notify)
    provideLog(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      rows: ctx.api.value.rows,
      loading: ctx.api.value.loading,
      atBottom: ctx.api.value.atBottom,
      sticking: ctx.api.value.sticking,
      showScrollButton: ctx.api.value.showScrollButton,
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

export const XhLogScrollButton = defineComponent({
  name: 'XhLogScrollButton',
  setup(_, { slots }) {
    const ctx = useLogContext()
    // 收起时走 hidden 属性，节点不卸载；插槽留空则由皮肤画兜底字形
    return () => h('button', ctx.api.value.getScrollButtonProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhLogLiveRegion = defineComponent({
  name: 'XhLogLiveRegion',
  setup(_, { slots }) {
    const ctx = useLogContext()
    // 内容由宿主写入，念哪一句、什么时候念都归宿主定
    return () => h('div', ctx.api.value.getLiveRegionProps() as Record<string, unknown>, slots.default?.())
  },
})
