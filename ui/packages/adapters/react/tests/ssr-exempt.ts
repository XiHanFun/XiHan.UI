import type { SsrExemptions } from '@xihan-ui/testing/ssr'

const SLOT_ONLY = '根组件只渲插槽，不产出自己的元素'

/** React 适配器在服务端直出下的存量豁免。 */
export const reactSsrExempt: SsrExemptions = {
  throwExempt: {},
  emptyExempt: {},
  partExempt: {
    dialog: {
      root: SLOT_ONLY,
    },
  },
}
