import { defineComponent } from 'vue'
import { avatarProps } from './interface'
import type { AvatarProps } from './interface'

export default defineComponent({
  name: 'Avatar',
  props: avatarProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-avatar">
        {slots.default?.()}
      </div>
    )
  }
})
