import type { IconWrapperProps } from '@xihan-ui/headless'
import { connectIconWrapper, iconWrapperAnatomy, iconWrapperMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-icon-wrapper>` —— Light-DOM 行为宿主，无状态机，把 connectIconWrapper 产出打到 root 角色节点。
 *
 * 根上不写 role、也不写 aria-hidden：里面那个图元是装饰还是信息，由作者按用途声明。
 *
 * @customElement xh-icon-wrapper
 * @attr {'solid'|'subtle'|'outline'|'ghost'} variant - 形态，决定底色、描边与前景怎么用
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气，决定用哪族颜色
 * @attr {'sm'|'md'|'lg'} size - 尺寸，决定底座直径与里面图元的直径
 * @csspart root - 底座容器，承载 data-variant / data-tone / data-size
 */
export class XhIconWrapperElement extends XhElement {
  static override partContract = { anatomy: iconWrapperAnatomy, meta: iconWrapperMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    variant: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    tone: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    size: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
  }

  declare variant?: string
  declare tone?: string
  declare size?: string

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectIconWrapper({
      variant: this.variant,
      tone: this.tone,
      size: this.size,
    } satisfies IconWrapperProps, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
