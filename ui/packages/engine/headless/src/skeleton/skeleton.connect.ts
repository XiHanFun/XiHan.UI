/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 skeleton 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { SkeletonApi, SkeletonItemProps, SkeletonSchema } from './skeleton.types'
import { skeletonAnatomy } from './skeleton.anatomy'
import { skeletonLoading } from './skeleton.machine'

const parts = skeletonAnatomy.build()

/**
 * 加载态与形状全部来自 props；机器只记容器还留不留着——刚加载完的骨架要淡出播完才收起。
 *
 * 无障碍分两层，两层缺一不可：
 * · 骨架条是纯装饰，逐根写 aria-hidden="true" 把它们从无障碍树里摘掉，
 *   读屏不会念出一串没有含义的占位块；
 * · 容器写 aria-busy="true"，告诉辅助技术这块内容还在加载。
 * aria-hidden 只写在骨架条上、绝不写在容器上：写在容器上会连同它自己的 aria-busy
 * 一起被摘出无障碍树，加载态就再也报不出去了。
 *
 * loading 为假时不再说"忙"——内容已经就位；淡出那几帧骨架条仍是装饰、仍摘出无障碍树，
 * 播完给容器加 hidden，把留在 DOM 里的整块骨架收起来。
 */
export function connectSkeleton<T extends PropTypes>(
  service: Service<SkeletonSchema>,
  normalize: NormalizeProps<T>,
): SkeletonApi<T> {
  const { prop, context, scope } = service
  const loading = skeletonLoading(prop('loading'))
  const shape = prop('shape') ?? 'text'
  // 刚加载完：淡出播完之前容器还留着，盖在真实内容之上
  const shown = loading || context.get('rendered')

  return {
    loading,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 机器按 id 找到容器，等它的淡出、把它抬出文档流
      'id': scope.partId('skeleton', 'root'),
      'aria-busy': loading ? 'true' : undefined,
      'data-state': loading ? 'loading' : 'loaded',
      // 动效档挂在容器上，逐根骨架条靠后代选择器接到，不必各写一份
      'data-animation': prop('animation'),
      // 收起时留着节点，只加 hidden
      'hidden': !shown || undefined,
    }),

    getItemProps: (item: SkeletonItemProps = {}) => normalize.element({
      ...parts.item.attrs,
      'aria-hidden': shown ? true : undefined,
      'data-shape': item.shape ?? shape,
    }),
  }
}
