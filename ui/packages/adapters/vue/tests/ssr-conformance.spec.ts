/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 ssr conformance 相关行为。

// @vitest-environment node
//
// 服务端直出必须跑在真正没有 document 的宿主里。jsdom 下 `typeof document !== 'undefined'`
// 成立，组件里的 DOM 分支照常执行，服务端这一半根本测不出来。

import { allSuites } from '@xihan-ui/testing'
import { runSsrConformance, vueSsrExempt } from '@xihan-ui/testing/ssr'
import { describe, it } from 'vitest'
import { createVueSsrHarness } from './ssr-harness'

runSsrConformance(createVueSsrHarness(), allSuites, { describe, it }, vueSsrExempt)
