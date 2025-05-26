import { defineComponent } from 'vue'
import { carouselProps } from './interface'
import type { CarouselProps } from './interface'

export default defineComponent({
  name: 'Carousel',
  props: carouselProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-carousel">
        {slots.default?.()}
      </div>
    )
  }
})
