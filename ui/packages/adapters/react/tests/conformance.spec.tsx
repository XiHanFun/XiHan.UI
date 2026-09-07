// @vitest-environment jsdom
import { accordionSuite, alertSuite, anchorSuite, avatarGroupSuite, avatarSuite, badgeSuite, breadcrumbSuite, buttonSuite, calendarSuite, cardSuite, carouselSuite, cascaderSuite, checkboxGroupSuite, checkboxSuite, collapsibleSuite, comboboxSuite, commandSuite, contextMenuSuite, dateFieldSuite, datePickerSuite, descriptionsSuite, dialogSuite, drawerSuite, editableSuite, emptyStateSuite, fieldArraySuite, fieldsetSuite, fieldSuite, flexSuite, formSuite, gridSuite, hoverCardSuite, imageCropperSuite, imageSuite, imageViewerSuite, infiniteScrollSuite, inputGroupSuite, layoutSuite, listboxSuite, listSuite, loadingBarSuite, menubarSuite, menuSuite, navigationMenuSuite, notificationSuite, numberFieldSuite, pageHeaderSuite, paginationSuite, passwordInputSuite, pinInputSuite, popconfirmSuite, popoverSuite, progressSuite, qrCodeSuite, radioGroupSuite, ratingSuite, runConformance, segmentedSuite, selectSuite, separatorSuite, sideNavSuite, signaturePadSuite, skeletonSuite, spinnerSuite, statisticSuite, stepsSuite, switchSuite, tableSuite, tabsSuite, tagsInputSuite, tagSuite, textFieldSuite, timeFieldSuite, timelineSuite, timePickerSuite, toastSuite, toggleGroupSuite, toggleSuite, toolbarSuite, tooltipSuite, tourSuite, transferSuite, treeSelectSuite, treeSuite, truncateSuite, typographySuite, virtualizerSuite, watermarkSuite } from '@xihan-ui/testing'
import { describe, it } from 'vitest'
import { createReactHarness } from './harness'

;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false

runConformance(
  createReactHarness(),
  [accordionSuite, alertSuite, anchorSuite, avatarGroupSuite, avatarSuite, badgeSuite, breadcrumbSuite, buttonSuite, calendarSuite, cardSuite, carouselSuite, cascaderSuite, checkboxGroupSuite, checkboxSuite, collapsibleSuite, comboboxSuite, commandSuite, contextMenuSuite, dateFieldSuite, datePickerSuite, descriptionsSuite, dialogSuite, drawerSuite, editableSuite, emptyStateSuite, fieldArraySuite, fieldsetSuite, fieldSuite, flexSuite, formSuite, gridSuite, hoverCardSuite, imageCropperSuite, imageSuite, imageViewerSuite, infiniteScrollSuite, inputGroupSuite, layoutSuite, listboxSuite, listSuite, loadingBarSuite, menubarSuite, menuSuite, navigationMenuSuite, notificationSuite, numberFieldSuite, pageHeaderSuite, paginationSuite, passwordInputSuite, pinInputSuite, popconfirmSuite, popoverSuite, progressSuite, qrCodeSuite, radioGroupSuite, ratingSuite, segmentedSuite, selectSuite, separatorSuite, sideNavSuite, signaturePadSuite, skeletonSuite, spinnerSuite, statisticSuite, stepsSuite, switchSuite, tableSuite, tabsSuite, tagsInputSuite, tagSuite, textFieldSuite, timeFieldSuite, timelineSuite, timePickerSuite, toastSuite, toggleGroupSuite, toggleSuite, toolbarSuite, tooltipSuite, tourSuite, transferSuite, treeSelectSuite, treeSuite, truncateSuite, typographySuite, virtualizerSuite, watermarkSuite],
  { describe, it },
  {
    keyboardCoverageExempt: {
      // 列设置区摆在 root 之外，而套件的 fixture 是一棵以 root 为树根的树，表达不出它的兄弟位；
      // 这一行由 headless 的 tests/table-column-settings.spec.ts 认领
      'table.kbd.column-visibility': '列设置区在 root 之外，fixture 表达不出它的兄弟位',
      // 焦点环绕要真实的 Tab 焦点移动，jsdom 按 Tab 不移动焦点，这九行在这里演不出来。
      // 陷阱本身（trapped/loop 的装配）由 focus-scope 的单测覆盖
      'command.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'dialog.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'dialog.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'drawer.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'drawer.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'image-viewer.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'image-viewer.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'popover.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'popover.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
    },
  },
)
