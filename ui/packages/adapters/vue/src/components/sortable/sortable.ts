import type { SortableItemState, SortableMode, SortableSchema, SortableTranslations } from '@xihan-ui/headless'
import type { Direction } from '@xihan-ui/kernel'
import type { SortableAxis } from '@xihan-ui/pointer'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideSortable, useSortableContext } from './context'
import { useSortable } from './use-sortable'

type SortableProps = SortableSchema['props']

/** 默认插槽的载荷：逐项呈现状态与整体拖动态。 */
export interface SortableRootSlotProps {
  items: SortableItemState[]
  dragging: boolean
  activeId: string | null
  from: number
  to: number
  mode: SortableMode | null
}

/** 每一项的插槽载荷。`dragging` 是「就是它被拖着」，不是「列表里有人在拖」。 */
export interface SortableItemSlotProps {
  dragging: boolean
  index: number
}

export const XhSortableRoot = defineComponent({
  name: 'XhSortableRoot',
  props: {
    ids: { type: Array as PropType<string[]>, default: () => [] },
    orientation: { type: String as PropType<SortableAxis>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    disabled: Boolean,
    activationDistance: { type: Number, default: undefined },
    autoScroll: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<Partial<SortableTranslations>>, default: undefined },
  },
  // sort 携带 { from, to, id, ids }，update:ids 携带重排好的裸数组，可直接 v-model:ids
  emits: {
    'sort': (_details: PayloadOf<SortableProps, 'onSort'>) => true,
    'update:ids': (_ids: PayloadOf<SortableProps, 'onSort'>['ids']) => true,
    'drag-start': (_details: PayloadOf<SortableProps, 'onDragStart'>) => true,
    'drag-end': (_details: PayloadOf<SortableProps, 'onDragEnd'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: SortableRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifySort: SortableProps['onSort'] = (details) => {
      emit('sort', details)
      emit('update:ids', details.ids)
    }
    const ctx = useSortable(
      withXhConfig('sortable', props) as SortableProps,
      notifySort,
      details => emit('drag-start', details),
      details => emit('drag-end', details),
    )
    provideSortable(ctx)

    return () => h('div', {
      ...ctx.api.value.getRootProps() as Record<string, unknown>,
      ref: ctx.rootRef,
    }, slots.default?.({
      items: ctx.api.value.items,
      dragging: ctx.api.value.dragging,
      activeId: ctx.api.value.activeId,
      from: ctx.api.value.from,
      to: ctx.api.value.to,
      mode: ctx.api.value.mode,
    }))
  },
})

export const XhSortableItem = defineComponent({
  name: 'XhSortableItem',
  props: {
    /** 项标识，与 `ids` 里的值一一对应。 */
    itemId: { type: String, required: true },
    /** 单独禁掉这一项。整份 `disabled` 在 Root 上，这条是项级的。 */
    disabled: { type: Boolean, default: undefined },
  },
  slots: Object as SlotsType<{
    default?: (props: SortableItemSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useSortableContext()
    const state = computed(() => ctx.api.value.items.find(item => item.id === props.itemId))
    return () => h(
      'div',
      ctx.api.value.getItemProps({ id: props.itemId, disabled: props.disabled }) as Record<string, unknown>,
      slots.default?.({
        dragging: state.value?.dragging ?? false,
        index: state.value?.index ?? -1,
      }),
    )
  },
})

export const XhSortableItemDragTrigger = defineComponent({
  name: 'XhSortableItemDragTrigger',
  props: {
    /** 项标识，与 `ids` 里的值一一对应。 */
    itemId: { type: String, required: true },
    /** 单独禁掉这一项。整份 `disabled` 在 Root 上，这条是项级的。 */
    disabled: { type: Boolean, default: undefined },
  },
  slots: Object as SlotsType<{
    default?: () => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useSortableContext()
    return () => h(
      'button',
      ctx.api.value.getItemDragTriggerProps({ id: props.itemId, disabled: props.disabled }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

/**
 * 拖动过程的读屏播报区，视觉上不可见。
 *
 * 放进列表里就行，位置不限。它必须在拖动开始**之前**就在 DOM 上——
 * 读屏不播报后插入的节点，等到拾起才渲出来等于没有。
 */
export const XhSortableLiveRegion = defineComponent({
  name: 'XhSortableLiveRegion',
  setup() {
    const ctx = useSortableContext()
    return () => h(
      'div',
      ctx.api.value.getLiveRegionProps() as Record<string, unknown>,
      ctx.service.context.get('announcement'),
    )
  },
})
