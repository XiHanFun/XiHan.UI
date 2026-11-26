/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image 相关实现。

import type { ImageApi, ImageSchema, ImageViewerItem } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import type { PropsOf } from '../../runtime/props-of'
import { computed, defineComponent, h, ref, watch } from 'vue'
import {
  XhImageViewerCloseTrigger,
  XhImageViewerContent,
  XhImageViewerFlipHorizontalTrigger,
  XhImageViewerFlipVerticalTrigger,
  XhImageViewerImage,
  XhImageViewerResetTrigger,
  XhImageViewerRoot,
  XhImageViewerRotateLeftTrigger,
  XhImageViewerRotateRightTrigger,
  XhImageViewerToolbar,
  XhImageViewerViewport,
  XhImageViewerZoomInTrigger,
  XhImageViewerZoomOutTrigger,
} from '../image-viewer/image-viewer'
import { provideImage, useImageContext } from './context'
import { useImage } from './use-image'

type ImageProps = ImageSchema['props']

/** 默认插槽的载荷：加载状态、是否已加载完成，以及回退内容当前是否应当显示。 */
export type ImageRootSlotProps = Pick<ImageApi, 'status' | 'loaded' | 'showFallback' | 'showPlaceholder'>

/**
 * 预览层：一张图的图片预览，工具条放齐缩放、旋转、翻转与归零，外加关闭钮。
 * 开合受图片的 previewOpen 控制，预览层请求关闭时经 setPreviewOpen 写回；三端是同一棵树。
 */
function renderPreview(api: ImageApi, collection: ImageViewerItem[]): VNode {
  return h(XhImageViewerRoot, {
    collection,
    open: api.previewOpen,
    onOpenChange: (details: { open: boolean }) => api.setPreviewOpen(details.open),
  }, () => h(XhImageViewerContent, null, () => [
    h(XhImageViewerViewport, null, () => h(XhImageViewerImage)),
    h(XhImageViewerToolbar, null, () => [
      h(XhImageViewerZoomOutTrigger),
      h(XhImageViewerZoomInTrigger),
      h(XhImageViewerRotateLeftTrigger),
      h(XhImageViewerRotateRightTrigger),
      h(XhImageViewerFlipHorizontalTrigger),
      h(XhImageViewerFlipVerticalTrigger),
      h(XhImageViewerResetTrigger),
    ]),
    h(XhImageViewerCloseTrigger),
  ]))
}

export const XhImageRoot = defineComponent({
  name: 'XhImageRoot',
  props: {
    // 缺席即无来源，落回退态
    src: { type: String },
    alt: { type: String },
    fit: { type: String as PropType<ImageProps['fit']> },
    lazy: Boolean,
    preview: { type: [Boolean, Object] as PropType<ImageProps['preview']> },
    fallbackDelay: { type: Number },
  },
  // status-change 携带 { status }
  emits: {
    'status-change': (_details: PayloadOf<ImageProps, 'onStatusChange'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ImageRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: ImageProps['onStatusChange'] = details => emit('status-change', details)
    const ctx = useImage(props as ImageProps, notify)
    provideImage(ctx)
    // 预览清单只随地址与替代文本换：图片自己换相位时不给预览层一份新数组
    const previewSrc = computed(() => ctx.api.value.previewItem?.src)
    const previewAlt = computed(() => ctx.api.value.previewItem?.alt)
    const previewCollection = computed<ImageViewerItem[]>(() => {
      const src = previewSrc.value
      if (src === undefined)
        return []
      return previewAlt.value === undefined ? [{ src }] : [{ src, alt: previewAlt.value }]
    })
    return () => {
      const api = ctx.api.value
      // 预览层挂在 root 里：它的内容经 Portal 搬到浮层落点，DOM 事件不会冒回这颗按钮
      return h('div', api.getRootProps(), [
        slots.default?.({
          status: api.status,
          loaded: api.loaded,
          showFallback: api.showFallback,
          showPlaceholder: api.showPlaceholder,
        }),
        api.previewable ? renderPreview(api, previewCollection.value) : null,
      ])
    }
  },
})

export const XhImageImage = defineComponent({
  name: 'XhImageImage',
  setup() {
    const ctx = useImageContext()
    const imageEl = ref<HTMLImageElement | null>(null)

    // 进入 loading 时为已就绪的图（如注水前就加载完的 SSR 图）补报一次加载完成
    watch(() => ctx.api.value.status, (status) => {
      const { service } = ctx
      if (status !== 'loading' || service.getStatus() !== 'Started')
        return
      const img = imageEl.value
      if (img?.complete && img.naturalWidth > 0 && img.currentSrc === img.src)
        service.send({ type: 'IMAGE.LOAD' })
    }, { immediate: true, flush: 'post' })

    // 节点常挂，靠 hidden 显隐
    return () => h('img', {
      ...ctx.api.value.getImageProps(),
      ref: imageEl,
    })
  },
})

export const XhImagePlaceholder = defineComponent({
  name: 'XhImagePlaceholder',
  setup(_, { slots }) {
    const ctx = useImageContext()
    // 节点常挂，靠 hidden 显隐
    return () => h('div', ctx.api.value.getPlaceholderProps(), slots.default?.())
  },
})

export const XhImageFallback = defineComponent({
  name: 'XhImageFallback',
  setup(_, { slots }) {
    const ctx = useImageContext()
    // 节点常挂，靠 hidden 显隐
    return () => h('div', ctx.api.value.getFallbackProps(), slots.default?.())
  },
})

// 各组件接受的 props，与 React 同名
export type XhImageFallbackProps = PropsOf<typeof XhImageFallback>
export type XhImageImageProps = PropsOf<typeof XhImageImage>
export type XhImagePlaceholderProps = PropsOf<typeof XhImagePlaceholder>
export type XhImageRootProps = PropsOf<typeof XhImageRoot>
