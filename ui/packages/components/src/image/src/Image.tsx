import { defineComponent } from 'vue'
import { imageProps } from './interface'
import type { ImageProps } from './interface'

export default defineComponent({
  name: 'Image',
  props: imageProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-image">
        {slots.default?.()}
      </div>
    )
  }
})
