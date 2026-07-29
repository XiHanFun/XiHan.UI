import type { KeyboardTable } from '../spec/types'

// 不可聚焦、不接任何键，出处指向 ARIA 的 progressbar 角色。
const SPEC = 'https://www.w3.org/TR/wai-aria-1.2/#progressbar'

export const loadingBarKeyboard: KeyboardTable = {
  component: 'loading-bar',
  source: SPEC,
  rows: [],
}
