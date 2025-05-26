import { defineComponent } from 'vue'
import { descriptionsProps } from './interface'
import type { DescriptionsProps } from './interface'

export default defineComponent({
  name: 'Descriptions',
  props: descriptionsProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-descriptions">
        {slots.default?.()}
      </div>
    )
  }
})
