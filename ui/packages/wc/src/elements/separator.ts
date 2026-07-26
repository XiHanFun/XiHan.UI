import type { SeparatorProps } from '@xihan-ui/headless'
import { connectSeparator } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-separator>` —— Light-DOM 行为宿主，无状态机：朝向与语义直接来自宿主属性，
 * wire 时算 connectSeparator 打到 `[data-xh-part="root"]` 角色节点。
 *
 * @customElement xh-separator
 * @attr {'horizontal'|'vertical'} orientation - 朝向，默认 horizontal
 * @attr {boolean} decorative - 装饰性分隔，仅视觉分组（role=none，退出无障碍树）
 * @csspart root - 承载 role/aria-orientation/data-orientation 的分隔节点
 */
export class XhSeparatorElement extends XhElement {
  static override properties = {
    orientation: {},
    decorative: { type: Boolean },
  }

  declare orientation?: string
  declare decorative?: boolean

  protected wire(): void {
    const api = connectSeparator({
      orientation: (this.getAttribute('orientation') ?? undefined) as SeparatorProps['orientation'],
      decorative: this.hasAttribute('decorative'),
    }, wcNormalize)
    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
