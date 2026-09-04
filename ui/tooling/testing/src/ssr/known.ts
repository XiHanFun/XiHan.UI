import type { SsrRunOptions } from './run'

/** 逐适配器的服务端直出豁免表。 */
export type SsrExemptions = Required<Pick<SsrRunOptions, 'throwExempt' | 'emptyExempt' | 'partExempt'>>

const CLOSED = '套件里没有首屏即展开的入参，浮层这一屏关着，展开才渲染'

/** Vue 适配器在服务端直出下的存量豁免。 */
export const vueSsrExempt: SsrExemptions = {
  throwExempt: {},
  emptyExempt: {},
  partExempt: {
    'dialog': {
      'root': '根组件只渲插槽，不产出自己的元素',
      'content': CLOSED,
      'title': CLOSED,
      'description': CLOSED,
      'close-trigger': CLOSED,
    },
    'image-viewer': {
      'content': CLOSED,
      'viewport': CLOSED,
      'image': CLOSED,
      'counter': CLOSED,
      'toolbar': CLOSED,
      'prev-trigger': CLOSED,
      'next-trigger': CLOSED,
      'zoom-in-trigger': CLOSED,
      'zoom-out-trigger': CLOSED,
      'reset-trigger': CLOSED,
      'close-trigger': CLOSED,
    },
  },
}
