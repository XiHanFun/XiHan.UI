/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 command 相关实现。

import type { Direction, OverlayBackdropVariant, Size } from '@xihan-ui/core'
import type { CommandApi, CommandGroup, CommandGroupMeta, CommandGroupProps, CommandItemProps, CommandNode, CommandNodeMeta, CommandSchema, StructureNode } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { commandStructure, resolveCommandGroups } from '@xihan-ui/headless'
import { computed, defineComponent, h, mergeProps } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderStructure } from '../../runtime/structure'
import { useScrollbars } from '../../runtime/use-scrollbars'
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

/** 默认插槽的载荷：开合、检索串、结果与锚点，以及修改它们的命令。 */
export type CommandRootSlotProps = Pick<
  CommandApi,
  'open' | 'inputValue' | 'groups' | 'results' | 'highlightedValue' | 'empty' | 'setOpen' | 'setInputValue' | 'select'
>

export const XhCommandRoot = defineComponent({
  name: 'XhCommandRoot',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    collection: { type: Array as PropType<CommandNode[]> },
    groups: { type: Array as PropType<CommandGroup[]> },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    inputValue: { type: String },
    defaultInputValue: { type: String },
    /** 内置过滤，默认开启；关闭后由调用方自行筛选 */
    filter: { type: Boolean, default: undefined },
    caseSensitive: Boolean,
    closeOnSelect: { type: Boolean, default: undefined },
    modal: { type: Boolean, default: true },
    closeOnEscape: { type: Boolean, default: true },
    closeOnInteractOutside: { type: Boolean, default: undefined },
    restoreFocus: { type: Boolean, default: true },
    loop: { type: Boolean, default: undefined },
    loading: Boolean,
    placeholder: { type: String },
    /** 无匹配时的提示语。提供后不必再写 empty 部件；需要放置其他内容时改用 empty 插槽。 */
    empty: { type: String },
    /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
    dir: { type: String as PropType<Direction> },
    size: { type: String as PropType<Size> },
    variant: { type: String as PropType<OverlayBackdropVariant> },
    translations: { type: Object as PropType<CommandProps['translations']> },
  },
  // *-change 携带 details 对象，update:* 携带裸值
  emits: {
    'open-change': (_details: PayloadOf<CommandProps, 'onOpenChange'>) => true,
    'input-value-change': (_details: PayloadOf<CommandProps, 'onInputValueChange'>) => true,
    'item-select': (_details: PayloadOf<CommandProps, 'onItemSelect'>) => true,
    'update:open': (_open: PayloadOf<CommandProps, 'onOpenChange'>['open']) => true,
    'update:inputValue': (_inputValue: PayloadOf<CommandProps, 'onInputValueChange'>['inputValue']) => true,
  },
  slots: Object as SlotsType<{
    'default'?: (props: CommandRootSlotProps) => VNode[]
    /** 铺开时的触发按钮内容；未提供时不渲染触发器（面板改由快捷键或 v-model:open 唤起）。 */
    'trigger'?: () => VNode[]
    /** 只填条目的文字槽，副文本与首尾两格照旧各归各的 */
    'item'?: (node: CommandNodeMeta) => VNode[]
    /** 只接管行首那一格，其余槽照旧由数据铺 */
    'item-prefix'?: (node: CommandNodeMeta) => VNode[]
    /** 只接管行尾那一格（计数、徽标、次级图标），其余槽照旧由数据铺 */
    'item-suffix'?: (node: CommandNodeMeta) => VNode[]
    'empty'?: () => VNode[]
    'footer'?: () => VNode[]
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
    const notifyItemSelect: CommandProps['onItemSelect'] = details => emit('item-select', details)

    const ctx = useCommand(withXhConfig('command', props) as CommandProps, {
      onOpenChange: notifyOpen,
      onInputValueChange: notifyInputValue,
      onItemSelect: notifyItemSelect,
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
      return renderDefaultStructure(fullTree.value, props.empty, {
        'trigger': slots.trigger,
        'empty': slots.empty,
        'footer': slots.footer,
        'item': slots.item,
        'item-prefix': slots['item-prefix'],
        'item-suffix': slots['item-suffix'],
      })
    }
  },
})

