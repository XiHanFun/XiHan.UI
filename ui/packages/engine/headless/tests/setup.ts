// 单测公共准备：core 的浮层按需块先取齐。用例断言的是打开之后的同步行为；
// 第一次打开时按需块还没到的那条路径由 overlay-kit-gate.spec.ts 用一份新加载的模块单独测。

import { loadOverlayKit } from '@xihan-ui/core'
import { beforeAll } from 'vitest'

beforeAll(async () => {
  await loadOverlayKit()
})
