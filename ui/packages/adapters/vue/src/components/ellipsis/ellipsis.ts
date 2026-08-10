import type { EllipsisSchema } from '@xihan-ui/headless'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { useEllipsis } from './use-ellipsis'

type EllipsisProps = EllipsisSchema['props']

/**
 * 一段夹住的文字：单行收成省略号，多行按行数裁。
 * 溢出与否是量出来的，落在 data-overflowing 上，也经默认插槽的 overflowing 交出去——
 * 要不要再套一层提示由作者决定，这里不做浮层。
 */
export const XhEllipsis = defineComponent({
  name: 'XhEllipsis',
  // 缺省值由机器与 connect 决定，这里一律 default: undefined
  props: {
    lines: { type: Number, default: undefined },
    expandable: Boolean,
    expanded: { type: Boolean, default: undefined },
    defaultExpanded: Boolean,
    tooltip: Boolean,
  },
  // expanded-change 携带 { expanded }，update:expanded 携带裸布尔
  emits: {
    'expanded-change': (_details: PayloadOf<EllipsisProps, 'onExpandedChange'>) => true,
    'update:expanded': (_expanded: PayloadOf<EllipsisProps, 'onExpandedChange'>['expanded']) => true,
    'overflow-change': (_details: PayloadOf<EllipsisProps, 'onOverflowChange'>) => true,
  },
  setup(props, { slots, emit }) {
    const ctx = useEllipsis(props as EllipsisProps, {
      onExpandedChange: (details) => {
        emit('expanded-change', details)
        emit('update:expanded', details.expanded)
      },
      onOverflowChange: details => emit('overflow-change', details),
    })
    return () => h('div', {
      ...ctx.api.value.getRootProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
    }, slots.default?.({
      expanded: ctx.api.value.expanded,
      overflowing: ctx.api.value.overflowing,
      setExpanded: ctx.api.value.setExpanded,
      measure: ctx.api.value.measure,
    }))
  },
})
