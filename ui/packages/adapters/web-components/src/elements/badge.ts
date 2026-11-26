/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 badge 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { BadgeApi, BadgePlacement, BadgeSchema } from '@xihan-ui/headless'
import type { KeyedChildren } from '../dom/generated-nodes'
import { badgeAnatomy, badgeMachine, badgeMeta, connectBadge } from '@xihan-ui/headless'
import { BOOLEAN_CONVERTER, NUMBER_CONVERTER, STRING_CONVERTER } from '../dom/converters'
import { createGeneratedElement, hasAuthorContent, reconcile, setText } from '../dom/generated-nodes'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/**
 * `<xh-badge>`：角标宿主。显隐与计数由属性算出，状态机只管角标出现与消失的进退场。
 *
 * 被标记的对象写入 root，角标本身写入 indicator；角标是挂在其他元素角上的标记，
 * 行内的状态药丸使用 `<xh-tag>`。
 *
 * @customElement xh-badge
 * @attr {'top-end'|'top-start'|'bottom-end'|'bottom-start'} placement - 挂在哪个角，默认 top-end
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {number} count - 计数：提供后徽标自行显示数字，超过 max 时显示为「max+」；节点已有内容时以内容为准
 * @attr {number} max - 计数上限，默认 99
 * @attr {boolean} show-zero - 计数为 0 时也显示，默认不显示
 * @attr {boolean} dot - 只显示圆点，不显示数字
 * @attr {boolean} pulse - 圆点呼吸：表达正在进行、给不出进度的状态，只在 dot 模式下生效
 * @attr {string} label - 读屏朗读该角标的方式，例如「3 条未读」
 * @csspart root - 锚点：被标记的对象放置在其中
 * @csspart indicator - 角标本身，绝对定位在 root 的某个角
 * @csspart value - 计数的数字部分，各位排在里面；indicator 空着时由元素写入
 * @csspart glyph - 数字的一位：换数时变了的那几位滚过去
 * @csspart suffix - 超过上限时数字后面的「+」
 */
export class XhBadgeElement extends XhElement {
  static override partContract = { anatomy: badgeAnatomy, meta: badgeMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    placement: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    count: { converter: NUMBER_CONVERTER },
    max: { converter: NUMBER_CONVERTER },
    showZero: { converter: BOOLEAN_CONVERTER, attribute: 'show-zero' },
    dot: { converter: BOOLEAN_CONVERTER },
    pulse: { converter: BOOLEAN_CONVERTER },
    label: { converter: STRING_CONVERTER },
  }

  declare placement?: BadgePlacement
  declare tone?: Tone
  declare size?: Size
  declare count?: number
  declare max?: number
  declare showZero?: boolean
  declare dot?: boolean
  /** 圆点呼吸：表达正在进行、给不出进度的状态。只在 dot 模式下生效。 */
  declare pulse?: boolean
  declare label?: string

  /** 逐位写出的计数节点，按 key 复用。 */
  readonly #keys: KeyedChildren = new WeakMap()

  private readonly ctrl = new MachineController<BadgeSchema>(
    this,
    badgeMachine,
    () => this.machineProps(),
  )

  // 读响应式 property，不回读 DOM 特性
  private machineProps(): Partial<BadgeSchema['props']> {
    return this.configured('badge', {
      placement: this.placement,
      tone: this.tone,
      size: this.size,
      count: this.count,
      max: this.max,
      showZero: this.showZero,
      dot: this.dot,
      pulse: this.pulse,
      label: this.label,
    })
  }

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return
    const api = connectBadge(this.ctrl.service, wcNormalize)
    this.spreader.spread(root, api.getRootProps())

    const indicator = this.getPart('indicator')
    if (!indicator)
      return
    this.spreader.spread(indicator, api.getIndicatorProps())
    // 作者自己写了内容就不动它，空着才把算好的计数逐位写进去
    if (!hasAuthorContent(indicator))
      this.paintCount(indicator, api)
  }

  /** 计数逐位排出：数字各位排进 value，「+」排在它后面；换数时在动的位换一个节点，滚动从头播。 */
  private paintCount(indicator: HTMLElement, api: BadgeApi): void {
    const doc = indicator.ownerDocument
    const paint = (reuse: Element | undefined, props: Record<string, unknown>, char?: string): Element => {
      const node = (reuse as HTMLElement | undefined) ?? createGeneratedElement(doc, 'span')
      this.spreader.spread(node, props)
      if (char !== undefined)
        setText(node, char)
      return node
    }
    const { glyphs, suffix } = api
    const top = glyphs.length || suffix ? ['value', ...(suffix ? [suffix.key] : [])] : []
    reconcile(indicator, top, this.#keys, key => key, (key, reuse) => {
      if (key !== 'value')
        return paint(reuse, api.getSuffixProps(suffix!), suffix!.char)
      const value = paint(reuse, api.getValueProps())
      reconcile(value, glyphs, this.#keys, glyph => glyph.key, (glyph, node) => paint(node, api.getGlyphProps(glyph), glyph.char))
      return value
    })
  }
}
