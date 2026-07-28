import { XhAccordionElement } from './elements/accordion'
import { XhAnchorElement } from './elements/anchor'
import { XhAvatarElement } from './elements/avatar'
import { XhBadgeElement } from './elements/badge'
import { XhBreadcrumbElement } from './elements/breadcrumb'
import { XhButtonElement } from './elements/button'
import { XhCalendarElement } from './elements/calendar'
import { XhCarouselElement } from './elements/carousel'
import { XhCascaderElement } from './elements/cascader'
import { XhCheckboxElement } from './elements/checkbox'
import { XhCheckboxGroupElement } from './elements/checkbox-group'
import { XhClipboardElement } from './elements/clipboard'
import { XhCollapsibleElement } from './elements/collapsible'
import { XhColorPickerElement } from './elements/color-picker'
import { XhComboboxElement } from './elements/combobox'
import { XhContextMenuElement } from './elements/context-menu'
import { XhDateFieldElement } from './elements/date-field'
import { XhDatePickerElement } from './elements/date-picker'
import { XhDialogElement } from './elements/dialog'
import { XhDrawerElement } from './elements/drawer'
import { XhEditableElement } from './elements/editable'
import { XhFieldElement } from './elements/field'
import { XhFileUploadElement } from './elements/file-upload'
import { XhFormElement } from './elements/form'
import { XhHoverCardElement } from './elements/hover-card'
import { XhImageElement } from './elements/image'
import { XhListboxElement } from './elements/listbox'
import { XhLoadingBarElement } from './elements/loading-bar'
import { XhMenuElement } from './elements/menu'
import { XhMenubarElement } from './elements/menubar'
import { XhNavigationMenuElement } from './elements/navigation-menu'
import { XhNumberFieldElement } from './elements/number-field'
import { XhPaginationElement } from './elements/pagination'
import { XhPinInputElement } from './elements/pin-input'
import { XhPopoverElement } from './elements/popover'
import { XhProgressElement } from './elements/progress'
import { XhRadioGroupElement } from './elements/radio-group'
import { XhRatingElement } from './elements/rating'
import { XhScrollAreaElement } from './elements/scroll-area'
import { XhSelectElement } from './elements/select'
import { XhSeparatorElement } from './elements/separator'
import { XhSliderElement } from './elements/slider'
import { XhSplitterElement } from './elements/splitter'
import { XhStepsElement } from './elements/steps'
import { XhSwitchElement } from './elements/switch'
import { XhTableElement } from './elements/table'
import { XhTabsElement } from './elements/tabs'
import { XhTagsInputElement } from './elements/tags-input'
import { XhTextFieldElement } from './elements/text-field'
import { XhTimeFieldElement } from './elements/time-field'
import { XhTimePickerElement } from './elements/time-picker'
import { XhToastElement } from './elements/toast'
import { XhToasterElement } from './elements/toaster'
import { XhToggleElement } from './elements/toggle'
import { XhToggleGroupElement } from './elements/toggle-group'
import { XhToolbarElement } from './elements/toolbar'
import { XhTooltipElement } from './elements/tooltip'
import { XhTourElement } from './elements/tour'
import { XhTransferElement } from './elements/transfer'
import { XhTreeElement } from './elements/tree'
import { XhTreeSelectElement } from './elements/tree-select'
import { XhVirtualizerElement } from './elements/virtualizer'
import { defineElement } from './runtime/registry'

const VERSION = '0.0.0'

