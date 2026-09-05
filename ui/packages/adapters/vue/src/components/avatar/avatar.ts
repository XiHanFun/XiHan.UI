import type { Size } from '@xihan-ui/core'
import type { AvatarSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, ref, watch } from 'vue'
import { provideAvatar, useAvatarContext } from './context'
import { useAvatar } from './use-avatar'

type AvatarProps = AvatarSchema['props']

export const XhAvatarRoot = defineComponent({
  name: 'XhAvatarRoot',
  props: {
    // 缺席即无来源，落回退态
    src: { type: String, default: undefined },
    alt: { type: String, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // status-change 携带 { status }
  emits: {
    'status-change': (_details: PayloadOf<AvatarProps, 'onStatusChange'>) => true,
  },
  setup(props, { slots, emit }) {
    const notify: AvatarProps['onStatusChange'] = details => emit('status-change', details)
    const ctx = useAvatar(props as AvatarProps, notify)
    provideAvatar(ctx)
    return () => h('span', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhAvatarImage = defineComponent({
  name: 'XhAvatarImage',
  setup() {
    const ctx = useAvatarContext()
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

export const XhAvatarFallback = defineComponent({
  name: 'XhAvatarFallback',
  setup(_, { slots }) {
    const ctx = useAvatarContext()
    // 节点常挂，靠 hidden 显隐
    return () => h('span', ctx.api.value.getFallbackProps() as Record<string, unknown>, slots.default?.())
  },
})
