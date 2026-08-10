import type { KeyboardTable } from '../spec/types'

// 头像组是容器，不接收焦点；里面若放了可点的头像，键盘行为归那些控件自己。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const avatarGroupKeyboard: KeyboardTable = {
  component: 'avatar-group',
  source: APG,
  rows: [],
}
