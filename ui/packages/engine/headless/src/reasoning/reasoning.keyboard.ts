import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/'

// 除下面这一行外一律不接管、不 preventDefault。
export const reasoningKeyboard: KeyboardTable = {
  component: 'reasoning',
  source: APG,
  rows: [
    { id: 'reasoning.kbd.toggle', keys: ['Enter', 'Space'], when: '焦点在折叠开关上且未禁用', does: '展开或收起思考正文，并把自动开合永久停用' },
  ],
}
