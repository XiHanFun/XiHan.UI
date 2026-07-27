import type { DrawerSchema, DrawerSide } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h, Teleport } from 'vue'
import { provideDrawer, useDrawerContext } from './context'
import { useDrawer } from './use-drawer'

type DrawerProps = DrawerSchema['props']

export const XhDrawerRoot = defineComponent({
  name: 'XhDrawerRoot',
  props: {
    // 一律 default: undefined，缺省值只在 connect 里定义一次：
    // 这边再写一份默认值，两处一旦不同步，同一份标记在 Vue 与 WC 上就会产出不同的 DOM。
    // （Vue 的 Boolean prop 不给 default 会被强转成 false，那就再也表达不了"没写"。）
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    modal: { type: Boolean, default: undefined },
    side: { type: String as PropType<DrawerSide>, default: undefined },
    role: { type: String as PropType<'dialog' | 'alertdialog'>, default: undefined },
    closeOnEscape: { type: Boolean, default: undefined },
    closeOnInteractOutside: { type: Boolean, default: undefined },
    restoreFocus: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<DrawerProps['translations']>, default: undefined },
  },
  // open-change 携带 { open }；update:open 携带裸布尔，支持 v-model:open
  emits: ['open-change', 'update:open'],
  setup(props, { slots, emit }) {
    const notify: DrawerProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useDrawer(props as DrawerProps, notify)
    provideDrawer(ctx)
    // root 是真实节点：content 会被 portal 到 body，data-side 若只挂在浮层上，
    // 留在页面里的那半边（trigger 及作者的容器样式）就无从知道抽屉朝哪边开。
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      side: ctx.api.value.side,
      setOpen: ctx.api.value.setOpen,
    }))
  },
})

export const XhDrawerTrigger = defineComponent({
  name: 'XhDrawerTrigger',
  setup(_, { slots }) {
    const ctx = useDrawerContext()
    return () => h('button', ctx.api.value.getTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDrawerContent = defineComponent({
  name: 'XhDrawerContent',
  setup(_, { slots }) {
    const ctx = useDrawerContext()
    return () => {
      // presence 说不必在场就整棵不渲染：退场动画播完才会翻假
      if (!ctx.rendered.value)
        return null
      const api = ctx.api.value
      return h(Teleport, { to: 'body' }, [
        h('div', {
          ...api.getBackdropProps() as Record<string, unknown>,
          ref: (el: unknown) => { ctx.backdropRef.value = el as HTMLElement },
        }),
        h('div', api.getPositionerProps() as Record<string, unknown>, [
          h('div', {
            ...api.getContentProps() as Record<string, unknown>,
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
