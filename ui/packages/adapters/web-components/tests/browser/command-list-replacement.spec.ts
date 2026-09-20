import type { XhCommandElement } from '../../src/elements/command'
import { afterEach, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()
let host: XhCommandElement | undefined

/**
 * 展开即把 content 整段搬进 Portal 落点，作者节点不再在宿主子树里；按升级后写入的 data-scope 加作者声明的
 * data-xh-part 在整个文档里取，一次只挂一个宿主，取到的就是它的。
 */
function part(name: string): HTMLElement {
  const matches = document.querySelectorAll<HTMLElement>(`[data-scope='command'][data-xh-part='${name}']`)
  if (matches.length !== 1)
    throw new Error(`找不到唯一的命令部件 ${name}，命中 ${matches.length} 个`)
  return matches[0]!
}

async function settle(): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await Promise.resolve()
    await host?.updateComplete
  }
}

afterEach(() => {
  host?.remove()
  host = undefined
})

it('保持展开替换作者 List 后重新接线，新节点隐藏和恢复更新 ARIA', async () => {
  host = document.createElement('xh-command') as XhCommandElement
  host.open = true
  host.modal = false
  host.collection = [{ value: 'first', label: '首项' }, { value: 'second', label: '次项' }]
  host.innerHTML = '<div data-xh-part="content"><input data-xh-part="input"><div data-xh-part="list"><div data-xh-part="item" value="first">首项</div><div data-xh-part="item" value="second">次项</div></div><div data-xh-part="empty">没有显示中的命令</div></div>'
  document.body.append(host)
  await settle()
  const input = part('input')
  const oldList = part('list')
  const nextList = document.createElement('div')
  nextList.dataset.xhPart = 'list'
  nextList.innerHTML = '<div data-xh-part="item" value="first">首项</div><div data-xh-part="item" value="second">次项</div>'
  oldList.replaceWith(nextList)
  await settle()
  expect(part('list')).toBe(nextList)
  const first = nextList.querySelector<HTMLElement>('[value="first"]')!
  const second = nextList.querySelector<HTMLElement>('[value="second"]')!
  first.hidden = true
  await settle()
  await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(second.id)
  second.hidden = true
  await settle()
  await expect.poll(() => input.getAttribute('aria-activedescendant')).toBeNull()
  expect(part('empty').getBoundingClientRect().height).toBeGreaterThan(0)
  first.hidden = false
  await settle()
  await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(first.id)
  expect(part('empty').getBoundingClientRect().height).toBe(0)
  oldList.hidden = true
  await settle()
  expect(input.getAttribute('aria-activedescendant')).toBe(first.id)
  expect(part('content').getAttribute('data-state')).toBe('open')
})
