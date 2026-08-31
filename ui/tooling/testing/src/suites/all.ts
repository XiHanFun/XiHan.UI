import type { ConformanceSuite } from '../conformance/types'
import { accordionSuite } from './accordion.suite'
import { affixSuite } from './affix.suite'
import { alertSuite } from './alert.suite'
import { anchorSuite } from './anchor.suite'
import { avatarGroupSuite } from './avatar-group.suite'
import { avatarSuite } from './avatar.suite'
import { backTopSuite } from './back-top.suite'
import { badgeSuite } from './badge.suite'
import { breadcrumbSuite } from './breadcrumb.suite'
import { buttonGroupSuite } from './button-group.suite'
import { buttonSuite } from './button.suite'
import { calendarSuite } from './calendar.suite'
import { cardSuite } from './card.suite'
import { carouselSuite } from './carousel.suite'
import { cascaderSuite } from './cascader.suite'
import { checkboxGroupSuite } from './checkbox-group.suite'
import { checkboxSuite } from './checkbox.suite'
import { clipboardSuite } from './clipboard.suite'
import { codeBlockSuite } from './code-block.suite'
import { codeViewSuite } from './code-view.suite'
import { collapsibleSuite } from './collapsible.suite'
import { colorPickerSuite } from './color-picker.suite'
import { comboboxSuite } from './combobox.suite'
import { composerSuite } from './composer.suite'
import { contextMenuSuite } from './context-menu.suite'
import { countdownSuite } from './countdown.suite'
import { dateFieldSuite } from './date-field.suite'
import { datePickerSuite } from './date-picker.suite'
import { descriptionsSuite } from './descriptions.suite'
import { dialogSuite } from './dialog.suite'
import { downloadTriggerSuite } from './download-trigger.suite'
import { drawerSuite } from './drawer.suite'
import { dynamicInputSuite } from './dynamic-input.suite'
import { editableSuite } from './editable.suite'
import { ellipsisSuite } from './ellipsis.suite'
import { emptyStateSuite } from './empty-state.suite'
import { fieldSuite } from './field.suite'
import { fieldsetSuite } from './fieldset.suite'
import { fileUploadSuite } from './file-upload.suite'
import { flexSuite } from './flex.suite'
import { floatButtonSuite } from './float-button.suite'
import { floatingPanelSuite } from './floating-panel.suite'
import { formSuite } from './form.suite'
import { gradientTextSuite } from './gradient-text.suite'
import { gridSuite } from './grid.suite'
import { heatmapSuite } from './heatmap.suite'
import { highlightSuite } from './highlight.suite'
import { hotkeysSuite } from './hotkeys.suite'
import { hoverCardSuite } from './hover-card.suite'
import { iconWrapperSuite } from './icon-wrapper.suite'
import { iconSuite } from './icon.suite'
import { imageCropperSuite } from './image-cropper.suite'
import { imageViewerSuite } from './image-viewer.suite'
import { imageSuite } from './image.suite'
import { infiniteScrollSuite } from './infinite-scroll.suite'
import { jsonViewerSuite } from './json-viewer.suite'
import { layoutSuite } from './layout.suite'
import { listSuite } from './list.suite'
import { listboxSuite } from './listbox.suite'
import { loadingBarSuite } from './loading-bar.suite'
import { logSuite } from './log.suite'
import { markdownStreamSuite } from './markdown-stream.suite'
import { marqueeSuite } from './marquee.suite'
import { masonrySuite } from './masonry.suite'
import { mentionSuite } from './mention.suite'
import { menuSuite } from './menu.suite'
import { menubarSuite } from './menubar.suite'
import { messageFeedSuite } from './message-feed.suite'
import { navigationMenuSuite } from './navigation-menu.suite'
import { notificationSuite } from './notification.suite'
import { numberAnimationSuite } from './number-animation.suite'
import { numberFieldSuite } from './number-field.suite'
import { pageHeaderSuite } from './page-header.suite'
import { paginationSuite } from './pagination.suite'
import { passwordInputSuite } from './password-input.suite'
import { pinInputSuite } from './pin-input.suite'
import { popconfirmSuite } from './popconfirm.suite'
import { popoverSuite } from './popover.suite'
import { popselectSuite } from './popselect.suite'
import { progressSuite } from './progress.suite'
import { qrCodeSuite } from './qr-code.suite'
import { radioGroupSuite } from './radio-group.suite'
import { ratingSuite } from './rating.suite'
import { resizableSuite } from './resizable.suite'
import { resultSuite } from './result.suite'
import { scrollAreaSuite } from './scroll-area.suite'
import { scrollbarSuite } from './scrollbar.suite'
import { segmentedSuite } from './segmented.suite'
import { selectSuite } from './select.suite'
import { separatorSuite } from './separator.suite'
import { sideNavSuite } from './side-nav.suite'
import { signaturePadSuite } from './signature-pad.suite'
import { skeletonSuite } from './skeleton.suite'
import { sliderSuite } from './slider.suite'
import { sortableSuite } from './sortable.suite'
import { spaceSuite } from './space.suite'
import { spinnerSuite } from './spinner.suite'
import { splitterSuite } from './splitter.suite'
import { statisticSuite } from './statistic.suite'
import { stepsSuite } from './steps.suite'
import { switchSuite } from './switch.suite'
import { tableSuite } from './table.suite'
import { tabsSuite } from './tabs.suite'
import { tagSuite } from './tag.suite'
import { tagsInputSuite } from './tags-input.suite'
import { textFieldSuite } from './text-field.suite'
import { threadSuite } from './thread.suite'
import { timeFieldSuite } from './time-field.suite'
import { timePickerSuite } from './time-picker.suite'
import { timeSuite } from './time.suite'
import { timelineSuite } from './timeline.suite'
import { timerSuite } from './timer.suite'
import { toastSuite } from './toast.suite'
import { toggleGroupSuite } from './toggle-group.suite'
import { toggleSuite } from './toggle.suite'
import { toolbarSuite } from './toolbar.suite'
import { tooltipSuite } from './tooltip.suite'
import { tourSuite } from './tour.suite'
import { transferSuite } from './transfer.suite'
import { treeSelectSuite } from './tree-select.suite'
import { treeSuite } from './tree.suite'
import { typographySuite } from './typography.suite'
import { virtualizerSuite } from './virtualizer.suite'
import { watermarkSuite } from './watermark.suite'

