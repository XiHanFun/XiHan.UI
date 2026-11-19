// @vitest-environment jsdom
// <xh-badge> 的计数由元素逐位写进 indicator：改了 count 要跟着重写，作者自己写的内容不动。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface BadgeHost extends HTMLElement {
  count?: number
  max?: number
  updateComplete: Promise<unknown>
}

afterEach(() => {
  document.body.innerHTML = ''
})

async function mount(count: number, indicatorContent = ''): Promise<{ host: BadgeHost, indicator: HTMLElement }> {
  const host = document.createElement('xh-badge') as BadgeHost
  host.count = count
  const root = document.createElement('span')
  root.dataset.xhPart = 'root'
  const indicator = document.createElement('span')
  indicator.dataset.xhPart = 'indicator'
  indicator.textContent = indicatorContent
  root.append('收件箱', indicator)
  host.append(root)
  document.body.append(host)
  await host.updateComplete
  return { host, indicator }
}

async function set(host: BadgeHost, next: Partial<Pick<BadgeHost, 'count' | 'max'>>): Promise<void> {
  Object.assign(host, next)
  await host.updateComplete
  await host.updateComplete
}

describe('xh-badge 计数', () => {
  it('indicator 空着时逐位写出计数，超过上限的「+」排在数字后面', async () => {
    const { indicator } = await mount(120)
    expect(indicator.querySelector('[data-part="value"]')!.textContent).toBe('99')
    expect(indicator.querySelectorAll('[data-part="glyph"]')).toHaveLength(2)
    expect(indicator.querySelector('[data-part="suffix"]')!.textContent).toBe('+')
    expect(indicator.textContent).toBe('99+')
  })

  it('改了 count 跟着重写，不把第一次写进去的数字当成作者内容', async () => {
    const { host, indicator } = await mount(5)
    await set(host, { count: 6 })
    expect(indicator.textContent).toBe('6')
    await set(host, { count: 12 })
    expect(indicator.textContent).toBe('12')
    await set(host, { count: 7 })
    expect(indicator.textContent).toBe('7')
    expect(indicator.querySelectorAll('[data-part="glyph"]')).toHaveLength(1)
  })

  it('作者自己写的内容不动', async () => {
    const { host, indicator } = await mount(3, '新')
    await set(host, { count: 4 })
    expect(indicator.textContent).toBe('新')
    expect(indicator.querySelector('[data-part="value"]')).toBeNull()
  })
})
