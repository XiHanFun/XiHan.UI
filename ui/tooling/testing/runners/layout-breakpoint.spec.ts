// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { createReactHarness } from '../../../packages/adapters/react/tests/harness'
import { createVueHarness } from '../../../packages/adapters/vue/tests/harness'
import { createWcHarness } from '../../../packages/adapters/web-components/tests/harness'
import { installLayoutViewport } from '../src/fixtures/layout-viewport'
import { layoutSuite } from '../src/suites/layout.suite'

describe('三端 Layout 断点热切换', () => {
  for (const createHarness of [createVueHarness, createReactHarness, createWcHarness]) {
    const harness = createHarness()
    it(`${harness.adapterName} 更新断点后同步呈现形态和侧栏意图`, async () => {
      const restore = installLayoutViewport(document)
      try {
        const { root } = await harness.mount({ component: 'layout', tree: layoutSuite.fixture, props: { siderBreakpoint: 'md', siderPresentation: 'sheet' } })
        await harness.flush()
        const sider = (): Element => root.querySelector('[data-part="sider"]')!
        expect(sider().getAttribute('data-presentation')).toBe('inline')
        await harness.setProps({ siderBreakpoint: 'lg' })
        await harness.flush()
        expect(sider().getAttribute('data-presentation')).toBe('sheet')
        expect(sider().hasAttribute('data-collapsed')).toBe(true)
        await harness.setProps({ siderBreakpoint: 'md' })
        await harness.flush()
        expect(sider().getAttribute('data-presentation')).toBe('inline')
        expect(sider().hasAttribute('data-collapsed')).toBe(false)
      }
      finally {
        await harness.unmount()
        restore()
      }
    })
  }
})
