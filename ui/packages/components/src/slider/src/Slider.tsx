import { defineComponent } from 'vue'
import { sliderProps } from './interface'
import type { SliderProps } from './interface'

export default defineComponent({
  name: 'Slider',
  props: sliderProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-slider">
        {slots.default?.()}
      </div>
    )
  }
})
