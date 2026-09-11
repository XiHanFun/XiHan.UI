import type { Direction, OverlayBackdropVariant, Size } from '@xihan-ui/core'
import type { CommandApi, CommandGroup, CommandGroupMeta, CommandGroupProps, CommandItemProps, CommandNode, CommandNodeMeta, CommandSchema } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { COMMAND_UNGROUPED, resolveCommandGroups } from '@xihan-ui/headless'
import { computed, defineComponent, h, mergeProps } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import {
  provideCommand,
  provideCommandItem,
  provideCommandItemGroup,
  useCommandContext,
  useCommandItemContext,
  useCommandItemGroupContext,
} from './context'
import { useCommand } from './use-command'

type CommandProps = CommandSchema['props']

/** 默认插槽的载荷：开合、检索串、结果与锚点，以及改这些的命令。 */
export type CommandRootSlotProps = Pick<
  CommandApi,
  'open' | 'inputValue' | 'groups' | 'results' | 'highlightedValue' | 'empty' | 'setOpen' | 'setInputValue' | 'select'
>

export const XhCommandRoot = defineComponent({
  name: 'XhCommandRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    collection: { type: Array as PropType<CommandNode[]>, default: undefined },
    groups: { type: Array as PropType<CommandGroup[]>, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    inputValue: { type: String, default: undefined },
    defaultInputValue: { type: String, default: undefined },
    /** 内置过滤，默认开；关掉即由调用方自己筛 */
    filter: { type: Boolean, default: undefined },
    caseSensitive: Boolean,
    closeOnSelect: { type: Boolean, default: undefined },
    modal: { type: Boolean, default: true },
    closeOnEscape: { type: Boolean, default: true },
    closeOnInteractOutside: { type: Boolean, default: undefined },
    restoreFocus: { type: Boolean, default: true },
    loop: { type: Boolean, default: undefined },
    loading: Boolean,
    placeholder: { type: String, default: undefined },
    /** 无匹配时的提示语。给了它就不必再写 empty 部件；要放别的内容改用 empty 插槽。 */
    empty: { type: String, default: undefined },
    /** 文字方向；浮层搬到落点后继承不到作者子树上的方向，要 RTL 就显式给。 */
    dir: { type: String as PropType<Direction>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    variant: { type: String as PropType<OverlayBackdropVariant>, default: undefined },
    translations: { type: Object as PropType<CommandProps['translations']>, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值
  emits: {
    'open-change': (_details: PayloadOf<CommandProps, 'onOpenChange'>) => true,
    'input-value-change': (_details: PayloadOf<CommandProps, 'onInputValueChange'>) => true,
    'select': (_details: PayloadOf<CommandProps, 'onSelect'>) => true,
    'update:open': (_open: PayloadOf<CommandProps, 'onOpenChange'>['open']) => true,
    'update:inputValue': (_inputValue: PayloadOf<CommandProps, 'onInputValueChange'>['inputValue']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: CommandRootSlotProps) => VNode[]
    /** 铺开时的触发按钮内容；不给即不渲染触发器（面板改由快捷键或 v-model:open 唤起）。 */
    trigger?: () => VNode[]
    item?: (node: CommandNodeMeta) => VNode[]
    empty?: () => VNode[]
    footer?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyOpen: CommandProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const notifyInputValue: CommandProps['onInputValueChange'] = (details) => {
      emit('input-value-change', details)
      emit('update:inputValue', details.inputValue)
    }
    const notifySelect: CommandProps['onSelect'] = details => emit('select', details)

    const ctx = useCommand(withXhConfig('command', props) as CommandProps, {
      onOpenChange: notifyOpen,
      onInputValueChange: notifyInputValue,
      onSelect: notifySelect,
    })
    provideCommand(ctx)

    // 铺开的是整份清单，不是过滤后那几条：此刻该不该露面由 connect 打在条目上的 hidden 说了算。
    // 只渲染命中的那几条会让「铺开」与「手写部件」产出两棵不同的 DOM
    const fullTree = computed(() => resolveCommandGroups(
      props.collection ?? [],
      props.groups ?? [],
      '',
      { filter: false, caseSensitive: false },
    ))

    return () => {
      const api = ctx.api.value
      if (slots.default) {
        return slots.default({
          open: api.open,
          inputValue: api.inputValue,
          groups: api.groups,
          results: api.results,
          highlightedValue: api.highlightedValue,
          empty: api.empty,
          setOpen: api.setOpen,
          setInputValue: api.setInputValue,
          select: api.select,
        })
      }
      return renderDefaultTree(
        fullTree.value,
        slots.trigger,
        slots.item,
        slots.empty?.() ?? (props.empty != null ? [props.empty] : null),
        slots.footer?.(),
      )
    }
  },
})

export const XhCommandTrigger = defineComponent({
  name: 'XhCommandTrigger',
  // 直通属性自己合：Vue 默认把作者的处理器排在部件的后面，这里改成作者先跑
  inheritAttrs: false,
  props: {
    /** 借用作者的子节点当触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const ctx = useCommandContext()
    return () => {
      const part = mergePartProps(ctx.api.value.getTriggerProps() as Record<string, unknown>, attrs)
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, part, 'command')
        if (merged)
          return merged
      }
      return h('button', part, children)
    }
  },
})

export const XhCommandContent = defineComponent({
  name: 'XhCommandContent',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 content 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useCommandContext()
    return () => {
      if (!ctx.rendered.value)
        return null
      const api = ctx.api.value
      const backdrop = api.getBackdropProps() as Record<string, unknown>
      // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
      return h(XhPortal, { to: ctx.portalTarget.value }, () => [
        !backdrop.hidden
          ? h('div', {
              ...backdrop,
              ref: (el: unknown) => { ctx.backdropRef.value = el as HTMLElement },
            })
          : null,
        h('div', api.getPositionerProps() as Record<string, unknown>, [
          h('div', {
            ...mergeProps(api.getContentProps() as Record<string, unknown>, attrs),
            ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
          }, slots.default?.()),
        ]),
      ])
    }
  },
})

export const XhCommandInput = defineComponent({
  name: 'XhCommandInput',
  setup() {
    const ctx = useCommandContext()
    return () => h('input', {
      ...ctx.api.value.getInputProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.inputRef.value = el as HTMLInputElement },
    })
  },
})

export const XhCommandList = defineComponent({
  name: 'XhCommandList',
  setup(_, { slots }) {
    const ctx = useCommandContext()
    return () => h('div', {
      ...ctx.api.value.getListProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.listRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhCommandGroup = defineComponent({
  name: 'XhCommandGroup',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useCommandContext()
    const group = computed<CommandGroupProps>(() => ({ value: props.value }))
    provideCommandItemGroup({ group })
    return () => h('div', ctx.api.value.getGroupProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhCommandGroupLabel = defineComponent({
  name: 'XhCommandGroupLabel',
  setup(_, { slots }) {
    const ctx = useCommandContext()
    const { group } = useCommandItemGroupContext()
    return () => h('span', ctx.api.value.getGroupLabelProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhCommandItem = defineComponent({
  name: 'XhCommandItem',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回清单里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useCommandContext()
    const item = computed<CommandItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideCommandItem({ item })
    return () => h('div', ctx.api.value.getItemProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhCommandItemText = defineComponent({
  name: 'XhCommandItemText',
  setup(_, { slots }) {
    const ctx = useCommandContext()
    const { item } = useCommandItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhCommandEmpty = defineComponent({
  name: 'XhCommandEmpty',
  setup(_, { slots }) {
    const ctx = useCommandContext()
    // 放在 content 里作 list 的兄弟节点，不进 role=listbox
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCommandLoading = defineComponent({
  name: 'XhCommandLoading',
  setup(_, { slots }) {
    const ctx = useCommandContext()
    // 在途占位：与空态占位同一个位置，取数期间顶上来
    return () => h('div', ctx.api.value.getLoadingProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCommandFooter = defineComponent({
  name: 'XhCommandFooter',
  setup(_, { slots }) {
    const ctx = useCommandContext()
    return () => h('footer', ctx.api.value.getFooterProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 没写默认插槽时按清单铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 */
function renderDefaultTree(
  tree: readonly CommandGroupMeta[],
  triggerSlot: (() => VNode[]) | undefined,
  itemSlot: ((node: CommandNodeMeta) => VNode[]) | undefined,
  empty: (VNode | string)[] | null,
  footer: VNode[] | undefined,
): VNode[] {
  const renderItem = (node: CommandNodeMeta): VNode =>
    h(XhCommandItem, { key: node.value, value: node.value }, () => [
      h(XhCommandItemText, null, () => itemSlot?.(node) ?? node.label),
    ])

  return [
    ...(triggerSlot ? [h(XhCommandTrigger, null, triggerSlot)] : []),
    h(XhCommandContent, null, () => [
      h(XhCommandInput),
      h(XhCommandList, null, () => tree.map(group =>
        // 没归组的那批直接铺条目，不套分组外壳——空标题的分组只会在列表里留一道白
        group.value === COMMAND_UNGROUPED
          ? group.items.map(renderItem)
          : h(XhCommandGroup, { key: group.value, value: group.value }, () => [
              h(XhCommandGroupLabel, null, () => group.label),
              ...group.items.map(renderItem),
            ]),
      )),
      // 空态与在途占位都是 list 的兄弟，不进 role=listbox
      h(XhCommandEmpty, null, () => empty ?? []),
      h(XhCommandLoading),
      ...(footer ? [h(XhCommandFooter, null, () => footer)] : []),
    ]),
  ]
}
