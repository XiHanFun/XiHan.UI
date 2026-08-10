import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { DescriptionsApi, DescriptionsProps } from './descriptions.types'
import { dataAttr } from '@xihan-ui/kernel'
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

  return {
    getRootProps: () => normalize.element(rootAttrs),
    getItemProps: () => normalize.element(parts.item.attrs),
    getLabelProps: () => normalize.element(parts.label.attrs),
    getValueProps: () => normalize.element(parts.value.attrs),
  }
}
