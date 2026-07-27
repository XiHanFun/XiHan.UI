// @vitest-environment jsdom
import { accordionSuite, avatarSuite, badgeSuite, breadcrumbSuite, buttonSuite, checkboxGroupSuite, checkboxSuite, clipboardSuite, collapsibleSuite, comboboxSuite, contextMenuSuite, dialogSuite, drawerSuite, editableSuite, fieldSuite, fileUploadSuite, hoverCardSuite, imageSuite, listboxSuite, menuSuite, numberFieldSuite, paginationSuite, pinInputSuite, popoverSuite, progressSuite, radioGroupSuite, ratingSuite, runConformance, selectSuite, separatorSuite, sliderSuite, stepsSuite, switchSuite, tabsSuite, tagsInputSuite, textFieldSuite, toasterSuite, toastSuite, toggleGroupSuite, toggleSuite, toolbarSuite, tooltipSuite, treeSuite } from '@xihan-ui/testing'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { createVueHarness } from './harness'

beforeEach(() => {
  // jsdom 无 matchMedia，桩掉供 RuntimeConfig.reducedMotion 使用
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

// 键盘/焦点相关行需真机验证，jsdom 态不强制全覆盖（浏览器态转硬门禁）。
runConformance(
  createVueHarness(),
  [
    accordionSuite,
    avatarSuite,
    badgeSuite,
    breadcrumbSuite,
    buttonSuite,
    checkboxGroupSuite,
    checkboxSuite,
    clipboardSuite,
    collapsibleSuite,
    comboboxSuite,
    contextMenuSuite,
    dialogSuite,
    drawerSuite,
    editableSuite,
    fieldSuite,
    fileUploadSuite,
    hoverCardSuite,
    imageSuite,
    listboxSuite,
    menuSuite,
    numberFieldSuite,
    paginationSuite,
    pinInputSuite,
    popoverSuite,
    progressSuite,
    radioGroupSuite,
    ratingSuite,
    selectSuite,
    separatorSuite,
    sliderSuite,
    stepsSuite,
    switchSuite,
    tabsSuite,
    tagsInputSuite,
    textFieldSuite,
    toastSuite,
    toasterSuite,
    toggleGroupSuite,
    toggleSuite,
    toolbarSuite,
    tooltipSuite,
    treeSuite,
  ],
  { describe, it },
  {
    // 焦点环绕要真实的 Tab 焦点移动，jsdom 按 Tab 不移动焦点，这四行在这里演不出来。
    // 陷阱本身（trapped/loop 的装配）由 focus-scope 的单测覆盖，环绕效果待真机验证。
    keyboardCoverageExempt: {
      'dialog.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'dialog.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'popover.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'popover.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'drawer.kbd.tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
      'drawer.kbd.shift-tab': 'jsdom 按 Tab 不移动焦点，焦点环绕演不出来',
    },
  },
)
