/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 define 相关实现。

import { VERSION as CORE_VERSION, isDev } from '@xihan-ui/core'
import { checkLockstepVersion, printMetadataBannerOnce, registerRuntimeHost } from '@xihan-ui/core/metadata'
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
import { XhBarCodeElement } from './elements/bar-code'
import { XhBreadcrumbElement } from './elements/breadcrumb'
import { XhButtonElement } from './elements/button'
import { XhButtonGroupElement } from './elements/button-group'
import { XhCalendarPickerElement } from './elements/calendar-picker'
import { XhCalendarRangePickerElement } from './elements/calendar-range-picker'
import { XhCardElement } from './elements/card'
import { XhCarouselElement } from './elements/carousel'
import { XhCartesianChartElement } from './elements/cartesian-chart'
import { XhCascaderElement } from './elements/cascader'
import { XhCheckboxElement } from './elements/checkbox'
import { XhCheckboxGroupElement } from './elements/checkbox-group'
import { XhCitationElement } from './elements/citation'
import { XhClipboardElement } from './elements/clipboard'
import { XhCodeViewElement } from './elements/code-view'
import { XhCollapsibleElement } from './elements/collapsible'
import { XhColorFieldElement } from './elements/color-field'
import { XhColorPickerElement } from './elements/color-picker'
import { XhColorSliderElement } from './elements/color-slider'
import { XhColorSwatchElement } from './elements/color-swatch'
import { XhColorSwatchPickerElement } from './elements/color-swatch-picker'
import { XhComboboxElement } from './elements/combobox'
import { XhCommandElement } from './elements/command'
import { XhConfigElement } from './elements/config'
import { XhContextMenuElement } from './elements/context-menu'
import { XhDateFieldElement } from './elements/date-field'
import { XhDatePickerElement } from './elements/date-picker'
import { XhDateRangePickerElement } from './elements/date-range-picker'
import { XhDescriptionsElement } from './elements/descriptions'
import { XhDialogElement } from './elements/dialog'
import { XhDiffViewElement } from './elements/diff-view'
import { XhDownloadTriggerElement } from './elements/download-trigger'
import { XhDrawerElement } from './elements/drawer'
import { XhEditableElement } from './elements/editable'
import { XhEmptyStateElement } from './elements/empty-state'
import { XhExpressionInputElement } from './elements/expression-input'
import { XhFieldBoundaryElement, XhFieldElement } from './elements/field'
import { XhFieldArrayElement } from './elements/field-array'
import { XhFieldsetElement } from './elements/fieldset'
import { XhFileUploadElement } from './elements/file-upload'
import { XhFlexElement } from './elements/flex'
import { XhFloatButtonElement } from './elements/float-button'
import { XhFloatingPanelElement } from './elements/floating-panel'
import { XhFormElement } from './elements/form'
import { XhFormatInputElement } from './elements/format-input'
import { XhFunnelChartElement } from './elements/funnel-chart'
import { XhGraphChartElement } from './elements/graph-chart'
import { XhGridElement } from './elements/grid'
import { XhGridListElement } from './elements/grid-list'
import { XhHeatmapElement } from './elements/heatmap'
import { XhHierarchyChartElement } from './elements/hierarchy-chart'
import { XhHighlightElement } from './elements/highlight'
import { XhHoverCardElement } from './elements/hover-card'
import { XhIconElement } from './elements/icon'
import { XhImageElement } from './elements/image'
import { XhImageCropperElement } from './elements/image-cropper'
import { XhImageViewerElement } from './elements/image-viewer'
import { XhInfiniteScrollElement } from './elements/infinite-scroll'
import { XhInputGroupElement } from './elements/input-group'
import { XhJsonViewerElement } from './elements/json-viewer'
import { XhKbdElement } from './elements/kbd'
import { XhLayoutElement } from './elements/layout'
import { XhListElement } from './elements/list'
import { XhListboxElement } from './elements/listbox'
import { XhLoadingBarElement } from './elements/loading-bar'
import { XhLogElement } from './elements/log'
import { XhMarkdownStreamElement } from './elements/markdown-stream'
import { XhMarqueeElement } from './elements/marquee'
import { XhMasonryElement } from './elements/masonry'
import { XhMatrixCodeElement } from './elements/matrix-code'
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
import { XhPieChartElement } from './elements/pie-chart'
import { XhPinInputElement } from './elements/pin-input'
import { XhPopconfirmElement } from './elements/popconfirm'
import { XhPopoverElement } from './elements/popover'
import { XhProgressElement } from './elements/progress'
import { XhPromptInputElement } from './elements/prompt-input'
import { XhQuestionFlowElement } from './elements/question-flow'
import { XhRadarChartElement } from './elements/radar-chart'
import { XhRadioGroupElement } from './elements/radio-group'
import { XhRatingElement } from './elements/rating'
import { XhReasoningElement } from './elements/reasoning'
import { XhResizableElement } from './elements/resizable'
import { XhSankeyChartElement } from './elements/sankey-chart'
import { XhScrollAreaElement } from './elements/scroll-area'
import { XhScrollbarElement } from './elements/scrollbar'
import { XhSelectElement } from './elements/select'
import { XhSeparatorElement } from './elements/separator'
import { XhSideNavElement } from './elements/side-nav'
import { XhSignaturePadElement } from './elements/signature-pad'
import { XhSkeletonElement } from './elements/skeleton'
import { XhSliderElement } from './elements/slider'
import { XhSortableElement } from './elements/sortable'
import { XhSparklineElement } from './elements/sparkline'
import { XhSpinnerElement } from './elements/spinner'
import { XhSplitterElement } from './elements/splitter'
import { XhStatisticElement } from './elements/statistic'
import { XhStepsElement } from './elements/steps'
import { XhSwitchElement } from './elements/switch'
import { XhTableElement } from './elements/table'
import { XhTabsElement } from './elements/tabs'
import { XhTagElement } from './elements/tag'
import { XhTagGroupElement } from './elements/tag-group'
import { XhTagsInputElement } from './elements/tags-input'
import { XhTextFieldElement } from './elements/text-field'
import { XhTimeFieldElement } from './elements/time-field'
import { XhTimePickerElement } from './elements/time-picker'
import { XhTimeRangePickerElement } from './elements/time-range-picker'
import { XhTimelineElement } from './elements/timeline'
import { XhTimerElement } from './elements/timer'
import { XhTimestampElement } from './elements/timestamp'
import { XhToggleElement } from './elements/toggle'
import { XhToggleGroupElement } from './elements/toggle-group'
import { XhToolCallElement } from './elements/tool-call'
import { XhToolbarElement } from './elements/toolbar'
import { XhTooltipElement, XhTooltipProviderElement } from './elements/tooltip'
import { XhTourElement } from './elements/tour'
import { XhTransferElement } from './elements/transfer'
import { XhTreeElement } from './elements/tree'
import { XhTreeSelectElement } from './elements/tree-select'
import { XhTruncateElement } from './elements/truncate'
import { XhTypographyElement } from './elements/typography'
import { XhVirtualizerElement } from './elements/virtualizer'
import { XhWatermarkElement } from './elements/watermark'
import { defineElement } from './runtime/registry'

