/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 visually hidden 相关实现。

import type { VisuallyHiddenProps } from '@xihan-ui/headless'
import type { PropsOf } from '../../runtime/props-of'
import { connectVisuallyHidden } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'

/**
 * 把默认插槽的内容包进一个 `<span>`：屏幕上看不见、读屏照读，仍留在布局与表单里。
 *
 * 藏法全在皮肤里；`focusable` 打开后，里面的链接或按钮获得焦点时整段显出来，焦点离开再藏回去。
 */
export const XhVisuallyHidden = defineComponent({
  name: 'XhVisuallyHidden',
  props: {
    /** 获得焦点时显出来：给「跳到正文」这类跳转链接用。缺省一直藏着。 */
    focusable: Boolean,
  },
  setup(props, { slots }) {
    // 没有状态机，全局配置（组件级缺省）在这里并进来
    const configured = withXhConfig('visually-hidden', props)
    const api = computed(() => connectVisuallyHidden({
      focusable: configured.focusable,
    } satisfies VisuallyHiddenProps, vueNormalize))
    return () => h('span', api.value.getRootProps(), slots.default?.())
  },
})

// 各组件接受的 props，与 React 同名
export type XhVisuallyHiddenProps = PropsOf<typeof XhVisuallyHidden>
