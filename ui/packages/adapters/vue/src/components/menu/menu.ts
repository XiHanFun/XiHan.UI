import type { Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { MenuApi, MenuGroupProps, MenuItemProps, MenuNode, MenuNodeMeta, MenuSchema, MenuTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { mergeProps } from '@xihan-ui/core'
import { computed, defineComponent, h, mergeProps as mergeVueProps, onBeforeUnmount, ref, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { provideMenu, provideMenuGroup, provideMenuItem, provideMenuSub, useMenuContext, useMenuGroupContext, useMenuItemContext, useMenuSubContext } from './context'
import { useMenu, useMenuWithParent } from './use-menu'

type MenuProps = MenuSchema['props']

/** 默认插槽的载荷：展开态与改展开的动作。 */
export type MenuRootSlotProps = Pick<MenuApi, 'open' | 'setOpen'>

export const XhMenuRoot = /* @__PURE__ */ defineComponent({
  name: 'XhMenuRoot',
  // 缺省值由 connect 给出，这里一律 default: undefined
  props: {
    collection: { type: Array as PropType<MenuNode[]>, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<Partial<MenuTranslations>>, default: undefined },
    openOnHover: { type: Boolean, default: undefined },
    hoverOpenDelay: { type: Number, default: undefined },
    hoverCloseDelay: { type: Number, default: undefined },
    /**
     * 只交 collection 时，触发器插槽给的那个节点直接当触发器用，不再外包一颗 <button>。
     * 摆部件的写法有 XhMenuTrigger 自己的 asChild，这个 prop 是给代铺那条路的同一个能力。
     */
    triggerAsChild: Boolean,
  },
  // open-change 携带 { open }、select 携带 { value }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<MenuProps, 'onOpenChange'>) => true,
    'select': (_details: PayloadOf<MenuProps, 'onSelect'>) => true,
    'update:open': (_open: PayloadOf<MenuProps, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: MenuRootSlotProps) => VNode[]
    trigger?: () => VNode[]
    item?: (node: MenuNodeMeta) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyOpen: MenuProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const notifySelect: MenuProps['onSelect'] = details => emit('select', details)
    const ctx = useMenu(withXhConfig('menu', props) as MenuProps, notifyOpen, notifySelect)
    provideMenu(ctx)
    return () => (slots.default
      ? slots.default({ open: ctx.api.value.open, setOpen: ctx.api.value.setOpen })
      : props.collection
        ? renderDefaultTree(ctx.api.value.collection, slots.trigger?.() ?? null, slots.item, props.triggerAsChild)
        : [])
  },
})

export const XhMenuTrigger = /* @__PURE__ */ defineComponent({
  name: 'XhMenuTrigger',
  // 直通属性自己合：Vue 默认把作者的处理器排在部件的后面，这里改成作者先跑
  inheritAttrs: false,
  props: {
    /** 借用作者的子节点当触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
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
    container: { type: Object as PropType<Element>, default: undefined },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useMenuContext()
    // 条目列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
    const bars = useScrollbars({ scrollable: () => ctx.contentRef.value })
    // 定位层搬到 portal 落点，逃开祖先的层叠上下文
    return () => h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.triggerRef }, () => [
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

export const XhMenuItem = /* @__PURE__ */ defineComponent({
  name: 'XhMenuItem',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useMenuContext()
    const item = computed<MenuItemProps>(() => ({ value: props.value, disabled: props.disabled }))
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
    return () => h(
      'div',
      { ...ctx.api.value.getItemProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

/** 默认插槽的载荷：本层子菜单的展开态与改展开的动作。 */
export type MenuSubSlotProps = Pick<MenuApi, 'open' | 'setOpen'>

/**
 * 子菜单：内部再跑一台 menu 机器（submenu 模式），触发条目由 XhMenuSubTrigger
 * 渲染成「父菜单条目 + 本子菜单触发器」的双重身份。本身不渲染节点。
 */
export const XhMenuSub = /* @__PURE__ */ defineComponent({
  name: 'XhMenuSub',
  props: {
    /** 它在父菜单里的条目身份。 */
    value: { type: String, required: true },
    disabled: { type: Boolean, default: undefined },
    collection: { type: Array as PropType<MenuNode[]>, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    loop: { type: Boolean, default: undefined },
    openOnHover: { type: Boolean, default: undefined },
    hoverOpenDelay: { type: Number, default: undefined },
    /** 文字方向；缺省继承父层。子层被搬到浮层落点，继承不到父层的方向。 */
    dir: { type: String as PropType<Direction>, default: undefined },
    /** 语气；缺省继承父层。子层是浮层落点下的同级节点，CSS 私有槽继承不到。 */
    tone: { type: String as PropType<Tone>, default: undefined },
    /** 尺寸；缺省继承父层，理由同 tone。 */
    size: { type: String as PropType<Size>, default: undefined },
    hoverCloseDelay: { type: Number, default: undefined },
  },
  slots: Object as SlotsType<{
    default?: (props: MenuSubSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const parent = useMenuContext()
    const ctx = useMenuWithParent(
      {
        ...props,
        submenu: true,
        dir: props.dir ?? parent.service.prop('dir'),
        tone: props.tone ?? parent.service.prop('tone'),
        size: props.size ?? parent.service.prop('size'),
      } as MenuProps,
      undefined,
      parent.tree,
    )
    // 覆盖菜单上下文：本子树内的部件都归子机器
    provideMenu(ctx)
    provideMenuSub({ parent, value: props.value, disabled: props.disabled })
    // 父层收起（Escape、外点、选中）时本层跟着收，层层传导
    watch(() => parent.api.value.open, (open) => {
      if (!open)
        ctx.api.value.setOpen(false)
    })
    return () => slots.default?.({ open: ctx.api.value.open, setOpen: ctx.api.value.setOpen })
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

/** 条目里的文字载体：连打检索取它，图标与副文本的文字因此不进检索串 */
export const XhMenuItemText = /* @__PURE__ */ defineComponent({
  name: 'XhMenuItemText',
  setup(_, { slots }) {
    const ctx = useMenuContext()
    const { item } = useMenuItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目里的标记位（勾选、图标），纯装饰 */
export const XhMenuItemIndicator = /* @__PURE__ */ defineComponent({
  name: 'XhMenuItemIndicator',
  setup(_, { slots }) {
    const ctx = useMenuContext()
    const { item } = useMenuItemContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 条目里的副文本，排在文字下一行 */
export const XhMenuItemDescription = /* @__PURE__ */ defineComponent({
  name: 'XhMenuItemDescription',
  setup(_, { slots }) {
    const ctx = useMenuContext()
    const { item } = useMenuItemContext()
    return () => h('span', ctx.api.value.getItemDescriptionProps(item.value) as Record<string, unknown>, slots.default?.())
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

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 * 触发器内容归作者，由 trigger 插槽承载；条目内容缺省是 label，可由 item 插槽接管。
 */
function renderDefaultTree(
  collection: readonly MenuNodeMeta[],
  trigger: (VNode | string)[] | null,
  itemSlot?: (node: MenuNodeMeta) => VNode[],
  triggerAsChild?: boolean,
): VNode[] {
  return [
    h(XhMenuTrigger, { asChild: triggerAsChild }, () => trigger ?? []),
    h(XhMenuPositioner, null, () => [
      h(XhMenuContent, null, () => collection.flatMap((node, index) => [
        // 首条上的标记不产出分隔线：菜单开头不留一道空隔
        ...(index > 0 && node.separatorBefore ? [h(XhMenuSeparator, { key: `separator:${node.value}` })] : []),
        h(XhMenuItem, { key: node.value, value: node.value }, () => itemSlot?.(node) ?? node.label),
      ])),
    ]),
  ]
}
