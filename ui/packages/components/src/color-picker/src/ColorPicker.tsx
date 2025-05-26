import { defineComponent } from 'vue'
import { colorpickerProps } from './interface'
import type { ColorPickerProps } from './interface'

export default defineComponent({
  name: 'ColorPicker',
  props: colorpickerProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-color-picker">
        {slots.default?.()}
      </div>
    )
  }
})
