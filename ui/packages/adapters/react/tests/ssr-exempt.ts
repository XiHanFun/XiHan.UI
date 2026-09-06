import type { SsrExemptions } from '@xihan-ui/testing/ssr'

/** React 适配器在服务端直出下的存量豁免。 */
export const reactSsrExempt: SsrExemptions = {
  throwExempt: {},
  emptyExempt: {},
  partExempt: {},
}
