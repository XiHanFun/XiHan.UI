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
 * @csspart root - 承载 data-scope/data-part/data-* 的展示节点
 */
export class XhBadgeElement extends XhElement {
  static override partContract = { anatomy: badgeAnatomy, meta: badgeMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    variant: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    tone: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    size: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
  }

  declare variant?: BadgeVariant
  declare tone?: Tone
  declare size?: Size

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return
    // 读响应式 property，不回读 DOM 特性
    const api = connectBadge({ variant: this.variant, tone: this.tone, size: this.size } as BadgeProps, wcNormalize)
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
