import { defineComponent } from 'vue'
import { treeProps } from './interface'
import type { TreeProps } from './interface'

export default defineComponent({
  name: 'Tree',
  props: treeProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-tree">
        {slots.default?.()}
      </div>
    )
  }
})
