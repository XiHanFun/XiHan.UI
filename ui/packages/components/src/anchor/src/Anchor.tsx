import { defineComponent } from 'vue'
import { anchorProps } from './interface'
import type { AnchorProps } from './interface'

export default defineComponent({
  name: 'Anchor',
  props: anchorProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-anchor">
        {slots.default?.()}
      </div>
    )
  }
})
