import type { ConformanceSuite } from '../conformance/types'
import { accordionSuite } from './accordion.suite'
import { anchorSuite } from './anchor.suite'
import { avatarSuite } from './avatar.suite'
import { badgeSuite } from './badge.suite'
import { breadcrumbSuite } from './breadcrumb.suite'
import { buttonSuite } from './button.suite'
import { calendarSuite } from './calendar.suite'
import { carouselSuite } from './carousel.suite'
import { cascaderSuite } from './cascader.suite'
import { checkboxGroupSuite } from './checkbox-group.suite'
import { checkboxSuite } from './checkbox.suite'
import { clipboardSuite } from './clipboard.suite'
import { codeBlockSuite } from './code-block.suite'
import { collapsibleSuite } from './collapsible.suite'
import { colorPickerSuite } from './color-picker.suite'
import { comboboxSuite } from './combobox.suite'
import { composerSuite } from './composer.suite'
import { contextMenuSuite } from './context-menu.suite'
import { dateFieldSuite } from './date-field.suite'
import { datePickerSuite } from './date-picker.suite'
import { dialogSuite } from './dialog.suite'
import { drawerSuite } from './drawer.suite'
import { editableSuite } from './editable.suite'
import { fieldSuite } from './field.suite'
import { fileUploadSuite } from './file-upload.suite'
import { formSuite } from './form.suite'
import { hoverCardSuite } from './hover-card.suite'
import { imageSuite } from './image.suite'
import { listboxSuite } from './listbox.suite'
import { loadingBarSuite } from './loading-bar.suite'
import { menuSuite } from './menu.suite'
import { menubarSuite } from './menubar.suite'
import { navigationMenuSuite } from './navigation-menu.suite'
import { numberFieldSuite } from './number-field.suite'
import { paginationSuite } from './pagination.suite'
import { pinInputSuite } from './pin-input.suite'
import { popoverSuite } from './popover.suite'
import { progressSuite } from './progress.suite'
import { radioGroupSuite } from './radio-group.suite'
import { ratingSuite } from './rating.suite'
import { scrollAreaSuite } from './scroll-area.suite'
import { selectSuite } from './select.suite'
import { separatorSuite } from './separator.suite'
import { sliderSuite } from './slider.suite'
import { splitterSuite } from './splitter.suite'
import { stepsSuite } from './steps.suite'
import { switchSuite } from './switch.suite'
import { tableSuite } from './table.suite'
import { tabsSuite } from './tabs.suite'
import { tagsInputSuite } from './tags-input.suite'
import { textFieldSuite } from './text-field.suite'
import { threadSuite } from './thread.suite'
import { timeFieldSuite } from './time-field.suite'
import { timePickerSuite } from './time-picker.suite'
import { toastSuite } from './toast.suite'
import { toasterSuite } from './toaster.suite'
import { toggleGroupSuite } from './toggle-group.suite'
import { toggleSuite } from './toggle.suite'
import { toolbarSuite } from './toolbar.suite'
import { tooltipSuite } from './tooltip.suite'
import { tourSuite } from './tour.suite'
import { transferSuite } from './transfer.suite'
import { treeSelectSuite } from './tree-select.suite'
import { treeSuite } from './tree.suite'
import { virtualizerSuite } from './virtualizer.suite'

/** 全部一致性套件；新增组件在此登记一次。 */
export const allSuites: readonly ConformanceSuite[] = [
  accordionSuite,
  anchorSuite,
  avatarSuite,
  badgeSuite,
  breadcrumbSuite,
  buttonSuite,
  calendarSuite,
  carouselSuite,
  cascaderSuite,
  checkboxGroupSuite,
  checkboxSuite,
  clipboardSuite,
  codeBlockSuite,
  collapsibleSuite,
  colorPickerSuite,
  comboboxSuite,
  composerSuite,
  contextMenuSuite,
  dateFieldSuite,
  datePickerSuite,
  dialogSuite,
  drawerSuite,
  editableSuite,
  fieldSuite,
  fileUploadSuite,
  formSuite,
  hoverCardSuite,
  imageSuite,
  listboxSuite,
  loadingBarSuite,
  menuSuite,
  menubarSuite,
  navigationMenuSuite,
  numberFieldSuite,
  paginationSuite,
  pinInputSuite,
  popoverSuite,
  progressSuite,
  radioGroupSuite,
  ratingSuite,
  scrollAreaSuite,
  selectSuite,
  separatorSuite,
  sliderSuite,
  splitterSuite,
  stepsSuite,
  switchSuite,
  tableSuite,
  tabsSuite,
  tagsInputSuite,
  textFieldSuite,
  threadSuite,
  timeFieldSuite,
  timePickerSuite,
  toastSuite,
  toasterSuite,
  toggleGroupSuite,
  toggleSuite,
  toolbarSuite,
  tooltipSuite,
  tourSuite,
  transferSuite,
  treeSelectSuite,
  treeSuite,
  virtualizerSuite,
]
