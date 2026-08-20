import type { MenubarApi, MenubarContentProps, MenubarGroupProps, MenubarItemProps, MenubarNode, MenubarNodeMeta, MenubarSchema } from '@xihan-ui/headless'
import type { Direction, Orientation, Placement, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import type { MenubarPartRegistry } from './use-menubar'
import { createRuntimeConfig } from '@xihan-ui/kernel'
import { computed, defineComponent, h, mergeProps, onBeforeUnmount, ref, Teleport, watch } from 'vue'
import { mergeIntoChild } from '../../runtime/as-child'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import {
  provideMenubar,
  provideMenubarChain,
  provideMenubarGroup,
  provideMenubarItem,
  provideMenubarMenu,
  provideMenubarSub,
  useMenubarChain,
  useMenubarContext,
  useMenubarGroupContext,
  useMenubarItemContext,
  useMenubarMenuContext,
  useMenubarSubContext,
} from './context'
import { provideMenu, provideMenuChain, useMenuContext } from '../menu/context'
import { useMenu } from '../menu/use-menu'
import { useMenubar } from './use-menubar'

type MenubarProps = MenubarSchema['props']

/** 在 ref 回调里把节点按 value 登记进菜单栏取值表，value 变更时迁移到新键，卸载时注销 */
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

/** 默认插槽的载荷：当前展开的那一项、有没有菜单展开着，与切换展开项的命令。 */
export type MenubarRootSlotProps = Pick<MenubarApi, 'value' | 'open' | 'setValue'>

/** role=menubar 根节点：trigger 的 roving tabindex 作用域，各菜单浮层也挂在其内 */
export const XhMenubarRoot = defineComponent({
  name: 'XhMenubarRoot',
  // 全部 default: undefined，缺省值由机器与 connect 决定
  props: {
    collection: { type: Array as PropType<MenubarNode[]>, default: undefined },
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    disabled: { type: Boolean, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // value-change 携带 { value }、select 携带 { menu, value }，update:value 携带裸值
  emits: {
    'value-change': (_details: PayloadOf<MenubarProps, 'onValueChange'>) => true,
    'select': (_details: PayloadOf<MenubarProps, 'onSelect'>) => true,
    'update:value': (_value: PayloadOf<MenubarProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: MenubarRootSlotProps) => VNode[]
    item?: (node: MenubarNodeMeta) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyValue: MenubarProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifySelect: MenubarProps['onSelect'] = details => emit('select', details)
    const ctx = useMenubar(props as MenubarProps, notifyValue, notifySelect)
    provideMenubar(ctx)
    // 子菜单任意层级的选中都汇到这里：先发根的 select，再关掉整条菜单栏。
    // 关根用 setValue(null) —— 菜单栏是「当前展开哪一项」的模型，没有 setOpen
    provideMenubarChain({
      notifySelect: (details) => {
        emit('select', details)
        ctx.api.value.setValue(null)
      },
    })
    return () => h('div', {
      ...ctx.api.value.getRootProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
    }, slots.default
      ? slots.default({
          value: ctx.api.value.value,
          open: ctx.api.value.open,
          setValue: ctx.api.value.setValue,
        })
      : props.collection
        ? renderDefaultTree(ctx.api.value.collection, slots.item)
        : [])
  },
})

export const XhMenubarTrigger = defineComponent({
  name: 'XhMenubarTrigger',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
    /** 借用作者的子节点当触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useMenubarContext()
    // trigger 同时作为定位锚点与焦点归还目标
    const setEl = useMenubarPart(ctx.registerTrigger, () => props.value)
    return () => {
      const attrs = {
        ...ctx.api.value.getTriggerProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>,
        ref: (el: unknown) => setEl(el as HTMLElement | null),
      }
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, attrs, 'menubar')
        if (merged)
          return merged
      }
      return h('button', attrs, children)
    }
  },
})

export const XhMenubarPositioner = defineComponent({
  name: 'XhMenubarPositioner',
  props: {
    value: { type: String, required: true },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useMenubarContext()
    const menu = computed<MenubarContentProps>(() => ({ value: props.value }))
    // 供内部 content 继承 value
    provideMenubarMenu({ menu })
    const setEl = useMenubarPart(ctx.registerPositioner, () => props.value)
    // 每张菜单各搬各的定位层到 portal 落点，逃开祖先的层叠上下文
    return () => h(Teleport, { to: ctx.portalTarget.value }, [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps(menu.value) as Record<string, unknown>, attrs),
        ref: (el: unknown) => setEl(el as HTMLElement | null),
      }, slots.default?.()),
    ])
  },
})

export const XhMenubarContent = defineComponent({
  name: 'XhMenubarContent',
  props: {
    // 缺省时沿用外层 positioner 提供的身份，无 positioner 时必填
    value: { type: String, default: undefined },
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
    const visible = useOverlayExit({
      config: typeof document === 'undefined' ? null : createRuntimeConfig(),
      isOpen: () => (ctx.api.value.getContentProps(menu.value) as Record<string, unknown>).hidden !== true,
      contentRef,
    })
    return () => h('div', {
      ...ctx.api.value.getContentProps(menu.value) as Record<string, unknown>,
      // 收起跟着闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场就一帧都
      // 播不出来），所以真正的收起落成内联 display
      style: visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => {
        contentRef.value = el as HTMLElement | null
        setEl(el as HTMLElement | null)
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

export const XhMenubarGroupLabel = defineComponent({
  name: 'XhMenubarGroupLabel',
  setup(_, { slots }) {
    const ctx = useMenubarContext()
    const { group } = useMenubarGroupContext()
    return () => h('span', ctx.api.value.getGroupLabelProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhMenubarItem = defineComponent({
  name: 'XhMenubarItem',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useMenubarContext()
    const item = computed<MenubarItemProps>(() => ({ value: props.value, disabled: props.disabled }))
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
    return () => h(
      'div',
      { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

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

export const XhMenubarSeparator = defineComponent({
  name: 'XhMenubarSeparator',
  setup() {
    const ctx = useMenubarContext()
    return () => h('div', ctx.api.value.getSeparatorProps() as Record<string, unknown>)
  },
})

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 一排入口排在前、各自那张菜单的浮层排在后，与手写部件产出的 DOM 完全一致；
 * 要改结构就写默认插槽，行为不变。
 */
function renderDefaultTree(
  collection: readonly MenubarNodeMeta[],
  itemSlot?: (node: MenubarNodeMeta) => VNode[],
): VNode[] {
  return [
    ...collection.map(menu =>
      h(XhMenubarTrigger, { key: `trigger:${menu.value}`, value: menu.value }, () => menu.label),
    ),
    ...collection.map(menu =>
      h(XhMenubarPositioner, { key: `positioner:${menu.value}`, value: menu.value }, () => [
        h(XhMenubarContent, null, () => menu.items.map(item =>
          h(XhMenubarItem, { key: item.value, value: item.value }, () => [
            h(XhMenubarItemText, null, () => itemSlot?.(item) ?? item.label),
          ]),
        )),
      ]),
    ),
  ]
}

/** XhMenubarSub 默认插槽拿到的东西。 */
export interface MenubarSubSlotProps {
  open: boolean
  setOpen: (next: boolean) => void
}

export const XhMenubarSub = defineComponent({
  name: 'XhMenubarSub',
  props: {
    /** 它在所属那张菜单里的条目身份。 */
    value: { type: String, required: true },
    disabled: { type: Boolean, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    loop: { type: Boolean, default: undefined },
    openOnHover: { type: Boolean, default: undefined },
    hoverOpenDelay: { type: Number, default: undefined },
    hoverCloseDelay: { type: Number, default: undefined },
    /** 文字方向；缺省继承父层。子层被搬到浮层落点，继承不到父层的方向。 */
    dir: { type: String as PropType<Direction>, default: undefined },
    /** 语气；缺省继承父层。子层是浮层落点下的同级节点，CSS 私有槽继承不到。 */
    tone: { type: String as PropType<Tone>, default: undefined },
    /** 尺寸；缺省继承父层，理由同 tone。 */
    size: { type: String as PropType<Size>, default: undefined },
  },
  slots: Object as SlotsType<{
    default?: (props: MenubarSubSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const parent = useMenubarContext()
    const owner = useMenubarMenuContext()
    if (!owner)
      throw new Error('[xh] MenubarSub 必须用在 XhMenubarPositioner 内')
    const chain = useMenubarChain()
    // 子层跑的是一台子菜单模式的 menu 机器：菜单栏那台是单机器单锚点，装不下第二层
    const sub = useMenu(
      {
        ...props,
        submenu: true,
        dir: props.dir ?? parent.service.prop('dir'),
        tone: props.tone ?? parent.service.prop('tone'),
        size: props.size ?? parent.service.prop('size'),
      },
      undefined,
      // 菜单栏的选中要带菜单身份，子层只知道条目值，在这里补上
      details => chain.notifySelect({ menu: owner.menu.value.value, value: details.value }),
    )
    // 子树内的 XhMenu 系部件都归子机器
    provideMenu(sub)
    // 子层里还能再嵌一层 XhMenuSub：那一层要往上找选中汇总的链
    provideMenuChain({
      notifySelect: details => chain.notifySelect({ menu: owner.menu.value.value, value: details.value }),
    })
    provideMenubarSub({ parent, value: props.value, disabled: props.disabled })
    // 所属那张菜单收起时本层跟着收，层层传导
    watch(() => parent.api.value.isOpen(owner.menu.value.value), (open) => {
      if (!open)
        sub.api.value.setOpen(false)
    })
    return () => slots.default?.({ open: sub.api.value.open, setOpen: sub.api.value.setOpen })
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