/** 全部一致性套件；新增组件在此登记一次。少登记一个，parity 覆盖门禁会红。 */
export const allSuites: readonly ConformanceSuite[] = [
  accordionSuite,
  affixSuite,
  alertSuite,
  anchorSuite,
  avatarSuite,
  avatarGroupSuite,
  backTopSuite,
  badgeSuite,
  breadcrumbSuite,
  buttonSuite,
  buttonGroupSuite,
  calendarSuite,
  cardSuite,
  carouselSuite,
  cascaderSuite,
  checkboxSuite,
  checkboxGroupSuite,
  clipboardSuite,
  codeBlockSuite,
  codeViewSuite,
  collapsibleSuite,
  colorPickerSuite,
  comboboxSuite,
  composerSuite,
  contextMenuSuite,
  countdownSuite,
  dateFieldSuite,
  datePickerSuite,
  descriptionsSuite,
  dialogSuite,
  downloadTriggerSuite,
  drawerSuite,
  dynamicInputSuite,
  editableSuite,
  ellipsisSuite,
  emptyStateSuite,
  fieldSuite,
  fieldsetSuite,
  fileUploadSuite,
  flexSuite,
  floatButtonSuite,
  floatingPanelSuite,
  formSuite,
  gradientTextSuite,
  gridSuite,
  heatmapSuite,
  highlightSuite,
  hotkeysSuite,
  hoverCardSuite,
  iconSuite,
  iconWrapperSuite,
  imageSuite,
  imageCropperSuite,
  imageViewerSuite,
  infiniteScrollSuite,
  jsonViewerSuite,
  layoutSuite,
  listSuite,
  listboxSuite,
  loadingBarSuite,
  logSuite,
  markdownStreamSuite,
  marqueeSuite,
  masonrySuite,
  mentionSuite,
  menuSuite,
  menubarSuite,
  messageFeedSuite,
  navigationMenuSuite,
  numberAnimationSuite,
  numberFieldSuite,
  pageHeaderSuite,
  paginationSuite,
  passwordInputSuite,
  pinInputSuite,
  popconfirmSuite,
  popoverSuite,
  popselectSuite,
  progressSuite,
  qrCodeSuite,
  radioGroupSuite,
  ratingSuite,
  resizableSuite,
  resultSuite,
  scrollAreaSuite,
  scrollbarSuite,
  segmentedSuite,
  selectSuite,
  separatorSuite,
  sideNavSuite,
  signaturePadSuite,
  skeletonSuite,
  sliderSuite,
  spaceSuite,
  spinnerSuite,
  sortableSuite,
  splitterSuite,
  statisticSuite,
  stepsSuite,
  switchSuite,
  tableSuite,
  tabsSuite,
  tagSuite,
  tagsInputSuite,
  textFieldSuite,
  threadSuite,
  timeSuite,
  timeFieldSuite,
  timePickerSuite,
  timelineSuite,
  timerSuite,
  toastSuite,
  notificationSuite,
  toggleSuite,
  toggleGroupSuite,
  toolbarSuite,
  tooltipSuite,
  tourSuite,
  transferSuite,
  treeSuite,
  treeSelectSuite,
  typographySuite,
  virtualizerSuite,
  watermarkSuite,
]
