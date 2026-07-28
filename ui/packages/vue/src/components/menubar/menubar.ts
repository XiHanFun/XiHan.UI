import type { Direction, Orientation, Placement } from '@xihan-ui/core'
import type { MenubarContentProps, MenubarGroupProps, MenubarItemProps, MenubarSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import type { MenubarPartRegistry } from './use-menubar'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import {
  provideMenubar,
  provideMenubarGroup,
  provideMenubarItem,
  provideMenubarMenu,
  useMenubarContext,
  useMenubarGroupContext,
  useMenubarItemContext,
  useMenubarMenuContext,
} from './context'
import { useMenubar } from './use-menubar'

type MenubarProps = MenubarSchema['props']

/**
 * 把一个角色节点按 value 登记进菜单栏的取值表。
 *
 * 登记发生在 ref 回调里（挂载补丁期同步跑完，早于 onMounted），
 * 挂载即展开时机器的 entry 才查得到 content——晚一拍登记就只能靠 flush 重试兜。
 * value 改了要把登记挪到新键上：表是按 value 取的，留在旧键上等于换了名字就找不到了。
 */
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

/**
 * 根是 role=menubar：一排 trigger 的 roving tabindex 作用域，
 * 每张菜单的浮层也住在它里面（层与焦点离场都以它为界）。
 */
export const XhMenubarRoot = defineComponent({
  name: 'XhMenubarRoot',
  // 全部 default: undefined —— 缺省值的唯一事实源在机器与 connect（loop / typeahead 尤其：
  // 裸 Boolean 声明会把缺省压成 false，回绕与连打就默默关掉了）
  props: {
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    disabled: { type: Boolean, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
  },
  // value-change 携带 { value }、select 携带 { menu, value }；update:value 携带裸值，支持 v-model:value
  emits: ['value-change', 'select', 'update:value'],
  setup(props, { slots, emit }) {
    const notifyValue: MenubarProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifySelect: MenubarProps['onSelect'] = details => emit('select', details)
    const ctx = useMenubar(props as MenubarProps, notifyValue, notifySelect)
    provideMenubar(ctx)
    return () => h('div', {
      ...ctx.api.value.getRootProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
    }, slots.default?.({
      value: ctx.api.value.value,
      open: ctx.api.value.open,
      setValue: ctx.api.value.setValue,
    }))
  },
})

export const XhMenubarTrigger = defineComponent({
  name: 'XhMenubarTrigger',
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useMenubarContext()
    // trigger 同时是定位锚点与焦点归还目标，两处都按 value 取
    const setEl = useMenubarPart(ctx.registerTrigger, () => props.value)
    return () => h('button', {
      ...ctx.api.value.getTriggerProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>,
      ref: (el: unknown) => setEl(el as HTMLElement | null),
    }, slots.default?.())
  },
})

export const XhMenubarPositioner = defineComponent({
  name: 'XhMenubarPositioner',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useMenubarContext()
    const menu = computed<MenubarContentProps>(() => ({ value: props.value }))
    // 内部的 content 因此可以不重复写 value
    provideMenubarMenu({ menu })
    const setEl = useMenubarPart(ctx.registerPositioner, () => props.value)
    return () => h('div', {
      ...ctx.api.value.getPositionerProps(menu.value) as Record<string, unknown>,
      ref: (el: unknown) => setEl(el as HTMLElement | null),
    }, slots.default?.())
  },
})

export const XhMenubarContent = defineComponent({
  name: 'XhMenubarContent',
  props: {
    // 缺省即沿用外层 positioner 提供的身份；positioner 可缺省，那时必须自己写
    value: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useMenubarContext()
    const inherited = useMenubarMenuContext()
    if (props.value == null && !inherited)
      throw new Error('[xh] XhMenubarContent 必须写在 XhMenubarPositioner 内，或自带 value')
    const menu = computed<MenubarContentProps>(() => ({ value: props.value ?? inherited!.menu.value.value }))
    const setEl = useMenubarPart(ctx.registerContent, () => menu.value.value)
    return () => h('div', {
      ...ctx.api.value.getContentProps(menu.value) as Record<string, unknown>,
      ref: (el: unknown) => setEl(el as HTMLElement | null),
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
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useMenubarContext()
    const item = computed<MenubarItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideMenubarItem({ item })
    // 承载焦点的条目被移出 DOM 时浏览器不派 focusout，锚点会停在一个已消失的值上：
    // 没有条目认领 tabindex=0、方向键也失去起点。卸载前如实上报，机器就地重挑锚点。
    // v-for 不带 key 时 Vue 会就地复用节点：被删的是"最后一个组件实例"，
    // 而持有焦点的那个 DOM 节点还在、value 却被改成了别的条目。此时锚点仍指着旧值、
    // 已无人认领，键盘就此失灵。自己正持有焦点且 value 变了，就按新值重报一次。
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
      // 整组一起卸载时根先停机，此刻无焦点可言（送事件还会在 dev 下抛）
      if (service.getStatus() !== 'Started')
        return
      // 判据是「本节点当下正持有焦点」，不是「值对得上」：v-for 就地复用时
      // 被卸载的是末位实例、它的 value 可能恰好等于刚纠正过的锚点，按值判会把好端端的锚点清掉
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
