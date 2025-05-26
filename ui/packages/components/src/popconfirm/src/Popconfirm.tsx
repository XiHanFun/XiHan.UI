import { defineComponent } from 'vue'
import { popconfirmProps } from './interface'
import type { PopconfirmProps } from './interface'

export default defineComponent({
  name: 'Popconfirm',
  props: popconfirmProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-popconfirm">
        {slots.default?.()}
      </div>
    )
  }
})
