// 各组件内建文案的覆盖表。两个适配器共用它做全局配置的形状，放在这里避免各写一份而漂移。
//
// 104 个组件全部列出，包括眼下还没有任何文案的那些——它们的 Translations 是空接口。
// 位先占着，将来某个组件要外露一句文案时只改它自己那个接口，这张表、两个适配器、门禁都不用动。
import type { AccordionTranslations } from '../accordion/accordion.types'
import type { AffixTranslations } from '../affix/affix.types'
import type { AlertTranslations } from '../alert/alert.types'
import type { AnchorTranslations } from '../anchor/anchor.types'
import type { AvatarGroupTranslations } from '../avatar-group/avatar-group.types'
import type { AvatarTranslations } from '../avatar/avatar.types'
import type { BackTopTranslations } from '../back-top/back-top.types'
import type { BadgeTranslations } from '../badge/badge.types'
import type { BreadcrumbTranslations } from '../breadcrumb/breadcrumb.types'
import type { ButtonGroupTranslations } from '../button-group/button-group.types'
import type { ButtonTranslations } from '../button/button.types'
import type { CalendarTranslations } from '../calendar/calendar.types'
import type { CardTranslations } from '../card/card.types'
import type { CarouselTranslations } from '../carousel/carousel.types'
import type { CascaderTranslations } from '../cascader/cascader.types'
import type { CheckboxGroupTranslations } from '../checkbox-group/checkbox-group.types'
import type { CheckboxTranslations } from '../checkbox/checkbox.types'
import type { ClipboardTranslations } from '../clipboard/clipboard.types'
import type { CodeBlockTranslations } from '../code-block/code-block.types'
import type { CodeViewTranslations } from '../code-view/code-view.types'
import type { CollapsibleTranslations } from '../collapsible/collapsible.types'
import type { ColorPickerTranslations } from '../color-picker/color-picker.types'
import type { ComboboxTranslations } from '../combobox/combobox.types'
import type { ComposerTranslations } from '../composer/composer.types'
import type { ContextMenuTranslations } from '../context-menu/context-menu.types'
import type { CountdownTranslations } from '../countdown/countdown.types'
import type { DateFieldTranslations } from '../date-field/date-field.types'
import type { DatePickerTranslations } from '../date-picker/date-picker.types'
import type { DescriptionsTranslations } from '../descriptions/descriptions.types'
import type { DialogTranslations } from '../dialog/dialog.types'
import type { DownloadTriggerTranslations } from '../download-trigger/download-trigger.types'
import type { DrawerTranslations } from '../drawer/drawer.types'
import type { DynamicInputTranslations } from '../dynamic-input/dynamic-input.types'
import type { EditableTranslations } from '../editable/editable.types'
import type { EllipsisTranslations } from '../ellipsis/ellipsis.types'
import type { EmptyStateTranslations } from '../empty-state/empty-state.types'
import type { FieldTranslations } from '../field/field.types'
import type { FieldsetTranslations } from '../fieldset/fieldset.types'
import type { FileUploadTranslations } from '../file-upload/file-upload.types'
import type { FlexTranslations } from '../flex/flex.types'
import type { FloatButtonTranslations } from '../float-button/float-button.types'
import type { FloatingPanelTranslations } from '../floating-panel/floating-panel.types'
import type { FormTranslations } from '../form/form.types'
import type { GradientTextTranslations } from '../gradient-text/gradient-text.types'
import type { GridTranslations } from '../grid/grid.types'
import type { HeatmapTranslations } from '../heatmap/heatmap.types'
import type { HighlightTranslations } from '../highlight/highlight.types'
import type { HotkeysTranslations } from '../hotkeys/hotkeys.types'
import type { HoverCardTranslations } from '../hover-card/hover-card.types'
import type { IconWrapperTranslations } from '../icon-wrapper/icon-wrapper.types'
import type { IconTranslations } from '../icon/icon.types'
import type { ImageCropperTranslations } from '../image-cropper/image-cropper.types'
import type { ImageViewerTranslations } from '../image-viewer/image-viewer.types'
import type { ImageTranslations } from '../image/image.types'
import type { InfiniteScrollTranslations } from '../infinite-scroll/infinite-scroll.types'
import type { JsonViewerTranslations } from '../json-viewer/json-viewer.types'
import type { LayoutTranslations } from '../layout/layout.types'
import type { ListTranslations } from '../list/list.types'
import type { ListboxTranslations } from '../listbox/listbox.types'
import type { LoadingBarTranslations } from '../loading-bar/loading-bar.types'
import type { LogTranslations } from '../log/log.types'
import type { MarkdownStreamTranslations } from '../markdown-stream/markdown-stream.types'
import type { MarqueeTranslations } from '../marquee/marquee.types'
import type { MasonryTranslations } from '../masonry/masonry.types'
import type { MentionTranslations } from '../mention/mention.types'
import type { MenuTranslations } from '../menu/menu.types'
import type { MessageFeedTranslations } from '../message-feed/message-feed.types'
import type { MenubarTranslations } from '../menubar/menubar.types'
import type { NavigationMenuTranslations } from '../navigation-menu/navigation-menu.types'
import type { NotificationTranslations } from '../notification/notification.types'
import type { NumberAnimationTranslations } from '../number-animation/number-animation.types'
import type { NumberFieldTranslations } from '../number-field/number-field.types'
import type { PageHeaderTranslations } from '../page-header/page-header.types'
import type { PaginationTranslations } from '../pagination/pagination.types'
import type { PasswordInputTranslations } from '../password-input/password-input.types'
import type { PinInputTranslations } from '../pin-input/pin-input.types'
import type { PopconfirmTranslations } from '../popconfirm/popconfirm.types'
import type { PopoverTranslations } from '../popover/popover.types'
import type { PopselectTranslations } from '../popselect/popselect.types'
import type { ProgressTranslations } from '../progress/progress.types'
import type { PromptInputTranslations } from '../prompt-input/prompt-input.types'
import type { QrCodeTranslations } from '../qr-code/qr-code.types'
import type { RadioGroupTranslations } from '../radio-group/radio-group.types'
import type { RatingTranslations } from '../rating/rating.types'
import type { ResizableTranslations } from '../resizable/resizable.types'
import type { ResultTranslations } from '../result/result.types'
import type { ScrollAreaTranslations } from '../scroll-area/scroll-area.types'
import type { ScrollbarTranslations } from '../scrollbar/scrollbar.types'
import type { SegmentedTranslations } from '../segmented/segmented.types'
import type { SelectTranslations } from '../select/select.types'
import type { SeparatorTranslations } from '../separator/separator.types'
import type { SideNavTranslations } from '../side-nav/side-nav.types'
import type { SignaturePadTranslations } from '../signature-pad/signature-pad.types'
import type { SkeletonTranslations } from '../skeleton/skeleton.types'
import type { SliderTranslations } from '../slider/slider.types'
import type { SortableTranslations } from '../sortable/sortable.types'
import type { SpaceTranslations } from '../space/space.types'
import type { SpinnerTranslations } from '../spinner/spinner.types'
import type { SplitterTranslations } from '../splitter/splitter.types'
import type { StatisticTranslations } from '../statistic/statistic.types'
import type { StepsTranslations } from '../steps/steps.types'
import type { SwitchTranslations } from '../switch/switch.types'
import type { TableTranslations } from '../table/table.types'
import type { TabsTranslations } from '../tabs/tabs.types'
import type { TagTranslations } from '../tag/tag.types'
import type { TagsInputTranslations } from '../tags-input/tags-input.types'
import type { TextFieldTranslations } from '../text-field/text-field.types'
import type { ThreadTranslations } from '../thread/thread.types'
import type { TimeFieldTranslations } from '../time-field/time-field.types'
import type { TimePickerTranslations } from '../time-picker/time-picker.types'
import type { TimeTranslations } from '../time/time.types'
import type { TimelineTranslations } from '../timeline/timeline.types'
import type { TimerTranslations } from '../timer/timer.types'
import type { ToastTranslations } from '../toast/toast.types'
import type { ToggleGroupTranslations } from '../toggle-group/toggle-group.types'
import type { ToggleTranslations } from '../toggle/toggle.types'
import type { ToolbarTranslations } from '../toolbar/toolbar.types'
import type { TooltipTranslations } from '../tooltip/tooltip.types'
import type { TourTranslations } from '../tour/tour.types'
import type { TransferTranslations } from '../transfer/transfer.types'
import type { TreeSelectTranslations } from '../tree-select/tree-select.types'
import type { TreeTranslations } from '../tree/tree.types'
import type { TypographyTranslations } from '../typography/typography.types'
import type { VirtualizerTranslations } from '../virtualizer/virtualizer.types'
import type { WatermarkTranslations } from '../watermark/watermark.types'

