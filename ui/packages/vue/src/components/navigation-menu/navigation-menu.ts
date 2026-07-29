import type { Direction, Orientation } from '@xihan-ui/core'
import type { NavigationMenuSchema, NavigationMenuTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideNavigationMenu, useNavigationMenuContext } from './context'
import { useNavigationMenu } from './use-navigation-menu'

type NavigationMenuProps = NavigationMenuSchema['props']

/** 根节点渲染为 nav，收起的三条出口（指针离开、焦点离场、Escape）在这一层处理 */
export const XhNavigationMenuRoot = defineComponent({
  name: 'XhNavigationMenuRoot',
  // 全部 default: undefined，缺省值由机器与 connect 决定
  props: {
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    delayDuration: { type: Number, default: undefined },
    skipDelayDuration: { type: Number, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    loop: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<Partial<NavigationMenuTranslations>>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸值以支持 v-model:value
  emits: ['value-change', 'update:value'],
  setup(props, { slots, emit }) {
    const notify: NavigationMenuProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useNavigationMenu(props as NavigationMenuProps, notify)
    provideNavigationMenu(ctx)
    return () => h('nav', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

// 用 ul 而非 div：站点导航是一组并列的去处，读屏会念"列表，共 n 项"。
export const XhNavigationMenuList = defineComponent({
  name: 'XhNavigationMenuList',
  setup(_, { slots }) {
    const ctx = useNavigationMenuContext()
    return () => h('ul', {
      ...ctx.api.value.getListProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.listRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

/** 一项渲染为一个 li；面板 content 写在同一个 li 内、紧跟 trigger 之后 */
export const XhNavigationMenuItem = defineComponent({
  name: 'XhNavigationMenuItem',
  setup(_, { slots }) {
    const ctx = useNavigationMenuContext()
    return () => h('li', ctx.api.value.getItemProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhNavigationMenuTrigger = defineComponent({
  name: 'XhNavigationMenuTrigger',
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useNavigationMenuContext()
    return () => h(
      'button',
      ctx.api.value.getTriggerProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

// 面板常挂，靠 hidden 显隐，不做懒挂载
export const XhNavigationMenuContent = defineComponent({
  name: 'XhNavigationMenuContent',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useNavigationMenuContext()
    return () => h(
      'div',
      ctx.api.value.getContentProps({ value: props.value }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

/** 面板内的链接项：href 由作者写，点击不拦截，只收起导航 */
export const XhNavigationMenuLink = defineComponent({
  name: 'XhNavigationMenuLink',
  props: {
    current: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useNavigationMenuContext()
    return () => h(
      'a',
      ctx.api.value.getLinkProps({ current: props.current }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

/** 指示条容器，位置由机器算好写入内联样式；渲染为 li 以 list 为定位参照系 */
export const XhNavigationMenuIndicator = defineComponent({
  name: 'XhNavigationMenuIndicator',
  setup() {
    const ctx = useNavigationMenuContext()
    return () => h('li', ctx.api.value.getIndicatorProps() as Record<string, unknown>)
  },
})

/** 可选的共享面板外壳，放在 root 内、list 之后 */
export const XhNavigationMenuViewport = defineComponent({
  name: 'XhNavigationMenuViewport',
  setup(_, { slots }) {
    const ctx = useNavigationMenuContext()
    return () => h('div', ctx.api.value.getViewportProps() as Record<string, unknown>, slots.default?.())
  },
})
