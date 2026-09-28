/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 truncate 相关实现。

import type { IdGenerator, Service } from '@xihan-ui/core'
import type { TruncateOpenChangeDetails, TruncateOverflowChangeDetails, TruncatePosition, TruncateSchema, TruncateTranslations } from '@xihan-ui/headless'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { connectTruncate, truncateAnatomy, truncateMachine, truncateMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态：属性缺席 = 非受控，写了才是受控的那个布尔。
const TRISTATE_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-truncate>`：省略行为宿主：把一段文字限制在给定行数内，并如实报告是否被裁剪。
 *
 * 测量在状态机的效应中运行：挂载后推迟一拍测量一次，此后随盒子尺寸与盒内文字的变化重新测量。
 * 结论写为 root 上的 data-overflowing，浮层不在这里处理：是否附加提示由作者按该属性决定。
 * 开启 tooltip 则另提供一条不使用浮层的路径：实际裁剪时才把整段文字写进 root 的 title，交给平台的原生提示。
 *
 * 行数写在 root 的内联 style 中（自定义属性只有这一条路径能同时落到各适配器上），
 * 因此 root 的内联 style 归本元素管理，作者自己的内联样式写在外层元素上。
 *
 * 展开按钮是 root 之外的另一个角色节点（放进 root 会跟着文字一起被裁掉）：作者写一个
 * `<button data-xh-part="trigger">` 与 root 并排；它留空时元素按展开态写入缺省文案，写了内容则原样保留。
 *
 * @customElement xh-truncate
 * @attr {number} lines - 截断行数，1 为单行，默认 1
 * @attr {'end'|'middle'} position - 省略号落在哪，默认 end；middle 只对单行生效
 * @attr {boolean} expandable - 在文字旁放一颗展开 / 收起全文的按钮（trigger 部件）
 * @attr {boolean} open - 受控展开；未提供该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {boolean} tooltip - 实际裁掉内容时才把整段文字交给平台的原生提示
 * @fires open-change - 展开状态变化；detail 为 `{ open: boolean }`
 * @fires overflow-change - 溢出结论翻转；detail 为 `{ overflowing: boolean }`
 * @csspart root - 截断文字的盒子，承载 data-lines / data-multiline / data-expandable / data-state / data-overflowing / data-position / data-middle-text
 * @csspart trigger - 展开 / 收起全文的按钮，与 root 并排；没东西可展开时收起不占位
 */
export class XhTruncateElement extends XhElement {
  static override partContract = { anatomy: truncateAnatomy, meta: truncateMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    lines: { converter: NUMBER_CONVERTER },
    position: { converter: STRING_CONVERTER },
    expandable: { type: Boolean },
    open: { converter: TRISTATE_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    tooltip: { type: Boolean },
    // 文案是对象，只走 property
    translations: { attribute: false },
  }

  declare lines?: number
  declare position?: TruncatePosition
  declare expandable?: boolean
  declare open?: boolean
  declare defaultOpen?: boolean
  declare tooltip?: boolean
  declare translations?: Partial<TruncateTranslations>

  // 展开按钮以 aria-controls 指回文字盒子，id 要按实例派生
  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly truncateScope = createScope(this, this.idGen)
  /** 作者自己往展开按钮里写了内容：那就原样保留，不拿缺省文案去盖。首见即定。 */
  private readonly authoredTrigger = new WeakMap<HTMLElement, boolean>()

  private readonly notifyOpen = (details: TruncateOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyOverflow = (details: TruncateOverflowChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('overflow-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<TruncateSchema>(
    this,
    truncateMachine,
    () => this.machineProps(),
    { scope: this.truncateScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<TruncateSchema['props']> {
    return this.configured('truncate', {
      lines: this.lines,
      position: this.position,
      expandable: this.expandable ?? false,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      tooltip: this.tooltip ?? false,
      translations: this.translations,
      onOpenChange: this.notifyOpen,
      onOverflowChange: this.notifyOverflow,
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  // 取值口惰性读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着。
  private injectRefs(svc: Service<TruncateSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
  }

  protected wire(): void {
    const api = connectTruncate(this.ctrl.service, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    const trigger = this.getPart('trigger')
    if (trigger) {
      this.spreader.spread(trigger, api.getTriggerProps() as Record<string, unknown>)
      if (!this.authoredTrigger.has(trigger))
        this.authoredTrigger.set(trigger, (trigger.textContent ?? '').trim() !== '' || trigger.children.length > 0)
      if (!this.authoredTrigger.get(trigger) && trigger.textContent !== api.triggerLabel)
        trigger.textContent = api.triggerLabel
    }
  }
}
