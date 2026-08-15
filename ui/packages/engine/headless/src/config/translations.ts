// 各组件内建文案的覆盖表。两个适配器共用它做全局配置的形状，放在这里避免各写一份而漂移。
//
// 104 个组件全部列出，包括眼下还没有任何文案的那些——它们的 Translations 是空接口。
// 位先占着，将来某个组件要外露一句文案时只改它自己那个接口，这张表、两个适配器、门禁都不用动。
import type {
  AccordionTranslations,
  AffixTranslations,
  AlertTranslations,
  AnchorTranslations,
  AvatarGroupTranslations,
  AvatarTranslations,
  BackTopTranslations,
  BadgeTranslations,
  BreadcrumbTranslations,
  ButtonGroupTranslations,
  ButtonTranslations,
  CalendarTranslations,
  CardTranslations,
  CarouselTranslations,
  CascaderTranslations,
  CheckboxGroupTranslations,
  CheckboxTranslations,
  ClipboardTranslations,
  CodeBlockTranslations,
  CollapsibleTranslations,
  ColorPickerTranslations,
  ComboboxTranslations,
  ComposerTranslations,
  ContextMenuTranslations,
  CountdownTranslations,
  DatePickerTranslations,
  DescriptionsTranslations,
  DialogTranslations,
  DrawerTranslations,
  DynamicInputTranslations,
  EditableTranslations,
  EllipsisTranslations,
  EmptyStateTranslations,
  FieldTranslations,
  FileUploadTranslations,
  FlexTranslations,
  FloatButtonTranslations,
  FormTranslations,
  GradientTextTranslations,
  GridTranslations,
  HighlightTranslations,
  HoverCardTranslations,
  IconTranslations,
  IconWrapperTranslations,
  ImageTranslations,
  ImageViewerTranslations,
  InfiniteScrollTranslations,
  LayoutTranslations,
  ListboxTranslations,
  ListTranslations,
  LoadingBarTranslations,
  LogTranslations,
  MarqueeTranslations,
  MentionTranslations,
  MenubarTranslations,
  MenuTranslations,
  NavigationMenuTranslations,
  NumberAnimationTranslations,
  NumberFieldTranslations,
  PageHeaderTranslations,
  PaginationTranslations,
  PinInputTranslations,
  PopconfirmTranslations,
  PopoverTranslations,
  PopselectTranslations,
  ProgressTranslations,
  QrCodeTranslations,
  RadioGroupTranslations,
  RatingTranslations,
  ResultTranslations,
  ScrollAreaTranslations,
  SelectTranslations,
  SeparatorTranslations,
  SideNavTranslations,
  SkeletonTranslations,
  SliderTranslations,
  SpinnerTranslations,
  SplitterTranslations,
  StatisticTranslations,
  StepsTranslations,
  SwitchTranslations,
  TableTranslations,
  TabsTranslations,
  TagsInputTranslations,
  TextFieldTranslations,
  ThreadTranslations,
  TimeFieldTranslations,
  TimelineTranslations,
  TimePickerTranslations,
  TimeTranslations,
  ToasterTranslations,
  ToastTranslations,
  ToggleGroupTranslations,
  ToggleTranslations,
  ToolbarTranslations,
  TooltipTranslations,
  TourTranslations,
  TransferTranslations,
  TreeSelectTranslations,
  TreeTranslations,
  TypographyTranslations,
  VirtualizerTranslations,
  WatermarkTranslations,
} from '../index'

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
  'collapsible'?: Partial<CollapsibleTranslations>
  'color-picker'?: Partial<ColorPickerTranslations>
  'combobox'?: Partial<ComboboxTranslations>
  'composer'?: Partial<ComposerTranslations>
  'context-menu'?: Partial<ContextMenuTranslations>
  'countdown'?: Partial<CountdownTranslations>
  'date-field'?: Partial<DatePickerTranslations>
  'date-picker'?: Partial<DatePickerTranslations>
  'descriptions'?: Partial<DescriptionsTranslations>
  'dialog'?: Partial<DialogTranslations>
  'drawer'?: Partial<DrawerTranslations>
  'dynamic-input'?: Partial<DynamicInputTranslations>
  'editable'?: Partial<EditableTranslations>
  'ellipsis'?: Partial<EllipsisTranslations>
  'empty-state'?: Partial<EmptyStateTranslations>
  'field'?: Partial<FieldTranslations>
  'file-upload'?: Partial<FileUploadTranslations>
  'flex'?: Partial<FlexTranslations>
  'float-button'?: Partial<FloatButtonTranslations>
  'form'?: Partial<FormTranslations>
  'gradient-text'?: Partial<GradientTextTranslations>
  'grid'?: Partial<GridTranslations>
  'highlight'?: Partial<HighlightTranslations>
  'hover-card'?: Partial<HoverCardTranslations>
  'icon'?: Partial<IconTranslations>
  'icon-wrapper'?: Partial<IconWrapperTranslations>
  'image'?: Partial<ImageTranslations>
  'image-viewer'?: Partial<ImageViewerTranslations>
  'infinite-scroll'?: Partial<InfiniteScrollTranslations>
  'layout'?: Partial<LayoutTranslations>
  'list'?: Partial<ListTranslations>
  'listbox'?: Partial<ListboxTranslations>
  'loading-bar'?: Partial<LoadingBarTranslations>
  'log'?: Partial<LogTranslations>
  'marquee'?: Partial<MarqueeTranslations>
  'mention'?: Partial<MentionTranslations>
  'menu'?: Partial<MenuTranslations>
  'menubar'?: Partial<MenubarTranslations>
  'navigation-menu'?: Partial<NavigationMenuTranslations>
  'number-animation'?: Partial<NumberAnimationTranslations>
  'number-field'?: Partial<NumberFieldTranslations>
  'page-header'?: Partial<PageHeaderTranslations>
  'pagination'?: Partial<PaginationTranslations>
  'pin-input'?: Partial<PinInputTranslations>
  'popconfirm'?: Partial<PopconfirmTranslations>
  'popover'?: Partial<PopoverTranslations>
  'popselect'?: Partial<PopselectTranslations>
  'progress'?: Partial<ProgressTranslations>
  'qr-code'?: Partial<QrCodeTranslations>
  'radio-group'?: Partial<RadioGroupTranslations>
  'rating'?: Partial<RatingTranslations>
  'result'?: Partial<ResultTranslations>
  'scroll-area'?: Partial<ScrollAreaTranslations>
  'select'?: Partial<SelectTranslations>
  'separator'?: Partial<SeparatorTranslations>
  'side-nav'?: Partial<SideNavTranslations>
  'skeleton'?: Partial<SkeletonTranslations>
  'slider'?: Partial<SliderTranslations>
  'spinner'?: Partial<SpinnerTranslations>
  'splitter'?: Partial<SplitterTranslations>
  'statistic'?: Partial<StatisticTranslations>
  'steps'?: Partial<StepsTranslations>
  'switch'?: Partial<SwitchTranslations>
  'table'?: Partial<TableTranslations>
  'tabs'?: Partial<TabsTranslations>
  'tags-input'?: Partial<TagsInputTranslations>
  'text-field'?: Partial<TextFieldTranslations>
  'thread'?: Partial<ThreadTranslations>
  'time'?: Partial<TimeTranslations>
  'time-field'?: Partial<TimeFieldTranslations>
  'time-picker'?: Partial<TimePickerTranslations>
  'timeline'?: Partial<TimelineTranslations>
  'toast'?: Partial<ToastTranslations>
  'toaster'?: Partial<ToasterTranslations>
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
