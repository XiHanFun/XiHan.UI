import { runA11y, wcA11yBaseline } from '@xihan-ui/testing/a11y'
import { describe, it } from 'vitest'
import { createWcHarness } from '../harness'
import { wcSuites } from '../suites'
// 皮肤要一起加载：色彩对比、可见性、目标尺寸这些规则查的是最终渲染结果，
// 不带样式扫出来的绿跟发出去的那套皮肤没有关系。
import '@xihan-ui/system/tokens.css'
import '@xihan-ui/styled'

runA11y(createWcHarness(), wcSuites, { describe, it }, wcA11yBaseline)
