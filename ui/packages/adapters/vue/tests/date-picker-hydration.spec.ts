// @vitest-environment jsdom

import type { App, VNode } from 'vue'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import {
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerPositioner,
  XhDatePickerRoot,
} from '../src'

function picker(): VNode {
  return h('section', {
    'data-theme': 'dark',
    'data-density': 'compact',
    'dir': 'rtl',
  }, [
    h(XhDatePickerRoot, { open: true }, () => [
      h(XhDatePickerControl),
      h(XhDatePickerPositioner, null, () => [
        h(XhDatePickerContent, null, () => h('span', { 'data-testid': 'hydrated-date-panel' }, '水合日期面板')),
      ]),
    ]),
  ])
}

async function settle(): Promise<void> {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

describe('date-picker 服务端 hydration', () => {
  it('首帧同构，随后只搬运一份正文并保留视觉来源与 Layer 归属', async () => {
    document.getElementById('xh-portal-root')?.remove()
    const registry = createRuntimeConfig({
      scope: createScope(document.body, createCounterIdGenerator()),
    }).layerRegistry
    expect(registry.list()).toHaveLength(0)

    const html = await renderToString(createSSRApp({ render: picker }))
    expect(html).toContain('data-xh-portal-shell')
    expect(html.match(/水合日期面板/g)).toHaveLength(1)

    const host = document.createElement('div')
    host.innerHTML = html
    document.body.append(host)
    const warnings = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const captured: unknown[] = []
    let app: App | null = createSSRApp({ render: picker })
    app.config.errorHandler = error => captured.push(error)

    try {
      app.mount(host)
      await settle()

      expect(warnings).not.toHaveBeenCalled()
      expect(errors).not.toHaveBeenCalled()
      expect(captured).toHaveLength(0)

      const copies = document.querySelectorAll<HTMLElement>('[data-testid="hydrated-date-panel"]')
      expect(copies).toHaveLength(1)
      const content = copies[0]!.closest<HTMLElement>(`[data-scope='date-picker'][data-part='content']`)
      const shell = copies[0]!.closest<HTMLElement>('[data-xh-portal-shell]')
      expect(content).not.toBeNull()
      expect(shell?.parentElement?.id).toBe('xh-portal-root')
      expect(shell?.getAttribute('data-theme')).toBe('dark')
      expect(shell?.getAttribute('data-density')).toBe('compact')
      expect(shell?.getAttribute('dir')).toBe('rtl')

      expect(registry.list()).toHaveLength(1)
      expect(registry.top()?.node()).toBe(content)

      app.unmount()
      app = null
      await settle()
      expect(registry.list()).toHaveLength(0)
      expect(document.querySelector('[data-testid="hydrated-date-panel"]')).toBeNull()
      expect(warnings).not.toHaveBeenCalled()
      expect(errors).not.toHaveBeenCalled()
      expect(captured).toHaveLength(0)
    }
    finally {
      app?.unmount()
      warnings.mockRestore()
      errors.mockRestore()
      host.remove()
      document.getElementById('xh-portal-root')?.remove()
    }
  })
})
