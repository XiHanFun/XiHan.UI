import { defineComponent } from 'vue'
import { configproviderProps } from './interface'
import type { ConfigProviderProps } from './interface'

export default defineComponent({
  name: 'ConfigProvider',
  props: configproviderProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-config-provider">
        {slots.default?.()}
      </div>
    )
  }
})
