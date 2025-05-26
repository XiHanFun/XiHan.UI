import { defineComponent } from 'vue'
import { dropdownProps } from './interface'
import type { DropdownProps } from './interface'

export default defineComponent({
  name: 'Dropdown',
  props: dropdownProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-dropdown">
        {slots.default?.()}
      </div>
    )
  }
})
