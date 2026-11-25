/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 container 相关实现。

import type { ContainerMaxWidth, ContainerProps } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PropsOf } from '../../runtime/props-of'
import { connectContainer } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'

/**
 * 页面居中限宽的版心：根是一个 `<div>`，最大宽度档落成 data-max-width，
 * 宽度、居中与左右内衬由皮肤按档位与视口给出。根上不写 role：它只是排版用的盒子。
 */
export const XhContainer = defineComponent({
  name: 'XhContainer',
  // 缺省值由 connect 给出，这里不写 default
  props: {
    maxWidth: { type: String as PropType<ContainerMaxWidth> },
  },
  slots: Object as SlotsType<{
    /** 版心里的内容。 */
    default?: () => VNode[]
  }>,
  setup(props, { slots }) {
    // 没有状态机，全局配置（组件级缺省）在这里并进来
    const configured = withXhConfig('container', props)
    const api = computed(() => connectContainer({
      maxWidth: configured.maxWidth,
    } satisfies ContainerProps, vueNormalize))
    return () => h('div', api.value.getRootProps(), slots.default?.())
  },
})

// 各组件接受的 props，与 React 同名
export type XhContainerProps = PropsOf<typeof XhContainer>
