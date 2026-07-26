import { XhButtonElement } from './elements/button'
import { XhDialogElement } from './elements/dialog'
import { defineElement } from './runtime/registry'

const VERSION = '0.0.0'

// 显式注册（惰性）：只有在 DOM 环境显式调用才 customElements.define，主入口 import 不注册。
export function defineXhElements(): void {
  defineElement('xh-button', XhButtonElement, VERSION)
  defineElement('xh-dialog', XhDialogElement, VERSION)
}

export { XhButtonElement, XhDialogElement }
