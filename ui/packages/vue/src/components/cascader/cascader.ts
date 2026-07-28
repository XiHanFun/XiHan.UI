import type { Direction, Placement } from '@xihan-ui/core'
import type {
  CascaderExpandTrigger,
  CascaderItemProps,
  CascaderNode,
  CascaderSchema,
  CascaderValue,
} from '@xihan-ui/headless'
import type { PropType, Ref } from 'vue'
import type { CascaderContext } from './use-cascader'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideCascader, provideCascaderItem, useCascaderContext, useCascaderItemContext } from './context'
import { useCascader } from './use-cascader'

type CascaderProps = CascaderSchema['props']

/**
 * 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的条目上：
 * 没有条目认领 tabindex=0、方向键也失去起点。卸载前如实上报，机器就地重挑锚点，
 * 且只有自己正持有焦点时才报——否则删掉任一无关条目都会把光标一并清掉。
 *
 * v-for 不带 key 时 Vue 会就地复用节点：被删的是「最后一个组件实例」，
 * 而持有焦点的那个 DOM 节点还在、value 却被改成了别的条目。此时锚点仍指着旧值、
 * 已无人认领，键盘就此失灵。自己正持有焦点且 value 变了，就按新值重报一次。
 */
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
    // 层号回 collection 里查：条目只自报值，路径与所在列都不是它说了算的
    const meta = api.value.levels.flatMap(level => level.items).find(item => item.value === next)
    if (meta)
      service.send({ type: 'ITEM.FOCUS', level: meta.level, value: next })
  })
  onBeforeUnmount(() => {
    const { service } = ctx
    // 整个控件一起卸载时根部件先停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (service.getStatus() !== 'Started')
      return
    // 判据是「本条目当下正持有焦点」，不是「值对得上」：v-for 就地复用时
    // 被卸载的是末位实例、它的 value 可能恰好等于刚纠正过的锚点，按值判会把好端端的锚点清掉
    if (el.value && service.scope.getActiveElement() === el.value)
      service.send({ type: 'ITEM.LOST' })
  })
}

export const XhCascaderRoot = defineComponent({
  name: 'XhCascaderRoot',
  // 缺省值的唯一事实源在 connect —— 凡是 connect 有兜底的一律 default: undefined
  // （loop 尤其：裸 Boolean 声明会把缺省压成 false，将来改缺省就再也传不进真值）
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
    placeholder: { type: String, default: undefined },
    separator: { type: String, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
  },
  // *-change 携带 details 对象；update:* 携带裸值，支持 v-model:value / v-model:open。
  // 回传的选中值恒是「路径的数组」（单选也是长度 ≤ 1 的数组），形状不随模式变
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
      // 作者按 levels 写标记（每层一个列、层内节点各一个条目），当下露哪些由连接层用 hidden 收口；
      // columns 只是让作者看得见「此刻开着哪几列」，不该拿它去决定渲染什么
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
    // 作者写了插槽就听作者的，否则显示整条路径，无选中时显示 placeholder
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
    // 收起时留在 DOM 只隐藏，不卸载作者节点；键盘也在这里收口（列与列之间要跨着走）
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhCascaderColumn = defineComponent({
  name: 'XhCascaderColumn',
  props: {
    // 层号由作者声明。也收字符串：模板里写 level="0"（不带冒号）拿到的就是字符串，
    // 只声明 Number 会让那种写法在运行期报警且值原样透传下去
    level: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useCascaderContext()
    // 展开路径砍短了这一列就收起来，作者节点常挂不卸载
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
