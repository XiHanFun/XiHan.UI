import { allSuites } from '@xihan-ui/testing'
import { reactA11yBaseline, runA11y } from '@xihan-ui/testing/a11y'
import { describe, it } from 'vitest'
import { createReactHarness } from '../harness'
// 皮肤要一起加载：色彩对比、可见性、目标尺寸这些规则查的是最终渲染结果，
// 不带样式扫出来的绿跟发出去的那套皮肤没有关系。
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

runA11y(createReactHarness(), allSuites, { describe, it }, reactA11yBaseline)
