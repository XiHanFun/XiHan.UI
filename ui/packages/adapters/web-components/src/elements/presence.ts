/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 presence 相关实现。

import type { ExitGate } from '@xihan-ui/core/presence'
import type { PresenceProps } from '@xihan-ui/headless'
import { createExitGate } from '@xihan-ui/core/presence'
import { connectPresence, presenceAnatomy, presenceMeta } from '@xihan-ui/headless'
import { BOOLEAN_CONVERTER } from '../dom/converters'
import { emitEvent } from '../dom/emit-event'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { withoutHidden } from '../overlay-exit'
import { LazyContent } from '../runtime/lazy-content'

/**
 * `<xh-presence>`：Light-DOM 行为宿主，无状态机，让 root 里的内容按 present 进场与退场。
 * 退场动画播完才藏起 root、撤下内容，之后派发 exit-complete；元素不生成任何结构。
 *
 * Light DOM 下元素不能真的销毁作者写的节点，「挂上」与「卸掉」落在 root 的子节点上，与 Collapsible 的 content 同一套：
 * 内容写在 root 里的一个 `<template>` 中时，解析时不实例化，该挂上时克隆一份放进 root，卸掉时连同克隆一起拿掉，
 * 再挂上时重新克隆（里面的状态随之清空）；没写模板时内容节点原样摘进一个游离片段暂存，该挂上时放回（节点还是那几个，
 * 输入的内容跟着回来）。root 本身始终留在原处，不在场时带 hidden 与内联 `display: none`。
 *
 * @customElement xh-presence
 * @attr {boolean} present - 是否在场，缺省 false；变 false 时等退场动画播完才藏起 root、撤下内容
 * @attr {boolean} lazy-mount - 第一次在场之前不挂内容，缺省为真；与 unmount-on-exit="false" 同写 lazy-mount="false" 时内容从一开始就挂着，不在场时随 root 一起藏起
 * @attr {boolean} unmount-on-exit - 退场播完后卸掉内容，缺省为真；写 unmount-on-exit="false" 时内容留着、root 只带 hidden
 * @fires exit-complete - 退场动画播完、内容撤下之后派发，没有 detail；初始就不在场时不派发
 * @csspart root - 进出场的那一块，内容写在它里面；承载 data-state（open / closed）、data-instant 与 hidden
 */
export class XhPresenceElement extends XhElement {
  static override partContract = { anatomy: presenceAnatomy, meta: presenceMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。三个都是三态布尔：不写取缺省，写 ="false" 才算假
  static override properties = {
    present: { converter: BOOLEAN_CONVERTER },
    lazyMount: { converter: BOOLEAN_CONVERTER, attribute: 'lazy-mount' },
    unmountOnExit: { converter: BOOLEAN_CONVERTER, attribute: 'unmount-on-exit' },
  }

  declare present?: boolean
  declare lazyMount?: boolean
  declare unmountOnExit?: boolean

  private exit: ExitGate | null = null
  /** root 里内容的挂卸落点。 */
  private readonly lazyContent = new LazyContent()
  /** 第一次接线时的在场与否；之后 present 一变即算变过。 */
  private initialPresent: boolean | undefined
  /** present 变过没有：交给 connect 判首帧就在场的那一段直接呈现。 */
  private moved = false
  /** 在场过一次：lazyMount 只拦第一次在场之前那一段。 */
  private mountedOnce = false
  /** 退场已播完、还没派发 exit-complete：等这一轮把内容撤下之后再发。 */
  private exitPending = false

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return

    // 读响应式 property，不回读 DOM 特性
    // 没有状态机，全局配置（组件级缺省）在这里并进来
    const api = connectPresence(this.configured('presence', {
      present: this.present,
      lazyMount: this.lazyMount,
      unmountOnExit: this.unmountOnExit,
    } satisfies PresenceProps), wcNormalize)

    this.initialPresent ??= api.present
    if (api.present !== this.initialPresent)
      this.moved = true
    if (api.present)
      this.mountedOnce = true

    // 收起跟着退场闸门走：connect 给的 hidden 跟着 present 走，这里摘掉，等闸门定案才由 setPartHidden 写。
    // 宿主的 [hidden]{display:none!important} 压得过皮肤，hidden 跟着 present 走退场就一帧都播不出来
    this.spreader.spread(root, withoutHidden(api.getRootProps(true, this.moved)))

    // data-state 已写进 DOM，再驱动闸门：退场探测读到的才是这一次的动画
    this.exit ??= createExitGate({
      open: api.present,
      onExitComplete: () => {
        this.exitPending = true
        this.requestUpdate()
      },
    })
    this.exit.track(root)
    this.exit.update(api.present)
    const visible = this.exit.visible
    this.setPartHidden(root, !visible, { attribute: true })
    this.lazyContent.sync(root, api.isContentMounted(visible, this.mountedOnce))

    // 播完之后、这一轮之前又回到在场：内容一直没撤下，这次退场不算完成
    if (this.exitPending) {
      this.exitPending = false
      if (!visible)
        emitEvent(this, 'exit-complete')
    }
  }
}
