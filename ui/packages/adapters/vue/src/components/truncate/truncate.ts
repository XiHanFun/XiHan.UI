import type { TruncateApi, TruncateSchema } from '@xihan-ui/headless'
import type { SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { useTruncate } from './use-truncate'

type TruncateProps = TruncateSchema['props']

/** 默认插槽的载荷：展开态与量出来的溢出与否，以及展开与重量一次的方法。 */
export type TruncateSlotProps = Pick<TruncateApi, 'open' | 'overflowing' | 'setOpen' | 'measure'>

/**
 * 一段夹住的文字：单行收成省略号，多行按行数裁。
 * 溢出与否是量出来的，落在 data-overflowing 上，也经默认插槽的 overflowing 交出去——
 * 要不要再套一层提示由作者决定，这里不做浮层。
 */
export const XhTruncate = defineComponent({
  name: 'XhTruncate',
  // 缺省值由机器与 connect 决定，这里一律 default: undefined
  props: {
    lines: { type: Number, default: undefined },
    expandable: Boolean,
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    tooltip: Boolean,
  },
  // open-change 携带 { open }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<TruncateProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<TruncateProps, 'onOpenChange'>['open']) => true,
    'overflow-change': (_details: PayloadOf<TruncateProps, 'onOverflowChange'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TruncateSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useTruncate(props as TruncateProps, {
      onOpenChange: (details) => {
        emit('open-change', details)
        emit('update:open', details.open)
      },
      onOverflowChange: details => emit('overflow-change', details),
    })
    return () => h('div', {
      ...ctx.api.value.getRootProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
    }, slots.default?.({
      open: ctx.api.value.open,
      overflowing: ctx.api.value.overflowing,
      setOpen: ctx.api.value.setOpen,
      measure: ctx.api.value.measure,
    }))
  },
})
