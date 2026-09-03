import type { GridColumnCount, GridColumnOffset, GridProps } from '@xihan-ui/headless'
import { connectGrid, gridAnatomy, gridMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/** 断点对象形态的列数，从 GridProps 上取，不在这里另抄一份档位清单。 */
type ColsByBreakpoint = Exclude<GridProps['cols'], GridColumnCount | undefined>

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
/**
 * 列数写整数就是各档同一个列数（`cols="3"`），写 JSON 对象就是逐档的列数
 * （`cols='{"base":1,"md":3}'`）。解析不出对象时当没写：落一个半截对象进去，
 * 缺的那几档会安静地退回一列，而作者看不出是哪里写坏了。
 */
const COLS_CONVERTER = {
  fromAttribute: (v: string | null) => {
    if (v === null)
      return undefined
    if (!v.trimStart().startsWith('{'))
      return Number(v) as GridColumnCount
    try {
      const parsed: unknown = JSON.parse(v)
      return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as ColsByBreakpoint)
        : undefined
    }
    catch {
      return undefined
    }
  },
}

/** 读作者写在角色节点上的数值声明：属性缺席、为空或不是数字时当作没写；取值范围由 connect 判。 */
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
 * 列数可以逐档写：`cols='{"base":1,"md":3}'` 落成 data-cols 与 data-cols-md，
 * 窄视口分一列、宽到 md 断点后分三列。
 *
 * 每一格的跨列与错列写在 item 角色节点自己的 `span` / `offset` 属性上：
 * span 收 1 至 12、offset 收 1 至 11，范围外的值按没写算。
 * 运行期改写这两个属性不触发重新接线，需作者自行 requestUpdate。
 *
 * 根上不写 role：容器只做排布，里面装的是列表还是一组卡片由作者自己声明。
 *
 * @customElement xh-grid
 * @attr {number|string} cols - 列数（1 至 12 的整数），不写或超出范围按一列排；写 JSON 对象则逐档给列数（base / sm / md / lg / xl）
 * @attr {'xs'|'sm'|'md'|'lg'|'xl'} gap - 行列间距档位，逐档对应一个间距令牌
 * @attr {'start'|'center'|'end'|'stretch'|'baseline'} align - 每一项在自己那格里的块向对齐
 * @attr {'start'|'center'|'end'|'stretch'} justify - 每一项在自己那格里的行内对齐
 * @csspart root - 排布容器，承载 data-cols（及逐档的 data-cols-sm/-md/-lg/-xl）/ data-gap / data-align / data-justify
 * @csspart item - 一格，承载自报的 data-span / data-offset
 */
export class XhGridElement extends XhElement {
  static override partContract = { anatomy: gridAnatomy, meta: gridMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    cols: { converter: COLS_CONVERTER },
    gap: { converter: STRING_CONVERTER },
    align: { converter: STRING_CONVERTER },
    justify: { converter: STRING_CONVERTER },
  }

  declare cols?: GridColumnCount | ColsByBreakpoint
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
        span: authorNumber(el, 'span') as GridColumnCount | undefined,
        offset: authorNumber(el, 'offset') as GridColumnOffset | undefined,
      })
      this.spreader.spread(el, attrs as Record<string, unknown>)
    }
  }
}
