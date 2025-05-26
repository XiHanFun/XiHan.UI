import { defineComponent } from 'vue'
import { skeletonProps } from './interface'
import type { SkeletonProps } from './interface'

export default defineComponent({
  name: 'Skeleton',
  props: skeletonProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-skeleton">
        {slots.default?.()}
      </div>
    )
  }
})
