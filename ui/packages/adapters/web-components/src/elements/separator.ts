import type { SeparatorProps } from '@xihan-ui/headless'
import { connectSeparator, separatorAnatomy, separatorMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-separator>` —— Light-DOM 行为宿主，无状态机，把 connectSeparator 产出打到三个角色节点上。
 *
 * 只写 root 就是一条线；在 root 里摆「line · content · line」三个节点，就是带分节文字的那一档。
 *
 * @customElement xh-separator
 * @attr {'horizontal'|'vertical'} orientation - 朝向，默认 horizontal
 * @attr {boolean} decorative - 装饰性分隔，仅视觉分组（role=none，退出无障碍树）
 * @attr {'default'|'subtle'|'strong'} variant - 线怎么画：默认线 / 弱线 / 强线
 * @attr {boolean} dashed - 画成虚线
 * @attr {'start'|'center'|'end'} align - 分节文字落在哪一侧，缺省居中
 * @csspart root - 承载 role/aria-orientation/data-orientation 的分隔节点；有分节文字时它是容器
 * @csspart line - 分节文字两侧的线，纯装饰
 * @csspart content - 夹在两条线中间的分节文字
 */
export class XhSeparatorElement extends XhElement {
  static override partContract = { anatomy: separatorAnatomy, meta: separatorMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    orientation: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    decorative: { type: Boolean },
    variant: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    dashed: { type: Boolean },
    align: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
  }

  declare orientation?: string
  declare decorative?: boolean
  declare variant?: string
  declare dashed?: boolean
  declare align?: string

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectSeparator({
      orientation: this.orientation as SeparatorProps['orientation'],
      decorative: this.decorative ?? false,
      variant: this.variant as SeparatorProps['variant'],
      dashed: this.dashed ?? false,
      align: this.align as SeparatorProps['align'],
    }, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 两条线共用同一份属性，逐个铺
    for (const line of this.getParts('line'))
      this.spreader.spread(line, api.getLineProps() as Record<string, unknown>)

    const content = this.getPart('content')
    if (content)
      this.spreader.spread(content, api.getContentProps() as Record<string, unknown>)
  }
}
