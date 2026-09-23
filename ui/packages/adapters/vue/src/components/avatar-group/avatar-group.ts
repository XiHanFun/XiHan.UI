/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 avatar group 相关实现。

import type { Size } from '@xihan-ui/core'
import type { AvatarGroupProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectAvatarGroup } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideAvatarGroup, useAvatarGroupContext } from './context'

export const XhAvatarGroupRoot = defineComponent({
  name: 'XhAvatarGroupRoot',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    max: { type: Number },
    size: { type: String as PropType<Size> },
  },
  setup(props, { slots }) {
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理
    const configured = withXhConfig('avatar-group', props)
    const api = computed(() => connectAvatarGroup(configured as AvatarGroupProps, vueNormalize))
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
