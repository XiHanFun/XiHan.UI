// @xihan-ui/testing —— 跨适配器一致性套件运行时（私有，不发布）。

export { applyStep } from './conformance/apply-step'
export type { ApplyContext } from './conformance/apply-step'
export { checkExpectation } from './conformance/match'
export { recordTrace, runConformance, runParity } from './conformance/run'
export type { RunOptions } from './conformance/run'
export type {
  ActiveElementExpectation,
  ActiveElementRef,
  AdapterEvent,
  AdapterHarness,
  AdapterName,
  AttrExpectation,
  ConformanceCase,
  ConformanceSuite,
  DomSnapshot,
  Fixture,
  FixtureNode,
  KeyName,
  ModifierKey,
  PartRef,
  PartSnapshot,
  SettleCondition,
  SnapshotExpectation,
  Step,
  StepWithExpect,
  TestHooks,
} from './conformance/types'
export { coveredRows, danglingCovers, missingKeyboardRows } from './machine/transition-coverage'
export { collectDomSnapshot } from './snapshot/collect'
export type { CollectOptions } from './snapshot/collect'
export { normalizeAttrs } from './snapshot/normalize'
export { accordionSuite } from './suites/accordion.suite'
export { allSuites } from './suites/all'
export { anchorSuite } from './suites/anchor.suite'
export { avatarSuite } from './suites/avatar.suite'
export { badgeSuite } from './suites/badge.suite'
export { breadcrumbSuite } from './suites/breadcrumb.suite'
export { buttonSuite } from './suites/button.suite'
export { calendarSuite } from './suites/calendar.suite'
export { carouselSuite } from './suites/carousel.suite'
export { cascaderSuite } from './suites/cascader.suite'
export { checkboxGroupSuite } from './suites/checkbox-group.suite'
export { checkboxSuite } from './suites/checkbox.suite'
export { clipboardSuite } from './suites/clipboard.suite'
export { collapsibleSuite } from './suites/collapsible.suite'
export { colorPickerSuite } from './suites/color-picker.suite'
export { comboboxSuite } from './suites/combobox.suite'
export { contextMenuSuite } from './suites/context-menu.suite'
export { dateFieldSuite } from './suites/date-field.suite'
export { datePickerSuite } from './suites/date-picker.suite'
export { dialogSuite } from './suites/dialog.suite'
export { drawerSuite } from './suites/drawer.suite'
export { editableSuite } from './suites/editable.suite'
export { fieldSuite } from './suites/field.suite'
export { fileUploadSuite } from './suites/file-upload.suite'
export { formSuite } from './suites/form.suite'
export { hoverCardSuite } from './suites/hover-card.suite'
export { imageSuite } from './suites/image.suite'
export { listboxSuite } from './suites/listbox.suite'
export { loadingBarSuite } from './suites/loading-bar.suite'
export { menuSuite } from './suites/menu.suite'
export { menubarSuite } from './suites/menubar.suite'
export { navigationMenuSuite } from './suites/navigation-menu.suite'
export { numberFieldSuite } from './suites/number-field.suite'
export { paginationSuite } from './suites/pagination.suite'
export { pinInputSuite } from './suites/pin-input.suite'
export { popoverSuite } from './suites/popover.suite'
export { progressSuite } from './suites/progress.suite'
export { radioGroupSuite } from './suites/radio-group.suite'
export { ratingSuite } from './suites/rating.suite'
export { scrollAreaSuite } from './suites/scroll-area.suite'
export { selectSuite } from './suites/select.suite'
export { separatorSuite } from './suites/separator.suite'
export { dispatchClickOnDisabled } from './suites/shared/disabled-press'
export { nativeActivation, singleTabStop } from './suites/shared/native-activation'
export { sliderSuite } from './suites/slider.suite'
export { splitterSuite } from './suites/splitter.suite'
export { stepsSuite } from './suites/steps.suite'
export { switchSuite } from './suites/switch.suite'
export { tableSuite } from './suites/table.suite'
export { tabsSuite } from './suites/tabs.suite'
export { tagsInputSuite } from './suites/tags-input.suite'
export { textFieldSuite } from './suites/text-field.suite'
export { timeFieldSuite } from './suites/time-field.suite'
export { timePickerSuite } from './suites/time-picker.suite'
export { toastSuite } from './suites/toast.suite'
export { toasterSuite } from './suites/toaster.suite'
export { toggleGroupSuite } from './suites/toggle-group.suite'
export { toggleSuite } from './suites/toggle.suite'
export { toolbarSuite } from './suites/toolbar.suite'
export { tooltipSuite } from './suites/tooltip.suite'
export { tourSuite } from './suites/tour.suite'
export { transferSuite } from './suites/transfer.suite'
export { treeSelectSuite } from './suites/tree-select.suite'
export { treeSuite } from './suites/tree.suite'
export { virtualizerSuite } from './suites/virtualizer.suite'
