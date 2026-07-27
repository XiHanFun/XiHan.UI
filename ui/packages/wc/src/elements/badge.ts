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
  // 属性缺席翻成 undefined，让 connect 那边的缺省只有一份
  static override properties = {
    variant: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
  }

  declare variant?: string

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return
    // 读声明好的响应式属性，不回读 DOM 特性：框架绑定走的是 property 这条路，
    // 回读特性会让它空转；而且一旦先写过 property，之后再写同值 attribute
    // 会被 Lit 的 hasChanged 吞掉，从此再也改不动
    const api = connectBadge({ variant: this.variant } as BadgeProps, wcNormalize)
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
