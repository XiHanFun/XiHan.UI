/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 collapsible 相关实现。

import type { Direction, IdGenerator, RuntimeConfig, Size, Tone } from '@xihan-ui/core'
import type { CollapsibleOpenChangeDetails, CollapsibleSchema } from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { collapsibleAnatomy, collapsibleMachine, collapsibleMeta, connectCollapsible } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { createOverlayExit } from '../overlay-exit'
import { LazyContent } from '../runtime/lazy-content'
import { MachineController } from '../runtime/machine-controller'

/**
 * `<xh-collapsible>`：Light-DOM 行为宿主，运行 collapsible 状态机并接到 root / trigger / content / indicator
 * 角色节点，收起时用内联 style.display 隐藏 content。
 *
 * @customElement xh-collapsible
 * @attr {boolean} open - 受控开合；未提供该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {boolean} disabled - 禁用 trigger 切换
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {'ltr'|'rtl'} dir - 文字方向，写到 root 上；未提供时继承祖先
 * @attr {boolean} lazy-mount - 内容第一次展开时才挂载；内容写在 content 里的一个 `<template>` 中时首次展开才实例化
 * @attr {boolean} unmount-on-exit - 收起动画播完后卸载内容，再展开时从 `<template>` 重新克隆（没写模板时原样放回）
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 披露根容器
 * @csspart header - 触发器与其同排内容所在的行，可省略
 * @csspart trigger - 触发按钮（aria-expanded / aria-controls 所在）
 * @csspart content - 可折叠内容（收起时隐藏）
 * @csspart indicator - 开合方向标记（展开时转向）
 */
export class XhCollapsibleElement extends XhElement {
  private exit: OverlayExit | null = null
  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly collapsibleScope = createScope(null, this.idGen)
  private config: RuntimeConfig | null = null

  // 退场闸门要一份运行期配置来问减弱动效偏好；本组件不入层栈，所以只建这一样
  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.collapsibleScope, idGenerator: this.idGen })
  }

  static override partContract = { anatomy: collapsibleAnatomy, meta: collapsibleMeta }

  static override properties = {
    open: { converter: { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') } },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    disabled: { type: Boolean },
    tone: {},
    size: {},
    // property 另起名字，避开 HTMLElement 自带的 dir 存取器
    textDir: { attribute: 'dir' },
    lazyMount: { type: Boolean, attribute: 'lazy-mount' },
    unmountOnExit: { type: Boolean, attribute: 'unmount-on-exit' },
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare disabled?: boolean
  declare tone?: Tone
  declare size?: Size
  declare textDir?: Direction
  declare lazyMount?: boolean
  declare unmountOnExit?: boolean

  /** content 里内容的挂卸落点。 */
  private readonly lazyContent = new LazyContent()

  private readonly notify = (details: CollapsibleOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<CollapsibleSchema>(
    this,
    collapsibleMachine,
    () => this.machineProps(),
  )

  private machineProps(): Partial<CollapsibleSchema['props']> {
    return {
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      disabled: this.disabled ?? false,
      tone: this.tone,
      size: this.size,
      dir: this.textDir,
      lazyMount: this.lazyMount ?? false,
      unmountOnExit: this.unmountOnExit ?? false,
      onOpenChange: this.notify,
    }
  }

  protected wire(): void {
    const svc = this.ctrl.service
    const api = connectCollapsible(svc, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('header', api.getHeaderProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('indicator', api.getIndicatorProps() as Record<string, unknown>)

    // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
    // 就一帧都播不出来），真正的收起在动画结束后落成内联 display
    const content = this.getPart('content')
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      open: api.open,
      onExitComplete: () => this.requestUpdate(),
    })
    this.exit.track(content)
    this.exit.update(api.open)
    if (content)
      this.setPartHidden(content, !this.exit.visible)
    this.lazyContent.sync(content, api.isContentMounted(this.exit.visible))
  }
}
