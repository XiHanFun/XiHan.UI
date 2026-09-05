import type { AvatarGroupProps } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import { connectAvatarGroup } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideAvatarGroup, useAvatarGroupContext } from './context'

export const XhAvatarGroupRoot = defineComponent({
  name: 'XhAvatarGroupRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    max: { type: Number, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  setup(props, { slots }) {
    const api = computed(() => connectAvatarGroup(withXhConfig('avatar-group', props) as AvatarGroupProps, vueNormalize))
    provideAvatarGroup({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhAvatarGroupOverflowItem = defineComponent({
  name: 'XhAvatarGroupOverflowItem',
  setup(_, { slots }) {
    const ctx = useAvatarGroupContext()
    // 「+N」的文本由作者写进插槽
    return () => h('span', ctx.api.value.getOverflowItemProps() as Record<string, unknown>, slots.default?.())
  },
})
