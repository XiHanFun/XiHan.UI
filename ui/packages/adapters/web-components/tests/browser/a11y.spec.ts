import { runA11y, wcA11yBaseline } from '@xihan-ui/testing/a11y'
import { describe, it } from 'vitest'
import { createWcHarness } from '../harness'
import { wcSuites } from '../suites'
import { wcDialogSuite } from '../wc-dialog.suite'
import { wcDrawerSuite } from '../wc-drawer.suite'
import { wcImageViewerSuite } from '../wc-image-viewer.suite'
// 皮肤要一起加载：色彩对比、可见性、目标尺寸这些规则查的是最终渲染结果，
// 不带样式扫出来的绿跟发出去的那套皮肤没有关系。
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 三个模态的 presence 模型与共享套件对不上，各自单开了一份 WC 规格；它们不在 wcSuites 里，
// 但焦点陷阱、aria-modal、背景 inert 恰恰最该在真机里扫
runA11y(createWcHarness(), [...wcSuites, wcDialogSuite, wcDrawerSuite, wcImageViewerSuite], { describe, it }, wcA11yBaseline)
