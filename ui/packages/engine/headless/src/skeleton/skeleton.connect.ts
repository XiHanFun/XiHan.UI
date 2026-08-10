import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { SkeletonApi, SkeletonBoneProps, SkeletonProps } from './skeleton.types'
import { skeletonAnatomy } from './skeleton.anatomy'

const parts = skeletonAnatomy.build()

/**
 * Skeleton 无状态机：加载态与形状全部来自 props。
 *
 * 无障碍分两层，两层缺一不可：
 * · 骨架条是纯装饰，逐根写 aria-hidden="true" 把它们从无障碍树里摘掉，
 *   读屏不会念出一串没有含义的占位块；
 * · 容器写 aria-busy="true"，告诉辅助技术这块内容还在加载。
 * aria-hidden 只写在骨架条上、绝不写在容器上：写在容器上会连同它自己的 aria-busy
 * 一起被摘出无障碍树，加载态就再也报不出去了。
 *
 * loading 为假时两者都不输出——内容已经就位，既不该再说"忙"，也没有需要藏起来的装饰；
 * 同时给容器加 hidden，把留在 DOM 里的整块骨架收起来。
 */
export function connectSkeleton<T extends PropTypes>(
  props: SkeletonProps,
  normalize: NormalizeProps<T>,
): SkeletonApi<T> {
  const loading = props.loading ?? true
  const variant = props.variant ?? 'text'

  return {
    loading,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'aria-busy': loading ? 'true' : undefined,
      'data-state': loading ? 'loading' : 'loaded',
      // 收起时留着节点，只加 hidden
      'hidden': !loading || undefined,
    }),

    getBoneProps: (bone: SkeletonBoneProps = {}) => normalize.element({
      ...parts.bone.attrs,
      'aria-hidden': loading ? 'true' : undefined,
      'data-variant': bone.variant ?? variant,
    }),
  }
}
