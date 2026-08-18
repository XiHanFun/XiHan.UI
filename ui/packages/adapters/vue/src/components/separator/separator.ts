import type { SeparatorProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectSeparator } from '@xihan-ui/headless'
import { DIAGNOSTIC_CODES, reportDiagnostic } from '@xihan-ui/kernel'
import { defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export const XhSeparator = defineComponent({
  name: 'XhSeparator',
  props: {
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
    decorative: Boolean,
  },
  setup(props, { slots }) {
    return () => {
      // 只画线，不渲染内容；给了插槽就报一条，免得文案静默消失
      if (slots.default) {
        reportDiagnostic({
          code: DIAGNOSTIC_CODES.ignoredSlot,
          level: 'warn',
          scope: 'separator',
          message: '分隔线不渲染插槽内容。带文案的分节标题在外层排版：一行里摆两条线，中间放文案。',
        })
      }
      return h('div', connectSeparator(props as SeparatorProps, vueNormalize).getRootProps() as Record<string, unknown>)
    }
  },
})
