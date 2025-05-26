import { defineComponent } from 'vue'
import { spaceProps } from './interface'
import type { SpaceProps } from './interface'

export default defineComponent({
  name: 'Space',
  props: spaceProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-space">
        {slots.default?.()}
      </div>
    )
  }
})