/**
 * 标签 → 元素类：全量注册按这张表的次序逐个注册，按需注册的类型约束也从它推出，两处不会对不上。
 */
const XH_ELEMENTS = {
  'xh-affix': XhAffixElement,
  'xh-alert': XhAlertElement,
  'xh-avatar-group': XhAvatarGroupElement,
  'xh-back-top': XhBackTopElement,
  'xh-bar-code': XhBarCodeElement,
  'xh-button-group': XhButtonGroupElement,
  'xh-cartesian-chart': XhCartesianChartElement,
  'xh-citation': XhCitationElement,
  'xh-color-field': XhColorFieldElement,
  'xh-color-slider': XhColorSliderElement,
  'xh-color-swatch': XhColorSwatchElement,
  'xh-color-swatch-picker': XhColorSwatchPickerElement,
  'xh-command': XhCommandElement,
  'xh-date-range-picker': XhDateRangePickerElement,
  'xh-descriptions': XhDescriptionsElement,
  'xh-diff-view': XhDiffViewElement,
  'xh-download-trigger': XhDownloadTriggerElement,
  'xh-empty-state': XhEmptyStateElement,
  'xh-expression-input': XhExpressionInputElement,
  'xh-field-array': XhFieldArrayElement,
  'xh-fieldset': XhFieldsetElement,
  'xh-flex': XhFlexElement,
  'xh-float-button': XhFloatButtonElement,
  'xh-floating-panel': XhFloatingPanelElement,
  'xh-format-input': XhFormatInputElement,
  'xh-funnel-chart': XhFunnelChartElement,
  'xh-graph-chart': XhGraphChartElement,
  'xh-grid': XhGridElement,
  'xh-grid-list': XhGridListElement,
  'xh-heatmap': XhHeatmapElement,
  'xh-hierarchy-chart': XhHierarchyChartElement,
  'xh-highlight': XhHighlightElement,
  'xh-kbd': XhKbdElement,
  'xh-image-cropper': XhImageCropperElement,
  'xh-infinite-scroll': XhInfiniteScrollElement,
  'xh-input-group': XhInputGroupElement,
  'xh-json-viewer': XhJsonViewerElement,
  'xh-layout': XhLayoutElement,
  'xh-list': XhListElement,
  'xh-log': XhLogElement,
  'xh-markdown-stream': XhMarkdownStreamElement,
  'xh-marquee': XhMarqueeElement,
  'xh-masonry': XhMasonryElement,
  'xh-matrix-code': XhMatrixCodeElement,
  'xh-mention': XhMentionElement,
  'xh-number-animation': XhNumberAnimationElement,
  'xh-page-header': XhPageHeaderElement,
  'xh-password-input': XhPasswordInputElement,
  'xh-pie-chart': XhPieChartElement,
  'xh-popconfirm': XhPopconfirmElement,
  'xh-question-flow': XhQuestionFlowElement,
  'xh-radar-chart': XhRadarChartElement,
  'xh-reasoning': XhReasoningElement,
  'xh-resizable': XhResizableElement,
  'xh-sankey-chart': XhSankeyChartElement,
  'xh-signature-pad': XhSignaturePadElement,
  'xh-skeleton': XhSkeletonElement,
  'xh-sparkline': XhSparklineElement,
  'xh-spinner': XhSpinnerElement,
  'xh-accordion': XhAccordionElement,
  'xh-anchor': XhAnchorElement,
  'xh-approval': XhApprovalElement,
  'xh-avatar': XhAvatarElement,
  'xh-badge': XhBadgeElement,
  'xh-breadcrumb': XhBreadcrumbElement,
  'xh-button': XhButtonElement,
  'xh-calendar-picker': XhCalendarPickerElement,
  'xh-calendar-range-picker': XhCalendarRangePickerElement,
  'xh-card': XhCardElement,
  'xh-carousel': XhCarouselElement,
  'xh-cascader': XhCascaderElement,
  'xh-checkbox': XhCheckboxElement,
  'xh-checkbox-group': XhCheckboxGroupElement,
  'xh-clipboard': XhClipboardElement,
  'xh-config': XhConfigElement,
  'xh-code-view': XhCodeViewElement,
  'xh-collapsible': XhCollapsibleElement,
  'xh-color-picker': XhColorPickerElement,
  'xh-combobox': XhComboboxElement,
  'xh-context-menu': XhContextMenuElement,
  'xh-date-field': XhDateFieldElement,
  'xh-date-picker': XhDatePickerElement,
  'xh-dialog': XhDialogElement,
  'xh-drawer': XhDrawerElement,
  'xh-editable': XhEditableElement,
  'xh-field': XhFieldElement,
  'xh-field-boundary': XhFieldBoundaryElement,
  'xh-file-upload': XhFileUploadElement,
  'xh-form': XhFormElement,
  'xh-hover-card': XhHoverCardElement,
  'xh-icon': XhIconElement,
  'xh-image': XhImageElement,
  'xh-image-viewer': XhImageViewerElement,
  'xh-listbox': XhListboxElement,
  'xh-loading-bar': XhLoadingBarElement,
  'xh-menu': XhMenuElement,
  'xh-menubar': XhMenubarElement,
  'xh-message-feed': XhMessageFeedElement,
  'xh-navigation-menu': XhNavigationMenuElement,
  'xh-notification': XhNotificationElement,
  'xh-notification-item': XhNotificationItemElement,
  'xh-pagination': XhPaginationElement,
  'xh-pin-input': XhPinInputElement,
  'xh-popover': XhPopoverElement,
  'xh-progress': XhProgressElement,
  'xh-prompt-input': XhPromptInputElement,
  'xh-radio-group': XhRadioGroupElement,
  'xh-number-field': XhNumberFieldElement,
  'xh-rating': XhRatingElement,
  'xh-scroll-area': XhScrollAreaElement,
  'xh-scrollbar': XhScrollbarElement,
  'xh-select': XhSelectElement,
  'xh-separator': XhSeparatorElement,
  'xh-side-nav': XhSideNavElement,
  'xh-slider': XhSliderElement,
  'xh-sortable': XhSortableElement,
  'xh-splitter': XhSplitterElement,
  'xh-statistic': XhStatisticElement,
  'xh-steps': XhStepsElement,
  'xh-switch': XhSwitchElement,
  'xh-table': XhTableElement,
  'xh-tabs': XhTabsElement,
  'xh-tag': XhTagElement,
  'xh-tag-group': XhTagGroupElement,
  'xh-tags-input': XhTagsInputElement,
  'xh-text-field': XhTextFieldElement,
  'xh-time-field': XhTimeFieldElement,
  'xh-time-picker': XhTimePickerElement,
  'xh-time-range-picker': XhTimeRangePickerElement,
  'xh-timeline': XhTimelineElement,
  'xh-timer': XhTimerElement,
  'xh-timestamp': XhTimestampElement,
  'xh-toggle': XhToggleElement,
  'xh-toggle-group': XhToggleGroupElement,
  'xh-tool-call': XhToolCallElement,
  'xh-toolbar': XhToolbarElement,
  'xh-tooltip': XhTooltipElement,
  'xh-tooltip-provider': XhTooltipProviderElement,
  'xh-tour': XhTourElement,
  'xh-transfer': XhTransferElement,
  'xh-tree': XhTreeElement,
  'xh-tree-select': XhTreeSelectElement,
  'xh-truncate': XhTruncateElement,
  'xh-typography': XhTypographyElement,
  'xh-virtualizer': XhVirtualizerElement,
  'xh-watermark': XhWatermarkElement,
} as const

