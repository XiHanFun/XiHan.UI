import { defineComponent } from 'vue'
import { tabsProps } from './interface'
import type { TabsProps } from './interface'

export default defineComponent({
  name: 'Tabs',
  props: tabsProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-tabs">
        {slots.default?.()}
      </div>
    )
  }
})
