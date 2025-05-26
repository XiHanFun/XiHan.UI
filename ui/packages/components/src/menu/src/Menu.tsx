import { defineComponent } from 'vue'
import { menuProps } from './interface'
import type { MenuProps } from './interface'

export default defineComponent({
  name: 'Menu',
  props: menuProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-menu">
        {slots.default?.()}
      </div>
    )
  }
})
