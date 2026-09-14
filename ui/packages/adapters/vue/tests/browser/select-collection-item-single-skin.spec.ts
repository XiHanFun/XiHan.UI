import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhSelectRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles/layers.css'
import '@xihan-ui/styles/tone.css'
import '@xihan-ui/styles/select.css'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

describe('collection Item 单皮肤入口', () => {
  it('select.css 递归带入家族网格、选中对号与禁用状态', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhSelectRoot, {
        collection: [
          { value: 'alpha', label: 'Alpha' },
          { value: 'beta', label: 'Beta', disabled: true },
        ],
        defaultOpen: true,
        defaultValue: 'alpha',
      }),
    })
    app.mount(host)
    await nextTick()
    await nextTick()

    const [selected, disabled] = [...document.querySelectorAll<HTMLElement>('[data-xh-collection-item]')]
    const selectedStyle = getComputedStyle(selected!)
    const indicator = selected!.querySelector<HTMLElement>('[data-xh-collection-slot=\'indicator\']')!
    expect(selectedStyle.display).toBe('grid')
    expect(selectedStyle.paddingBlockStart).toBe('6px')
    expect(selectedStyle.paddingInlineStart).toBe('12px')
    expect(selectedStyle.fontSize).toBe('14px')
    expect(selectedStyle.fontWeight).toBe('400')
    expect(getComputedStyle(indicator).visibility).toBe('visible')
    expect(getComputedStyle(disabled!).cursor).toBe('not-allowed')
  })
})
