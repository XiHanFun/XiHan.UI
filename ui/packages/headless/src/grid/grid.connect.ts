import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { GridApi, GridProps } from './grid.types'
import { gridAnatomy } from './grid.anatomy'

const parts = gridAnatomy.build()

/** 档位数落成字符串，两个适配器写到 DOM 上的值一致；没给就不写这个属性。 */
function tier(value: number | undefined): string | undefined {
  return value == null ? undefined : String(value)
}

// Grid 无状态机：二维排布不持有任何状态，列数、间距档位与两条对齐轴原样落成 data-*，
// 换算成哪条 CSS 规则由皮肤定。
// 根上不写 role：容器只做排布，里面装的是列表还是一组卡片由作者自己声明。
export function connectGrid<T extends PropTypes>(
  props: GridProps,
  normalize: NormalizeProps<T>,
): GridApi<T> {
  return {
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 列数恒有值：不写就是一列，读一眼 DOM 就知道这一层分几列
      'data-cols': tier(props.cols) ?? '1',
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
