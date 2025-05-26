import { defineComponent } from 'vue'
import { drawerProps } from './interface'
import type { DrawerProps } from './interface'

export default defineComponent({
  name: 'Drawer',
  props: drawerProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-drawer">
        {slots.default?.()}
      </div>
    )
  }
})
