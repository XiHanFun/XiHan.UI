import { defineComponent } from 'vue'
import { affixProps } from './interface'
import type { AffixProps } from './interface'

export default defineComponent({
  name: 'Affix',
  props: affixProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-affix">
        {slots.default?.()}
      </div>
    )
  }
})
