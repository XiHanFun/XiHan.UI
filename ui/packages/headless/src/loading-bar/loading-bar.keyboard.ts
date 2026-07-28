import type { KeyboardTable } from '../spec/types'

// 这个组件一个键都不接，表是空的：它不可聚焦、不可交互，进度完全由宿主的
// loading / value 驱动。出处指向 ARIA 的 progressbar 角色而不是 APG 模式页——
// progressbar 本来就不是一种键盘模式，APG 那边没有与之对应的交互规格。
const SPEC = 'https://www.w3.org/TR/wai-aria-1.2/#progressbar'

export const loadingBarKeyboard: KeyboardTable = {
  component: 'loading-bar',
  source: SPEC,
  rows: [],
}
