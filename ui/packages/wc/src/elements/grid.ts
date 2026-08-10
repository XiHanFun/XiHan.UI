import type { GridProps } from '@xihan-ui/headless'
import { connectGrid, gridAnatomy, gridMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }

/** 读作者写在角色节点上的数值声明：属性缺席、为空或不是数字时当作没写。 */
function authorNumber(el: HTMLElement, name: string): number | undefined {
  const raw = el.getAttribute(name)
  if (raw == null || raw.trim() === '')
    return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}

/**
 * `<xh-grid>` —— Light-DOM 行为宿主，无状态机，把 connectGrid 产出打到 root 与各 item 角色节点。
 * 列数、间距档位与两条对齐轴原样落成 data-*，排布规则写在皮肤里。
 *
 * 每一格的跨列与错列写在 item 角色节点自己的 `span` / `offset` 属性上。
 * 运行期改写这两个属性不触发重新接线，需作者自行 requestUpdate。
 *
 * 根上不写 role：容器只做排布，里面装的是列表还是一组卡片由作者自己声明。
 *
 * @customElement xh-grid
 * @attr {number} cols - 列数（1–12），不写按一列排
 * @attr {'xs'|'sm'|'md'|'lg'|'xl'} gap - 行列间距档位，逐档对应一个间距令牌
 * @attr {'start'|'center'|'end'|'stretch'|'baseline'} align - 每一项在自己那格里的块向对齐
 * @attr {'start'|'center'|'end'|'stretch'} justify - 每一项在自己那格里的行内对齐
 * @csspart root - 排布容器，承载 data-cols / data-gap / data-align / data-justify
 * @csspart item - 一格，承载自报的 data-span / data-offset
 */
export class XhGridElement extends XhElement {
  static override partContract = { anatomy: gridAnatomy, meta: gridMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    cols: { converter: NUMBER_CONVERTER },
    gap: { converter: STRING_CONVERTER },
    align: { converter: STRING_CONVERTER },
    justify: { converter: STRING_CONVERTER },
  }

  declare cols?: number
  declare gap?: string
  declare align?: string
  declare justify?: string

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectGrid({
      cols: this.cols,
      gap: this.gap as GridProps['gap'],
      align: this.align as GridProps['align'],
      justify: this.justify as GridProps['justify'],
    } satisfies GridProps, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 多实例 part 逐个打，每一格的占位取作者写的 span 与 offset
    for (const el of this.getParts('item')) {
      const attrs = api.getItemProps({
        span: authorNumber(el, 'span'),
        offset: authorNumber(el, 'offset'),
      })
      this.spreader.spread(el, attrs as Record<string, unknown>)
    }
  }
}
