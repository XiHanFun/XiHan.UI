import type { SeparatorProps } from '@xihan-ui/headless'
import { connectSeparator } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-separator>` —— Light-DOM 行为宿主，无状态机，把 connectSeparator 产出打到 root 角色节点。
 *
 * @customElement xh-separator
 * @attr {'horizontal'|'vertical'} orientation - 朝向，默认 horizontal
 * @attr {boolean} decorative - 装饰性分隔，仅视觉分组（role=none，退出无障碍树）
 * @csspart root - 承载 role/aria-orientation/data-orientation 的分隔节点
 */
export class XhSeparatorElement extends XhElement {
  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    orientation: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    decorative: { type: Boolean },
  }

  declare orientation?: string
  declare decorative?: boolean

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectSeparator({
      orientation: this.orientation as SeparatorProps['orientation'],
      decorative: this.decorative ?? false,
    }, wcNormalize)
    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