export const XhCommandTrigger = defineComponent({
  name: 'XhCommandTrigger',
  // 直通属性自己合：Vue 默认把作者的处理器排在部件的后面，这里改成作者先跑
  inheritAttrs: false,
  props: {
    /** 借用作者的子节点作为触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
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
  props: {
    /** 本实例的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 content 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useCommandContext()
    // 结果列表的自绘条：与 list 同级、绝对定位不占布局，壳是面板自己（content 已经 relative）；
    // 模态浮层里的条子走 4px 档
    const bars = useScrollbars({ scrollable: () => ctx.listRef.value, props: { size: 'sm' } })
    return () => {
      if (!ctx.rendered.value)
        return null
      const api = ctx.api.value
      const backdrop = api.getBackdropProps() as Record<string, unknown>
      // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
      return h(XhPortal, { to: props.container ?? ctx.portalTarget.value }, () => [
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
          }, [...(slots.default?.() ?? []), ...bars.render()]),
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

/** 条目行首的作者内容（图标、色块、头像），对读屏隐藏 */
export const XhCommandItemPrefix = defineComponent({
  name: 'XhCommandItemPrefix',
  setup(_, { slots }) {
    const ctx = useCommandContext()
    const { item } = useCommandItemContext()
    return () => h('span', ctx.api.value.getItemPrefixProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目行尾的作者内容（计数、徽标） */
export const XhCommandItemSuffix = defineComponent({
  name: 'XhCommandItemSuffix',
  setup(_, { slots }) {
    const ctx = useCommandContext()
    const { item } = useCommandItemContext()
    return () => h('span', ctx.api.value.getItemSuffixProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目的第 2 行副文本，跨文字槽、走 muted 档 */
export const XhCommandItemDescription = defineComponent({
  name: 'XhCommandItemDescription',
  setup(_, { slots }) {
    const ctx = useCommandContext()
    const { item } = useCommandItemContext()
    return () => h('span', ctx.api.value.getItemDescriptionProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 命令行尾的快捷键提示，与说明同档同色；纯装饰 */
export const XhCommandItemShortcut = defineComponent({
  name: 'XhCommandItemShortcut',
  setup(_, { slots }) {
    const ctx = useCommandContext()
    const { item } = useCommandItemContext()
    return () => h('span', ctx.api.value.getItemShortcutProps(item.value) as Record<string, unknown>, slots.default?.())
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

/** 遮罩：XhCommandContent 连同定位层一起把它铺在浮层落点里，结构里这个节点不另渲。 */
const CommandStructureBackdrop = /* @__PURE__ */ defineComponent({
  name: 'CommandStructureBackdrop',
  setup() {
    return () => null
  },
})

/** 定位层：由 XhCommandContent 铺在浮层落点里，结构里这一层只把面板交下去。 */
const CommandStructurePositioner = /* @__PURE__ */ defineComponent({
  name: 'CommandStructurePositioner',
  setup(_, { slots }) {
    return () => slots.default?.()
  },
})

/** 标准结构里各部件对应的组件。 */
const COMMAND_PARTS = {
  'trigger': XhCommandTrigger,
  'backdrop': CommandStructureBackdrop,
  'positioner': CommandStructurePositioner,
  'content': XhCommandContent,
  'input': XhCommandInput,
  'list': XhCommandList,
  'group': XhCommandGroup,
  'group-label': XhCommandGroupLabel,
  'item': XhCommandItem,
  'item-prefix': XhCommandItemPrefix,
  'item-text': XhCommandItemText,
  'item-description': XhCommandItemDescription,
  'item-shortcut': XhCommandItemShortcut,
  'item-suffix': XhCommandItemSuffix,
  'empty': XhCommandEmpty,
  'loading': XhCommandLoading,
  'footer': XhCommandFooter,
}

/** 不写默认插槽时可给内容的插槽。 */
interface CommandStructureSlots {
  trigger?: () => VNode[]
  empty?: () => VNode[]
  footer?: () => VNode[]
  item?: (node: CommandNodeMeta) => VNode[]
  ['item-prefix']?: (node: CommandNodeMeta) => VNode[]
  ['item-suffix']?: (node: CommandNodeMeta) => VNode[]
}

/**
 * 未写默认插槽时照 commandStructure 铺开的整套结构，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 铺的是整份清单分好的组，不是过滤后那几条：此刻该不该露面由 connect 打在条目上的 hidden 说了算。
 * 触发按钮、空态与页脚的内容归作者（同名插槽），空态没给插槽时取 empty 文字；条目文字、行首、行尾可由 item 系插槽逐槽接管。
 */
function renderDefaultStructure(tree: readonly CommandGroupMeta[], empty: string | undefined, content: CommandStructureSlots): VNode[] {
  const nodes = commandStructure(tree, {
    ...(empty === undefined ? {} : { empty }),
    slotted: name => content[name as keyof CommandStructureSlots] != null,
  })
  return renderStructure(nodes, COMMAND_PARTS, (node: StructureNode) => {
    const name = node.slot?.name
    if (name === 'trigger' || name === 'empty' || name === 'footer')
      return content[name]?.()
    if (name !== 'item' && name !== 'item-prefix' && name !== 'item-suffix')
      return undefined
    const meta = node.data as CommandNodeMeta | undefined
    return meta ? content[name]?.(meta) : undefined
  })
}
