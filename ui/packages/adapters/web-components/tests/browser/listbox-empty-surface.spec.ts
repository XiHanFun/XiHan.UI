import type { XhListboxElement } from '../../src/elements/listbox'
import { afterEach, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()
let host: XhListboxElement | undefined

function part(name: string): HTMLElement {
  const node = host?.querySelector<HTMLElement>(`[data-xh-part='${name}']`)
  if (!node)
    throw new Error(`缺少列表部件 ${name}`)
  return node
}

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await Promise.resolve()
    await host?.updateComplete
  }
}

afterEach(() => {
  host?.remove()
  host = undefined
})

it('合法零候选无空框，作者空态与首次加载共享位置，数据到达后恢复键盘入口', async () => {
  host = document.createElement('xh-listbox') as XhListboxElement
  host.collection = []
  host.selectionMode = 'multiple'
  host.innerHTML = '<div data-xh-part="root"><span data-xh-part="label">候选</span><div data-xh-part="content">   </div><div data-xh-part="empty">没有匹配项</div><div data-xh-part="loading">正在加载</div></div>'
  document.body.append(host)
  await settle()
  expect(part('content').getBoundingClientRect().height).toBe(0)
  expect(part('empty').getBoundingClientRect().height).toBeGreaterThan(0)
  host.loading = true
  await settle()
  expect(part('content').getBoundingClientRect().height).toBe(0)
  expect(part('empty').getBoundingClientRect().height).toBe(0)
  expect(part('loading').getBoundingClientRect().height).toBeGreaterThan(0)
  part('content').innerHTML = '<div data-xh-part="item" value="pear">梨</div>'
  host.collection = [{ value: 'pear', label: '梨' }]
  host.loading = false
  await settle()
  expect(part('content').getBoundingClientRect().height).toBeGreaterThan(0)
  part('content').focus()
  await userEvent.keyboard('{Enter}')
  expect(part('item').getAttribute('aria-selected')).toBe('true')
})

it('手写空组和空白文本不撑开列表，禁用候选显示后恢复完整框体', async () => {
  host = document.createElement('xh-listbox') as XhListboxElement
  host.innerHTML = '<div data-xh-part="root"><span data-xh-part="label">候选</span><div data-xh-part="content">\n <div data-xh-part="group" value="empty"><span data-xh-part="group-label">空组</span></div></div></div>'
  document.body.append(host)
  await settle()
  expect(part('content').getBoundingClientRect().height).toBe(0)
  part('content').insertAdjacentHTML('beforeend', '<div data-xh-part="item" value="blocked" aria-disabled="true">不可选</div>')
  await settle()
  await expect.poll(() => part('content').getBoundingClientRect().height).toBeGreaterThan(0)
  expect(part('group').getBoundingClientRect().height).toBe(0)
  expect(part('item').getAttribute('aria-disabled')).toBe('true')
})
