/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 浮层按需块：浮层第一次打开时才用得上的那几件，由 kernel/overlay-kit 的加载器 import()。
//
// 只从这里静态引入它们；浮层那一侧要用经 overlayKit() / whenOverlayKit() 取，
// 直接从主入口引就又被同步拉回首屏。主入口照旧导出这几件，不走浮层的调用方（布局的 Escape 后备、
// 字段数组的列表动效、Vue/React 的 behavior 子路径）不受影响。

import { trackListMotion } from './behavior/arrival/list-motion'
import { createDismissLayer } from './behavior/dismissable-layer'
import { createFocusScope } from './behavior/focus-scope'
import { acquireScrollLock } from './behavior/scroll-lock'
import { hideOutside } from './kernel/capability/a11y/hide-outside'
import { createPortalVisualBridge } from './kernel/structure/portal-visual-bridge'

export const overlayKit = Object.freeze({
  /** 消解层：Escape 与层外交互的判定。 */
  createDismissLayer,
  /** 焦点域：初始落焦、陷焦点与归还。 */
  createFocusScope,
  /** 模态浮层的滚动锁。 */
  acquireScrollLock,
  /** 模态浮层的背景失活：背景对读屏隐藏。 */
  hideOutside,
  /** Portal 视觉桥：把来源的密度、方向、主题投到落点的壳上。 */
  createPortalVisualBridge,
  /** 多选标签行的到达、离场与换位。 */
  trackListMotion,
})
