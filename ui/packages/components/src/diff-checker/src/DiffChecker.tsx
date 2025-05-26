import { defineComponent } from 'vue'
import { diffcheckerProps } from './interface'
import type { DiffCheckerProps } from './interface'

export default defineComponent({
  name: 'DiffChecker',
  props: diffcheckerProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-diff-checker">
        {slots.default?.()}
      </div>
    )
  }
})
