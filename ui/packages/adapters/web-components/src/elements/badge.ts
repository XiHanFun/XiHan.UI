import type { Size, Tone } from '@xihan-ui/core'
import type { BadgePlacement, BadgeProps } from '@xihan-ui/headless'
import { badgeAnatomy, badgeMeta, connectBadge } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-badge>` —— 角标宿主，无状态机。
 *
 * 被标记的东西写进 root，角标本身写进 indicator；角标是挂在别的元素角上的一枚标记，
 * 行内的状态药丸请用 `<xh-tag>`。
 *
 * @customElement xh-badge
 * @attr {'top-end'|'top-start'|'bottom-end'|'bottom-start'} placement - 挂在哪个角上，默认 top-end
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {number} count - 计数：给了它徽标就自己出数字，超过 max 写成「max+」；节点已有内容时以内容为准
 * @attr {number} max - 计数上限，默认 99
 * @attr {boolean} show-zero - 计数为 0 时也显示，默认不显示
 * @attr {boolean} dot - 只出一个点，不出数字
 * @attr {string} label - 读屏怎么念这枚角标，例如「3 条未读」
 * @csspart root - 锚点：被标记的那个东西放进它里面
 * @csspart indicator - 角标本身，绝对定位在 root 的某个角上
 */
export class XhBadgeElement extends XhElement {
  static override partContract = { anatomy: badgeAnatomy, meta: badgeMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    placement: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    tone: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    size: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    count: { converter: { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) } },
    max: { converter: { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) } },
    showZero: { type: Boolean, attribute: 'show-zero' },
    dot: { type: Boolean },
    label: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
  }

  declare placement?: BadgePlacement
  declare tone?: Tone
  declare size?: Size
  declare count?: number
  declare max?: number
  declare showZero?: boolean
  declare dot?: boolean
  declare label?: string

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return
    // 读响应式 property，不回读 DOM 特性
    const api = connectBadge(this.configured('badge', {
      placement: this.placement,
      tone: this.tone,
      size: this.size,
      count: this.count,
      max: this.max,
      showZero: this.showZero,
      dot: this.dot,
      label: this.label,
    } as BadgeProps), wcNormalize)
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    const indicator = this.getPart('indicator')
    if (!indicator)
      return
    this.spreader.spread(indicator, api.getIndicatorProps() as Record<string, unknown>)
    // 作者自己写了内容就不动它，空着才把算好的计数填进去
    if (api.text && !indicator.textContent?.trim())
      indicator.textContent = api.text
  }
}
