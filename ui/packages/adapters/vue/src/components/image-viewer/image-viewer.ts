import type { imageViewerCounterText as counterTextFn, ImageViewerApi, ImageViewerItem, ImageViewerSchema } from '@xihan-ui/headless'
import type { OverlayBackdropVariant } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { imageViewerCounterText } from '@xihan-ui/headless'
import { defineComponent, h, mergeProps, Teleport } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { provideImageViewer, useImageViewerContext } from './context'
import { useImageViewer } from './use-image-viewer'

type ImageViewerProps = ImageViewerSchema['props']

/** 默认插槽的载荷：当前图与下标、变换与可翻页状态，以及翻页、缩放、旋转、翻转、归零等命令。 */
export type ImageViewerRootSlotProps = Pick<
  ImageViewerApi,
  | 'open'
  | 'index'
  | 'count'
  | 'currentItem'
  | 'transform'
  | 'canPrev'
  | 'canNext'
  | 'setOpen'
  | 'setIndex'
  | 'next'
  | 'prev'
  | 'zoomIn'
  | 'zoomOut'
  | 'setScale'
  | 'rotateLeft'
  | 'rotateRight'
  | 'flipHorizontal'
  | 'flipVertical'
  | 'reset'
>

export const XhImageViewerRoot = defineComponent({
  name: 'XhImageViewerRoot',
  // 缺省值由 connect 与机器给出，这里一律 default: undefined
  props: {
    collection: { type: Array as PropType<ImageViewerItem[]>, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    index: { type: Number, default: undefined },
    defaultIndex: { type: Number, default: undefined },
    loop: { type: Boolean, default: undefined },
    zoomStep: { type: Number, default: undefined },
    minScale: { type: Number, default: undefined },
    maxScale: { type: Number, default: undefined },
    closeOnEscape: { type: Boolean, default: undefined },
    closeOnInteractOutside: { type: Boolean, default: undefined },
    restoreFocus: { type: Boolean, default: undefined },
    variant: { type: String as PropType<OverlayBackdropVariant>, default: undefined },
    translations: { type: Object as PropType<ImageViewerProps['translations']>, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值，支持 v-model:open 与 v-model:index
  emits: {
    'open-change': (_details: PayloadOf<ImageViewerProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<ImageViewerProps, 'onOpenChange'>['open']) => true,
    'index-change': (_details: PayloadOf<ImageViewerProps, 'onIndexChange'>) => true,
    'update:index': (_index: PayloadOf<ImageViewerProps, 'onIndexChange'>['index']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ImageViewerRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useImageViewer(withXhConfig('image-viewer', props) as ImageViewerProps, {
      onOpenChange: (details) => {
        emit('open-change', details)
        emit('update:open', details.open)
      },
      onIndexChange: (details) => {
        emit('index-change', details)
        emit('update:index', details.index)
      },
    })
    provideImageViewer(ctx)
    // 经插槽暴露状态与命令，供浮层外的按钮（如缩略图）使用
    return () => slots.default?.({
      open: ctx.api.value.open,
      index: ctx.api.value.index,
      count: ctx.api.value.count,
      currentItem: ctx.api.value.currentItem,
      transform: ctx.api.value.transform,
      canPrev: ctx.api.value.canPrev,
      canNext: ctx.api.value.canNext,
      setOpen: ctx.api.value.setOpen,
      setIndex: ctx.api.value.setIndex,
      next: ctx.api.value.next,
      prev: ctx.api.value.prev,
      zoomIn: ctx.api.value.zoomIn,
      zoomOut: ctx.api.value.zoomOut,
      setScale: ctx.api.value.setScale,
      rotateLeft: ctx.api.value.rotateLeft,
      rotateRight: ctx.api.value.rotateRight,
      flipHorizontal: ctx.api.value.flipHorizontal,
      flipVertical: ctx.api.value.flipVertical,
      reset: ctx.api.value.reset,
    })
  },
})

export const XhImageViewerTrigger = defineComponent({
  name: 'XhImageViewerTrigger',
  props: {
    /** 借用作者的子节点当触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useImageViewerContext()
    return () => {
      const attrs = ctx.api.value.getTriggerProps() as Record<string, unknown>
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, attrs, 'image-viewer')
        if (merged)
          return merged
      }
      return h('button', attrs, children)
    }
  },
})

export const XhImageViewerContent = defineComponent({
  name: 'XhImageViewerContent',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 content 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useImageViewerContext()
    return () => {
      if (!ctx.rendered.value)
        return null
      const api = ctx.api.value
      return h(Teleport, { to: ctx.portalTarget.value }, [
        h('div', {
          ...api.getBackdropProps() as Record<string, unknown>,
          ref: (el: unknown) => {
            ctx.backdropRef.value = el as HTMLElement
          },
        }),
        h('div', api.getPositionerProps() as Record<string, unknown>, [
          h('div', {
            ...mergeProps(api.getContentProps() as Record<string, unknown>, attrs),
            ref: (el: unknown) => {
              ctx.contentRef.value = el as HTMLElement
            },
          }, slots.default?.()),
        ]),
      ])
    }
  },
})

export const XhImageViewerViewport = defineComponent({
  name: 'XhImageViewerViewport',
  setup(_, { slots }) {
    const ctx = useImageViewerContext()
    return () => h('div', ctx.api.value.getViewportProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhImageViewerImage = defineComponent({
  name: 'XhImageViewerImage',
  setup() {
    const ctx = useImageViewerContext()
    return () => h('img', ctx.api.value.getImageProps() as Record<string, unknown>)
  },
})

export const XhImageViewerToolbar = defineComponent({
  name: 'XhImageViewerToolbar',
  setup(_, { slots }) {
    const ctx = useImageViewerContext()
    return () => h('div', ctx.api.value.getToolbarProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 工具条按钮共用的组件工厂：没写插槽内容就空着，皮肤据 :empty 画兜底图标；给了文字的（1:1）填文字。 */
function toolTrigger(name: string, getProps: (api: ReturnType<typeof useImageViewerContext>['api']['value']) => Record<string, unknown>, fallback?: string): ReturnType<typeof defineComponent> {
  return defineComponent({
    name,
    setup(_, { slots }) {
      const ctx = useImageViewerContext()
      return () => h('button', getProps(ctx.api.value) as Record<string, unknown>, slots.default ? slots.default() : fallback)
    },
  })
}

export const XhImageViewerZoomInTrigger = toolTrigger('XhImageViewerZoomInTrigger', api => api.getZoomInTriggerProps() as Record<string, unknown>)
export const XhImageViewerZoomOutTrigger = toolTrigger('XhImageViewerZoomOutTrigger', api => api.getZoomOutTriggerProps() as Record<string, unknown>)
export const XhImageViewerRotateLeftTrigger = toolTrigger('XhImageViewerRotateLeftTrigger', api => api.getRotateLeftTriggerProps() as Record<string, unknown>)
export const XhImageViewerRotateRightTrigger = toolTrigger('XhImageViewerRotateRightTrigger', api => api.getRotateRightTriggerProps() as Record<string, unknown>)
export const XhImageViewerFlipHorizontalTrigger = toolTrigger('XhImageViewerFlipHorizontalTrigger', api => api.getFlipHorizontalTriggerProps() as Record<string, unknown>)
export const XhImageViewerFlipVerticalTrigger = toolTrigger('XhImageViewerFlipVerticalTrigger', api => api.getFlipVerticalTriggerProps() as Record<string, unknown>)
export const XhImageViewerResetTrigger = toolTrigger('XhImageViewerResetTrigger', api => api.getResetTriggerProps() as Record<string, unknown>, '1:1')
export const XhImageViewerPrevTrigger = toolTrigger('XhImageViewerPrevTrigger', api => api.getPrevTriggerProps() as Record<string, unknown>)
export const XhImageViewerNextTrigger = toolTrigger('XhImageViewerNextTrigger', api => api.getNextTriggerProps() as Record<string, unknown>)
export const XhImageViewerCloseTrigger = toolTrigger('XhImageViewerCloseTrigger', api => api.getCloseTriggerProps() as Record<string, unknown>)

export const XhImageViewerCounter = defineComponent({
  name: 'XhImageViewerCounter',
  setup(_, { slots }) {
    const ctx = useImageViewerContext()
    return () => {
      const api = ctx.api.value
      // 无插槽内容时用「第 n / 共 m」的缺省文本兜底
      const fallback: ReturnType<typeof counterTextFn> = imageViewerCounterText(
        ctx.service.prop('translations'),
        api.index,
        api.count,
      )
      return h('div', api.getCounterProps() as Record<string, unknown>, slots.default ? slots.default() : fallback)
    }
  },
})
