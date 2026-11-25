/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 presence 类型契约。

import type { PropTypes } from '@xihan-ui/core'

export interface PresenceProps {
  /** 是否在场。由 false 变 true 时进场；由 true 变 false 时等退场动画播完才撤下。缺省 false。 */
  present?: boolean
  /** 第一次在场之前不挂内容，缺省 true。 */
  lazyMount?: boolean
  /** 退场播完后卸掉内容，缺省 true；写 false 时内容留着、根上带 hidden。 */
  unmountOnExit?: boolean
  /** 退场动画播完、内容撤下之后通知；初始就不在场时不通知。 */
  onExitComplete?: () => void
}

export interface PresenceApi<T extends PropTypes = PropTypes> {
  present: boolean
  /**
   * 这一帧内容该不该挂着。visible 是适配器退场闸门给的「在场或还在播退场」，
   * mountedOnce 是此前是否在场过一次。
   */
  isContentMounted: (visible: boolean, mountedOnce: boolean) => boolean
  /**
   * visible 同上：退场播完才带 hidden，退场那一段还要看得见。
   * presentChanged 是 present 自挂载以来变过没有：没变过时首帧就在场的根带 data-instant 直接呈现，
   * 第一次变化起每一次进场照常播。
   */
  getRootProps: (visible: boolean, presentChanged: boolean) => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface PresenceTranslations {}
