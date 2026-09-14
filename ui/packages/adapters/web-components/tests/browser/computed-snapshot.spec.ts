import { runComputedSnapshot } from '@xihan-ui/testing'
import { describe, expect, it } from 'vitest'
import { createWcHarness } from '../harness'
import { wcSuites } from '../suites'
import { wcDialogSuite } from '../wc-dialog.suite'
import { wcDrawerSuite } from '../wc-drawer.suite'
import { wcImageViewerSuite } from '../wc-image-viewer.suite'
// 快照读的是最终解析值，皮肤与令牌必须一起加载，否则采到的是浏览器默认样式。
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 三个模态各自单开了 WC 规格，不在 wcSuites 里，与 a11y 那份取同一组套件。
runComputedSnapshot(
  createWcHarness(),
  [...wcSuites, wcDialogSuite, wcDrawerSuite, wcImageViewerSuite],
  { describe, it },
  {
    write: async (component, text) => {
      await expect(text).toMatchFileSnapshot(`./__snapshots__/computed/${component}.txt`)
    },
  },
)
