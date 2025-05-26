import { defineComponent } from 'vue'
import { statisticProps } from './interface'
import type { StatisticProps } from './interface'

export default defineComponent({
  name: 'Statistic',
  props: statisticProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-statistic">
        {slots.default?.()}
      </div>
    )
  }
})
