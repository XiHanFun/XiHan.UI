// @vitest-environment node
//
// 服务端直出必须跑在真正没有 document 的宿主里。jsdom 下 `typeof document !== 'undefined'`
// 成立，组件里的 DOM 分支照常执行，服务端这一半根本测不出来。

import { accordionSuite, alertSuite, avatarGroupSuite, avatarSuite, badgeSuite, breadcrumbSuite, buttonSuite, cardSuite, checkboxGroupSuite, checkboxSuite, collapsibleSuite, contextMenuSuite, dialogSuite, drawerSuite, editableSuite, emptyStateSuite, fieldArraySuite, fieldsetSuite, fieldSuite, formSuite, hoverCardSuite, inputGroupSuite, loadingBarSuite, menuSuite, notificationSuite, numberFieldSuite, paginationSuite, passwordInputSuite, pinInputSuite, popconfirmSuite, popoverSuite, progressSuite, radioGroupSuite, ratingSuite, segmentedSuite, selectSuite, separatorSuite, skeletonSuite, spinnerSuite, statisticSuite, stepsSuite, switchSuite, tabsSuite, tagsInputSuite, tagSuite, textFieldSuite, timelineSuite, toastSuite, toggleGroupSuite, toggleSuite, tooltipSuite } from '@xihan-ui/testing'
import { runSsrConformance } from '@xihan-ui/testing/ssr'
import { describe, it } from 'vitest'
import { reactSsrExempt } from './ssr-exempt'
import { createReactSsrHarness } from './ssr-harness'

runSsrConformance(createReactSsrHarness(), [accordionSuite, alertSuite, avatarGroupSuite, avatarSuite, badgeSuite, breadcrumbSuite, buttonSuite, cardSuite, checkboxGroupSuite, checkboxSuite, collapsibleSuite, contextMenuSuite, dialogSuite, drawerSuite, editableSuite, emptyStateSuite, fieldArraySuite, fieldsetSuite, fieldSuite, formSuite, hoverCardSuite, inputGroupSuite, loadingBarSuite, menuSuite, notificationSuite, numberFieldSuite, paginationSuite, passwordInputSuite, pinInputSuite, popconfirmSuite, popoverSuite, progressSuite, radioGroupSuite, ratingSuite, segmentedSuite, selectSuite, separatorSuite, skeletonSuite, spinnerSuite, statisticSuite, stepsSuite, switchSuite, tabsSuite, tagsInputSuite, tagSuite, textFieldSuite, timelineSuite, toastSuite, toggleGroupSuite, toggleSuite, tooltipSuite], { describe, it }, reactSsrExempt)
