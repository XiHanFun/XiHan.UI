import type { DrawerApi, DrawerSchema, DrawerSide } from '@xihan-ui/headless'
import type { OverlayBackdropVariant, Size } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, mergeProps, Teleport } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { provideDrawer, useDrawerContext } from './context'
import { useDrawer } from './use-drawer'

type DrawerProps = DrawerSchema['props']

/** 默认插槽的载荷：展开状态、已解析的滑出边，与开合命令。 */
export type DrawerRootSlotProps = Pick<DrawerApi, 'open' | 'side' | 'setOpen'>

export const XhDrawerRoot = defineComponent({
  name: 'XhDrawerRoot',
  props: {
    // 缺省值由 connect 给出，这里一律 default: undefined
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    modal: { type: Boolean, default: undefined },
    side: { type: String as PropType<DrawerSide>, default: undefined },
    role: { type: String as PropType<'dialog' | 'alertdialog'>, default: undefined },
    closeOnEscape: { type: Boolean, default: undefined },
    closeOnInteractOutside: { type: Boolean, default: undefined },
    restoreFocus: { type: Boolean, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    variant: { type: String as PropType<OverlayBackdropVariant>, default: undefined },
    /**
     * 挂到哪个容器（CSS 选择器或元素）。给了它就是局部抽屉：
     * 浮层搬进那个容器，遮罩与定位层从 fixed 换成 absolute，只罩住它而不是盖满整屏。
     *
     * 那个容器要自己带 position（relative 之类），否则 absolute 会往上找到别的定位祖先。
     * 不给则问全局配置的 portalContainer，再没有才落 body。
     */
    container: { type: [String, Object] as PropType<string | Element>, default: undefined },
    /**
     * 只把画法改成局部（遮罩与定位层从 fixed 换成 absolute），不管搬到哪儿。
     * 给了 container 就默认为真，不必再写一遍；两个都不给即铺满视口。
     */
    contained: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<DrawerProps['translations']>, default: undefined },
  },
  // open-change 携带 { open }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<DrawerProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<DrawerProps, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: DrawerRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: DrawerProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    // 容器一处给定，两件事都从它派生：contained 交给机器（皮肤据此把遮罩与定位层
    // 从 fixed 换成 absolute），同一个值又是 Teleport 的落点，两边不会各说各话
    const ctx = useDrawer(withXhConfig('drawer', props) as DrawerProps, notify, () => props.container)
    provideDrawer(ctx)
    // root 是真实节点，content 会被 portal 到 body，data-side 挂在这里供页面内的部分读取
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      side: ctx.api.value.side,
      setOpen: ctx.api.value.setOpen,
    }))
  },
})

export const XhDrawerTrigger = defineComponent({
  name: 'XhDrawerTrigger',
  props: {
    /** 借用作者的子节点当触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useDrawerContext()
    return () => {
      const attrs = ctx.api.value.getTriggerProps() as Record<string, unknown>
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, attrs, 'drawer')
        if (merged)
          return merged
      }
      return h('button', attrs, children)
    }
  },
})

export const XhDrawerContent = defineComponent({
  name: 'XhDrawerContent',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 content 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useDrawerContext()
    return () => {
      // presence 判定不在场则整棵不渲染，退场动画播完才翻假
      if (!ctx.rendered.value)
        return null
      const api = ctx.api.value
      return h(Teleport, { to: ctx.portalTarget.value }, [
        h('div', {
          ...api.getBackdropProps() as Record<string, unknown>,
          ref: (el: unknown) => { ctx.backdropRef.value = el as HTMLElement },
        }),
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

export const XhDrawerTitle = defineComponent({
  name: 'XhDrawerTitle',
  setup(_, { slots }) {
    const ctx = useDrawerContext()
    return () => h('h2', ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDrawerDescription = defineComponent({
  name: 'XhDrawerDescription',
  setup(_, { slots }) {
    const ctx = useDrawerContext()
    return () => h('p', ctx.api.value.getDescriptionProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDrawerCloseTrigger = defineComponent({
  name: 'XhDrawerCloseTrigger',
  setup(_, { slots }) {
    const ctx = useDrawerContext()
    return () => h('button', ctx.api.value.getCloseTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
