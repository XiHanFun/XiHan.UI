/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 menu 相关实现。

import type { Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { MenuAnyItemProps, MenuApi, MenuGroupProps, MenuNode, MenuNodeMeta, MenuRadioValue, MenuSchema, MenuTranslations, StructureNode } from '@xihan-ui/headless'
import type { InjectionKey, PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { mergeProps } from '@xihan-ui/core'
import { menuNodesStructure, menuStructure } from '@xihan-ui/headless'
import { computed, defineComponent, h, inject, mergeProps as mergeVueProps, onBeforeUnmount, provide, ref, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { liveProps } from '../../runtime/live-props'
import { mergePartProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderStructure } from '../../runtime/structure'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { XhIcon } from '../icon/icon'
import { provideMenu, provideMenuGroup, provideMenuItem, provideMenuSub, useMenuContext, useMenuGroupContext, useMenuItemContext, useMenuSubContext } from './context'
import { useMenu, useMenuWithParent } from './use-menu'

type MenuProps = MenuSchema['props']

/** 默认插槽的载荷：展开态与修改展开的动作。 */
export type MenuRootSlotProps = Pick<MenuApi, 'open' | 'setOpen' | 'checkboxValue' | 'radioValue' | 'setCheckboxValue' | 'setRadioValue'>

/** 代铺条目时可逐槽接管的三个插槽；三个都不写即完全按数据铺。 */
export interface MenuItemSlots {
  /** 整条的接管口：写了它，代铺的标记位、文字、说明与快捷键一概不铺。 */
  'item'?: (node: MenuNodeMeta) => VNode[]
  /** 只接管行首那一格（与数据里的 indicator 同一个部件），其余槽照旧由数据铺。 */
  'item-prefix'?: (node: MenuNodeMeta) => VNode[]
  /** 只接管行尾那一格（计数、徽标、次级图标），其余槽照旧由数据铺。 */
  'item-suffix'?: (node: MenuNodeMeta) => VNode[]
}

/** 根菜单铺给各层子菜单的条目插槽。 */
const MENU_ITEM_SLOTS: InjectionKey<MenuItemSlots> = Symbol('XhMenuItemSlots')

export const XhMenuRoot = /* @__PURE__ */ defineComponent({
  name: 'XhMenuRoot',
  // 缺省值由 connect 给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    collection: { type: Array as PropType<MenuNode[]> },
    checkboxValue: { type: Array as PropType<string[]> },
    defaultCheckboxValue: { type: Array as PropType<string[]> },
    radioValue: { type: Object as PropType<MenuRadioValue> },
    defaultRadioValue: { type: Object as PropType<MenuRadioValue> },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    /** 外部锚点：给了就锚在它上面、收起时焦点归还到它，不再取 trigger；按数据铺设时不铺触发按钮。 */
    anchor: { type: Object as PropType<HTMLElement | null> },
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    fitAvailableHeight: { type: Boolean, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<Partial<MenuTranslations>> },
    openOnHover: { type: Boolean, default: undefined },
    hoverOpenDelay: { type: Number },
    hoverCloseDelay: { type: Number },
    /**
     * 只提供 collection 时，触发器插槽给出的节点直接作为触发器使用，不再外包一个 <button>。
     * 放置部件的写法有 XhMenuTrigger 自己的 asChild，该 prop 是自动铺设路径的同一能力。
     */
    triggerAsChild: Boolean,
    /** 按数据铺设时触发按钮的文字；trigger 插槽有内容时以插槽为准。 */
    label: { type: String },
  },
  // open-change 携带 { open }、select 携带 { value }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<MenuProps, 'onOpenChange'>) => true,
    'item-select': (_details: PayloadOf<MenuProps, 'onItemSelect'>) => true,
    'checkbox-value-change': (_details: PayloadOf<MenuProps, 'onCheckboxValueChange'>) => true,
    'radio-value-change': (_details: PayloadOf<MenuProps, 'onRadioValueChange'>) => true,
    'update:open': (_open: PayloadOf<MenuProps, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    'default'?: (props: MenuRootSlotProps) => VNode[]
    'trigger'?: () => VNode[]
    /** 整条的接管口：写了它，代铺的各格一概不铺，作者自己放置部件 */
    'item'?: (node: MenuNodeMeta) => VNode[]
    /** 只接管行首那一格，其余槽照旧由数据铺 */
    'item-prefix'?: (node: MenuNodeMeta) => VNode[]
    /** 只接管行尾那一格（计数、徽标、次级图标），其余槽照旧由数据铺 */
    'item-suffix'?: (node: MenuNodeMeta) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyOpen: MenuProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const notifyItemSelect: MenuProps['onItemSelect'] = details => emit('item-select', details)
    const notifyCheckboxValue: MenuProps['onCheckboxValueChange'] = details => emit('checkbox-value-change', details)
    const notifyRadioValue: MenuProps['onRadioValueChange'] = details => emit('radio-value-change', details)
    const ctx = useMenu(withXhConfig('menu', props) as MenuProps, notifyOpen, notifyItemSelect, notifyCheckboxValue, notifyRadioValue)
    provideMenu(ctx)
    // 各层子菜单按数据铺条目时与本层同用这几个插槽
    provide(MENU_ITEM_SLOTS, { 'item': slots.item, 'item-prefix': slots['item-prefix'], 'item-suffix': slots['item-suffix'] })
    return () => (slots.default
      ? slots.default({
          open: ctx.api.value.open,
          setOpen: ctx.api.value.setOpen,
          checkboxValue: ctx.api.value.checkboxValue,
          radioValue: ctx.api.value.radioValue,
          setCheckboxValue: ctx.api.value.setCheckboxValue,
          setRadioValue: ctx.api.value.setRadioValue,
        })
      : renderDefaultStructure(ctx.api.value, {
          'item': slots.item,
          'item-prefix': slots['item-prefix'],
          'item-suffix': slots['item-suffix'],
        }, { label: props.label, trigger: slots.trigger, triggerAsChild: props.triggerAsChild, anchored: props.anchor !== undefined }))
  },
})

export const XhMenuTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhMenuTrigger',
  // 直通属性自己合：Vue 默认把作者的处理器排在部件的后面，这里改成作者先跑
  inheritAttrs: false,
  props: {
    /** 借用作者的子节点作为触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const ctx = useMenuContext()
    return () => {
      const part = mergePartProps({
        ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
      }, attrs)
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, part, 'menu')
        if (merged)
          return merged
      }
      return h('button', part, children)
    }
  },
})

export const XhMenuPositioner = /* @__PURE__ */ defineComponent({
  name: 'XhMenuPositioner',
  props: {
    /** 本实例的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useMenuContext()
    // 条目列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner；浮层里的条子走 4px 档
    const bars = useScrollbars({ scrollable: () => ctx.contentRef.value, props: { size: 'sm' } })
    // 定位层搬到 portal 落点，逃开祖先的层叠上下文
    return () => h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.portalSource.value, present: ctx.visible.value }, () => [
      h('div', {
        ...mergeVueProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, [...(slots.default?.() ?? []), ...bars.render()]),
    ])
  },
})

export const XhMenuContent = /* @__PURE__ */ defineComponent({
  name: 'XhMenuContent',
  setup(_, { slots }) {
    const ctx = useMenuContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

function createMenuItemComponent(name: string, kind: 'item' | 'checkbox' | 'radio'): ReturnType<typeof defineComponent> {
  return defineComponent({
    name,
    props: {
      value: { type: String, required: true },
      disabled: { type: Boolean, default: undefined },
      closeOnSelect: { type: Boolean, default: undefined },
    },
    setup(props, { slots }) {
      const ctx = useMenuContext()
      const radioGroup = kind === 'radio' ? useMenuGroupContext() : null
      const item = computed<MenuAnyItemProps>(() => kind === 'radio'
        ? { value: props.value, disabled: props.disabled, closeOnSelect: props.closeOnSelect, kind, group: radioGroup!.group.value.value }
        : { value: props.value, disabled: props.disabled, closeOnSelect: props.closeOnSelect, kind })
      provideMenuItem({ item })
      // 本条目持有焦点时，value 变更按新值重报焦点条目，卸载时上报焦点丢失
      const itemEl = ref<HTMLElement | null>(null)
      watch(() => props.value, (next, prev) => {
        if (next === prev)
          return
        const svc = ctx.service
        if (svc.getStatus() !== 'Started')
          return
        if (itemEl.value && svc.scope.getActiveElement() === itemEl.value)
          svc.send({ type: 'ITEM.FOCUS', value: next })
      })
      onBeforeUnmount(() => {
        const { service } = ctx
        // 根已停机时不再送事件
        if (service.getStatus() !== 'Started')
          return
        // 按「本节点当下正持有焦点」判定，不按 value 比对
        if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
          service.send({ type: 'ITEM.LOST' })
      })
      return () => {
        const declaration = item.value
        const part = declaration.kind === 'checkbox'
          ? ctx.api.value.getCheckboxItemProps(declaration)
          : declaration.kind === 'radio'
            ? ctx.api.value.getRadioItemProps(declaration)
            : ctx.api.value.getItemProps(declaration)
        return h('div', { ...part as Record<string, unknown>, ref: itemEl }, slots.default?.())
      }
    },
  })
}

export const XhMenuItem = /* @__PURE__ */ createMenuItemComponent('XhMenuItem', 'item')
export const XhMenuCheckboxItem = /* @__PURE__ */ createMenuItemComponent('XhMenuCheckboxItem', 'checkbox')
export const XhMenuRadioItem = /* @__PURE__ */ createMenuItemComponent('XhMenuRadioItem', 'radio')

/** 默认插槽的载荷：本层子菜单的展开态与修改展开的动作。 */
export type MenuSubSlotProps = Pick<MenuApi, 'open' | 'setOpen'>

/**
 * 子菜单：内部再运行一台 menu 状态机（submenu 模式），触发条目由 XhMenuSubTrigger
 * 渲染为父菜单条目与本子菜单触发器的双重身份。本身不渲染节点。
 * 不写默认插槽时照标准结构铺自己那一层：触发条目、定位层与按 collection 铺的条目。
 */
export const XhMenuSub = /* @__PURE__ */ defineComponent({
  name: 'XhMenuSub',
  // 本身不渲染节点，作为组合节点收到的 submenu 等标记无处可落
  inheritAttrs: false,
  props: {
    /** 它在父菜单中的条目身份。 */
    value: { type: String, required: true },
    /** 按数据铺设时触发条目的文字；缺省取父菜单 collection 里这一条的 label。 */
    label: { type: String },
    disabled: { type: Boolean, default: undefined },
    collection: { type: Array as PropType<MenuNode[]> },
    checkboxValue: { type: Array as PropType<string[]> },
    defaultCheckboxValue: { type: Array as PropType<string[]> },
    radioValue: { type: Object as PropType<MenuRadioValue> },
    defaultRadioValue: { type: Object as PropType<MenuRadioValue> },
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    loop: { type: Boolean, default: undefined },
    openOnHover: { type: Boolean, default: undefined },
    hoverOpenDelay: { type: Number },
    /** 文字方向；默认继承父层。子层被迁移到浮层落点，无法继承父层的方向。 */
    dir: { type: String as PropType<Direction> },
    /** 语气；默认继承父层。子层是浮层落点下的同级节点，CSS 私有槽无法继承。 */
    tone: { type: String as PropType<Tone> },
    /** 尺寸；默认继承父层，理由同 tone。 */
    size: { type: String as PropType<Size> },
    /** 只按可用高度封顶；默认继承父层，理由同 tone。 */
    fitAvailableHeight: { type: Boolean, default: undefined },
    hoverCloseDelay: { type: Number },
  },
  emits: {
    'checkbox-value-change': (_details: PayloadOf<MenuProps, 'onCheckboxValueChange'>) => true,
    'radio-value-change': (_details: PayloadOf<MenuProps, 'onRadioValueChange'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: MenuSubSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const parent = useMenuContext()
    const ctx = useMenuWithParent(
      // 子层的 props 按 getter 现取：宿主换数据（子层的 collection、勾选与单选值）时子机器跟着变
      liveProps(() => ({
        ...props,
        submenu: true,
        dir: props.dir ?? parent.service.prop('dir'),
        tone: props.tone ?? parent.service.prop('tone'),
        size: props.size ?? parent.service.prop('size'),
        fitAvailableHeight: props.fitAvailableHeight ?? parent.service.prop('fitAvailableHeight'),
      }) as MenuProps),
      undefined,
      parent.tree,
      details => emit('checkbox-value-change', details),
      details => emit('radio-value-change', details),
    )
    // 覆盖菜单上下文：本子树内的部件都归子机器
    provideMenu(ctx)
    provideMenuSub({ parent, value: props.value, disabled: props.disabled })
    // 父层收起（Escape、外点、选中）时本层跟着收，层层传导
    watch(() => parent.api.value.open, (open) => {
      if (!open)
        ctx.api.value.setOpen(false)
    })
    const itemSlots = inject(MENU_ITEM_SLOTS, {})
    return () => slots.default
      ? slots.default({ open: ctx.api.value.open, setOpen: ctx.api.value.setOpen })
      : renderSubStructure(ctx.api.value, parent.api.value, props.value, props.label, itemSlots)
  },
})

export const XhMenuSubTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhMenuSubTrigger',
  setup(_, { slots }) {
    const sub = useMenuSubContext()
    const ctx = useMenuContext()
    return () => h('div', {
      ...mergeProps(
        sub.parent.api.value.getItemProps({ value: sub.value, disabled: sub.disabled }) as Record<string, unknown>,
        ctx.api.value.getSubmenuTriggerProps({ value: sub.value, disabled: sub.disabled }) as Record<string, unknown>,
      ),
      // 子菜单的定位锚点就是这一条
      ref: (el: unknown) => {
        ctx.triggerRef.value = el as HTMLElement
      },
    }, slots.default?.())
  },
})

/** 条目中的文字载体：连打检索取它，图标与副文本的文字因此不进入检索串 */
export const XhMenuItemText = /* @__PURE__ */ defineComponent({
  name: 'XhMenuItemText',
  setup(_, { slots }) {
    const ctx = useMenuContext()
    const { item } = useMenuItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目中的标记位（勾选、图标），纯装饰 */
export const XhMenuItemIndicator = /* @__PURE__ */ defineComponent({
  name: 'XhMenuItemIndicator',
  setup(_, { slots }) {
    const ctx = useMenuContext()
    const { item } = useMenuItemContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目中的副文本，排在文字下一行 */
export const XhMenuItemDescription = /* @__PURE__ */ defineComponent({
  name: 'XhMenuItemDescription',
  setup(_, { slots }) {
    const ctx = useMenuContext()
    const { item } = useMenuItemContext()
    return () => h('span', ctx.api.value.getItemDescriptionProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目文字之前的图标格；装饰态，读屏从条目文字取意 */
export const XhMenuItemIcon = /* @__PURE__ */ defineComponent({
  name: 'XhMenuItemIcon',
  setup(_, { slots }) {
    const ctx = useMenuContext()
    const { item } = useMenuItemContext()
    return () => h('span', ctx.api.value.getItemIconProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目中的快捷键提示，贴行尾；纯装饰，读屏从条目文字取意 */
export const XhMenuItemShortcut = /* @__PURE__ */ defineComponent({
  name: 'XhMenuItemShortcut',
  setup(_, { slots }) {
    const ctx = useMenuContext()
    const { item } = useMenuItemContext()
    return () => h('span', ctx.api.value.getItemShortcutProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目行尾的作者内容（计数、徽标、次级图标）；家族只管落位，不规定字号与颜色 */
export const XhMenuItemSuffix = /* @__PURE__ */ defineComponent({
  name: 'XhMenuItemSuffix',
  setup(_, { slots }) {
    const ctx = useMenuContext()
    const { item } = useMenuItemContext()
    return () => h('span', ctx.api.value.getItemSuffixProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhMenuGroup = /* @__PURE__ */ defineComponent({
  name: 'XhMenuGroup',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useMenuContext()
    const group = computed<MenuGroupProps>(() => ({ value: props.value }))
    provideMenuGroup({ group })
    return () => h('div', ctx.api.value.getGroupProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhMenuRadioGroup = /* @__PURE__ */ defineComponent({
  name: 'XhMenuRadioGroup',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useMenuContext()
    const group = computed<MenuGroupProps>(() => ({ value: props.value }))
    provideMenuGroup({ group })
    return () => h('div', ctx.api.value.getRadioGroupProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhMenuGroupLabel = /* @__PURE__ */ defineComponent({
  name: 'XhMenuGroupLabel',
  setup(_, { slots }) {
    const ctx = useMenuContext()
    const { group } = useMenuGroupContext()
    return () => h('span', ctx.api.value.getGroupLabelProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhMenuSeparator = /* @__PURE__ */ defineComponent({
  name: 'XhMenuSeparator',
  setup() {
    const ctx = useMenuContext()
    return () => h('div', ctx.api.value.getSeparatorProps() as Record<string, unknown>)
  },
})

export const XhMenuArrow = /* @__PURE__ */ defineComponent({
  name: 'XhMenuArrow',
  setup() {
    const ctx = useMenuContext()
    return () => h('div', ctx.api.value.getArrowProps() as Record<string, unknown>)
  },
})

/** 按数据铺的条目：kind 取 collection 里这一条，勾选与单选条目各用自己的部件组件。 */
const MenuStructureItem = /* @__PURE__ */ defineComponent({
  name: 'MenuStructureItem',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useMenuContext()
    return () => {
      const meta = ctx.api.value.collection.find(node => node.value === props.value)
      const Item = meta?.kind === 'checkbox' ? XhMenuCheckboxItem : meta?.kind === 'radio' ? XhMenuRadioItem : XhMenuItem
      return h(Item, { value: props.value, closeOnSelect: meta?.closeOnSelect }, slots)
    }
  },
})

/** 按数据铺的分组：组里有单选条目时是单选组。 */
const MenuStructureGroup = /* @__PURE__ */ defineComponent({
  name: 'MenuStructureGroup',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useMenuContext()
    return () => {
      const radio = ctx.api.value.collection.some(node => node.kind === 'radio' && node.group === props.value)
      return h(radio ? XhMenuRadioGroup : XhMenuGroup, { value: props.value }, slots)
    }
  },
})

/** 根菜单借作者节点当触发器（triggerAsChild）。 */
const MenuAsChildTrigger = /* @__PURE__ */ defineComponent({
  name: 'MenuAsChildTrigger',
  setup(_, { slots }) {
    return () => h(XhMenuTrigger, { asChild: true }, slots)
  },
})

/** 子菜单的触发条目：身份取子菜单上下文，结构写在节点上的 value 不落到 DOM。 */
const MenuStructureSubTrigger = /* @__PURE__ */ defineComponent({
  name: 'MenuStructureSubTrigger',
  inheritAttrs: false,
  setup(_, { slots }) {
    return () => h(XhMenuSubTrigger, null, slots)
  },
})

/** 标准结构里各部件对应的组件。 */
const MENU_PARTS = {
  'trigger': XhMenuTrigger,
  'positioner': XhMenuPositioner,
  'content': XhMenuContent,
  'item': MenuStructureItem,
  'item-icon': XhMenuItemIcon,
  'item-text': XhMenuItemText,
  'item-indicator': XhMenuItemIndicator,
  'item-description': XhMenuItemDescription,
  'item-shortcut': XhMenuItemShortcut,
  'item-suffix': XhMenuItemSuffix,
  'separator': XhMenuSeparator,
  'group': MenuStructureGroup,
  'group-label': XhMenuGroupLabel,
}

/** 结构里组合进来的组件：带 children 的条目是嵌套的子菜单。 */
const MENU_INSTANCES = { menu: XhMenuSub, icon: XhIcon }

/** 条目三个插槽的接管：item 整条、item-prefix 行首、item-suffix 行尾，载荷是这一条的元信息。 */
function itemContent(slots: MenuItemSlots, lookup: (value: string) => MenuNodeMeta | undefined): (node: StructureNode) => VNode[] | undefined {
  return (node) => {
    const name = node.slot?.name
    if (name !== 'item' && name !== 'item-prefix' && name !== 'item-suffix')
      return undefined
    const meta = (node.data as MenuNodeMeta | undefined) ?? lookup(node.slot!.key ?? '')
    return meta ? slots[name]?.(meta) : undefined
  }
}

function slottedBy(slots: MenuItemSlots): (name: string) => boolean {
  return name => slots[name as keyof MenuItemSlots] != null
}

/**
 * 未写默认插槽时照 menuStructure 铺开的整套结构，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 触发按钮的内容归作者（trigger 插槽），没写时取 label；条目内容默认按数据铺，可由 item 系插槽逐槽接管。
 */
function renderDefaultStructure(
  api: MenuApi,
  itemSlots: MenuItemSlots,
  trigger: { label?: string, trigger?: () => VNode[], triggerAsChild?: boolean, anchored?: boolean },
): VNode[] {
  const slotted = slottedBy(itemSlots)
  const nodes = menuStructure(api, {
    ...(trigger.label === undefined ? {} : { label: trigger.label }),
    anchored: trigger.anchored ?? false,
    slotted: name => name === 'trigger' ? trigger.trigger != null : slotted(name),
  })
  const items = itemContent(itemSlots, value => api.collection.find(node => node.value === value))
  const parts = trigger.triggerAsChild ? { ...MENU_PARTS, trigger: MenuAsChildTrigger } : MENU_PARTS
  return renderStructure(nodes, parts, node => node.slot?.name === 'trigger' ? trigger.trigger?.() : items(node), MENU_INSTANCES)
}

/** 子菜单那一层照 menuStructure 铺：触发条目的文字与 item 插槽的载荷取父菜单里这一条。 */
function renderSubStructure(api: MenuApi, parent: MenuApi, value: string, label: string | undefined, itemSlots: MenuItemSlots): VNode[] {
  const meta = parent.collection.find(node => node.value === value)
  const nodes = menuStructure(api, { submenu: true, value, label: label ?? meta?.label ?? value, slotted: slottedBy(itemSlots) })
  const lookup = (key: string): MenuNodeMeta | undefined => key === value ? meta : api.collection.find(node => node.value === key)
  return renderStructure(nodes, { ...MENU_PARTS, trigger: MenuStructureSubTrigger }, itemContent(itemSlots, lookup), MENU_INSTANCES)
}

/**
 * 子菜单那一层的条目：从本层机器的 collection 照 menuNodesStructure 现铺，条目带 children 的再往下一层。
 * Menubar 与 ContextMenu 按数据铺子层时用它。不作为公开组件导出。
 */
export const MenuDefaultNodes = /* @__PURE__ */ defineComponent({
  name: 'MenuDefaultNodes',
  props: {
    itemSlots: { type: Object as PropType<MenuItemSlots>, default: () => ({}) },
  },
  setup(props) {
    const ctx = useMenuContext()
    // 再往下的子菜单与本层同用这几个插槽
    provide(MENU_ITEM_SLOTS, props.itemSlots)
    return () => {
      const api = ctx.api.value
      return renderStructure(
        menuNodesStructure(api.collection, slottedBy(props.itemSlots)),
        MENU_PARTS,
        itemContent(props.itemSlots, value => api.collection.find(node => node.value === value)),
        MENU_INSTANCES,
      )
    }
  },
})
