import type { ResizableOffset, ResizableSchema, ResizableSize, ResizableTranslations } from '@xihan-ui/headless'
import type { Direction } from '@xihan-ui/kernel'
import type { ResizeEdge } from '@xihan-ui/pointer'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { provideResizable, useResizableContext } from './context'
import { useResizable } from './use-resizable'

type ResizableProps = ResizableSchema['props']

/** 默认插槽的载荷：当前尺寸、位移与调整态。 */
export interface ResizableRootSlotProps {
  size: ResizableSize
  offset: ResizableOffset
  resizing: boolean
  activeEdge: ResizeEdge | null
}

export const XhResizableRoot = defineComponent({
  name: 'XhResizableRoot',
  props: {
    size: { type: Object as PropType<ResizableSize>, default: undefined },
    defaultSize: { type: Object as PropType<ResizableSize>, default: undefined },
    minWidth: { type: Number, default: undefined },
    minHeight: { type: Number, default: undefined },
    maxWidth: { type: Number, default: undefined },
    maxHeight: { type: Number, default: undefined },
    aspectRatio: { type: Number, default: undefined },
    step: { type: Number, default: undefined },
    keyboardStep: { type: Number, default: undefined },
    keyboardLargeStep: { type: Number, default: undefined },
    edges: { type: Array as PropType<ResizeEdge[]>, default: undefined },
    disabled: Boolean,
    dir: { type: String as PropType<Direction>, default: undefined },
    translations: { type: Object as PropType<Partial<ResizableTranslations>>, default: undefined },
  },
  // size-change 携带 { size }，update:size 携带裸尺寸（v-model:size）；
  // size-change-end 只在一次调整收尾时发一次，存尺寸用它
  emits: {
    'size-change': (_details: PayloadOf<ResizableProps, 'onSizeChange'>) => true,
    'update:size': (_size: PayloadOf<ResizableProps, 'onSizeChange'>['size']) => true,
    'size-change-end': (_details: PayloadOf<ResizableProps, 'onSizeChangeEnd'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ResizableRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: ResizableProps['onSizeChange'] = (details) => {
      emit('size-change', details)
      emit('update:size', details.size)
    }
    const ctx = useResizable(props as ResizableProps, notify, details => emit('size-change-end', details))
    provideResizable(ctx)

    return () => h('div', {
      ...ctx.api.value.getRootProps() as Record<string, unknown>,
      ref: ctx.rootRef,
    }, slots.default?.({
      size: ctx.api.value.size,
      offset: ctx.api.value.offset,
      resizing: ctx.api.value.resizing,
      activeEdge: ctx.api.value.activeEdge,
    }))
  },
})

/**
 * 一条边上的把手。
 *
 * 推西边与北边时容器的起点会动，那段位移写成 root 的 left / top——皮肤已给
 * `position: relative`，开箱即对。把 root 改成 static 会让这两个方向只变尺寸不移位。
 */
export const XhResizableHandle = defineComponent({
  name: 'XhResizableHandle',
  props: {
    edge: { type: String as PropType<ResizeEdge>, required: true },
  },
  slots: Object as SlotsType<{
    default?: () => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useResizableContext()
    return () => h(
      'span',
      ctx.api.value.getHandleProps({ edge: props.edge }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
