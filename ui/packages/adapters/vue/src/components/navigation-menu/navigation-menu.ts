import type { NavigationMenuNode, NavigationMenuNodeMeta, NavigationMenuSchema, NavigationMenuTranslations } from '@xihan-ui/headless'
import type { Direction, Orientation, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { createRuntimeConfig } from '@xihan-ui/kernel'
import { defineComponent, h, ref } from 'vue'
import { withXhConfig } from '../../config/config'
import { slotPaints } from '../../runtime/slot-content'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { provideNavigationMenu, useNavigationMenuContext } from './context'
import { useNavigationMenu } from './use-navigation-menu'

type NavigationMenuProps = NavigationMenuSchema['props']

/** 根节点渲染为 nav，收起的三条出口（指针离开、焦点离场、Escape）在这一层处理 */
export const XhNavigationMenuRoot = defineComponent({
  name: 'XhNavigationMenuRoot',
  // 全部 default: undefined，缺省值由机器与 connect 决定
  props: {
    collection: { type: Array as PropType<NavigationMenuNode[]>, default: undefined },
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    delayDuration: { type: Number, default: undefined },
    skipDelayDuration: { type: Number, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    loop: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<Partial<NavigationMenuTranslations>>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸值以支持 v-model:value
  emits: {
    'value-change': (_details: PayloadOf<NavigationMenuProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<NavigationMenuProps, 'onValueChange'>['value']) => true,
  },
  setup(props, { slots, emit }) {
    const notify: NavigationMenuProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useNavigationMenu(withXhConfig('navigation-menu', props) as NavigationMenuProps, notify)
    provideNavigationMenu(ctx)
    return () => {
      // 默认插槽里有真内容就照旧交给作者；只剩注释或空白时当没写，给了 collection 就按数据铺开整套结构
      const authored = slots.default?.()
      const children = slotPaints(authored)
        ? authored
        : (props.collection ? renderDefaultTree(ctx.api.value.collection, slots.panel) : undefined)
      return h('nav', {
        ...ctx.api.value.getRootProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
      }, children)
    }
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
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
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
    // 一个面板一份退场闸门：它们各开各的、动画各跑各的，一份管不过来。
    // 开合判据直接取 connect 这一帧的产出，不另起一套——两边各判一次迟早会说岔
    const contentRef = ref<HTMLElement | null>(null)
    const visible = useOverlayExit({
      config: typeof document === 'undefined' ? null : createRuntimeConfig(),
      isOpen: () => (ctx.api.value.getContentProps({ value: props.value }) as Record<string, unknown>).hidden !== true,
      contentRef,
    })
    return () => h(
      'div',
      {
        ...ctx.api.value.getContentProps({ value: props.value }) as Record<string, unknown>,
        // 收起跟着闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场就一帧都
        // 播不出来），所以真正的收起落成内联 display
        style: visible.value ? undefined : { display: 'none' },
        ref: (el: unknown) => { contentRef.value = el as HTMLElement | null },
      },
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

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 一项一个 li：带 href 的铺成直达链接，其余铺成 trigger 加面板，面板内容由 panel 插槽给。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 */
function renderDefaultTree(
  collection: readonly NavigationMenuNodeMeta[],
  panelSlot?: (node: NavigationMenuNodeMeta) => VNode[],
): VNode[] {
  return [
    h(XhNavigationMenuList, null, () => [
      ...collection.map(node => h(XhNavigationMenuItem, { key: node.value }, () => (
        node.href != null
          ? [h(XhNavigationMenuLink, { href: node.href, current: node.current }, () => node.label)]
          : [
              h(XhNavigationMenuTrigger, { value: node.value }, () => node.label),
              h(XhNavigationMenuContent, { value: node.value }, () => panelSlot?.(node) ?? []),
            ]
      ))),
      h(XhNavigationMenuIndicator),
    ]),
  ]
}
