import { defineComponent } from 'vue'
import { watermarkProps } from './interface'
import type { WatermarkProps } from './interface'

export default defineComponent({
  name: 'Watermark',
  props: watermarkProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-watermark">
        {slots.default?.()}
      </div>
    )
  }
})
