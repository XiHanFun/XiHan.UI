import type { CodeBlockProps } from '@xihan-ui/headless'
import { connectCodeBlock } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export const XhCodeBlock = defineComponent({
  name: 'XhCodeBlock',
  props: {
    code: { type: String, default: '' },
    lang: { type: String, default: undefined },
    // 三态：undefined 表示"作者没说"，与显式 false 一样不落 data-complete，
    // 但保留给上游区分"还没吐完"与"确认未闭合"
    complete: { type: Boolean, default: undefined },
  },
  setup(props) {
    // 流式吐字期间 props 每帧都在变，connect 本身无状态无副作用，重算即可
    const api = computed(() => connectCodeBlock(props as CodeBlockProps, vueNormalize))
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, [
      h('span', api.value.getLangLabelProps() as Record<string, unknown>, api.value.lang),
      // <pre> 与 <code> 是硬要求：代码里的空白与换行只有它们会原样保留
      h('pre', api.value.getPreProps() as Record<string, unknown>, [
        h('code', api.value.getCodeProps() as Record<string, unknown>, props.code),
      ]),
    ])
  },
})
