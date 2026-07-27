import type { AvatarSchema } from '@xihan-ui/headless'
import { defineComponent, h, ref, watch } from 'vue'
import { provideAvatar, useAvatarContext } from './context'
import { useAvatar } from './use-avatar'

type AvatarProps = AvatarSchema['props']

export const XhAvatarRoot = defineComponent({
  name: 'XhAvatarRoot',
  props: {
    // 属性缺席 = 没有来源，落回退态；不给 default: '' 免得空串被当成一个来源
    src: { type: String, default: undefined },
    alt: { type: String, default: undefined },
  },
  // status-change 携带 { status }
  emits: ['status-change'],
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

    // load/error 监听器要等这个节点挂上才生效，而图片可能早就就绪了：
    // 服务端渲染出的 img 在注水完成前就取回并派发过 load，那一次没人接，
    // 机器于是永远等不到 IMAGE.LOAD、状态卡在 loading——图明明在手边却只显示回退内容。
    //
    // 补报要盯着状态、不能只在挂载时做一次：首帧机器停在 idle，要等来源决议落地
    // （resolveSrc 的 flush）才进 loading，挂载那一刻查必然扑空。
    // 只在 loading 补报：idle 期间补会被随后落地的来源决议一脚踢回 loading。
    // 三个条件缺一不可：complete（排除在途请求）、naturalWidth > 0（排除取回失败）、
    // currentSrc === src（排除换图那一瞬旧图仍 complete，否则会把旧图当新图显出来）。
    // flush: 'post' 是为了等属性真落到节点上，此刻才问得出"它是不是早就加载完了"。
    watch(() => ctx.api.value.status, (status) => {
      const { service } = ctx
      if (status !== 'loading' || service.getStatus() !== 'Started')
        return
      const img = imageEl.value
      if (img?.complete && img.naturalWidth > 0 && img.currentSrc === img.src)
        service.send({ type: 'IMAGE.LOAD' })
    }, { immediate: true, flush: 'post' })

    // 节点常挂、靠 hidden 显隐：卸载重建会重新发一次请求，也就再也等不到 load 事件
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
    // 节点常挂、靠 hidden 显隐：不卸载作者写的首字母或图标
    return () => h('span', ctx.api.value.getFallbackProps() as Record<string, unknown>, slots.default?.())
  },
})
