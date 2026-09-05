import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction'

export const commandKeyboard: KeyboardTable = {
  component: 'command',
  source: APG,
  rows: [
    { id: 'command.kbd.open-on-trigger', keys: ['Enter', 'Space'], when: 'focus in trigger', does: '打开面板并把焦点移入检索框' },
    { id: 'command.kbd.escape', keys: ['Escape'], when: 'open', does: '关闭面板并把焦点还给 trigger', restoresFocus: true },
    { id: 'command.kbd.next', keys: ['ArrowDown'], when: 'open', does: '锚点移到下一条命令，禁用的跳过' },
    { id: 'command.kbd.prev', keys: ['ArrowUp'], when: 'open', does: '锚点移到上一条命令，禁用的跳过' },
    { id: 'command.kbd.first', keys: ['Home'], when: 'open', does: '锚点移到首条命令' },
    { id: 'command.kbd.last', keys: ['End'], when: 'open', does: '锚点移到末条命令' },
    { id: 'command.kbd.select', keys: ['Enter'], when: 'open, 锚点落在可用命令上', does: '选中该命令；长按连发的重复键不重复选中' },
    { id: 'command.kbd.tab', keys: ['Tab'], when: 'open, modal', does: '在面板内循环焦点' },
  ],
}
