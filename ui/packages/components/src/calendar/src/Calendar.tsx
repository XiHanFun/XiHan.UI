import { defineComponent } from 'vue'
import { calendarProps } from './interface'
import type { CalendarProps } from './interface'

export default defineComponent({
  name: 'Calendar',
  props: calendarProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-calendar">
        {slots.default?.()}
      </div>
    )
  }
})
