import type { CodeBlockProps } from '@xihan-ui/headless'
import { connectCodeBlock } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export const XhCodeBlock = defineComponent({
  name: 'XhCodeBlock',
  props: {
    code: { type: String, default: '' },
    lang: { type: String, default: undefined },
    // 三态，undefined 与 false 同样不落 data-complete
    complete: { type: Boolean, default: undefined },
  },
  setup(props) {
    // connect 无状态，props 变了直接重算
    const api = computed(() => connectCodeBlock(props as CodeBlockProps, vueNormalize))
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, [
      h('span', api.value.getLangLabelProps() as Record<string, unknown>, api.value.lang),
      // 用 pre 与 code 保留代码里的空白与换行
      h('pre', api.value.getPreProps() as Record<string, unknown>, [
        h('code', api.value.getCodeProps() as Record<string, unknown>, props.code),
      ]),
    ])
  },
})
