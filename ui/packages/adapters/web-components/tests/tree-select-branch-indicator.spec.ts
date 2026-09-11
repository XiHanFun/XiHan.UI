// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()
afterEach(() => { document.body.innerHTML = '' })

it('分支和叶子标记按最近节点接线，半选状态不误认成叶子', async () => {
  const element = document.createElement('xh-tree-select') as HTMLElement & {
    collection: unknown[]
    value: string[]
    updateComplete: Promise<unknown>
  }
  element.collection = [{ value: 'group', children: [{ value: 'one' }, { value: 'two' }] }]
  element.value = ['one']
  element.setAttribute('multiple', '')
  element.setAttribute('cascade', '')
  element.innerHTML = `
    <button data-xh-part="trigger">团队</button>
    <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="tree">
      <div data-xh-part="branch" value="group">
        <div data-xh-part="branch-control"><span data-xh-part="item-indicator" id="branch-mark"></span></div>
        <div data-xh-part="branch-content">
          <div data-xh-part="item" value="one"><span data-xh-part="item-indicator" id="leaf-mark"></span></div>
          <div data-xh-part="item" value="two"></div>
        </div>
      </div>
    </div></div></div>`
  document.body.append(element)
  await element.updateComplete
  expect(element.querySelector('#branch-mark')?.getAttribute('data-part')).toBe('item-indicator')
  expect(element.querySelector('#branch-mark')?.hasAttribute('data-indeterminate')).toBe(true)
  expect(element.querySelector('#leaf-mark')?.hasAttribute('data-selected')).toBe(true)
  element.value = ['one', 'two']
  await element.updateComplete
  expect(element.querySelector('#branch-mark')?.hasAttribute('data-selected')).toBe(true)
  expect(element.querySelector('#branch-mark')?.hasAttribute('data-indeterminate')).toBe(false)
})
