import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction'

export const imageViewerKeyboard: KeyboardTable = {
  component: 'image-viewer',
  source: APG,
  rows: [
    { id: 'image-viewer.kbd.open-on-trigger', keys: ['Enter', 'Space'], when: 'focus in trigger', does: '打开看片浮层并把焦点移入 content' },
    { id: 'image-viewer.kbd.escape', keys: ['Escape'], when: 'open', does: '关闭并把焦点还给 trigger（closeOnEscape=false 时不关）' },
    { id: 'image-viewer.kbd.tab', keys: ['Tab'], when: 'open', does: '在 content 内向后循环焦点' },
    { id: 'image-viewer.kbd.shift-tab', keys: ['Shift+Tab'], when: 'open', does: '在 content 内向前循环焦点' },
    { id: 'image-viewer.kbd.prev', keys: ['ArrowLeft'], when: 'open', does: '上一张' },
    { id: 'image-viewer.kbd.next', keys: ['ArrowRight'], when: 'open', does: '下一张' },
  ],
}
