import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { BreadcrumbApi, BreadcrumbProps } from './breadcrumb.types'
import { dataAttr } from '@xihan-ui/core'
import { breadcrumbAnatomy } from './breadcrumb.anatomy'

const parts = breadcrumbAnatomy.build()

// Breadcrumb 无状态机，属性来自 props 与部件自报的声明。
// 结构语义靠作者写的标签给（root 是 nav、list 是 ol、item/separator/ellipsis 是 li），这里不补 role。
export function connectBreadcrumb<T extends PropTypes>(
  props: BreadcrumbProps,
  normalize: NormalizeProps<T>,
): BreadcrumbApi<T> {
  const label = props.translations?.root ?? 'Breadcrumb'

  return {
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'aria-label': label,
      // 只有作者显式给了才写
      'dir': props.dir,
      'data-tone': props.tone,
      'data-size': props.size,
    }),

    getListProps: () => normalize.element({
      ...parts.list.attrs,
    }),

    getItemProps: () => normalize.element({
      ...parts.item.attrs,
    }),

    getLinkProps: (link) => {
      const current = !!link.current
      return normalize.element({
        ...parts.link.attrs,
        // 非布尔 aria，省略即"不是当前项"
        'aria-current': current ? 'page' : undefined,
        // 布尔 aria，显式写 true/false
        'aria-disabled': current ? 'true' : 'false',
        // 当前页那条退出 Tab 序列；非当前页不写 tabindex，沿用 <a href> 的原生行为
        'tabindex': current ? -1 : undefined,
        'data-current': dataAttr(current),
        // 当前页那条拦下点击，避免 href 跳到自己
        'onClick': (event: MouseEvent) => {
          if (current)
            event.preventDefault()
        },
      })
    },

    // 分隔符纯视觉，不进读屏
    getSeparatorProps: () => normalize.element({
      ...parts.separator.attrs,
      'aria-hidden': 'true',
    }),

    // 省略号纯视觉占位，不进读屏
    getEllipsisProps: () => normalize.element({
      ...parts.ellipsis.attrs,
      'aria-hidden': 'true',
    }),
  }
}
