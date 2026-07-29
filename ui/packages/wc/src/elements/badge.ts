import type { BadgeProps } from '@xihan-ui/headless'
import { connectBadge } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-badge>` —— 徽标展示宿主，无状态机，外观来自 variant 属性。
 *
 * @customElement xh-badge
 * @attr {'solid'|'subtle'|'outline'} variant - 视觉变体
 * @csspart root - 承载 data-scope/data-part/data-variant 的展示节点
 */
export class XhBadgeElement extends XhElement {
  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    variant: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
  }

  declare variant?: string

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return
    // 读响应式 property，不回读 DOM 特性
    const api = connectBadge({ variant: this.variant } as BadgeProps, wcNormalize)
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
