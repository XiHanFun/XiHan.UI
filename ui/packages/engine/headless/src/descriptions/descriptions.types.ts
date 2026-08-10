import type { PropTypes } from '@xihan-ui/kernel'

/** 每行摆几组「标签 + 取值」。皮肤逐档给出列数，一到六列。 */
export type DescriptionsColumns = 1 | 2 | 3 | 4 | 5 | 6

/** 标签相对取值的位置：top 标签在上、left 标签在左。 */
export type DescriptionsPlacement = 'top' | 'left'

/** 尺寸档位，只改每格的内边距、组与组的间距与整体字号。 */
export type DescriptionsSize = 'sm' | 'md' | 'lg'

export interface DescriptionsProps {
  /** 每行摆几组，一到六列；不写即每行一组。 */
  columns?: DescriptionsColumns
  /** 外框：给整份描述画一圈描边，并在格与格之间画网格线。 */
  bordered?: boolean
  /** 标签的位置：top / left；不写即标签在上。 */
  placement?: DescriptionsPlacement
  /** 尺寸：sm / md / lg。 */
  size?: DescriptionsSize
}

export interface DescriptionsApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getItemProps: () => T['element']
  getLabelProps: () => T['element']
  getValueProps: () => T['element']
}
