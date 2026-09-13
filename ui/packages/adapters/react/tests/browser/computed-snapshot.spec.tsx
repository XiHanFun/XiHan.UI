/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 computed snapshot 相关行为。

import { allSuites, runComputedSnapshot } from '@xihan-ui/testing'
import { describe, expect, it } from 'vitest'
import { createReactHarness } from '../harness'
// 快照读的是最终解析值，皮肤与令牌必须一起加载，否则采到的是浏览器默认样式。
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

runComputedSnapshot(createReactHarness(), allSuites, { describe, it }, {
  write: async (component, text) => {
    await expect(text).toMatchFileSnapshot(`./__snapshots__/computed/${component}.txt`)
  },
})
