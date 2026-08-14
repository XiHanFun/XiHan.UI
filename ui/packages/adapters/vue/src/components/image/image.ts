import type { ImageApi, ImageSchema } from '@xihan-ui/headless'
import type { SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, ref, watch } from 'vue'
import { provideImage, useImageContext } from './context'
import { useImage } from './use-image'

type ImageProps = ImageSchema['props']

/** 默认插槽的载荷：加载状态、是否已加载完，以及回退内容此刻该不该露面。 */
export type ImageRootSlotProps = Pick<ImageApi, 'status' | 'loaded' | 'showFallback'>

export const XhImageRoot = defineComponent({
  name: 'XhImageRoot',
  props: {
    // 缺席即无来源，落回退态
    src: { type: String, default: undefined },
    alt: { type: String, default: undefined },
    fallbackDelay: { type: Number, default: undefined },
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
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      status: ctx.api.value.status,
      loaded: ctx.api.value.loaded,
      showFallback: ctx.api.value.showFallback,
    }))
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
      ...ctx.api.value.getImageProps() as Record<string, unknown>,
      ref: imageEl,
    })
  },
})

export const XhImageFallback = defineComponent({
  name: 'XhImageFallback',
  setup(_, { slots }) {
    const ctx = useImageContext()
    // 节点常挂，靠 hidden 显隐
    return () => h('div', ctx.api.value.getFallbackProps() as Record<string, unknown>, slots.default?.())
  },
})
