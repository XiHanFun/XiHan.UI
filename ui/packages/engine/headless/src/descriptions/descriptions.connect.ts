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

    // 跨列数落成一个私有槽交给皮肤，不直接写 grid-column：
    // 内联的 grid-column 盖过皮肤里所有规则，窄档「一行只摆一组」就对带 span 的格失效，
    // 那一格反而比不带 span 的窄。写成槽之后由皮肤逐档决定这个数认不认
    getItemProps: (item) => {
      const span = spanOf(item)
      return normalize.element({
        ...parts.item.attrs,
        // 没写 span 就一条声明都不发：皮肤在这个部件上已经声明了默认的一列，
        // 发一条空串等于让每个格子都平白多一个 style 属性
        ...(span == null ? {} : { style: { '--xh-_descriptions-item-span': String(span) } }),
      })
    },

    getLabelProps: () => normalize.element(parts.label.attrs),
    getValueProps: () => normalize.element(parts.value.attrs),
  }
}
