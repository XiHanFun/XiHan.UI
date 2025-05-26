import { defineComponent } from 'vue'
import { cascaderProps } from './interface'
import type { CascaderProps } from './interface'

export default defineComponent({
  name: 'Cascader',
  props: cascaderProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-cascader">
        {slots.default?.()}
      </div>
    )
  }
})
