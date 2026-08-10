import type { AvatarGroupProps } from '@xihan-ui/headless'
import { connectAvatarGroup } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideAvatarGroup, useAvatarGroupContext } from './context'

export const XhAvatarGroupRoot = defineComponent({
  name: 'XhAvatarGroupRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    max: { type: Number, default: undefined },
    size: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const api = computed(() => connectAvatarGroup(props as AvatarGroupProps, vueNormalize))
    provideAvatarGroup({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhAvatarGroupOverflow = defineComponent({
  name: 'XhAvatarGroupOverflow',
  setup(_, { slots }) {
    const ctx = useAvatarGroupContext()
    // 「+N」的文本由作者写进插槽
    return () => h('span', ctx.api.value.getOverflowProps() as Record<string, unknown>, slots.default?.())
  },
})
