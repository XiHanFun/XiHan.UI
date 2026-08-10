import type { TypographyProps } from '@xihan-ui/headless'
import { connectTypography, typographyAnatomy, typographyMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/** 读作者写在角色节点上的声明；属性缺席即 undefined。 */
function authorValue(el: HTMLElement, name: string): string | undefined {
  return el.getAttribute(name) ?? undefined
}

/**
 * `<xh-typography>` —— Light-DOM 行为宿主，无状态机，把 connectTypography 产出打到各角色节点。
 *
 * 标签全由作者写：`<h2 data-xh-part="heading">`、`<p data-xh-part="paragraph">`、
 * `<span data-xh-part="text">`、`<a data-xh-part="link">`，皮肤认的是 data-scope + data-part。
 * 标题的字号档位取节点上的 `level`，行内文字的形态与语气取节点上的 `variant` 与 `tone`。
 * 运行期改写这三个属性不触发重新接线，需作者自行 requestUpdate。
 *
 * @customElement xh-typography
 * @attr {'sm'|'md'|'lg'} size - 尺寸，整块正文的字号与段间距跟着换档
 * @csspart root - 正文块容器，管段间距与最大行宽，承载 data-size
 * @csspart heading - 标题，写 level="1".."6" 换字号档位
 * @csspart paragraph - 段落
 * @csspart text - 行内文字，写 variant="muted|strong|code" 换形态、tone 换语气色
 * @csspart link - 行内链接
 */
export class XhTypographyElement extends XhElement {
  static override partContract = { anatomy: typographyAnatomy, meta: typographyMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    size: { converter: STRING_CONVERTER },
  }

  declare size?: string

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectTypography({ size: this.size } satisfies TypographyProps, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 四类内容部件都能有多份，逐个打；档位、形态、语气取作者写在各自节点上的声明
    for (const el of this.getParts('heading')) {
      const attrs = api.getHeadingProps({ level: authorValue(el, 'level') })
      this.spreader.spread(el, attrs as Record<string, unknown>)
    }

    for (const el of this.getParts('paragraph'))
      this.spreader.spread(el, api.getParagraphProps() as Record<string, unknown>)

    for (const el of this.getParts('text')) {
      const attrs = api.getTextProps({
        tone: authorValue(el, 'tone'),
        variant: authorValue(el, 'variant'),
      })
      this.spreader.spread(el, attrs as Record<string, unknown>)
    }

    for (const el of this.getParts('link'))
      this.spreader.spread(el, api.getLinkProps() as Record<string, unknown>)
  }
}
