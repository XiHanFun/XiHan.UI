// @vitest-environment node
//
// 服务端直出必须跑在真正没有 document 的宿主里。jsdom 下 `typeof document !== 'undefined'`
// 成立，组件里的 DOM 分支照常执行，服务端这一半根本测不出来。

import { accordionSuite, alertSuite, avatarGroupSuite, avatarSuite, badgeSuite, breadcrumbSuite, buttonSuite, checkboxGroupSuite, checkboxSuite, collapsibleSuite, dialogSuite, drawerSuite, fieldArraySuite, fieldsetSuite, fieldSuite, formSuite, loadingBarSuite, notificationSuite, paginationSuite, popoverSuite, radioGroupSuite, segmentedSuite, selectSuite, separatorSuite, skeletonSuite, spinnerSuite, stepsSuite, switchSuite, tabsSuite, tagSuite, toastSuite, toggleGroupSuite, toggleSuite, tooltipSuite } from '@xihan-ui/testing'
import { runSsrConformance } from '@xihan-ui/testing/ssr'
import { describe, it } from 'vitest'
import { reactSsrExempt } from './ssr-exempt'
import { createReactSsrHarness } from './ssr-harness'

runSsrConformance(createReactSsrHarness(), [accordionSuite, alertSuite, avatarGroupSuite, avatarSuite, badgeSuite, breadcrumbSuite, buttonSuite, checkboxGroupSuite, checkboxSuite, collapsibleSuite, dialogSuite, drawerSuite, fieldArraySuite, fieldsetSuite, fieldSuite, formSuite, loadingBarSuite, notificationSuite, paginationSuite, popoverSuite, radioGroupSuite, segmentedSuite, selectSuite, separatorSuite, skeletonSuite, spinnerSuite, stepsSuite, switchSuite, tabsSuite, tagSuite, toastSuite, toggleGroupSuite, toggleSuite, tooltipSuite], { describe, it }, reactSsrExempt)
