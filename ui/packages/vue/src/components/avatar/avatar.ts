import type { AvatarSchema } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
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
    // 节点常挂、靠 hidden 显隐：卸载重建会重新发一次请求，也就再也等不到 load 事件
    return () => h('img', ctx.api.value.getImageProps() as Record<string, unknown>)
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
