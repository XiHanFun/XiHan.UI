import { defineComponent } from 'vue'
import { datepickerProps } from './interface'
import type { DatePickerProps } from './interface'

export default defineComponent({
  name: 'DatePicker',
  props: datepickerProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-date-picker">
        {slots.default?.()}
      </div>
    )
  }
})
