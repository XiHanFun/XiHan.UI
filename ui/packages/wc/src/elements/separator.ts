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
  // 属性缺席翻成 undefined，让 connect 那边的缺省只有一份
  static override properties = {
    orientation: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    decorative: { type: Boolean },
  }

  declare orientation?: string
  declare decorative?: boolean

  protected wire(): void {
    // 读声明好的响应式属性，不回读 DOM 特性：作者与框架绑定（Vue 的 :prop、Lit 的 .prop）
    // 走的都是 property 这条路，回读特性会让那条路完全空转——赋值只排一轮更新、产出不变。
    const api = connectSeparator({
      orientation: this.orientation as SeparatorProps['orientation'],
      decorative: this.decorative ?? false,
    }, wcNormalize)
    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
