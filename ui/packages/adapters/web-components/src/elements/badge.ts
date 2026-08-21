import type { BadgeProps, BadgeVariant } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import { badgeAnatomy, badgeMeta, connectBadge } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-badge>` —— 徽标展示宿主，无状态机，外观来自 variant 属性。
 *
 * @customElement xh-badge
 * @attr {'solid'|'subtle'|'outline'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {number} count - 计数：给了它徽标就自己出数字，超过 max 写成「max+」；节点已有内容时以内容为准
 * @attr {number} max - 计数上限，默认 99
 * @attr {boolean} show-zero - 计数为 0 时也显示，默认不显示
 * @attr {boolean} dot - 只出一个点，不出数字
 * @attr {string} label - 读屏怎么念这枚徽标，例如「3 条未读」
 * @csspart root - 承载 data-scope/data-part/data-* 的展示节点
 */
export class XhBadgeElement extends XhElement {
  static override partContract = { anatomy: badgeAnatomy, meta: badgeMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    variant: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    tone: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    size: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    count: { converter: { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) } },
    max: { converter: { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) } },
    showZero: { type: Boolean, attribute: 'show-zero' },
    dot: { type: Boolean },
    label: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
  }

  declare variant?: BadgeVariant
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
    const api = connectBadge({
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      count: this.count,
      max: this.max,
      showZero: this.showZero,
      dot: this.dot,
      label: this.label,
    } as BadgeProps, wcNormalize)
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    // 作者自己写了内容就不动它，空着才把算好的计数填进去
    if (api.text && !root.textContent?.trim())
      root.textContent = api.text
  }
}
