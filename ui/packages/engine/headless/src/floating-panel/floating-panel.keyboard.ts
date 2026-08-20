import type { KeyboardTable } from '../spec/types'

// 面板本体是一块非模态的 dialog，Esc 关闭那一条取自对话框模式。
// 拖动与改尺的键盘约定借自窗口分隔条（.../apg/patterns/windowsplitter/）：
// 那是 APG 里唯一一处"用方向键把一条边推来推去"的现成规格，
// 本组件把它从一根轴推广到两根轴与八个把手。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction'

export const floatingPanelKeyboard: KeyboardTable = {
  component: 'floating-panel',
  source: APG,
  rows: [
    {
      id: 'floating-panel.kbd.escape',
      keys: ['Escape'],
      when: 'focus in content, 面板展开',
      does: '关闭面板；面板不是模态的，焦点在页面别处时这一键不归它管',
    },
    {
      id: 'floating-panel.kbd.move',
      keys: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
      when: 'focus on drag-trigger, 未禁用、draggable 开启且不是铺满形态',
      does: '把整块面板往该方向平移 10px',
    },
    {
      id: 'floating-panel.kbd.move-large',
      keys: ['Shift+ArrowUp', 'Shift+ArrowDown', 'Shift+ArrowLeft', 'Shift+ArrowRight'],
      when: 'focus on drag-trigger, 未禁用、draggable 开启且不是铺满形态',
      does: '同上，一下走 50px',
    },
    {
      id: 'floating-panel.kbd.recenter',
      keys: ['Enter', 'Space'],
      when: 'focus on drag-trigger, 未禁用、draggable 开启且不是铺满形态',
      does: '把面板送回初始落点（defaultPosition，没给就是 24,24）；面板被拖出视口后靠这一键收回来',
    },
    {
      id: 'floating-panel.kbd.resize',
      keys: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
      when: 'focus on resize-trigger, 未禁用、resizable 开启且是常规形态',
      does: '把这个把手守的那条边往该方向推 10px；推不动的那根轴上不拦键（上下把手放行左右键）',
    },
    {
      id: 'floating-panel.kbd.resize-large',
      keys: ['Shift+ArrowUp', 'Shift+ArrowDown', 'Shift+ArrowLeft', 'Shift+ArrowRight'],
      when: 'focus on resize-trigger, 未禁用、resizable 开启且是常规形态',
      does: '同上，一下推 50px',
    },
  ],
}
