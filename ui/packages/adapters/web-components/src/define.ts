import { isDev, VERSION as KERNEL_VERSION } from '@xihan-ui/kernel'
import { checkLockstepVersion, printMetadataBannerOnce, registerRuntimeHost } from '@xihan-ui/kernel/metadata'
import { version as VERSION } from '../package.json'
import { XhAccordionElement } from './elements/accordion'
import { XhAffixElement } from './elements/affix'
import { XhAlertElement } from './elements/alert'
import { XhAnchorElement } from './elements/anchor'
import { XhApprovalElement } from './elements/approval'
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
import { XhCodeViewElement } from './elements/code-view'
import { XhCollapsibleElement } from './elements/collapsible'
import { XhColorPickerElement } from './elements/color-picker'
import { XhComboboxElement } from './elements/combobox'
import { XhConfigElement } from './elements/config'
import { XhContextMenuElement } from './elements/context-menu'
import { XhCountdownElement } from './elements/countdown'
import { XhDateFieldElement } from './elements/date-field'
import { XhDatePickerElement } from './elements/date-picker'
import { XhDescriptionsElement } from './elements/descriptions'
import { XhDialogElement } from './elements/dialog'
import { XhDiffViewElement } from './elements/diff-view'
import { XhDownloadTriggerElement } from './elements/download-trigger'
import { XhDrawerElement } from './elements/drawer'
import { XhDynamicInputElement } from './elements/dynamic-input'
import { XhEditableElement } from './elements/editable'
import { XhEllipsisElement } from './elements/ellipsis'
import { XhEmptyStateElement } from './elements/empty-state'
import { XhFieldElement } from './elements/field'
import { XhFieldsetElement } from './elements/fieldset'
import { XhFileUploadElement } from './elements/file-upload'
import { XhFlexElement } from './elements/flex'
import { XhFloatButtonElement } from './elements/float-button'
import { XhFloatingPanelElement } from './elements/floating-panel'
import { XhFormElement } from './elements/form'
import { XhGradientTextElement } from './elements/gradient-text'
import { XhGridElement } from './elements/grid'
import { XhHeatmapElement } from './elements/heatmap'
import { XhHighlightElement } from './elements/highlight'
import { XhHotkeysElement } from './elements/hotkeys'
import { XhHoverCardElement } from './elements/hover-card'
import { XhIconElement } from './elements/icon'
import { XhIconWrapperElement } from './elements/icon-wrapper'
import { XhImageElement } from './elements/image'
import { XhImageCropperElement } from './elements/image-cropper'
import { XhImageViewerElement } from './elements/image-viewer'
import { XhInfiniteScrollElement } from './elements/infinite-scroll'
import { XhJsonViewerElement } from './elements/json-viewer'
import { XhLayoutElement } from './elements/layout'
import { XhListElement } from './elements/list'
import { XhListboxElement } from './elements/listbox'
import { XhLoadingBarElement } from './elements/loading-bar'
import { XhLogElement } from './elements/log'
import { XhMarkdownStreamElement } from './elements/markdown-stream'
import { XhMarqueeElement } from './elements/marquee'
import { XhMasonryElement } from './elements/masonry'
import { XhMentionElement } from './elements/mention'
import { XhMenuElement } from './elements/menu'
import { XhMenubarElement } from './elements/menubar'
import { XhMessageFeedElement } from './elements/message-feed'
import { XhNavigationMenuElement } from './elements/navigation-menu'
import { XhNotificationElement, XhNotificationItemElement } from './elements/notification'
import { XhNumberAnimationElement } from './elements/number-animation'
import { XhNumberFieldElement } from './elements/number-field'
import { XhPageHeaderElement } from './elements/page-header'
import { XhPaginationElement } from './elements/pagination'
import { XhPasswordInputElement } from './elements/password-input'
import { XhPinInputElement } from './elements/pin-input'
import { XhPopconfirmElement } from './elements/popconfirm'
import { XhPopoverElement } from './elements/popover'
import { XhPopselectElement } from './elements/popselect'
import { XhProgressElement } from './elements/progress'
import { XhPromptInputElement } from './elements/prompt-input'
import { XhQrCodeElement } from './elements/qr-code'
import { XhQuestionFlowElement } from './elements/question-flow'
import { XhRadioGroupElement } from './elements/radio-group'
import { XhRatingElement } from './elements/rating'
import { XhReasoningElement } from './elements/reasoning'
import { XhResizableElement } from './elements/resizable'
import { XhResultElement } from './elements/result'
import { XhScrollAreaElement } from './elements/scroll-area'
import { XhScrollbarElement } from './elements/scrollbar'
import { XhSegmentedElement } from './elements/segmented'
import { XhSelectElement } from './elements/select'
import { XhSeparatorElement } from './elements/separator'
import { XhSideNavElement } from './elements/side-nav'
import { XhSignaturePadElement } from './elements/signature-pad'
import { XhSkeletonElement } from './elements/skeleton'
import { XhSliderElement } from './elements/slider'
import { XhSortableElement } from './elements/sortable'
import { XhSpaceElement } from './elements/space'
import { XhSpinnerElement } from './elements/spinner'
import { XhSplitterElement } from './elements/splitter'
import { XhStatisticElement } from './elements/statistic'
import { XhStepsElement } from './elements/steps'
import { XhSwitchElement } from './elements/switch'
import { XhTableElement } from './elements/table'
import { XhTabsElement } from './elements/tabs'
import { XhTagElement } from './elements/tag'
import { XhTagsInputElement } from './elements/tags-input'
import { XhTextFieldElement } from './elements/text-field'
import { XhTimeElement } from './elements/time'
import { XhTimeFieldElement } from './elements/time-field'
import { XhTimePickerElement } from './elements/time-picker'
import { XhTimelineElement } from './elements/timeline'
import { XhTimerElement } from './elements/timer'
import { XhToastElement } from './elements/toast'
import { XhToggleElement } from './elements/toggle'
import { XhToggleGroupElement } from './elements/toggle-group'
import { XhToolCallElement } from './elements/tool-call'
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
  defineElement('xh-diff-view', XhDiffViewElement, VERSION)
  defineElement('xh-download-trigger', XhDownloadTriggerElement, VERSION)
  defineElement('xh-dynamic-input', XhDynamicInputElement, VERSION)
  defineElement('xh-ellipsis', XhEllipsisElement, VERSION)
  defineElement('xh-empty-state', XhEmptyStateElement, VERSION)
  defineElement('xh-fieldset', XhFieldsetElement, VERSION)
  defineElement('xh-flex', XhFlexElement, VERSION)
  defineElement('xh-float-button', XhFloatButtonElement, VERSION)
  defineElement('xh-floating-panel', XhFloatingPanelElement, VERSION)
  defineElement('xh-gradient-text', XhGradientTextElement, VERSION)
  defineElement('xh-grid', XhGridElement, VERSION)
  defineElement('xh-heatmap', XhHeatmapElement, VERSION)
  defineElement('xh-highlight', XhHighlightElement, VERSION)
  defineElement('xh-hotkeys', XhHotkeysElement, VERSION)
  defineElement('xh-icon-wrapper', XhIconWrapperElement, VERSION)
  defineElement('xh-image-cropper', XhImageCropperElement, VERSION)
  defineElement('xh-infinite-scroll', XhInfiniteScrollElement, VERSION)
  defineElement('xh-json-viewer', XhJsonViewerElement, VERSION)
  defineElement('xh-layout', XhLayoutElement, VERSION)
  defineElement('xh-list', XhListElement, VERSION)
  defineElement('xh-log', XhLogElement, VERSION)
  defineElement('xh-markdown-stream', XhMarkdownStreamElement, VERSION)
  defineElement('xh-marquee', XhMarqueeElement, VERSION)
  defineElement('xh-masonry', XhMasonryElement, VERSION)
  defineElement('xh-mention', XhMentionElement, VERSION)
  defineElement('xh-number-animation', XhNumberAnimationElement, VERSION)
  defineElement('xh-page-header', XhPageHeaderElement, VERSION)
  defineElement('xh-password-input', XhPasswordInputElement, VERSION)
  defineElement('xh-popconfirm', XhPopconfirmElement, VERSION)
  defineElement('xh-popselect', XhPopselectElement, VERSION)
  defineElement('xh-qr-code', XhQrCodeElement, VERSION)
  defineElement('xh-question-flow', XhQuestionFlowElement, VERSION)
  defineElement('xh-reasoning', XhReasoningElement, VERSION)
  defineElement('xh-resizable', XhResizableElement, VERSION)
  defineElement('xh-result', XhResultElement, VERSION)
  defineElement('xh-segmented', XhSegmentedElement, VERSION)
  defineElement('xh-signature-pad', XhSignaturePadElement, VERSION)
  defineElement('xh-skeleton', XhSkeletonElement, VERSION)
  defineElement('xh-space', XhSpaceElement, VERSION)
  defineElement('xh-spinner', XhSpinnerElement, VERSION)
  defineElement('xh-accordion', XhAccordionElement, VERSION)
  defineElement('xh-anchor', XhAnchorElement, VERSION)
  defineElement('xh-approval', XhApprovalElement, VERSION)
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
  defineElement('xh-config', XhConfigElement, VERSION)
  defineElement('xh-code-view', XhCodeViewElement, VERSION)
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
  defineElement('xh-icon', XhIconElement, VERSION)
  defineElement('xh-image', XhImageElement, VERSION)
  defineElement('xh-image-viewer', XhImageViewerElement, VERSION)
  defineElement('xh-listbox', XhListboxElement, VERSION)
  defineElement('xh-loading-bar', XhLoadingBarElement, VERSION)
  defineElement('xh-menu', XhMenuElement, VERSION)
  defineElement('xh-menubar', XhMenubarElement, VERSION)
  defineElement('xh-message-feed', XhMessageFeedElement, VERSION)
  defineElement('xh-navigation-menu', XhNavigationMenuElement, VERSION)
  defineElement('xh-notification', XhNotificationElement, VERSION)
  defineElement('xh-notification-item', XhNotificationItemElement, VERSION)
  defineElement('xh-pagination', XhPaginationElement, VERSION)
  defineElement('xh-pin-input', XhPinInputElement, VERSION)
  defineElement('xh-popover', XhPopoverElement, VERSION)
  defineElement('xh-progress', XhProgressElement, VERSION)
  defineElement('xh-prompt-input', XhPromptInputElement, VERSION)
  defineElement('xh-radio-group', XhRadioGroupElement, VERSION)
  defineElement('xh-number-field', XhNumberFieldElement, VERSION)
  defineElement('xh-rating', XhRatingElement, VERSION)
  defineElement('xh-scroll-area', XhScrollAreaElement, VERSION)
  defineElement('xh-scrollbar', XhScrollbarElement, VERSION)
  defineElement('xh-select', XhSelectElement, VERSION)
  defineElement('xh-separator', XhSeparatorElement, VERSION)
  defineElement('xh-side-nav', XhSideNavElement, VERSION)
  defineElement('xh-slider', XhSliderElement, VERSION)
  defineElement('xh-sortable', XhSortableElement, VERSION)
  defineElement('xh-splitter', XhSplitterElement, VERSION)
  defineElement('xh-statistic', XhStatisticElement, VERSION)
  defineElement('xh-steps', XhStepsElement, VERSION)
  defineElement('xh-switch', XhSwitchElement, VERSION)
  defineElement('xh-table', XhTableElement, VERSION)
  defineElement('xh-tabs', XhTabsElement, VERSION)
  defineElement('xh-tag', XhTagElement, VERSION)
  defineElement('xh-tags-input', XhTagsInputElement, VERSION)
  defineElement('xh-text-field', XhTextFieldElement, VERSION)
  defineElement('xh-time', XhTimeElement, VERSION)
  defineElement('xh-time-field', XhTimeFieldElement, VERSION)
  defineElement('xh-time-picker', XhTimePickerElement, VERSION)
  defineElement('xh-timeline', XhTimelineElement, VERSION)
  defineElement('xh-timer', XhTimerElement, VERSION)
  defineElement('xh-toast', XhToastElement, VERSION)
  defineElement('xh-toggle', XhToggleElement, VERSION)
  defineElement('xh-toggle-group', XhToggleGroupElement, VERSION)
  defineElement('xh-tool-call', XhToolCallElement, VERSION)
  defineElement('xh-toolbar', XhToolbarElement, VERSION)
  defineElement('xh-tooltip', XhTooltipElement, VERSION)
  defineElement('xh-tour', XhTourElement, VERSION)
  defineElement('xh-transfer', XhTransferElement, VERSION)
  defineElement('xh-tree', XhTreeElement, VERSION)
  defineElement('xh-tree-select', XhTreeSelectElement, VERSION)
  defineElement('xh-typography', XhTypographyElement, VERSION)
  defineElement('xh-virtualizer', XhVirtualizerElement, VERSION)
  defineElement('xh-watermark', XhWatermarkElement, VERSION)

  // 宿主登记不分 dev/prod：元数据要能报出运行在哪个适配器上
  registerRuntimeHost('web-components', VERSION)
  // 引用即打印：注册全部元素时打一次启动横幅（内部 dev 门禁 + 每页一次）
  printMetadataBannerOnce()

  if (isDev())
    checkLockstepVersion('web-components', VERSION, KERNEL_VERSION)
}

