import { defineComponent } from 'vue'
import { timepickerProps } from './interface'
import type { TimePickerProps } from './interface'

export default defineComponent({
  name: 'TimePicker',
  props: timepickerProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-time-picker">
        {slots.default?.()}
      </div>
    )
  }
})
