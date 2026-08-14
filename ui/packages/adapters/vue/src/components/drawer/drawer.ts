import type { DrawerApi, DrawerSchema, DrawerSide } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, Teleport } from 'vue'
import { withXhConfig } from '../../config/config'
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
    const ctx = useDrawer(withXhConfig('drawer', props) as DrawerProps, notify)
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
      // presence 判定不在场则整棵不渲染，退场动画播完才翻假
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