// 显式注册（惰性）：只有在 DOM 环境显式调用才 customElements.define，主入口 import 不注册。
export function defineXhElements(): void {
  defineElement('xh-accordion', XhAccordionElement, VERSION)
  defineElement('xh-anchor', XhAnchorElement, VERSION)
  defineElement('xh-avatar', XhAvatarElement, VERSION)
  defineElement('xh-badge', XhBadgeElement, VERSION)
  defineElement('xh-breadcrumb', XhBreadcrumbElement, VERSION)
  defineElement('xh-button', XhButtonElement, VERSION)
  defineElement('xh-calendar', XhCalendarElement, VERSION)
  defineElement('xh-carousel', XhCarouselElement, VERSION)
  defineElement('xh-cascader', XhCascaderElement, VERSION)
  defineElement('xh-checkbox', XhCheckboxElement, VERSION)
  defineElement('xh-checkbox-group', XhCheckboxGroupElement, VERSION)
  defineElement('xh-clipboard', XhClipboardElement, VERSION)
  defineElement('xh-collapsible', XhCollapsibleElement, VERSION)
  defineElement('xh-color-picker', XhColorPickerElement, VERSION)
  defineElement('xh-combobox', XhComboboxElement, VERSION)
  defineElement('xh-context-menu', XhContextMenuElement, VERSION)
  defineElement('xh-date-field', XhDateFieldElement, VERSION)
  defineElement('xh-date-picker', XhDatePickerElement, VERSION)
  defineElement('xh-dialog', XhDialogElement, VERSION)
  defineElement('xh-drawer', XhDrawerElement, VERSION)
  defineElement('xh-editable', XhEditableElement, VERSION)
  defineElement('xh-field', XhFieldElement, VERSION)
  defineElement('xh-file-upload', XhFileUploadElement, VERSION)
  defineElement('xh-form', XhFormElement, VERSION)
  defineElement('xh-hover-card', XhHoverCardElement, VERSION)
  defineElement('xh-image', XhImageElement, VERSION)
  defineElement('xh-listbox', XhListboxElement, VERSION)
  defineElement('xh-loading-bar', XhLoadingBarElement, VERSION)
  defineElement('xh-menu', XhMenuElement, VERSION)
  defineElement('xh-menubar', XhMenubarElement, VERSION)
  defineElement('xh-navigation-menu', XhNavigationMenuElement, VERSION)
  defineElement('xh-pagination', XhPaginationElement, VERSION)
  defineElement('xh-pin-input', XhPinInputElement, VERSION)
  defineElement('xh-popover', XhPopoverElement, VERSION)
  defineElement('xh-progress', XhProgressElement, VERSION)
  defineElement('xh-radio-group', XhRadioGroupElement, VERSION)
  defineElement('xh-number-field', XhNumberFieldElement, VERSION)
  defineElement('xh-rating', XhRatingElement, VERSION)
  defineElement('xh-scroll-area', XhScrollAreaElement, VERSION)
  defineElement('xh-select', XhSelectElement, VERSION)
  defineElement('xh-separator', XhSeparatorElement, VERSION)
  defineElement('xh-slider', XhSliderElement, VERSION)
  defineElement('xh-splitter', XhSplitterElement, VERSION)
  defineElement('xh-steps', XhStepsElement, VERSION)
  defineElement('xh-switch', XhSwitchElement, VERSION)
  defineElement('xh-table', XhTableElement, VERSION)
  defineElement('xh-tabs', XhTabsElement, VERSION)
  defineElement('xh-tags-input', XhTagsInputElement, VERSION)
  defineElement('xh-text-field', XhTextFieldElement, VERSION)
  defineElement('xh-time-field', XhTimeFieldElement, VERSION)
  defineElement('xh-time-picker', XhTimePickerElement, VERSION)
  defineElement('xh-toast', XhToastElement, VERSION)
  defineElement('xh-toaster', XhToasterElement, VERSION)
  defineElement('xh-toggle', XhToggleElement, VERSION)
  defineElement('xh-toggle-group', XhToggleGroupElement, VERSION)
  defineElement('xh-toolbar', XhToolbarElement, VERSION)
  defineElement('xh-tooltip', XhTooltipElement, VERSION)
  defineElement('xh-tour', XhTourElement, VERSION)
  defineElement('xh-transfer', XhTransferElement, VERSION)
  defineElement('xh-tree', XhTreeElement, VERSION)
  defineElement('xh-tree-select', XhTreeSelectElement, VERSION)
  defineElement('xh-virtualizer', XhVirtualizerElement, VERSION)
}

export {
  XhAccordionElement,
  XhAnchorElement,
  XhAvatarElement,
  XhBadgeElement,
  XhBreadcrumbElement,
  XhButtonElement,
  XhCalendarElement,
  XhCarouselElement,
  XhCascaderElement,
  XhCheckboxElement,
  XhCheckboxGroupElement,
  XhClipboardElement,
  XhCollapsibleElement,
  XhColorPickerElement,
  XhComboboxElement,
  XhContextMenuElement,
  XhDateFieldElement,
  XhDatePickerElement,
  XhDialogElement,
  XhDrawerElement,
  XhEditableElement,
  XhFieldElement,
  XhFileUploadElement,
  XhFormElement,
  XhHoverCardElement,
  XhImageElement,
  XhListboxElement,
  XhLoadingBarElement,
  XhMenubarElement,
  XhMenuElement,
  XhNavigationMenuElement,
  XhPaginationElement,
  XhPinInputElement,
  XhPopoverElement,
  XhProgressElement,
  XhRadioGroupElement,
  XhRatingElement,
  XhScrollAreaElement,
  XhSelectElement,
  XhSeparatorElement,
  XhSliderElement,
  XhSplitterElement,
  XhStepsElement,
  XhSwitchElement,
  XhTableElement,
  XhTabsElement,
  XhTagsInputElement,
  XhTextFieldElement,
  XhTimeFieldElement,
  XhTimePickerElement,
  XhToastElement,
  XhToasterElement,
  XhToggleElement,
  XhToggleGroupElement,
  XhToolbarElement,
  XhTooltipElement,
  XhTourElement,
  XhTransferElement,
  XhTreeElement,
  XhTreeSelectElement,
  XhVirtualizerElement,
}
