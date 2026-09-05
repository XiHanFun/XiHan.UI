import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { EmptyStateApi, EmptyStateProps } from './empty-state.types'
import { emptyStateAnatomy } from './empty-state.anatomy'

const parts = emptyStateAnatomy.build()

// EmptyState 无状态机，外观由 size 决定，播报与否由 live 决定。
export function connectEmptyState<T extends PropTypes>(
  props: EmptyStateProps,
  normalize: NormalizeProps<T>,
): EmptyStateApi<T> {
  const live = props.live ?? 'polite'

  return {
    live,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 空状态多半是一次筛选/搜索/删除之后结果区被换掉的产物：这次更新不移动焦点，
      // 读屏用户不会自动读到"一条也没有"，只能靠活区送到耳边。role=status 自带
      // polite 活区（不打断当前朗读），与 combobox 的空态用的是同一条理由。
      // 前提是这个节点先在文档里就位、之后内容才变：整块条件渲染进来的活区，
      // 插入与内容同一拍，读屏通常不播报，所以这个节点应当常挂、用 hidden 收起。
      // live='off' 留给随页面首屏一起出现的静态占位（空的卡片、还没建过任何东西的列表页）：
      // 那里没有"更新"可播报，页面结构本身已经把这段读给用户了，挂活区只是噪音。
      'role': live === 'off' ? undefined : 'status',
      'data-size': props.size,
      'data-status': props.status,
    }),

    // 图标是纯装饰：它表达的信息标题里已经写了，念出来只会重复一遍
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': true,
    }),

    // 标题与说明不占标题层级：活区会把整段读完，再插一级标题只会污染文档大纲
    getTitleProps: () => normalize.element({ ...parts.title.attrs }),

    getDescriptionProps: () => normalize.element({ ...parts.description.attrs }),

    // 操作槽只圈出按钮区，按钮本身的语义归作者（或 Button 组件）
    getActionProps: () => normalize.element({ ...parts.action.attrs }),
  }
}
