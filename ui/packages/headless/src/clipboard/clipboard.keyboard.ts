import type { KeyboardTable } from '../spec/types'

// 这个组件一个键都不自己接：
// · 复制按钮是原生 <button type="button">，Enter / Space 由平台翻成 click；
// · 展示框是原生只读 <input>，选区、Ctrl/Cmd+C、光标移动全归浏览器。
// 自己再接一遍只会与平台行为打架，所以表是空的——出处指向 HTML 规范的按钮状态而非 APG 模式页。
const SPEC = 'https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element'

export const clipboardKeyboard: KeyboardTable = {
  component: 'clipboard',
  source: SPEC,
  rows: [],
}