/** 标签 → 元素实例的类型，按需注册时用它约束标签与类对得上。 */
export type XhElementTagMap = { [K in keyof typeof XH_ELEMENTS]: InstanceType<(typeof XH_ELEMENTS)[K]> }

/** 宿主登记与版本核对：注册过任何一个元素后执行一次。 */
let hostRegistered = false
function registerHost(): void {
  if (hostRegistered)
    return
  hostRegistered = true
  // 宿主登记不分 dev/prod：元数据要能报出运行在哪个适配器上
  registerRuntimeHost('web-components', VERSION)
  if (isDev())
    checkLockstepVersion('web-components', VERSION, CORE_VERSION)
}

/**
 * 按库版本注册一个元素：与 defineXhElements 走同一张注册表，重复注册同一版本不报错，标签被别的版本或
 * 别的代码占用时抛错。只引用到的元素类会进打包结果，其余元素随 tree-shaking 去掉。
 * 元素类在 static dependencies 里声明的组合元素随之递归注册；委派目标不连带注册。
 */
export function defineXhElement<K extends keyof XhElementTagMap>(tag: K, ctor: new () => XhElementTagMap[K]): void {
  defineWithDependencies(tag, ctor)
  registerHost()
}

/** 注册一个元素，再沿它的 static dependencies 递归注册；先注册自己，依赖成环时也会停。 */
function defineWithDependencies(tag: string, ctor: CustomElementConstructor): void {
  if (typeof customElements !== 'undefined' && customElements.get(tag) === ctor)
    return
  defineElement(tag, ctor, VERSION)
  const dependencies = (ctor as { dependencies?: Readonly<Record<string, CustomElementConstructor>> }).dependencies
  for (const [dependencyTag, dependency] of Object.entries(dependencies ?? {}))
    defineWithDependencies(dependencyTag, dependency)
}

