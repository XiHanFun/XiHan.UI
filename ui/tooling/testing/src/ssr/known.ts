import type { SsrRunOptions } from './run'

/** 逐适配器的服务端直出豁免表。 */
export type SsrExemptions = Required<Pick<SsrRunOptions, 'throwExempt' | 'emptyExempt' | 'partExempt'>>

const SLOT_ONLY = '根组件只渲插槽，不产出自己的元素'
const HOSTED_TAG = '作者名，渲出来是 tag 的部件（data-scope="tag"），标记上不出现这个名字'

/** Vue 适配器在服务端直出下的存量豁免。 */
export const vueSsrExempt: SsrExemptions = {
  throwExempt: {},
  emptyExempt: {},
  partExempt: {
    'command': {
      root: SLOT_ONLY,
    },
    'dialog': {
      root: SLOT_ONLY,
    },
    // 三个作者名接的是 tag 的部件，直出的标记上戴的是 tag 的 root / label / close-trigger
    'tag-group': {
      'item': HOSTED_TAG,
      'item-text': HOSTED_TAG,
      'item-delete-trigger': HOSTED_TAG,
    },
  },
}
