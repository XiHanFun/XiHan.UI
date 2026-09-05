import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { SeparatorApi, SeparatorProps } from './separator.types'
import { dataAttr } from '@xihan-ui/core'
import { separatorAnatomy } from './separator.anatomy'

const parts = separatorAnatomy.build()

// Separator 无状态机：朝向与语义全部来自 props。
export function connectSeparator<T extends PropTypes>(
  props: SeparatorProps,
  normalize: NormalizeProps<T>,
): SeparatorApi<T> {
  const orientation = props.orientation ?? 'horizontal'
  const decorative = !!props.decorative

  return {
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 装饰性分隔退出无障碍树；语义分隔才暴露 separator 与朝向
      'role': decorative ? 'none' : 'separator',
      'aria-orientation': (!decorative && orientation === 'vertical') ? 'vertical' : undefined,
      'data-orientation': orientation,
      // 缺省档不写属性：皮肤的基础规则就是缺省档
      'data-variant': props.variant,
      'data-align': props.align,
      'data-dashed': dataAttr(!!props.dashed),
    }),

    // 两条线是纯装饰：语义由 root 上的 role=separator 给，线再报一次就成了两条分隔
    getLineProps: () => normalize.element({
      ...parts.line.attrs,
      'role': 'none',
      'data-orientation': orientation,
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
    }),
  }
}
