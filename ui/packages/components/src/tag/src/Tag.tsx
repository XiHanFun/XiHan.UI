import { defineComponent } from 'vue'
import { tagProps } from './interface'
import type { TagProps } from './interface'

export default defineComponent({
  name: 'Tag',
  props: tagProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-tag">
        {slots.default?.()}
      </div>
    )
  }
})
