import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { DescriptionsApi, DescriptionsItemProps, DescriptionsProps } from './descriptions.types'
import { dataAttr } from '@xihan-ui/core'
import { descriptionsAnatomy } from './descriptions.anatomy'

const parts = descriptionsAnatomy.build()

// Descriptions 无状态机：一组只读的「标签 + 取值」，属性全部由 props 算出。
// 各部件都不写 role：标签与取值的配对关系靠作者写的标签表达（dl 里的 dt / dd 天然成对），
// 组件只给身份与排版。
export function connectDescriptions<T extends PropTypes>(
  props: DescriptionsProps,
  normalize: NormalizeProps<T>,
): DescriptionsApi<T> {
  // 三个轴与一个开关只落在根上，每格从这里继承私有槽，子部件不重复标注
  const rootAttrs = {
    ...parts.root.attrs,
    // 列数如实落成字符串，两个适配器写到 DOM 上的值一致
    'data-columns': props.columns == null ? undefined : String(props.columns),
    'data-placement': props.placement,
    'data-size': props.size,
    'data-bordered': dataAttr(props.bordered),
  }

  // 跨列数钳进 1 到当前列数之间；列数没给即整份只有一列，跨列无从谈起
  const columns = props.columns ?? 1
  const spanOf = (item?: DescriptionsItemProps): number | undefined => {
    if (item?.span == null)
      return undefined
    return Math.min(Math.max(Math.trunc(item.span), 1), columns)
  }

  return {
    getRootProps: () => normalize.element(rootAttrs),

    // 跨列写成网格轨道数，不另发状态属性：这一格占几列是排版量，皮肤无须再据它分档
    getItemProps: (item) => {
      const span = spanOf(item)
      return normalize.element({
        ...parts.item.attrs,
        style: span == null ? undefined : { gridColumn: `span ${span}` },
      })
    },

    getLabelProps: () => normalize.element(parts.label.attrs),
    getValueProps: () => normalize.element(parts.value.attrs),
  }
}
