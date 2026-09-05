import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction'

export const imageViewerKeyboard: KeyboardTable = {
  component: 'image-viewer',
  source: APG,
  rows: [
    { id: 'image-viewer.kbd.open-on-trigger', keys: ['Enter', 'Space'], when: 'focus in trigger', does: '打开看片浮层并把焦点移入 content' },
    { id: 'image-viewer.kbd.escape', keys: ['Escape'], when: 'open', does: '关闭并把焦点还给 trigger（closeOnEscape=false 时不关）', restoresFocus: true },
    { id: 'image-viewer.kbd.tab', keys: ['Tab'], when: 'open', does: '在 content 内向后循环焦点' },
    { id: 'image-viewer.kbd.shift-tab', keys: ['Shift+Tab'], when: 'open', does: '在 content 内向前循环焦点' },
    { id: 'image-viewer.kbd.prev', keys: ['ArrowLeft'], when: 'open', does: '上一张' },
    { id: 'image-viewer.kbd.next', keys: ['ArrowRight'], when: 'open', does: '下一张' },
    { id: 'image-viewer.kbd.first', keys: ['Home'], when: 'open', does: '跳到第一张' },
    { id: 'image-viewer.kbd.last', keys: ['End'], when: 'open', does: '跳到最后一张' },
    { id: 'image-viewer.kbd.zoom-in', keys: ['+', '='], when: 'open', does: '放大一档（zoomStep），到 maxScale 停住' },
    { id: 'image-viewer.kbd.zoom-out', keys: ['-'], when: 'open', does: '缩小一档，到 minScale 停住' },
    { id: 'image-viewer.kbd.reset', keys: ['0'], when: 'open', does: '缩放、旋转、翻转与平移一并复位' },
  ],
}
