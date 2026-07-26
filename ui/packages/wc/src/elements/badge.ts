import type { BadgeProps } from '@xihan-ui/headless'
import { connectBadge } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-badge>` —— Light-DOM 行为宿主，无状态机：纯展示，外观全部来自 variant 属性，
 * wire 时算 connectBadge 打到 `[data-xh-part="root"]` 角色节点。
 *
 * @customElement xh-badge
 * @attr {'solid'|'subtle'|'outline'} variant - 视觉变体
 * @csspart root - 承载 data-scope/data-part/data-variant 的展示节点
 */
export class XhBadgeElement extends XhElement {
  static override properties = {
    variant: {},
  }

  declare variant?: string

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return
    const api = connectBadge({
      variant: this.getAttribute('variant') ?? undefined,
    } as BadgeProps, wcNormalize)
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
