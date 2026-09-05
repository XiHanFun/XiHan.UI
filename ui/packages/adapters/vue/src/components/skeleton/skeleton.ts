import type { SkeletonProps, SkeletonVariant } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideSkeleton, useSkeletonContext } from './context'
import { useSkeleton } from './use-skeleton'

/** 骨架容器：加载期间报 aria-busy，加载结束后整块收起。 */
export const XhSkeletonRoot = defineComponent({
  name: 'XhSkeletonRoot',
  props: {
    loading: { type: Boolean, default: true },
    variant: { type: String as PropType<SkeletonVariant>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useSkeleton(props as SkeletonProps)
    provideSkeleton(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 单根骨架条：纯装饰，不进无障碍树；形状缺省跟容器，给了 variant 就按自己的来。 */
export const XhSkeletonItem = defineComponent({
  name: 'XhSkeletonItem',
  props: {
    variant: { type: String as PropType<SkeletonVariant>, default: undefined },
  },
  setup(props) {
    const ctx = useSkeletonContext()
    return () => h(
      'div',
      ctx.api.value.getItemProps({ variant: props.variant }) as Record<string, unknown>,
    )
  },
})
