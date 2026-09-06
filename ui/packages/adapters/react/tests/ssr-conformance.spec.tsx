// @vitest-environment node
//
// 服务端直出必须跑在真正没有 document 的宿主里。jsdom 下 `typeof document !== 'undefined'`
// 成立，组件里的 DOM 分支照常执行，服务端这一半根本测不出来。

import { dialogSuite, fieldSuite, formSuite, selectSuite, switchSuite } from '@xihan-ui/testing'
import { runSsrConformance } from '@xihan-ui/testing/ssr'
import { describe, it } from 'vitest'
import { reactSsrExempt } from './ssr-exempt'
import { createReactSsrHarness } from './ssr-harness'

runSsrConformance(createReactSsrHarness(), [dialogSuite, fieldSuite, formSuite, selectSuite, switchSuite], { describe, it }, reactSsrExempt)
