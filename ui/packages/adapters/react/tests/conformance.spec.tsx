// @vitest-environment jsdom
import { accordionSuite, alertSuite, avatarGroupSuite, avatarSuite, badgeSuite, breadcrumbSuite, buttonSuite, cardSuite, checkboxGroupSuite, checkboxSuite, collapsibleSuite, contextMenuSuite, dialogSuite, drawerSuite, editableSuite, emptyStateSuite, fieldArraySuite, fieldsetSuite, fieldSuite, formSuite, hoverCardSuite, inputGroupSuite, loadingBarSuite, menuSuite, notificationSuite, numberFieldSuite, paginationSuite, passwordInputSuite, pinInputSuite, popconfirmSuite, popoverSuite, progressSuite, radioGroupSuite, ratingSuite, runConformance, segmentedSuite, selectSuite, separatorSuite, skeletonSuite, spinnerSuite, statisticSuite, stepsSuite, switchSuite, tabsSuite, tagsInputSuite, tagSuite, textFieldSuite, timelineSuite, toastSuite, toggleGroupSuite, toggleSuite, tooltipSuite } from '@xihan-ui/testing'
import { describe, it } from 'vitest'
import { createReactHarness } from './harness'

;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false

runConformance(
  createReactHarness(),
  [accordionSuite, alertSuite, avatarGroupSuite, avatarSuite, badgeSuite, breadcrumbSuite, buttonSuite, cardSuite, checkboxGroupSuite, checkboxSuite, collapsibleSuite, contextMenuSuite, dialogSuite, drawerSuite, editableSuite, emptyStateSuite, fieldArraySuite, fieldsetSuite, fieldSuite, formSuite, hoverCardSuite, inputGroupSuite, loadingBarSuite, menuSuite, notificationSuite, numberFieldSuite, paginationSuite, passwordInputSuite, pinInputSuite, popconfirmSuite, popoverSuite, progressSuite, radioGroupSuite, ratingSuite, segmentedSuite, selectSuite, separatorSuite, skeletonSuite, spinnerSuite, statisticSuite, stepsSuite, switchSuite, tabsSuite, tagsInputSuite, tagSuite, textFieldSuite, timelineSuite, toastSuite, toggleGroupSuite, toggleSuite, tooltipSuite],
  { describe, it },
  {
    keyboardCoverageExempt: {
      // 焦点环绕要真实的 Tab 焦点移动，jsdom 按 Tab 不移动焦点，这六行在这里演不出来。
      // 陷阱本身（trapped/loop 的装配）由 focus-scope 的单测覆盖
      'dialog.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'dialog.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'drawer.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'drawer.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'popover.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'popover.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
    },
  },
)
