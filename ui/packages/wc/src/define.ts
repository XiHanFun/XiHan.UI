import { XhAccordionElement } from './elements/accordion'
import { XhAvatarElement } from './elements/avatar'
import { XhBadgeElement } from './elements/badge'
import { XhButtonElement } from './elements/button'
import { XhCheckboxElement } from './elements/checkbox'
import { XhCollapsibleElement } from './elements/collapsible'
import { XhDialogElement } from './elements/dialog'
import { XhFieldElement } from './elements/field'
import { XhMenuElement } from './elements/menu'
import { XhPopoverElement } from './elements/popover'
import { XhProgressElement } from './elements/progress'
import { XhRadioGroupElement } from './elements/radio-group'
import { XhSelectElement } from './elements/select'
import { XhSeparatorElement } from './elements/separator'
import { XhSwitchElement } from './elements/switch'
import { XhTabsElement } from './elements/tabs'
import { XhToggleElement } from './elements/toggle'
import { XhTooltipElement } from './elements/tooltip'
import { defineElement } from './runtime/registry'

const VERSION = '0.0.0'

// 显式注册（惰性）：只有在 DOM 环境显式调用才 customElements.define，主入口 import 不注册。
export function defineXhElements(): void {
  defineElement('xh-accordion', XhAccordionElement, VERSION)
  defineElement('xh-avatar', XhAvatarElement, VERSION)
  defineElement('xh-badge', XhBadgeElement, VERSION)
  defineElement('xh-button', XhButtonElement, VERSION)
  defineElement('xh-checkbox', XhCheckboxElement, VERSION)
  defineElement('xh-collapsible', XhCollapsibleElement, VERSION)
  defineElement('xh-dialog', XhDialogElement, VERSION)
  defineElement('xh-field', XhFieldElement, VERSION)
  defineElement('xh-menu', XhMenuElement, VERSION)
  defineElement('xh-popover', XhPopoverElement, VERSION)
  defineElement('xh-progress', XhProgressElement, VERSION)
  defineElement('xh-radio-group', XhRadioGroupElement, VERSION)
  defineElement('xh-select', XhSelectElement, VERSION)
  defineElement('xh-separator', XhSeparatorElement, VERSION)
  defineElement('xh-switch', XhSwitchElement, VERSION)
  defineElement('xh-tabs', XhTabsElement, VERSION)
  defineElement('xh-toggle', XhToggleElement, VERSION)
  defineElement('xh-tooltip', XhTooltipElement, VERSION)
}

export {
  XhAccordionElement,
  XhAvatarElement,
  XhBadgeElement,
  XhButtonElement,
  XhCheckboxElement,
  XhCollapsibleElement,
  XhDialogElement,
  XhFieldElement,
  XhMenuElement,
  XhPopoverElement,
  XhProgressElement,
  XhRadioGroupElement,
  XhSelectElement,
  XhSeparatorElement,
  XhSwitchElement,
  XhTabsElement,
  XhToggleElement,
  XhTooltipElement,
}
