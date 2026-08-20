import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { MasonryApi, MasonryProps } from './masonry.types'
import { dataAttr } from '@xihan-ui/kernel'
import { masonryAnatomy } from './masonry.anatomy'

const parts = masonryAnatomy.build()

// Masonry 无状态机：分几列、每一项落哪一列都要先量到高度，量测与分配归适配器，
// connect 只把结果如实落成属性。列数不落到根上——有几个 column 角色节点就是几列。
// 根上不写 role：容器只做排布，里面装的是列表还是一组卡片由作者自己声明。
export function connectMasonry<T extends PropTypes>(
  props: MasonryProps,
  normalize: NormalizeProps<T>,
): MasonryApi<T> {
  return {
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-gap': props.gap,
      'data-sequential': dataAttr(props.sequential),
    }),

    // 列只报自己排第几，宽度由皮肤等分
    getColumnProps: column => normalize.element({
      ...parts.column.attrs,
      'data-index': String(column.index),
    }),

    // 项报原序与落点：重排后 DOM 序等于列序，原序只剩 data-index 认得出来，量高度要靠它对上号
    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      'data-index': String(item.index),
      'data-column': String(item.column),
    }),
  }
}
