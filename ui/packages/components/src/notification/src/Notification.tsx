import { defineComponent } from 'vue'
import { notificationProps } from './interface'
import type { NotificationProps } from './interface'

export default defineComponent({
  name: 'Notification',
  props: notificationProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-notification">
        {slots.default?.()}
      </div>
    )
  }
})