export {
  XhAccordionElement,
  XhAlertElement,
  XhAnchorElement,
  XhApprovalElement,
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
  XhCodeViewElement,
  XhCollapsibleElement,
  XhColorPickerElement,
  XhComboboxElement,
  XhConfigElement,
  XhContextMenuElement,
  XhDateFieldElement,
  XhDatePickerElement,
  XhDialogElement,
  XhDiffViewElement,
  XhDownloadTriggerElement,
  XhDrawerElement,
  XhEditableElement,
  XhEmptyStateElement,
  XhFieldElement,
  XhFieldsetElement,
  XhFileUploadElement,
  XhFloatingPanelElement,
  XhFormElement,
  XhHeatmapElement,
  XhHotkeysElement,
  XhHoverCardElement,
  XhIconElement,
  XhImageCropperElement,
  XhImageElement,
  XhImageViewerElement,
  XhJsonViewerElement,
  XhListboxElement,
  XhLoadingBarElement,
  XhMarkdownStreamElement,
  XhMasonryElement,
  XhMenubarElement,
  XhMenuElement,
  XhMessageFeedElement,
  XhNavigationMenuElement,
  XhNotificationElement,
  XhNotificationItemElement,
  XhNumberFieldElement,
  XhPaginationElement,
  XhPasswordInputElement,
  XhPinInputElement,
  XhPopoverElement,
  XhProgressElement,
  XhPromptInputElement,
  XhQuestionFlowElement,
  XhRadioGroupElement,
  XhRatingElement,
  XhReasoningElement,
  XhResizableElement,
  XhScrollAreaElement,
  XhScrollbarElement,
  XhSegmentedElement,
  XhSelectElement,
  XhSeparatorElement,
  XhSideNavElement,
  XhSignaturePadElement,
  XhSkeletonElement,
  XhSliderElement,
  XhSortableElement,
  XhSpaceElement,
  XhSpinnerElement,
  XhSplitterElement,
  XhStepsElement,
  XhSwitchElement,
  XhTableElement,
  XhTabsElement,
  XhTagElement,
  XhTagsInputElement,
  XhTextFieldElement,
  XhTimeFieldElement,
  XhTimePickerElement,
  XhTimerElement,
  XhToastElement,
  XhToggleElement,
  XhToggleGroupElement,
  XhToolbarElement,
  XhToolCallElement,
  XhTooltipElement,
  XhTourElement,
  XhTransferElement,
  XhTreeElement,
  XhTreeSelectElement,
  XhVirtualizerElement,
}
