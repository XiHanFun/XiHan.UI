import { allSuites, runComputedSnapshot } from '@xihan-ui/testing'
import { describe, expect, it } from 'vitest'
import { createVueHarness } from '../harness'
// 快照读的是最终解析值，皮肤与令牌必须一起加载，否则采到的是浏览器默认样式。
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

runComputedSnapshot(createVueHarness(), allSuites, { describe, it }, {
  write: async (component, text) => {
    await expect(text).toMatchFileSnapshot(`./__snapshots__/computed/${component}.txt`)
  },
})
