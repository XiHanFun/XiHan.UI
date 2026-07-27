import type { KeyboardTable } from '../spec/types'

// 上传控件在 APG 里没有独立模式：投放区是一个自定义按钮（role=button），
// 其余入口是原生 button，因此键盘契约按 Button 模式立。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'

export const fileUploadKeyboard: KeyboardTable = {
  component: 'file-upload',
  source: APG,
  rows: [
    {
      id: 'file-upload.kbd.tab',
      keys: ['Tab', 'Shift+Tab'],
      when: 'focus outside / inside the component',
      does: '投放区、选择按钮、每条的删除按钮与清空按钮各占一个 Tab 位；禁用时投放区退出 Tab 序列，几个原生按钮带 disabled 本就不可聚焦',
    },
    {
      id: 'file-upload.kbd.open-dropzone',
      keys: ['Enter', 'Space'],
      when: 'focus on dropzone',
      does: '打开系统文件选择框。投放区是 div，浏览器不会替它把这两个键合成成一次点击，连接层自己接管（并拦下空格滚屏）',
    },
    {
      id: 'file-upload.kbd.open-trigger',
      keys: ['Enter', 'Space'],
      when: 'focus on trigger',
      does: '打开系统文件选择框（原生 button 的默认激活）',
    },
    {
      id: 'file-upload.kbd.delete',
      keys: ['Enter', 'Space'],
      when: 'focus on item-delete-trigger',
      does: '把这一条从列表里删掉（原生 button 的默认激活）',
    },
    {
      id: 'file-upload.kbd.clear',
      keys: ['Enter', 'Space'],
      when: 'focus on clear-trigger，且列表非空',
      does: '清空整份列表；列表为空时该按钮带原生 disabled，键盘根本到不了它',
    },
  ],
}
