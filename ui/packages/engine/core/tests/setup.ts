// 单测公共准备：浮层按需块先取齐。用例断言的是打开之后的同步行为；
// 第一次打开时按需块还没到的那条路径由 overlay-kit.spec.ts 用一份新加载的模块单独测。

import { beforeAll } from 'vitest'
import { loadOverlayKit } from '../src/kernel/structure/overlay-kit'

beforeAll(async () => {
  await loadOverlayKit()
})
