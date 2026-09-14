import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhPortal } from '../../src/runtime/portal'
import '@xihan-ui/tokens/tokens.css'

let app: App | null = null

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

describe('portal 视觉环境桥', () => {
  it('真实 Chromium 将透明度轴与来源自定义属性投影到独占壳', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h('section', {
        'data-transparency': 'reduce',
        'style': '--business-color: rebeccapurple',
      }, [
        h(XhPortal, { to: document.body }, () => h('span', { 'data-testid': 'portal-content' }, '内容')),
      ]),
    })
    app.mount(host)
    await settle()

    const shell = document.querySelector<HTMLElement>('[data-testid="portal-content"]')?.closest<HTMLElement>('[data-xh-portal-shell]')
    expect(shell).not.toBeNull()
    expect(shell!.getAttribute('data-transparency')).toBe('reduce')
    expect(shell!.style.getPropertyValue('--business-color')).toBe('rebeccapurple')
    expect(getComputedStyle(shell!).getPropertyValue('--business-color')).toBe('rebeccapurple')
    expect(getComputedStyle(shell!).getPropertyValue('--xh-material-glass-backdrop')).toBe('none')
  })
})
