/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 作者在模板或 h() 上写没写过某个 prop。

import { getCurrentInstance } from 'vue'

/** 驼峰 prop 名在模板里的短横线写法。 */
function hyphenate(key: string): string {
  return key.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}

/**
 * 读当前组件这一帧收到的原始 props，驼峰与短横线两种写法都认；只能在 setup 期调用。
 * Vue 的裸 Boolean 没传也是 false、声明了 default 的没传就是那个缺省值，只看值分不出「没写」，
 * 组件级缺省要按这一条判。不在组件里调用时一律当没写过。
 */
export function usePropIsSet(): (key: string) => boolean {
  const instance = getCurrentInstance()
  return (key) => {
    const raw = instance?.vnode.props
    return !!raw && (key in raw || hyphenate(key) in raw)
  }
}
