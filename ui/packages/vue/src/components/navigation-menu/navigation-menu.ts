import type { Direction, Orientation } from '@xihan-ui/core'
import type { NavigationMenuSchema, NavigationMenuTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideNavigationMenu, useNavigationMenuContext } from './context'
import { useNavigationMenu } from './use-navigation-menu'

type NavigationMenuProps = NavigationMenuSchema['props']

/**
 * 根节点是 nav 地标：站点导航是读屏用户最常直接跳进来的那个地标。
 * 收起的三条出口（指针离开、焦点离场、Escape）都在这一层收口。
 */
export const XhNavigationMenuRoot = defineComponent({
  name: 'XhNavigationMenuRoot',
  // 全部 default: undefined —— 缺省值的唯一事实源在机器与 connect（loop 尤其：
  // 裸 Boolean 声明会把缺省压成 false，回绕就默默关掉了）
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
  // value-change 携带 { value }；update:value 携带裸值，支持 v-model:value
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

// ul 而不是 div：站点导航是一组并列的去处，读屏会念"列表，共 n 项"。
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

/**
 * 一项 = 一个 li。面板（content）就写在同一个 li 里、紧跟在 trigger 之后：
 * 「Tab 从 trigger 走进展开的面板」靠的正是这个位置关系。
 */
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

// 面板常挂、靠 hidden 显隐：不做懒挂载，面板内的滚动位置与表单态才留得住。
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

/**
 * 面板里的条目是链接不是命令——这正是 NavigationMenu 与 Menu 的分野。
 * href 归作者写（那是路由的事）；点击不拦，只把导航收起。
 */
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

/**
 * 指示条的位置由机器量好、经内联样式写下来；这里只是个容器，长什么样归样式层。
 *
 * 标签是 li 而不是 div：它得住在 list（ul）里才能以 list 为定位参照系，
 * 而 ul 里只放得下 li。它对读屏隐藏，列表项计数不受影响。
 */
export const XhNavigationMenuIndicator = defineComponent({
  name: 'XhNavigationMenuIndicator',
  setup() {
    const ctx = useNavigationMenuContext()
    return () => h('li', ctx.api.value.getIndicatorProps() as Record<string, unknown>)
  },
})

/**
 * 可选的共享面板外壳：放在 root 里、list 之后，画一层统一的边框/阴影/背景。
 * 面板本身可以继续写在各自的 item 里（Tab 顺序更顺），也可以整批塞进这里。
 */
export const XhNavigationMenuViewport = defineComponent({
  name: 'XhNavigationMenuViewport',
  setup(_, { slots }) {
    const ctx = useNavigationMenuContext()
    return () => h('div', ctx.api.value.getViewportProps() as Record<string, unknown>, slots.default?.())
  },
})
