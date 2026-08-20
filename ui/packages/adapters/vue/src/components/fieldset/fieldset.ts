import type { FieldsetProps, FieldsetTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideFieldset, useFieldsetContext } from './context'
import { useFieldset } from './use-fieldset'

export const XhFieldsetRoot = defineComponent({
  name: 'XhFieldsetRoot',
  // 三个布尔缺省 undefined：缺省值的事实源在 connect，写死 false 会挡住将来从上下文取值
  props: {
    disabled: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<Partial<FieldsetTranslations>>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useFieldset(withXhConfig('fieldset', props) as FieldsetProps)
    provideFieldset(ctx)
    // 必须是原生 <fieldset>：整组禁用连坐组内控件是浏览器给的，换成 div 就只剩一层灰样式
    return () => h('fieldset', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFieldsetLegend = defineComponent({
  name: 'XhFieldsetLegend',
  setup(_, { slots }) {
    const ctx = useFieldsetContext()
    // 原生 <legend> 只有作为 <fieldset> 的首个子节点时才充当这一组的名字
    return () => h('legend', ctx.api.value.getLegendProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFieldsetHelperText = defineComponent({
  name: 'XhFieldsetHelperText',
  setup(_, { slots }) {
    const ctx = useFieldsetContext()
    return () => h('p', ctx.api.value.getHelperTextProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFieldsetErrorText = defineComponent({
  name: 'XhFieldsetErrorText',
  setup(_, { slots }) {
    const ctx = useFieldsetContext()
    // 节点常挂，靠 hidden 显隐：翻转时 role=alert 才播报得出来，卸载重挂读屏读不到
    return () => h('p', ctx.api.value.getErrorTextProps() as Record<string, unknown>, slots.default?.())
  },
})
