import { defineComponent } from 'vue'
import { breadcrumbProps } from './interface'
import type { BreadcrumbProps } from './interface'

export default defineComponent({
  name: 'Breadcrumb',
  props: breadcrumbProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-breadcrumb">
        {slots.default?.()}
      </div>
    )
  }
})
