import { version as VERSION } from '../package.json'
import { XhAccordionElement } from './elements/accordion'
import { XhAffixElement } from './elements/affix'
import { XhAlertElement } from './elements/alert'
import { XhAnchorElement } from './elements/anchor'
import { XhAvatarElement } from './elements/avatar'
import { XhAvatarGroupElement } from './elements/avatar-group'
import { XhBackTopElement } from './elements/back-top'
import { XhBadgeElement } from './elements/badge'
import { XhBreadcrumbElement } from './elements/breadcrumb'
import { XhButtonElement } from './elements/button'
import { XhButtonGroupElement } from './elements/button-group'
import { XhCalendarElement } from './elements/calendar'
import { XhCardElement } from './elements/card'
import { XhCarouselElement } from './elements/carousel'
import { XhCascaderElement } from './elements/cascader'
import { XhCheckboxElement } from './elements/checkbox'
import { XhCheckboxGroupElement } from './elements/checkbox-group'
import { XhClipboardElement } from './elements/clipboard'
import { XhCodeBlockElement } from './elements/code-block'
import { XhCollapsibleElement } from './elements/collapsible'
import { XhColorPickerElement } from './elements/color-picker'
import { XhComboboxElement } from './elements/combobox'
import { XhComposerElement } from './elements/composer'
import { XhContextMenuElement } from './elements/context-menu'
import { XhCountdownElement } from './elements/countdown'
import { XhDateFieldElement } from './elements/date-field'
import { XhDatePickerElement } from './elements/date-picker'
import { XhDescriptionsElement } from './elements/descriptions'
import { XhDialogElement } from './elements/dialog'
import { XhDrawerElement } from './elements/drawer'
import { XhDynamicInputElement } from './elements/dynamic-input'
import { XhEditableElement } from './elements/editable'
import { XhEllipsisElement } from './elements/ellipsis'
import { XhEmptyStateElement } from './elements/empty-state'
import { XhFieldElement } from './elements/field'
import { XhFileUploadElement } from './elements/file-upload'
import { XhFlexElement } from './elements/flex'
import { XhFloatButtonElement } from './elements/float-button'
import { XhFormElement } from './elements/form'
import { XhGradientTextElement } from './elements/gradient-text'
import { XhGridElement } from './elements/grid'
import { XhHighlightElement } from './elements/highlight'
import { XhHoverCardElement } from './elements/hover-card'
import { XhIconElement } from './elements/icon'
import { XhIconWrapperElement } from './elements/icon-wrapper'
import { XhImageElement } from './elements/image'
import { XhInfiniteScrollElement } from './elements/infinite-scroll'
import { XhLayoutElement } from './elements/layout'
import { XhListElement } from './elements/list'
import { XhListboxElement } from './elements/listbox'
import { XhLoadingBarElement } from './elements/loading-bar'
import { XhLogElement } from './elements/log'
import { XhMarqueeElement } from './elements/marquee'
import { XhMentionElement } from './elements/mention'
import { XhMenuElement } from './elements/menu'
import { XhMenubarElement } from './elements/menubar'
import { XhNavigationMenuElement } from './elements/navigation-menu'
import { XhNumberAnimationElement } from './elements/number-animation'
import { XhNumberFieldElement } from './elements/number-field'
import { XhPageHeaderElement } from './elements/page-header'
import { XhPaginationElement } from './elements/pagination'
import { XhPinInputElement } from './elements/pin-input'
import { XhPopconfirmElement } from './elements/popconfirm'
import { XhPopoverElement } from './elements/popover'
import { XhPopselectElement } from './elements/popselect'
import { XhProgressElement } from './elements/progress'
import { XhQrCodeElement } from './elements/qr-code'
import { XhRadioGroupElement } from './elements/radio-group'
import { XhRatingElement } from './elements/rating'
import { XhResultElement } from './elements/result'
import { XhScrollAreaElement } from './elements/scroll-area'
import { XhSelectElement } from './elements/select'
import { XhSeparatorElement } from './elements/separator'
import { XhSkeletonElement } from './elements/skeleton'
import { XhSliderElement } from './elements/slider'
import { XhSpinnerElement } from './elements/spinner'
import { XhSplitterElement } from './elements/splitter'
import { XhStatisticElement } from './elements/statistic'
import { XhStepsElement } from './elements/steps'
import { XhSwitchElement } from './elements/switch'
import { XhTableElement } from './elements/table'
import { XhTabsElement } from './elements/tabs'
import { XhTagsInputElement } from './elements/tags-input'
import { XhTextFieldElement } from './elements/text-field'
import { XhThreadElement } from './elements/thread'
import { XhTimeElement } from './elements/time'
import { XhTimeFieldElement } from './elements/time-field'
import { XhTimePickerElement } from './elements/time-picker'
import { XhTimelineElement } from './elements/timeline'
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
import { XhTypographyElement } from './elements/typography'
import { XhVirtualizerElement } from './elements/virtualizer'
import { XhWatermarkElement } from './elements/watermark'
import { defineElement } from './runtime/registry'

