import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction'

export const tabsKeyboard: KeyboardTable = {
  component: 'tabs',
  source: APG,
  rows: [
    { id: 'tabs.kbd.next', keys: ['ArrowRight', 'ArrowDown'], when: 'focus in list, 按键与 orientation 同轴', does: '焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；automatic 模式顺带切换选中' },
    { id: 'tabs.kbd.prev', keys: ['ArrowLeft', 'ArrowUp'], when: 'focus in list, 按键与 orientation 同轴', does: '焦点移到上一个 trigger；automatic 模式顺带切换选中' },
    { id: 'tabs.kbd.first', keys: ['Home'], when: 'focus in list', does: '焦点移到首个可停留 trigger' },
    { id: 'tabs.kbd.last', keys: ['End'], when: 'focus in list', does: '焦点移到末个可停留 trigger' },
    { id: 'tabs.kbd.activate', keys: ['Enter', 'Space'], when: 'focus in trigger, not disabled', does: '把选中切到焦点所在 trigger（manual 模式的确认键）' },
    { id: 'tabs.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus in list', does: '整组只有锚点 trigger 留在 Tab 序列内，一次 Tab 进出；无锚点时由 list 兜底' },
  ],
}
