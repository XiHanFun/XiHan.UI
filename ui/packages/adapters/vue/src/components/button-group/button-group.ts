import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import type { ButtonGroupProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectButtonGroup } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideButtonGroupApi, provideButtonGroupDisabled, useButtonGroupApi } from './context'

/** 从实际调用推出 api 形状，免得再写一遍 normalize 的类型参数。 */
type VueButtonGroupApi = ReturnType<typeof connectButtonGroup>

export const XhButtonGroup = defineComponent({
  name: 'XhButtonGroup',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    orientation: { type: String as PropType<'horizontal' | 'vertical'> },
    variant: { type: String as PropType<ActionVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    disabled: { type: Boolean, default: undefined },
    fullWidth: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const configured = withXhConfig('button-group', props) as ButtonGroupProps
    const api = computed<VueButtonGroupApi>(() => connectButtonGroup(configured, vueNormalize))
    // 组内每一段收到的是真禁用：只打 data-* 的话按钮照样点得动
    provideButtonGroupDisabled(computed(() => api.value.disabled))
    provideButtonGroupApi(api)
    // 组内每一段是作者放进插槽的按钮，直接当直接子节点摆
    return () => h(
      'div',
      api.value.getRootProps() as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

/** 段与段之间的装饰线；纯视觉，读屏不念。 */
export const XhButtonGroupSeparator = defineComponent({
  name: 'XhButtonGroupSeparator',
  setup() {
    const api = useButtonGroupApi()
    return () => h('span', api.value.getSeparatorProps() as Record<string, unknown>)
  },
})