// 注册全部 xh-* 元素，需显式调用，主入口 import 不注册。
export function defineXhElements(): void {
  defineElement('xh-affix', XhAffixElement, VERSION)
  defineElement('xh-alert', XhAlertElement, VERSION)
  defineElement('xh-avatar-group', XhAvatarGroupElement, VERSION)
  defineElement('xh-back-top', XhBackTopElement, VERSION)
  defineElement('xh-button-group', XhButtonGroupElement, VERSION)
  defineElement('xh-countdown', XhCountdownElement, VERSION)
  defineElement('xh-descriptions', XhDescriptionsElement, VERSION)
  defineElement('xh-dynamic-input', XhDynamicInputElement, VERSION)
  defineElement('xh-ellipsis', XhEllipsisElement, VERSION)
  defineElement('xh-empty-state', XhEmptyStateElement, VERSION)
  defineElement('xh-flex', XhFlexElement, VERSION)
  defineElement('xh-float-button', XhFloatButtonElement, VERSION)
  defineElement('xh-gradient-text', XhGradientTextElement, VERSION)
  defineElement('xh-grid', XhGridElement, VERSION)
  defineElement('xh-highlight', XhHighlightElement, VERSION)
  defineElement('xh-icon-wrapper', XhIconWrapperElement, VERSION)
  defineElement('xh-infinite-scroll', XhInfiniteScrollElement, VERSION)
  defineElement('xh-layout', XhLayoutElement, VERSION)
  defineElement('xh-list', XhListElement, VERSION)
  defineElement('xh-log', XhLogElement, VERSION)
  defineElement('xh-marquee', XhMarqueeElement, VERSION)
  defineElement('xh-mention', XhMentionElement, VERSION)
  defineElement('xh-number-animation', XhNumberAnimationElement, VERSION)
  defineElement('xh-page-header', XhPageHeaderElement, VERSION)
  defineElement('xh-popconfirm', XhPopconfirmElement, VERSION)
  defineElement('xh-popselect', XhPopselectElement, VERSION)
  defineElement('xh-qr-code', XhQrCodeElement, VERSION)
  defineElement('xh-result', XhResultElement, VERSION)
  defineElement('xh-skeleton', XhSkeletonElement, VERSION)
  defineElement('xh-spinner', XhSpinnerElement, VERSION)
  defineElement('xh-accordion', XhAccordionElement, VERSION)
  defineElement('xh-anchor', XhAnchorElement, VERSION)
  defineElement('xh-avatar', XhAvatarElement, VERSION)
  defineElement('xh-badge', XhBadgeElement, VERSION)
  defineElement('xh-breadcrumb', XhBreadcrumbElement, VERSION)
  defineElement('xh-button', XhButtonElement, VERSION)
  defineElement('xh-calendar', XhCalendarElement, VERSION)
  defineElement('xh-card', XhCardElement, VERSION)
  defineElement('xh-carousel', XhCarouselElement, VERSION)
  defineElement('xh-cascader', XhCascaderElement, VERSION)
  defineElement('xh-checkbox', XhCheckboxElement, VERSION)
  defineElement('xh-checkbox-group', XhCheckboxGroupElement, VERSION)
  defineElement('xh-clipboard', XhClipboardElement, VERSION)
  defineElement('xh-code-block', XhCodeBlockElement, VERSION)
  defineElement('xh-collapsible', XhCollapsibleElement, VERSION)
  defineElement('xh-color-picker', XhColorPickerElement, VERSION)
  defineElement('xh-combobox', XhComboboxElement, VERSION)
  defineElement('xh-composer', XhComposerElement, VERSION)
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
  defineElement('xh-icon', XhIconElement, VERSION)
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
  defineElement('xh-statistic', XhStatisticElement, VERSION)
  defineElement('xh-steps', XhStepsElement, VERSION)
  defineElement('xh-switch', XhSwitchElement, VERSION)
  defineElement('xh-table', XhTableElement, VERSION)
  defineElement('xh-tabs', XhTabsElement, VERSION)
  defineElement('xh-tags-input', XhTagsInputElement, VERSION)
  defineElement('xh-text-field', XhTextFieldElement, VERSION)
  defineElement('xh-thread', XhThreadElement, VERSION)
  defineElement('xh-time', XhTimeElement, VERSION)
  defineElement('xh-time-field', XhTimeFieldElement, VERSION)
  defineElement('xh-time-picker', XhTimePickerElement, VERSION)
  defineElement('xh-timeline', XhTimelineElement, VERSION)
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
  defineElement('xh-typography', XhTypographyElement, VERSION)
  defineElement('xh-virtualizer', XhVirtualizerElement, VERSION)
  defineElement('xh-watermark', XhWatermarkElement, VERSION)
}

export {
  XhAccordionElement,
  XhAlertElement,
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
  XhCodeBlockElement,
  XhCollapsibleElement,
  XhColorPickerElement,
  XhComboboxElement,
  XhComposerElement,
  XhContextMenuElement,
  XhDateFieldElement,
  XhDatePickerElement,
  XhDialogElement,
  XhDrawerElement,
  XhEditableElement,
  XhEmptyStateElement,
  XhFieldElement,
  XhFileUploadElement,
  XhFormElement,
  XhHoverCardElement,
  XhIconElement,
  XhImageElement,
  XhListboxElement,
  XhLoadingBarElement,
  XhMenubarElement,
  XhMenuElement,
  XhNavigationMenuElement,
  XhNumberFieldElement,
  XhPaginationElement,
  XhPinInputElement,
  XhPopoverElement,
  XhProgressElement,
  XhRadioGroupElement,
  XhRatingElement,
  XhScrollAreaElement,
  XhSelectElement,
  XhSeparatorElement,
  XhSkeletonElement,
  XhSliderElement,
  XhSpinnerElement,
  XhSplitterElement,
  XhStepsElement,
  XhSwitchElement,
  XhTableElement,
  XhTabsElement,
  XhTagsInputElement,
  XhTextFieldElement,
  XhThreadElement,
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
