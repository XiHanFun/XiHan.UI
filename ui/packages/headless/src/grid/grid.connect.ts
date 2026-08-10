import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { GridApi, GridBreakpoint, GridCols, GridColsByBreakpoint, GridProps } from './grid.types'
import { gridAnatomy } from './grid.anatomy'

const parts = gridAnatomy.build()

/** 断点档位，自窄到宽。 */
const BREAKPOINTS: readonly GridBreakpoint[] = ['sm', 'md', 'lg', 'xl']

/** 档位数落成字符串，两个适配器写到 DOM 上的值一致；没给就不写这个属性。 */
function tier(value: number | undefined): string | undefined {
  return value == null ? undefined : String(value)
}

/**
 * 列数落成属性：给整数或不给时只写 data-cols；给断点对象时 base 写 data-cols、
 * 其余各档写 data-cols-<档>，没写的档不写属性。
 */
function colsAttrs(cols: GridCols | undefined): Record<string, string | undefined> {
  const byTier: GridColsByBreakpoint = cols != null && typeof cols === 'object' ? cols : { base: cols }
  const attrs: Record<string, string | undefined> = {
    // 列数恒有值：不写就是一列，读一眼 DOM 就知道这一层分几列
    'data-cols': tier(byTier.base) ?? '1',
  }
  for (const name of BREAKPOINTS)
    attrs[`data-cols-${name}`] = tier(byTier[name])
  return attrs
}

// Grid 无状态机：二维排布不持有任何状态，列数、间距档位与两条对齐轴原样落成 data-*，
// 换算成哪条 CSS 规则由皮肤定。列数按断点分档时也只是多落几个 data-cols-<档>，
// 哪一档在多宽的视口上接管由皮肤的媒体查询定，这里不量视口。
// 根上不写 role：容器只做排布，里面装的是列表还是一组卡片由作者自己声明。
export function connectGrid<T extends PropTypes>(
  props: GridProps,
  normalize: NormalizeProps<T>,
): GridApi<T> {
  return {
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      ...colsAttrs(props.cols),
      'data-gap': props.gap,
      'data-align': props.align,
      'data-justify': props.justify,
    }),

    // 跨列与错列是每一格自报的声明，都不写就按文档序占一格
    getItemProps: (item = {}) => normalize.element({
      ...parts.item.attrs,
      'data-span': tier(item.span),
      'data-offset': tier(item.offset),
    }),
  }
}
