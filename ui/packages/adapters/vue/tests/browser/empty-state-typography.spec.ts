// EmptyState 的标题与说明按 Surface 排版档取值，三个尺寸档只换图形与留白；依赖真实计算样式。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhEmptyStateAction,
  XhEmptyStateDescription,
  XhEmptyStateIndicator,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(size?: 'sm' | 'md' | 'lg'): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhEmptyStateRoot, { size }, () => [
      h(XhEmptyStateIndicator, null, () => '○'),
      h(XhEmptyStateTitle, null, () => '暂无数据'),
      h(XhEmptyStateDescription, null, () => '还没有任何记录，先新建一条。'),
      h(XhEmptyStateAction, null, () => [h('button', null, '新建')]),
    ]),
  })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>('[data-scope="empty-state"][data-part="root"]')!
}

function part(root: HTMLElement, name: string): HTMLElement {
  return root.querySelector<HTMLElement>(`[data-part="${name}"]`)!
}

function resolvedLength(scope: HTMLElement, value: string): number {
  const probe = document.createElement('span')
  probe.style.cssText = `position:absolute;inline-size:${value}`
  scope.append(probe)
  const resolved = probe.getBoundingClientRect().width
  probe.remove()
  return resolved
}

function tokenColor(token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${token})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

describe('空状态的排版档', () => {
  it('md 与 sm 的标题都是 Surface 标题档 14/600，lg 升到页面级 heading-3', async () => {
    for (const size of ['md', 'sm'] as const) {
      const root = await mount(size)
      const title = getComputedStyle(part(root, 'title'))
      expect(Number.parseFloat(title.fontSize), size).toBe(resolvedLength(root, 'var(--xh-text-label-size)'))
      expect(title.fontWeight, size).toBe('600')
      app?.unmount()
      host?.remove()
    }
    const root = await mount('lg')
    expect(Number.parseFloat(getComputedStyle(part(root, 'title')).fontSize)).toBe(resolvedLength(root, 'var(--xh-text-heading-3-size)'))
  })

  it('说明是 13/fg-muted，根无壳：不画边、底与影', async () => {
    const root = await mount()
    const description = getComputedStyle(part(root, 'description'))
    expect(Number.parseFloat(description.fontSize)).toBe(resolvedLength(root, 'var(--xh-text-secondary-size)'))
    expect(description.color).toBe(tokenColor('--xh-fg-muted'))
    const style = getComputedStyle(root)
    expect(style.borderTopWidth).toBe('0px')
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.boxShadow).toBe('none')
  })
})
