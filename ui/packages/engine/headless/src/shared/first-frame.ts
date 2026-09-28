/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 浮层的首帧：挂载时已经打开的浮层直接呈现，不播进场。
//
// 首帧规则：初始渲染时已在的内容直接呈现，只有用户操作或新数据带来的出现才播进场。浮层的进场写在
// [data-state='open'] 上，挂载时就开着（defaultOpen，或受控 open 的初值为 true）的那一次也会跟着播，
// 页面一打开就看见面板从锚点弹出来。
//
// 机器在 context 里记一格 openedAtMount：初值取挂载时开着没有，进入收起态时清掉。connect 把它投影成
// content（以及带进场的遮罩、定位层、聚光框）上的 data-instant，皮肤把进场写在 :not([data-instant]) 下。
// 退场写在 [data-state='closed'] 上、不看这个标记，第一次收起照常播；清掉之后的每一次打开都是用户操作
// 带来的，照常进场。标记只在开着的那一段里出现，打开途中不会被撤——撤掉就等于把进场动画补播一遍。

import type { Bindable, ReactiveRuntime } from '@xihan-ui/core'

/** 挂载时开没开的通用判据：受控 open 压过 defaultOpen。机器的 initialState 与首帧标记取同一份。 */
export function openAtMount(prop: (key: 'open' | 'defaultOpen') => boolean | undefined): boolean {
  return !!(prop('open') ?? prop('defaultOpen'))
}

/** 记首帧的那一格（context 的 openedAtMount）：初值取挂载时是否打开，与机器的 initialState 同一个判据。 */
export function openedAtMountCell(cell: ReactiveRuntime['cell'], open: boolean): Bindable<boolean> {
  return cell<boolean>(() => ({ defaultValue: open }))
}

/**
 * 写在收起态的 entry 上：第一次收起即清掉首帧标记。挂载即收起时这是空操作。
 * 分几段收起的机器（先等延时再收）写在内容真正落成收起的那一态上，不写在等待态上。
 */
export function clearOpenedAtMount(params: { context: { set: (key: 'openedAtMount', value: boolean) => void } }): void {
  params.context.set('openedAtMount', false)
}
