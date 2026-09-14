import type { XhTreeSelectElement } from '../../src/elements/tree-select'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import demo from '../../../../../../docs/.vitepress/demos/tree-select/08-async.html?raw'
import { defineXhElements } from '../../src/define'

let stage: HTMLElement | null = null

beforeAll(() => defineXhElements())

afterEach(() => {
  stage?.remove()
  stage = null
})

async function settle(host: HTMLElement): Promise<void> {
  for (const element of host.querySelectorAll<HTMLElement>('*')) {
    const pending = (element as { updateComplete?: Promise<unknown> }).updateComplete
    if (pending)
      await pending
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function mountDemo(): Promise<HTMLElement> {
  stage = document.createElement('div')
  stage.innerHTML = demo
  document.body.append(stage)

  const stale = stage.querySelector('script')
  if (!stale)
    throw new Error('异步 TreeSelect 示例缺少模块脚本')
  const readyEvent = `tree-select-demo-ready-${crypto.randomUUID()}`
  const script = document.createElement('script')
  script.type = 'module'
  script.textContent = `${stale.textContent ?? ''}\ndocument.dispatchEvent(new Event(${JSON.stringify(readyEvent)}));`
  const ready = new Promise<void>(resolve => document.addEventListener(readyEvent, () => resolve(), { once: true }))
  stale.replaceWith(script)
  await ready
  await settle(stage)
  return stage
}

describe('tree-select 异步示例状态', () => {
  it('首次加载与空响应只使用正式状态部件，不生成可选占位行', async () => {
    const host = await mountDemo()
    const treeSelect = host.querySelector<XhTreeSelectElement>('#tree-select-async')
    const tree = host.querySelector<HTMLElement>('[data-part="tree"]')
    const loading = host.querySelector<HTMLElement>('[data-part="loading"]')
    const empty = host.querySelector<HTMLElement>('[data-part="empty"]')
    const trigger = host.querySelector<HTMLButtonElement>('[data-part="trigger"]')
    const emptyButton = host.querySelector<HTMLButtonElement>('[data-load-mode="empty"]')
    if (!treeSelect || !tree || !loading || !empty || !trigger || !emptyButton)
      throw new Error('异步 TreeSelect 示例缺少验收所需部件')

    const valueChanges: unknown[] = []
    treeSelect.addEventListener('value-change', event => valueChanges.push((event as CustomEvent).detail))
    trigger.click()
    await settle(host)

    expect(treeSelect.loading).toBe(true)
    expect(tree.getAttribute('aria-busy')).toBe('true')
    expect(loading.hidden).toBe(false)
    expect(empty.hidden).toBe(true)
    expect(tree.querySelectorAll('[role="treeitem"]')).toHaveLength(0)
    expect(tree.textContent).not.toContain('加载中')

    await expect.poll(() => treeSelect.loading).toBe(false)
    await settle(host)
    expect(treeSelect.loading).toBe(false)
    expect(loading.hidden).toBe(true)
    expect(empty.hidden).toBe(true)
    expect(tree.querySelectorAll('[data-part="branch"]')).toHaveLength(2)
    expect(tree.querySelectorAll('[data-part="item"]')).toHaveLength(5)
    expect([...tree.querySelectorAll('[data-value]')].some(node => node.getAttribute('data-value')?.includes('pending'))).toBe(false)

    emptyButton.click()
    await settle(host)
    expect(treeSelect.loading).toBe(true)
    expect(tree.querySelectorAll('[role="treeitem"]')).toHaveLength(0)

    await expect.poll(() => treeSelect.loading).toBe(false)
    await settle(host)
    expect(treeSelect.loading).toBe(false)
    expect(tree.getAttribute('aria-busy')).toBeNull()
    expect(loading.hidden).toBe(true)
    expect(empty.hidden).toBe(false)
    expect(tree.querySelectorAll('[role="treeitem"]')).toHaveLength(0)

    tree.focus()
    tree.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(document.activeElement).toBe(tree)
    expect(valueChanges).toHaveLength(0)
  })
})
