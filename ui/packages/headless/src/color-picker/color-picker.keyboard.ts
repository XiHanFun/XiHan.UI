import type { KeyboardTable } from '../spec/types'

// APG 没有取色器这一条模式；两条可交互的轴（取色区、通道滑杆）都按滑杆模式办，
// 浮层部分按对话框模式办，因此出处指到这两处。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction'

export const colorPickerKeyboard: KeyboardTable = {
  component: 'color-picker',
  source: APG,
  rows: [
    {
      id: 'color-picker.kbd.area-saturation',
      keys: ['ArrowRight', 'ArrowLeft'],
      when: 'focus in area-thumb, not disabled/readOnly',
      does: '按 1 调饱和度；RTL 下左右对调，语义恒是"朝饱和走一格"',
    },
    {
      id: 'color-picker.kbd.area-brightness',
      keys: ['ArrowUp', 'ArrowDown'],
      when: 'focus in area-thumb, not disabled/readOnly',
      does: '按 1 调明度，屏幕向上恒是变亮，与 dir 无关',
    },
    {
      id: 'color-picker.kbd.area-large-step',
      keys: ['Shift+ArrowRight', 'Shift+ArrowLeft', 'Shift+ArrowUp', 'Shift+ArrowDown'],
      when: 'focus in area-thumb, not disabled/readOnly',
      does: '同上，但一步走 10',
    },
    {
      id: 'color-picker.kbd.area-edge',
      keys: ['Home', 'End'],
      when: 'focus in area-thumb, not disabled/readOnly',
      does: '饱和度取 0 / 100（与 aria-valuenow 报的是同一条轴）',
    },
    {
      id: 'color-picker.kbd.channel-step',
      keys: ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'],
      when: 'focus in channel-slider-thumb, channel enabled',
      does: '按 1 调该通道；RTL 下左右对调，上下恒是"朝 max 走"',
    },
    {
      id: 'color-picker.kbd.channel-large-step',
      keys: ['Shift+ArrowRight', 'Shift+ArrowLeft', 'Shift+ArrowUp', 'Shift+ArrowDown'],
      when: 'focus in channel-slider-thumb, channel enabled',
      does: '同上，但一步走 10',
    },
    {
      id: 'color-picker.kbd.channel-edge',
      keys: ['Home', 'End'],
      when: 'focus in channel-slider-thumb, channel enabled',
      does: '该通道取 min / max（色相 0-360，透明度 0-100）',
    },
    {
      id: 'color-picker.kbd.input-commit',
      keys: ['Enter'],
      when: 'focus in channel-input',
      does: '收下框里的字；收不了（打了一半）就复原成规范文本。一并拦住表单提交',
    },
    {
      id: 'color-picker.kbd.escape',
      keys: ['Escape'],
      when: 'open（本层在层栈顶）',
      does: '收起浮层，焦点归还触发器',
    },
  ],
}
