import { defineComponent } from 'vue'
import { tooltipProps } from './interface'
import type { TooltipProps } from './interface'

export default defineComponent({
  name: 'Tooltip',
  props: tooltipProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-tooltip">
        {slots.default?.()}
      </div>
    )
  }
})
