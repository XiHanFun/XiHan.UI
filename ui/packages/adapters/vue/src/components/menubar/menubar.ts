/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 menubar 相关实现。

import type { Direction, Orientation, Placement, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { MenubarAnyItemProps, MenubarApi, MenubarContentProps, MenubarGroupProps, MenubarNode, MenubarNodeMeta, MenubarRadioValue, MenubarSchema, MenuNode, StructureNode } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import type { MenubarPartRegistry } from './use-menubar'
import { createRuntimeConfig } from '@xihan-ui/core'
import { menubarStructure } from '@xihan-ui/headless'
import { computed, defineComponent, h, mergeProps, onBeforeUnmount, ref, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderStructure } from '../../runtime/structure'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { XhIcon } from '../icon/icon'
import { provideMenu, useMenuContext } from '../menu/context'
import { MenuDefaultNodes, XhMenuContent, XhMenuPositioner } from '../menu/menu'
import { useMenuWithParent } from '../menu/use-menu'
import {
  provideMenubar,
  provideMenubarGroup,
  provideMenubarItem,
  provideMenubarMenu,
  provideMenubarSub,
  useMenubarContext,
  useMenubarGroupContext,
  useMenubarItemContext,
  useMenubarMenuContext,
  useMenubarSubContext,
} from './context'
import { useMenubar } from './use-menubar'

type MenubarProps = MenubarSchema['props']

/** 在 ref 回调中把节点按 value 登记进菜单栏取值表，value 变更时迁移到新键，卸载时注销 */
function useMenubarPart(register: MenubarPartRegistry, value: () => string): (el: HTMLElement | null) => void {
  const node = ref<HTMLElement | null>(null)
  watch(value, (next, prev) => {
    if (next === prev)
      return
    register(prev, null)
    register(next, node.value)
  })
  onBeforeUnmount(() => register(value(), null))
  return (el) => {
    node.value = el
    register(value(), el)
  }
}

/** 默认插槽的载荷：当前展开的菜单项、是否有菜单展开，以及切换展开项的命令。 */
export type MenubarRootSlotProps = Pick<MenubarApi, 'value' | 'open' | 'setValue' | 'checkboxValue' | 'radioValue' | 'setCheckboxValue' | 'setRadioValue'>

/** role=menubar 根节点：trigger 的 roving tabindex 作用域，各菜单浮层也挂在其内 */
/** 代铺条目时可逐槽接管的三个插槽；三个都不写即完全按数据铺。 */
export interface MenubarItemSlots {
  /** 只填条目的文字槽，其余槽照旧由数据铺。 */
  item?: (node: MenubarNodeMeta) => VNode[]
  /** 只接管行首那一格，其余槽照旧由数据铺。 */
  ['item-prefix']?: (node: MenubarNodeMeta) => VNode[]
  /** 只接管行尾那一格（计数、徽标、次级图标），其余槽照旧由数据铺。 */
  ['item-suffix']?: (node: MenubarNodeMeta) => VNode[]
}

export const XhMenubarRoot = defineComponent({
  name: 'XhMenubarRoot',
  // 缺省值由机器与 connect 决定；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    collection: { type: Array as PropType<MenubarNode[]> },
    checkboxValue: { type: Array as PropType<string[]> },
    defaultCheckboxValue: { type: Array as PropType<string[]> },
    radioValue: { type: Object as PropType<MenubarRadioValue> },
    defaultRadioValue: { type: Object as PropType<MenubarRadioValue> },
    value: { type: String as PropType<string | null> },
    defaultValue: { type: String as PropType<string | null> },
    orientation: { type: String as PropType<Orientation> },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction> },
    disabled: { type: Boolean, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    translations: { type: Object as PropType<MenubarProps['translations']> },
  },
  // value-change 携带 { value }、select 携带 { menu, value }，update:value 携带裸值
  emits: {
    'value-change': (_details: PayloadOf<MenubarProps, 'onValueChange'>) => true,
    'select': (_details: PayloadOf<MenubarProps, 'onSelect'>) => true,
    'checkbox-value-change': (_details: PayloadOf<MenubarProps, 'onCheckboxValueChange'>) => true,
    'radio-value-change': (_details: PayloadOf<MenubarProps, 'onRadioValueChange'>) => true,
    'update:value': (_value: PayloadOf<MenubarProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    'default'?: (props: MenubarRootSlotProps) => VNode[]
    /** 只填条目的文字槽，标记位、副文本与快捷键照旧由数据铺 */
    'item'?: (node: MenubarNodeMeta) => VNode[]
    /** 只接管行首那一格，其余槽照旧由数据铺 */
    'item-prefix'?: (node: MenubarNodeMeta) => VNode[]
    /** 只接管行尾那一格（计数、徽标、次级图标），其余槽照旧由数据铺 */
    'item-suffix'?: (node: MenubarNodeMeta) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyValue: MenubarProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifySelect: MenubarProps['onSelect'] = details => emit('select', details)
    const ctx = useMenubar(
      withXhConfig('menubar', props) as MenubarProps,
      notifyValue,
      notifySelect,
      details => emit('checkbox-value-change', details),
      details => emit('radio-value-change', details),
    )
    provideMenubar(ctx)
    return () => h('div', {
      ...ctx.api.value.getRootProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
    }, slots.default
      ? slots.default({
          value: ctx.api.value.value,
          open: ctx.api.value.open,
          setValue: ctx.api.value.setValue,
          checkboxValue: ctx.api.value.checkboxValue,
          radioValue: ctx.api.value.radioValue,
          setCheckboxValue: ctx.api.value.setCheckboxValue,
          setRadioValue: ctx.api.value.setRadioValue,
        })
      : renderDefaultStructure(ctx.api.value, { 'item': slots.item, 'item-prefix': slots['item-prefix'], 'item-suffix': slots['item-suffix'] }))
  },
})

export const XhMenubarTrigger = defineComponent({
  name: 'XhMenubarTrigger',
  // 直通属性自己合：Vue 默认把作者的处理器排在部件的后面，这里改成作者先跑
  inheritAttrs: false,
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
    /** 借用作者的子节点作为触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const ctx = useMenubarContext()
    // trigger 同时作为定位锚点与焦点归还目标
    const setEl = useMenubarPart(ctx.registerTrigger, () => props.value)
    // 本入口持有焦点时，value 变更重报焦点入口，卸载时上报菜单栏失焦
    const triggerEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      if (triggerEl.value && service.scope.getActiveElement() === triggerEl.value)
        service.send({ type: 'TRIGGER.FOCUS', value: next, disabled: props.disabled })
    })
    onBeforeUnmount(() => {
      const { service } = ctx
      // 整条栏一起卸载时根部件先停机，此刻送事件会在 dev 下抛
      if (service.getStatus() !== 'Started')
        return
      // 按「本入口当下正持有焦点」判定，不按 value 比对
      if (triggerEl.value && service.scope.getActiveElement() === triggerEl.value)
        service.send({ type: 'MENUBAR.BLUR' })
    })
    return () => {
      const part = mergePartProps({
        ...ctx.api.value.getTriggerProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>,
        ref: (el: unknown) => {
          triggerEl.value = el as HTMLElement | null
          setEl(el as HTMLElement | null)
        },
      }, attrs)
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, part, 'menubar')
        if (merged)
          return merged
      }
      return h('button', part, children)
    }
  },
})

export const XhMenubarPositioner = defineComponent({
  name: 'XhMenubarPositioner',
  props: {
    value: { type: String, required: true },
    /** 本实例的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useMenubarContext()
    const menu = computed<MenubarContentProps>(() => ({ value: props.value }))
    // 供内部 content 继承 value，并把它的内容节点写回来给自绘条
    const contentRef = ref<HTMLElement | null>(null)
    const visible = ref(false)
    provideMenubarMenu({ menu, contentRef, visible })
    const setEl = useMenubarPart(ctx.registerPositioner, () => props.value)
    // 这张菜单的条目列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner；
    // 一张菜单一套，浮层里的条子走 4px 档
    const bars = useScrollbars({ scrollable: () => contentRef.value, props: { size: 'sm' } })
    // 每张菜单各搬各的定位层到 portal 落点，逃开祖先的层叠上下文
    // 关着的菜单不建视觉桥：菜单栏上每一项各有一个定位层，几项就是几台挂在祖先链上的观察
    return () => h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.rootRef, present: visible.value }, () => [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps(menu.value) as Record<string, unknown>, attrs),
        ref: (el: unknown) => setEl(el as HTMLElement | null),
      }, [...(slots.default?.() ?? []), ...bars.render()]),
    ])
  },
})

export const XhMenubarContent = defineComponent({
  name: 'XhMenubarContent',
  props: {
    // 缺省时沿用外层 positioner 提供的身份，无 positioner 时必填
    value: { type: String },
  },
  setup(props, { slots }) {
    const ctx = useMenubarContext()
    const inherited = useMenubarMenuContext()
    if (props.value == null && !inherited)
      throw new Error('[xh] XhMenubarContent 必须写在 XhMenubarPositioner 内，或自带 value')
    const menu = computed<MenubarContentProps>(() => ({ value: props.value ?? inherited!.menu.value.value }))
    const setEl = useMenubarPart(ctx.registerContent, () => menu.value.value)
    // 一个菜单一份退场闸门：它们各开各的、动画各跑各的，一份管不过来。
    // 开合判据直接取 connect 这一帧的产出，不另起一套——两边各判一次迟早会说岔
    const contentRef = ref<HTMLElement | null>(null)
    let presence: PresenceHandle | null = null
    let presenceValue: string | null = null
    const sendPresence = (event: MenubarSchema['event']): void => {
      const deliver = (): void => {
        if (ctx.service.getStatus() === 'Started')
          ctx.service.send(event)
      }
      if (ctx.service.getStatus() === 'Started')
        deliver()
      else
        queueMicrotask(deliver)
    }
    const visible = useOverlayExit({
      config: typeof document === 'undefined' ? null : createRuntimeConfig(),
      isOpen: () => (ctx.api.value.getContentProps(menu.value) as Record<string, unknown>).hidden !== true,
      contentRef,
      onPresence: (next) => {
        const previous = presence
        const previousValue = presenceValue
        presence = next
        presenceValue = next ? menu.value.value : null
        if (next)
          sendPresence({ type: 'PRESENCE.SET', value: presenceValue!, presence: next, connected: true })
        else if (previous && previousValue != null)
          sendPresence({ type: 'PRESENCE.SET', value: previousValue, presence: previous, connected: false })
      },
    })
    // 呈现与否同步写回外层 positioner：同一轮刷新里它就按新值建桥或撤桥
    if (inherited) {
      watch(visible, (next) => {
        inherited.visible.value = next
      }, { flush: 'sync', immediate: true })
      onBeforeUnmount(() => {
        inherited.visible.value = false
      })
    }
    return () => h('div', {
      ...ctx.api.value.getContentProps(menu.value) as Record<string, unknown>,
      // 收起跟着闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场就一帧都
      // 播不出来），所以真正的收起落成内联 display
      style: visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => {
        contentRef.value = el as HTMLElement | null
        setEl(el as HTMLElement | null)
        // 写回给外层 positioner：它按这个节点配自绘条
        if (inherited)
          inherited.contentRef.value = el as HTMLElement | null
      },
    }, slots.default?.())
  },
})

export const XhMenubarGroup = defineComponent({
  name: 'XhMenubarGroup',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useMenubarContext()
    const group = computed<MenubarGroupProps>(() => ({ value: props.value }))
    provideMenubarGroup({ group })
    return () => h('div', ctx.api.value.getGroupProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhMenubarRadioGroup = defineComponent({
  name: 'XhMenubarRadioGroup',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useMenubarContext()
    const group = computed<MenubarGroupProps>(() => ({ value: props.value }))
    provideMenubarGroup({ group })
    return () => h('div', ctx.api.value.getRadioGroupProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhMenubarGroupLabel = defineComponent({
  name: 'XhMenubarGroupLabel',
  setup(_, { slots }) {
    const ctx = useMenubarContext()
    const { group } = useMenubarGroupContext()
    return () => h('span', ctx.api.value.getGroupLabelProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

function createMenubarItemComponent(name: string, kind: 'item' | 'checkbox' | 'radio'): ReturnType<typeof defineComponent> {
  return defineComponent({
    name,
    props: {
      value: { type: String, required: true },
      disabled: { type: Boolean, default: undefined },
      closeOnSelect: { type: Boolean, default: undefined },
    },
    setup(props, { slots }) {
      const ctx = useMenubarContext()
      const radioGroup = kind === 'radio' ? useMenubarGroupContext() : null
      const item = computed<MenubarAnyItemProps>(() => kind === 'radio'
        ? { value: props.value, disabled: props.disabled, closeOnSelect: props.closeOnSelect, kind, group: radioGroup!.group.value.value }
        : kind === 'checkbox'
          ? { value: props.value, disabled: props.disabled, closeOnSelect: props.closeOnSelect, kind }
          : { value: props.value, disabled: props.disabled, kind })
      provideMenubarItem({ item })
      // 本条目持有焦点时，value 变更重报焦点条目，卸载时上报焦点丢失
      const itemEl = ref<HTMLElement | null>(null)
      watch(() => props.value, (next, prev) => {
        if (next === prev)
          return
        const { service } = ctx
        if (service.getStatus() !== 'Started')
          return
        if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
          service.send({ type: 'ITEM.FOCUS', value: next })
      })
      onBeforeUnmount(() => {
        const { service } = ctx
        // 整组一起卸载时根部件先停机，此刻送事件会在 dev 下抛
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

export const XhMenubarItem = /* @__PURE__ */ createMenubarItemComponent('XhMenubarItem', 'item')
export const XhMenubarCheckboxItem = /* @__PURE__ */ createMenubarItemComponent('XhMenubarCheckboxItem', 'checkbox')
export const XhMenubarRadioItem = /* @__PURE__ */ createMenubarItemComponent('XhMenubarRadioItem', 'radio')

export const XhMenubarItemText = defineComponent({
  name: 'XhMenubarItemText',
  setup(_, { slots }) {
    const ctx = useMenubarContext()
    const { item } = useMenubarItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhMenubarItemIndicator = defineComponent({
  name: 'XhMenubarItemIndicator',
  setup(_, { slots }) {
    const ctx = useMenubarContext()
    const { item } = useMenubarItemContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目中的副文本，排在文字下一行 */
export const XhMenubarItemDescription = defineComponent({
  name: 'XhMenubarItemDescription',
  setup(_, { slots }) {
    const ctx = useMenubarContext()
    const { item } = useMenubarItemContext()
    return () => h('span', ctx.api.value.getItemDescriptionProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目文字之前的图标格；装饰态，读屏从条目文字取意 */
export const XhMenubarItemIcon = defineComponent({
  name: 'XhMenubarItemIcon',
  setup(_, { slots }) {
    const ctx = useMenubarContext()
    const { item } = useMenubarItemContext()
    return () => h('span', ctx.api.value.getItemIconProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目中的快捷键提示，贴行尾；纯装饰，读屏从条目文字取意 */
export const XhMenubarItemShortcut = defineComponent({
  name: 'XhMenubarItemShortcut',
  setup(_, { slots }) {
    const ctx = useMenubarContext()
    const { item } = useMenubarItemContext()
    return () => h('span', ctx.api.value.getItemShortcutProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目行尾的作者内容（计数、徽标、次级图标）；家族只管落位，不规定字号与颜色 */
export const XhMenubarItemSuffix = defineComponent({
  name: 'XhMenubarItemSuffix',
  setup(_, { slots }) {
    const ctx = useMenubarContext()
    const { item } = useMenubarItemContext()
    return () => h('span', ctx.api.value.getItemSuffixProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 指向本菜单锚点的箭头，纯装饰；须写在同一菜单的 positioner 中 */
export const XhMenubarArrow = defineComponent({
  name: 'XhMenubarArrow',
  setup() {
    const ctx = useMenubarContext()
    const menu = useMenubarMenuContext()
    if (!menu)
      throw new Error('[xh] XhMenubarArrow 必须用在 XhMenubarPositioner 内')
    return () => h('div', ctx.api.value.getArrowProps(menu.menu.value) as Record<string, unknown>)
  },
})

export const XhMenubarSeparator = defineComponent({
  name: 'XhMenubarSeparator',
  setup() {
    const ctx = useMenubarContext()
    return () => h('div', ctx.api.value.getSeparatorProps() as Record<string, unknown>)
  },
})

/** XhMenubarSub 默认插槽得到的载荷。 */
export interface MenubarSubSlotProps {
  open: boolean
  setOpen: (next: boolean) => void
}

export const XhMenubarSub = defineComponent({
  name: 'XhMenubarSub',
  // 本身不渲染节点，作为组合节点收到的 submenu 等标记无处可落
  inheritAttrs: false,
  props: {
    /** 它在所属菜单中的条目身份。 */
    value: { type: String, required: true },
    /** 按数据铺设时触发条目的文字；缺省取所属菜单 items 里这一条的 label。 */
    label: { type: String },
    disabled: { type: Boolean, default: undefined },
    /** 子层的条目数据：显示文本与禁用的事实源，按数据铺子层时由默认树代填。 */
    collection: { type: Array as PropType<MenuNode[]> },
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    loop: { type: Boolean, default: undefined },
    openOnHover: { type: Boolean, default: undefined },
    hoverOpenDelay: { type: Number },
    hoverCloseDelay: { type: Number },
    /** 文字方向；默认继承父层。子层被迁移到浮层落点，无法继承父层的方向。 */
    dir: { type: String as PropType<Direction> },
    /** 语气；默认继承父层。子层是浮层落点下的同级节点，CSS 私有槽无法继承。 */
    tone: { type: String as PropType<Tone> },
    /** 尺寸；默认继承父层，理由同 tone。 */
    size: { type: String as PropType<Size> },
  },
  slots: Object as SlotsType<{
    default?: (props: MenubarSubSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const parent = useMenubarContext()
    const owner = useMenubarMenuContext()
    if (!owner)
      throw new Error('[xh] MenubarSub 必须用在 XhMenubarPositioner 内')
    // 子层跑的是一台子菜单模式的 menu 机器：菜单栏那台是单机器单锚点，装不下第二层
    const sub = useMenuWithParent(
      {
        ...props,
        submenu: true,
        dir: props.dir ?? parent.service.prop('dir'),
        tone: props.tone ?? parent.service.prop('tone'),
        size: props.size ?? parent.service.prop('size'),
      },
      undefined,
      parent.tree,
    )
    // 子树内的 XhMenu 系部件都归子机器
    provideMenu(sub)
    provideMenubarSub({ parent, value: props.value, disabled: props.disabled })
    // 所属那张菜单收起时本层跟着收，层层传导
    watch(() => parent.api.value.isOpen(owner.menu.value.value), (open) => {
      if (!open)
        sub.api.value.setOpen(false)
    })
    return () => slots.default
      ? slots.default({ open: sub.api.value.open, setOpen: sub.api.value.setOpen })
      : renderSubLayer(props.label ?? parent.api.value.collection.find(menu => menu.value === owner.menu.value.value)?.items.find(node => node.value === props.value)?.label ?? props.value)
  },
})

export const XhMenubarSubTrigger = defineComponent({
  name: 'XhMenubarSubTrigger',
  setup(_, { slots }) {
    const handle = useMenubarSubContext()
    const sub = useMenuContext()
    return () => h('div', {
      // 合并序=子先父后：父层的 data-scope/data-part 胜出，菜单栏的方向键与选中照常认它。
      // 反过来写会让节点带上 data-scope="menu"，菜单栏按自己的 scope 查条目就一条都找不到
      ...mergeProps(
        sub.api.value.getSubmenuTriggerProps({ value: handle.value, disabled: handle.disabled }) as Record<string, unknown>,
        handle.parent.api.value.getItemProps({ value: handle.value, disabled: handle.disabled }) as Record<string, unknown>,
      ),
      // 子菜单的定位锚点就是这一条
      ref: (el: unknown) => {
        sub.triggerRef.value = el as HTMLElement
      },
    }, slots.default?.())
  },
})

/** 子菜单不写插槽时那一层：触发条目、定位层与按本层 collection 铺的条目；子层不经菜单栏上的条目插槽。 */
function renderSubLayer(label: string): VNode[] {
  return [
    h(XhMenubarSubTrigger, null, () => [label]),
    h(XhMenuPositioner, null, () => [h(XhMenuContent, null, () => [h(MenuDefaultNodes)])]),
  ]
}

/** 所属那张菜单里按数据铺的条目元信息。 */
function ownItems(ctx: ReturnType<typeof useMenubarContext>, owner: ReturnType<typeof useMenubarMenuContext>): readonly MenubarNodeMeta[] {
  const menu = owner?.menu.value.value
  return ctx.api.value.collection.find(node => node.value === menu)?.items ?? []
}

/** 按数据铺的条目：kind 取所属菜单 items 里这一条，勾选与单选条目各用自己的部件组件。 */
const MenubarStructureItem = /* @__PURE__ */ defineComponent({
  name: 'MenubarStructureItem',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useMenubarContext()
    const owner = useMenubarMenuContext()
    return () => {
      const meta = ownItems(ctx, owner).find(node => node.value === props.value)
      const Item = meta?.kind === 'checkbox' ? XhMenubarCheckboxItem : meta?.kind === 'radio' ? XhMenubarRadioItem : XhMenubarItem
      return h(Item, { value: props.value, closeOnSelect: meta?.closeOnSelect }, slots)
    }
  },
})

/** 按数据铺的分组：组里有单选条目时是单选组。 */
const MenubarStructureGroup = /* @__PURE__ */ defineComponent({
  name: 'MenubarStructureGroup',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useMenubarContext()
    const owner = useMenubarMenuContext()
    return () => {
      const radio = ownItems(ctx, owner).some(node => node.kind === 'radio' && node.group === props.value)
      return h(radio ? XhMenubarRadioGroup : XhMenubarGroup, { value: props.value }, slots)
    }
  },
})

/** 标准结构里各部件对应的组件。 */
const MENUBAR_PARTS = {
  'trigger': XhMenubarTrigger,
  'positioner': XhMenubarPositioner,
  'content': XhMenubarContent,
  'item': MenubarStructureItem,
  'item-icon': XhMenubarItemIcon,
  'item-text': XhMenubarItemText,
  'item-indicator': XhMenubarItemIndicator,
  'item-description': XhMenubarItemDescription,
  'item-shortcut': XhMenubarItemShortcut,
  'item-suffix': XhMenubarItemSuffix,
  'separator': XhMenubarSeparator,
  'group': MenubarStructureGroup,
  'group-label': XhMenubarGroupLabel,
}

/** 结构里组合进来的组件：带 children 的条目是嵌套的子菜单。 */
const MENUBAR_INSTANCES = { menu: XhMenubarSub, icon: XhIcon }

/**
 * 未写默认插槽时照 menubarStructure 铺开的整套结构，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 入口按钮的文字取入口的 label；条目文字、行首、行尾可由 item 系插槽逐槽接管，其余照数据铺。
 */
function renderDefaultStructure(api: MenubarApi, itemSlots: MenubarItemSlots): VNode[] {
  const nodes = menubarStructure(api, { slotted: name => itemSlots[name as keyof MenubarItemSlots] != null })
  return renderStructure(nodes, MENUBAR_PARTS, (node: StructureNode) => {
    const name = node.slot?.name
    if (name !== 'item' && name !== 'item-prefix' && name !== 'item-suffix')
      return undefined
    const meta = node.data as MenubarNodeMeta | undefined
    return meta ? itemSlots[name]?.(meta) : undefined
  }, MENUBAR_INSTANCES)
}