/** 按组件收纳的文案覆盖；date-field 与 date-picker 同一份文案。 */
export interface XhTranslationOverrides {
  'accordion'?: Partial<AccordionTranslations>
  'affix'?: Partial<AffixTranslations>
  'alert'?: Partial<AlertTranslations>
  'anchor'?: Partial<AnchorTranslations>
  'avatar'?: Partial<AvatarTranslations>
  'avatar-group'?: Partial<AvatarGroupTranslations>
  'back-top'?: Partial<BackTopTranslations>
  'badge'?: Partial<BadgeTranslations>
  'breadcrumb'?: Partial<BreadcrumbTranslations>
  'button'?: Partial<ButtonTranslations>
  'button-group'?: Partial<ButtonGroupTranslations>
  'calendar'?: Partial<CalendarTranslations>
  'card'?: Partial<CardTranslations>
  'carousel'?: Partial<CarouselTranslations>
  'cascader'?: Partial<CascaderTranslations>
  'checkbox'?: Partial<CheckboxTranslations>
  'checkbox-group'?: Partial<CheckboxGroupTranslations>
  'clipboard'?: Partial<ClipboardTranslations>
  'code-block'?: Partial<CodeBlockTranslations>
  'code-view'?: Partial<CodeViewTranslations>
  'collapsible'?: Partial<CollapsibleTranslations>
  'color-picker'?: Partial<ColorPickerTranslations>
  'combobox'?: Partial<ComboboxTranslations>
  'composer'?: Partial<ComposerTranslations>
  'context-menu'?: Partial<ContextMenuTranslations>
  'countdown'?: Partial<CountdownTranslations>
  'date-field'?: Partial<DateFieldTranslations>
  'date-picker'?: Partial<DatePickerTranslations>
  'descriptions'?: Partial<DescriptionsTranslations>
  'dialog'?: Partial<DialogTranslations>
  'download-trigger'?: Partial<DownloadTriggerTranslations>
  'drawer'?: Partial<DrawerTranslations>
  'dynamic-input'?: Partial<DynamicInputTranslations>
  'editable'?: Partial<EditableTranslations>
  'ellipsis'?: Partial<EllipsisTranslations>
  'empty-state'?: Partial<EmptyStateTranslations>
  'field'?: Partial<FieldTranslations>
  'fieldset'?: Partial<FieldsetTranslations>
  'file-upload'?: Partial<FileUploadTranslations>
  'flex'?: Partial<FlexTranslations>
  'float-button'?: Partial<FloatButtonTranslations>
  'floating-panel'?: Partial<FloatingPanelTranslations>
  'form'?: Partial<FormTranslations>
  'gradient-text'?: Partial<GradientTextTranslations>
  'grid'?: Partial<GridTranslations>
  'heatmap'?: Partial<HeatmapTranslations>
  'highlight'?: Partial<HighlightTranslations>
  'hotkeys'?: Partial<HotkeysTranslations>
  'hover-card'?: Partial<HoverCardTranslations>
  'icon'?: Partial<IconTranslations>
  'icon-wrapper'?: Partial<IconWrapperTranslations>
  'image'?: Partial<ImageTranslations>
  'image-cropper'?: Partial<ImageCropperTranslations>
  'image-viewer'?: Partial<ImageViewerTranslations>
  'infinite-scroll'?: Partial<InfiniteScrollTranslations>
  'json-viewer'?: Partial<JsonViewerTranslations>
  'layout'?: Partial<LayoutTranslations>
  'list'?: Partial<ListTranslations>
  'listbox'?: Partial<ListboxTranslations>
  'loading-bar'?: Partial<LoadingBarTranslations>
  'log'?: Partial<LogTranslations>
  'markdown-stream'?: Partial<MarkdownStreamTranslations>
  'marquee'?: Partial<MarqueeTranslations>
  'masonry'?: Partial<MasonryTranslations>
  'mention'?: Partial<MentionTranslations>
  'menu'?: Partial<MenuTranslations>
  'message-feed'?: Partial<MessageFeedTranslations>
  'menubar'?: Partial<MenubarTranslations>
  'navigation-menu'?: Partial<NavigationMenuTranslations>
  'number-animation'?: Partial<NumberAnimationTranslations>
  'number-field'?: Partial<NumberFieldTranslations>
  'page-header'?: Partial<PageHeaderTranslations>
  'pagination'?: Partial<PaginationTranslations>
  'password-input'?: Partial<PasswordInputTranslations>
  'pin-input'?: Partial<PinInputTranslations>
  'popconfirm'?: Partial<PopconfirmTranslations>
  'popover'?: Partial<PopoverTranslations>
  'popselect'?: Partial<PopselectTranslations>
  'progress'?: Partial<ProgressTranslations>
  'prompt-input'?: Partial<PromptInputTranslations>
  'qr-code'?: Partial<QrCodeTranslations>
  'radio-group'?: Partial<RadioGroupTranslations>
  'rating'?: Partial<RatingTranslations>
  'resizable'?: Partial<ResizableTranslations>
  'result'?: Partial<ResultTranslations>
  'scroll-area'?: Partial<ScrollAreaTranslations>
  'scrollbar'?: Partial<ScrollbarTranslations>
  'segmented'?: Partial<SegmentedTranslations>
  'select'?: Partial<SelectTranslations>
  'separator'?: Partial<SeparatorTranslations>
  'side-nav'?: Partial<SideNavTranslations>
  'signature-pad'?: Partial<SignaturePadTranslations>
  'skeleton'?: Partial<SkeletonTranslations>
  'slider'?: Partial<SliderTranslations>
  'space'?: Partial<SpaceTranslations>
  'spinner'?: Partial<SpinnerTranslations>
  'sortable'?: Partial<SortableTranslations>
  'splitter'?: Partial<SplitterTranslations>
  'statistic'?: Partial<StatisticTranslations>
  'steps'?: Partial<StepsTranslations>
  'switch'?: Partial<SwitchTranslations>
  'table'?: Partial<TableTranslations>
  'tabs'?: Partial<TabsTranslations>
  'tag'?: Partial<TagTranslations>
  'tags-input'?: Partial<TagsInputTranslations>
  'text-field'?: Partial<TextFieldTranslations>
  'thread'?: Partial<ThreadTranslations>
  'time'?: Partial<TimeTranslations>
  'time-field'?: Partial<TimeFieldTranslations>
  'time-picker'?: Partial<TimePickerTranslations>
  'timeline'?: Partial<TimelineTranslations>
  'timer'?: Partial<TimerTranslations>
  'toast'?: Partial<ToastTranslations>
  'notification'?: Partial<NotificationTranslations>
  'toggle'?: Partial<ToggleTranslations>
  'toggle-group'?: Partial<ToggleGroupTranslations>
  'toolbar'?: Partial<ToolbarTranslations>
  'tooltip'?: Partial<TooltipTranslations>
  'tour'?: Partial<TourTranslations>
  'transfer'?: Partial<TransferTranslations>
  'tree'?: Partial<TreeTranslations>
  'tree-select'?: Partial<TreeSelectTranslations>
  'typography'?: Partial<TypographyTranslations>
  'virtualizer'?: Partial<VirtualizerTranslations>
  'watermark'?: Partial<WatermarkTranslations>
}
