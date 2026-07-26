import { XhButtonElement } from './elements/button'
import { XhCheckboxElement } from './elements/checkbox'
import { XhCollapsibleElement } from './elements/collapsible'
import { XhDialogElement } from './elements/dialog'
import { XhSeparatorElement } from './elements/separator'
import { XhSwitchElement } from './elements/switch'
import { defineElement } from './runtime/registry'

const VERSION = '0.0.0'

// 显式注册（惰性）：只有在 DOM 环境显式调用才 customElements.define，主入口 import 不注册。
export function defineXhElements(): void {
  defineElement('xh-button', XhButtonElement, VERSION)
  defineElement('xh-checkbox', XhCheckboxElement, VERSION)
  defineElement('xh-collapsible', XhCollapsibleElement, VERSION)
  defineElement('xh-dialog', XhDialogElement, VERSION)
  defineElement('xh-separator', XhSeparatorElement, VERSION)
  defineElement('xh-switch', XhSwitchElement, VERSION)
}

export { XhButtonElement, XhCheckboxElement, XhCollapsibleElement, XhDialogElement, XhSeparatorElement, XhSwitchElement }
