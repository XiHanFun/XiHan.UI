import type {
  CascaderExpandTrigger,
  CascaderItemProps,
  CascaderNode,
  CascaderSchema,
  CascaderValue,
} from '@xihan-ui/headless'
import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, Ref } from 'vue'
import type { CascaderContext } from './use-cascader'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideCascader, provideCascaderItem, useCascaderContext, useCascaderItemContext } from './context'
import { useCascader } from './use-cascader'

type CascaderProps = CascaderSchema['props']

/** 本条目持有焦点时，value 变更重报焦点条目，卸载时上报焦点丢失 */
function reportItemFocus(
  ctx: CascaderContext,
  el: Ref<HTMLElement | null>,
  value: () => string,
): void {
  watch(value, (next, prev) => {
    if (next === prev)
      return
    const { service, api } = ctx
    if (service.getStatus() !== 'Started')
      return
    if (!el.value || service.scope.getActiveElement() !== el.value)
      return
    // 层号回 collection 里查，条目只自报值
    const meta = api.value.levels.flatMap(level => level.items).find(item => item.value === next)
    if (meta)
      service.send({ type: 'ITEM.FOCUS', level: meta.level, value: next })
  })
  onBeforeUnmount(() => {
    const { service } = ctx
    // 整组一起卸载时根部件先停机，此刻送事件会在 dev 下抛
    if (service.getStatus() !== 'Started')
      return
    // 按「本条目当下正持有焦点」判定，不按 value 比对
    if (el.value && service.scope.getActiveElement() === el.value)
      service.send({ type: 'ITEM.LOST' })
  })
}

export const XhCascaderRoot = defineComponent({
  name: 'XhCascaderRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    collection: { type: Array as PropType<CascaderNode[]>, default: undefined },
    value: { type: Array as PropType<CascaderValue>, default: undefined },
    defaultValue: { type: Array as PropType<CascaderValue>, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    expandTrigger: { type: String as PropType<CascaderExpandTrigger>, default: undefined },
    changeOnSelect: Boolean,
    multiple: Boolean,
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    placeholder: { type: String, default: undefined },
    separator: { type: String, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值；选中值恒为路径数组，单选时长度 ≤ 1
  emits: ['value-change', 'open-change', 'update:value', 'update:open'],
  setup(props, { slots, emit }) {
    const notifyValue: CascaderProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyOpen: CascaderProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useCascader(props as CascaderProps, {
      onValueChange: notifyValue,
      onOpenChange: notifyOpen,
    })
    provideCascader(ctx)

    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      // levels 每层一列、层内节点各一条目，供作者渲染；columns 只读当前展开的列
      levels: ctx.api.value.levels,
      columns: ctx.api.value.columns,
      value: ctx.api.value.value,
      valuePath: ctx.api.value.valuePath,
      activePath: ctx.api.value.activePath,
      focusedPath: ctx.api.value.focusedPath,
      displayText: ctx.api.value.displayText,
      canClear: ctx.api.value.canClear,
      isSelected: ctx.api.value.isSelected,
      isActive: ctx.api.value.isActive,
      isVisible: ctx.api.value.isVisible,
      setOpen: ctx.api.value.setOpen,
      setValue: ctx.api.value.setValue,
      setActivePath: ctx.api.value.setActivePath,
      select: ctx.api.value.select,
      clear: ctx.api.value.clear,
    }))
  },
})

export const XhCascaderLabel = defineComponent({
  name: 'XhCascaderLabel',
  setup(_, { slots }) {
    const ctx = useCascaderContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCascaderTrigger = defineComponent({
  name: 'XhCascaderTrigger',
  setup(_, { slots }) {
    const ctx = useCascaderContext()
    return () => h('button', {
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhCascaderValueText = defineComponent({
  name: 'XhCascaderValueText',
  setup(_, { slots }) {
    const ctx = useCascaderContext()
    // 有插槽用插槽，否则显示整条路径或 placeholder
    return () => h(
      'span',
      ctx.api.value.getValueTextProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.displayText,
    )
  },
})

export const XhCascaderIndicator = defineComponent({
  name: 'XhCascaderIndicator',
  setup(_, { slots }) {
    const ctx = useCascaderContext()
    return () => h('span', ctx.api.value.getIndicatorProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCascaderClearTrigger = defineComponent({
  name: 'XhCascaderClearTrigger',
  setup(_, { slots }) {
    const ctx = useCascaderContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCascaderPositioner = defineComponent({
  name: 'XhCascaderPositioner',
  setup(_, { slots }) {
    const ctx = useCascaderContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhCascaderContent = defineComponent({
  name: 'XhCascaderContent',
  setup(_, { slots }) {
    const ctx = useCascaderContext()
    // 收起时只隐藏不卸载；跨列的键盘导航也在这一层处理
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhCascaderColumn = defineComponent({
  name: 'XhCascaderColumn',
  props: {
    // 层号，兼收字符串以支持模板里写 level="0"
    level: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useCascaderContext()
    // 展开路径变短时本列收起，节点常挂不卸载
    return () => h(
      'div',
      ctx.api.value.getColumnProps({ level: Number(props.level) }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhCascaderItem = defineComponent({
  name: 'XhCascaderItem',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useCascaderContext()
    const item = computed<CascaderItemProps>(() => ({ value: props.value }))
    provideCascaderItem({ item })
    const el = ref<HTMLElement | null>(null)
    reportItemFocus(ctx, el, () => props.value)
    return () => h(
      'div',
      { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: el },
      slots.default?.(),
    )
  },
})

export const XhCascaderItemText = defineComponent({
  name: 'XhCascaderItemText',
  setup(_, { slots }) {
    const ctx = useCascaderContext()
    const { item } = useCascaderItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhCascaderItemIndicator = defineComponent({
  name: 'XhCascaderItemIndicator',
  setup(_, { slots }) {
    const ctx = useCascaderContext()
    const { item } = useCascaderItemContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})
