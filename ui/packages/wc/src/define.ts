import { XhAccordionElement } from './elements/accordion'
import { XhAvatarElement } from './elements/avatar'
import { XhBadgeElement } from './elements/badge'
import { XhButtonElement } from './elements/button'
import { XhCheckboxElement } from './elements/checkbox'
import { XhCheckboxGroupElement } from './elements/checkbox-group'
import { XhCollapsibleElement } from './elements/collapsible'
import { XhDialogElement } from './elements/dialog'
import { XhDrawerElement } from './elements/drawer'
import { XhFieldElement } from './elements/field'
import { XhListboxElement } from './elements/listbox'
import { XhMenuElement } from './elements/menu'
import { XhNumberFieldElement } from './elements/number-field'
import { XhPaginationElement } from './elements/pagination'
import { XhPinInputElement } from './elements/pin-input'
import { XhPopoverElement } from './elements/popover'
import { XhProgressElement } from './elements/progress'
import { XhRadioGroupElement } from './elements/radio-group'
import { XhRatingElement } from './elements/rating'
import { XhSelectElement } from './elements/select'
import { XhSeparatorElement } from './elements/separator'
import { XhSliderElement } from './elements/slider'
import { XhSwitchElement } from './elements/switch'
import { XhTabsElement } from './elements/tabs'
import { XhTextFieldElement } from './elements/text-field'
import { XhToastElement } from './elements/toast'
import { XhToasterElement } from './elements/toaster'
import { XhToggleElement } from './elements/toggle'
import { XhToggleGroupElement } from './elements/toggle-group'
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
  defineElement('xh-checkbox-group', XhCheckboxGroupElement, VERSION)
  defineElement('xh-collapsible', XhCollapsibleElement, VERSION)
  defineElement('xh-dialog', XhDialogElement, VERSION)
  defineElement('xh-drawer', XhDrawerElement, VERSION)
  defineElement('xh-field', XhFieldElement, VERSION)
  defineElement('xh-listbox', XhListboxElement, VERSION)
  defineElement('xh-menu', XhMenuElement, VERSION)
  defineElement('xh-pagination', XhPaginationElement, VERSION)
  defineElement('xh-pin-input', XhPinInputElement, VERSION)
  defineElement('xh-popover', XhPopoverElement, VERSION)
  defineElement('xh-progress', XhProgressElement, VERSION)
  defineElement('xh-radio-group', XhRadioGroupElement, VERSION)
  defineElement('xh-number-field', XhNumberFieldElement, VERSION)
  defineElement('xh-rating', XhRatingElement, VERSION)
  defineElement('xh-select', XhSelectElement, VERSION)
  defineElement('xh-separator', XhSeparatorElement, VERSION)
  defineElement('xh-slider', XhSliderElement, VERSION)
  defineElement('xh-switch', XhSwitchElement, VERSION)
  defineElement('xh-tabs', XhTabsElement, VERSION)
  defineElement('xh-text-field', XhTextFieldElement, VERSION)
  defineElement('xh-toast', XhToastElement, VERSION)
  defineElement('xh-toaster', XhToasterElement, VERSION)
  defineElement('xh-toggle', XhToggleElement, VERSION)
  defineElement('xh-toggle-group', XhToggleGroupElement, VERSION)
  defineElement('xh-tooltip', XhTooltipElement, VERSION)
}

export {
  XhAccordionElement,
  XhAvatarElement,
  XhBadgeElement,
  XhButtonElement,
  XhCheckboxElement,
  XhCheckboxGroupElement,
  XhCollapsibleElement,
  XhDialogElement,
  XhDrawerElement,
  XhFieldElement,
  XhListboxElement,
  XhMenuElement,
  XhPaginationElement,
  XhPinInputElement,
  XhPopoverElement,
  XhProgressElement,
  XhRadioGroupElement,
  XhRatingElement,
  XhSelectElement,
  XhSeparatorElement,
  XhSliderElement,
  XhSwitchElement,
  XhTabsElement,
  XhTextFieldElement,
  XhToastElement,
  XhToasterElement,
  XhToggleElement,
  XhToggleGroupElement,
  XhTooltipElement,
}
