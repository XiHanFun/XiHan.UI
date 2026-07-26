import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { SeparatorApi, SeparatorProps } from './separator.types'
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
    }),
  }
}
