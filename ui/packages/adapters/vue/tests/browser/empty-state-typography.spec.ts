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

async function mount(size?: 'sm' | 'md' | 'lg', tone?: 'success' | 'brand'): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhEmptyStateRoot, { size, tone }, () => [
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
  it('md 与 sm 的标题都是小面标题档 14/500，lg 升到区块标题 heading-3', async () => {
    for (const size of ['md', 'sm'] as const) {
      const root = await mount(size)
      const title = getComputedStyle(part(root, 'title'))
      expect(Number.parseFloat(title.fontSize), size).toBe(resolvedLength(root, 'var(--xh-text-label-size)'))
      expect(title.fontWeight, size).toBe('500')
      app?.unmount()
      host?.remove()
    }
    const root = await mount('lg')
    expect(Number.parseFloat(getComputedStyle(part(root, 'title')).fontSize)).toBe(resolvedLength(root, 'var(--xh-text-heading-3-size)'))
  })

  it('标题与说明之间 4px，说明到动作区比整档间距多 4px', async () => {
    const root = await mount()
    const gap = Number.parseFloat(getComputedStyle(root).rowGap)
    const title = part(root, 'title').getBoundingClientRect()
    const description = part(root, 'description').getBoundingClientRect()
    const action = part(root, 'action').getBoundingClientRect()
    expect(description.top - title.bottom).toBeCloseTo(4, 0)
    expect(action.top - description.bottom).toBeCloseTo(gap + 4, 0)
  })

  it('写了成功 / 警示 / 出错 / 提示语气时图标坐进 44px 语气淡底圆，品牌语气不画圆', async () => {
    const root = await mount('md', 'success')
    const indicator = getComputedStyle(part(root, 'indicator'))
    expect(Number.parseFloat(indicator.inlineSize)).toBe(resolvedLength(root, 'var(--xh-control-box-lg)'))
    expect(indicator.borderTopLeftRadius).not.toBe('0px')
    expect(indicator.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    app?.unmount()
    host?.remove()

    const brand = await mount('md', 'brand')
    expect(getComputedStyle(part(brand, 'indicator')).backgroundColor).toBe('rgba(0, 0, 0, 0)')
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
