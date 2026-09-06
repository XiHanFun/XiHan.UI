import type { SsrRunOptions } from './run'

/** 逐适配器的服务端直出豁免表。 */
export type SsrExemptions = Required<Pick<SsrRunOptions, 'throwExempt' | 'emptyExempt' | 'partExempt'>>

const SLOT_ONLY = '根组件只渲插槽，不产出自己的元素'

/** Vue 适配器在服务端直出下的存量豁免。 */
export const vueSsrExempt: SsrExemptions = {
  throwExempt: {},
  emptyExempt: {},
  partExempt: {
    command: {
      root: SLOT_ONLY,
    },
    dialog: {
      root: SLOT_ONLY,
    },
  },
}