// 注册全部 xh-* 元素，需显式调用，主入口 import 不注册。
export function defineXhElements(): void {
  for (const [tag, ctor] of Object.entries(XH_ELEMENTS))
    defineElement(tag, ctor, VERSION)
  registerHost()
  // 引用即打印：注册全部元素时打一次启动横幅（内部 dev 门禁 + 每页一次）
  printMetadataBannerOnce()
}

export {
  XhAccordionElement,
  XhAffixElement,
  XhAlertElement,
  XhAnchorElement,
  XhApprovalElement,
  XhAvatarElement,
  XhAvatarGroupElement,
  XhBackTopElement,
  XhBadgeElement,
  XhBarCodeElement,
  XhBreadcrumbElement,
  XhButtonElement,
  XhButtonGroupElement,
  XhCalendarPickerElement,
  XhCalendarRangePickerElement,
  XhCardElement,
  XhCarouselElement,
  XhCartesianChartElement,
  XhCascaderElement,
  XhCheckboxElement,
  XhCheckboxGroupElement,
  XhCitationElement,
  XhClipboardElement,
  XhCodeViewElement,
  XhCollapsibleElement,
  XhColorFieldElement,
  XhColorPickerElement,
  XhColorSliderElement,
  XhColorSwatchElement,
  XhColorSwatchPickerElement,
  XhComboboxElement,
  XhCommandElement,
  XhConfigElement,
  XhContextMenuElement,
  XhDateFieldElement,
  XhDatePickerElement,
  XhDateRangePickerElement,
  XhDescriptionsElement,
  XhDialogElement,
  XhDiffViewElement,
  XhDownloadTriggerElement,
  XhDrawerElement,
  XhEditableElement,
  XhEmptyStateElement,
  XhExpressionInputElement,
  XhFieldArrayElement,
  XhFieldBoundaryElement,
  XhFieldElement,
  XhFieldsetElement,
  XhFileUploadElement,
  XhFlexElement,
  XhFloatButtonElement,
  XhFloatingPanelElement,
  XhFormatInputElement,
  XhFormElement,
  XhFunnelChartElement,
  XhGraphChartElement,
  XhGridElement,
  XhGridListElement,
  XhHeatmapElement,
  XhHierarchyChartElement,
  XhHighlightElement,
  XhHoverCardElement,
  XhIconElement,
  XhImageCropperElement,
  XhImageElement,
  XhImageViewerElement,
  XhInfiniteScrollElement,
  XhInputGroupElement,
  XhJsonViewerElement,
  XhKbdElement,
  XhLayoutElement,
  XhListboxElement,
  XhListElement,
  XhLoadingBarElement,
  XhLogElement,
  XhMarkdownStreamElement,
  XhMarqueeElement,
  XhMasonryElement,
  XhMatrixCodeElement,
  XhMentionElement,
  XhMenubarElement,
  XhMenuElement,
  XhMessageFeedElement,
  XhNavigationMenuElement,
  XhNotificationElement,
  XhNotificationItemElement,
  XhNumberAnimationElement,
  XhNumberFieldElement,
  XhPageHeaderElement,
  XhPaginationElement,
  XhPasswordInputElement,
  XhPieChartElement,
  XhPinInputElement,
  XhPopconfirmElement,
  XhPopoverElement,
  XhProgressElement,
  XhPromptInputElement,
  XhQuestionFlowElement,
  XhRadarChartElement,
  XhRadioGroupElement,
  XhRatingElement,
  XhReasoningElement,
  XhResizableElement,
  XhSankeyChartElement,
  XhScrollAreaElement,
  XhScrollbarElement,
  XhSelectElement,
  XhSeparatorElement,
  XhSideNavElement,
  XhSignaturePadElement,
  XhSkeletonElement,
  XhSliderElement,
  XhSortableElement,
  XhSparklineElement,
  XhSpinnerElement,
  XhSplitterElement,
  XhStatisticElement,
  XhStepsElement,
  XhSwitchElement,
  XhTableElement,
  XhTabsElement,
  XhTagElement,
  XhTagGroupElement,
  XhTagsInputElement,
  XhTextFieldElement,
  XhTimeFieldElement,
  XhTimelineElement,
  XhTimePickerElement,
  XhTimeRangePickerElement,
  XhTimerElement,
  XhTimestampElement,
  XhToggleElement,
  XhToggleGroupElement,
  XhToolbarElement,
  XhToolCallElement,
  XhTooltipElement,
  XhTooltipProviderElement,
  XhTourElement,
  XhTransferElement,
  XhTreeElement,
  XhTreeSelectElement,
  XhTruncateElement,
  XhTypographyElement,
  XhVirtualizerElement,
  XhWatermarkElement,
}
