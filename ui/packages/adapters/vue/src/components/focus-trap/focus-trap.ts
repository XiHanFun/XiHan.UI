/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 focus trap 相关实现。

import type { PropsOf } from '../../runtime/props-of'
import { defineComponent, h } from 'vue'
import { useFocusTrap } from './use-focus-trap'

export const XhFocusTrap = defineComponent({
  name: 'XhFocusTrap',
  props: {
    // 四个开关缺省都是 true：没写时留 undefined 交给机器取缺省，不被 Vue 的布尔收成 false
    active: { type: Boolean, default: undefined },
    loop: { type: Boolean, default: undefined },
    autoFocus: { type: Boolean, default: undefined },
    restoreFocus: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const { api, rootRef } = useFocusTrap(props)
    return () => h('div', { ...api.value.getRootProps(), ref: rootRef }, slots.default?.())
  },
})

// 各组件接受的 props，与 React 同名
export type XhFocusTrapProps = PropsOf<typeof XhFocusTrap>
