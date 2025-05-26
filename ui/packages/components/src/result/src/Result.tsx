import { defineComponent } from 'vue'
import { resultProps } from './interface'
import type { ResultProps } from './interface'

export default defineComponent({
  name: 'Result',
  props: resultProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-result">
        {slots.default?.()}
      </div>
    )
  }
})
