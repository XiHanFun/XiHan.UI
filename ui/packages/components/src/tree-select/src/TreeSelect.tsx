import { defineComponent } from 'vue'
import { treeselectProps } from './interface'
import type { TreeSelectProps } from './interface'

export default defineComponent({
  name: 'TreeSelect',
  props: treeselectProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-tree-select">
        {slots.default?.()}
      </div>
    )
  }
})
