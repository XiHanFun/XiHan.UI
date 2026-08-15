// 各组件内建文案的覆盖表。两个适配器共用它做全局配置的形状，放在这里避免各写一份而漂移。
import type {
  AlertTranslations,
  AnchorTranslations,
  BackTopTranslations,
  BreadcrumbTranslations,
  CarouselTranslations,
  CascaderTranslations,
  ColorPickerTranslations,
  ComposerTranslations,
  DatePickerTranslations,
  DialogTranslations,
  DrawerTranslations,
  DynamicInputTranslations,
  FileUploadTranslations,
  FloatButtonTranslations,
  ImageViewerTranslations,
  LoadingBarTranslations,
  LogTranslations,
  MentionTranslations,
  NavigationMenuTranslations,
  PaginationTranslations,
  PinInputTranslations,
  PopoverTranslations,
  SelectTranslations,
  SideNavTranslations,
  SpinnerTranslations,
  TagsInputTranslations,
  ThreadTranslations,
  ToasterTranslations,
  ToastTranslations,
  TourTranslations,
} from '../index'

/** 按组件收纳的文案覆盖；date-field 与 date-picker 同一份文案。 */
export interface XhTranslationOverrides {
  'alert'?: Partial<AlertTranslations>
  'anchor'?: Partial<AnchorTranslations>
  'back-top'?: Partial<BackTopTranslations>
  'breadcrumb'?: Partial<BreadcrumbTranslations>
  'carousel'?: Partial<CarouselTranslations>
  'cascader'?: Partial<CascaderTranslations>
  'color-picker'?: Partial<ColorPickerTranslations>
  'composer'?: Partial<ComposerTranslations>
  'date-field'?: Partial<DatePickerTranslations>
  'date-picker'?: Partial<DatePickerTranslations>
  'dialog'?: Partial<DialogTranslations>
  'drawer'?: Partial<DrawerTranslations>
  'dynamic-input'?: Partial<DynamicInputTranslations>
  'file-upload'?: Partial<FileUploadTranslations>
  'image-viewer'?: Partial<ImageViewerTranslations>
  'float-button'?: Partial<FloatButtonTranslations>
  'loading-bar'?: Partial<LoadingBarTranslations>
  'log'?: Partial<LogTranslations>
  'mention'?: Partial<MentionTranslations>
  'navigation-menu'?: Partial<NavigationMenuTranslations>
  'pagination'?: Partial<PaginationTranslations>
  'pin-input'?: Partial<PinInputTranslations>
  'side-nav'?: Partial<SideNavTranslations>
  'select'?: Partial<SelectTranslations>
  'popover'?: Partial<PopoverTranslations>
  'spinner'?: Partial<SpinnerTranslations>
  'tags-input'?: Partial<TagsInputTranslations>
  'thread'?: Partial<ThreadTranslations>
  'toast'?: Partial<ToastTranslations>
  'toaster'?: Partial<ToasterTranslations>
  'tour'?: Partial<TourTranslations>
}
