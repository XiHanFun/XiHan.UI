// 单测公共准备：浮层的按需块（core 的消解层、焦点域、视觉桥，定位引擎，浮层里的自绘滚动条）先取齐。
// 用例断言的是打开之后的同步行为，第一次打开晚一拍的那条路径另有浏览器用例。

import { beforeAll } from 'vitest'
import { preloadOverlay } from '../src/runtime/preload-overlay'

beforeAll(async () => {
  await preloadOverlay()
})
