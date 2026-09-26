/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 empty state 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { EmptyStateApi, EmptyStateSchema } from './empty-state.types'
import { dataAttr } from '@xihan-ui/core'
import { emptyStateAnatomy } from './empty-state.anatomy'

const parts = emptyStateAnatomy.build()

// 外观由 size 决定，播报与否由 live 决定；机器只管开幕播不播。
export function connectEmptyState<T extends PropTypes>(
  service: Service<EmptyStateSchema>,
  normalize: NormalizeProps<T>,
): EmptyStateApi<T> {
  const { prop, context } = service
  const live = prop('live') ?? 'polite'
  const status = prop('status')
  // 开幕逐段播的五个部件同一个开关：随页面首屏就在时直接呈现，之后每次出现才播
  const instant = dataAttr(context.get('instant'))

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
      'data-size': prop('size'),
      'data-status': status,
      // 语气轴只挂在 root 上，子部件靠继承拿到语气槽
      'data-tone': prop('tone'),
    }),

    // 插画同样是纯装饰：它替代的是图标那一层，不是内容
    getMediaProps: () => normalize.element({
      ...parts.media.attrs,
      'aria-hidden': true,
      'data-instant': instant,
    }),

    // 图标是纯装饰：它表达的信息标题里已经写了，念出来只会重复一遍
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': true,
      'data-instant': instant,
    }),

    // 标题与说明不占标题层级：活区会把整段读完，再插一级标题只会污染文档大纲
    getTitleProps: () => normalize.element({ ...parts.title.attrs, 'data-instant': instant }),

    getDescriptionProps: () => normalize.element({ ...parts.description.attrs, 'data-instant': instant }),

    // 操作槽只圈出按钮区，按钮本身的语义归作者（或 Button 组件）
    getActionProps: () => normalize.element({ ...parts.action.attrs, 'data-instant': instant }),
  }
}
