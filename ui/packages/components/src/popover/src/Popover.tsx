import { defineComponent } from 'vue'
import { popoverProps } from './interface'
import type { PopoverProps } from './interface'

export default defineComponent({
  name: 'Popover',
  props: popoverProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-popover">
        {slots.default?.()}
      </div>
    )
  }
})
