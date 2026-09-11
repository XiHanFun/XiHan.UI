// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()
afterEach(() => {
  document.body.innerHTML = ''
})

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

it('懒分支的在途相位从 headless 落到现有 branch，不由元素另起请求状态', async () => {
  let resolve: (nodes: { value: string }[]) => void = () => {}
  const element = document.createElement('xh-tree-select') as HTMLElement & {
    collection: unknown[]
    loadChildren: () => Promise<{ value: string }[]>
    updateComplete: Promise<unknown>
  }
  element.collection = [{ value: 'remote', hasChildren: true }]
  element.loadChildren = () => new Promise((done) => {
    resolve = done
  })
  element.innerHTML = `
    <button data-xh-part="trigger">远程</button>
    <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="tree">
      <div data-xh-part="branch" value="remote">
        <div data-xh-part="branch-control"><span data-xh-part="branch-trigger"></span></div>
        <div data-xh-part="branch-content"></div>
      </div>
    </div></div></div>`
  document.body.append(element)
  await element.updateComplete

  const branch = element.querySelector<HTMLElement>('[data-xh-part="branch"]')!
  element.querySelector<HTMLElement>('[data-xh-part="branch-trigger"]')!.click()
  await element.updateComplete
  expect(branch.getAttribute('aria-busy')).toBe('true')
  expect(branch.hasAttribute('data-loading')).toBe(true)

  resolve([{ value: 'fetched' }])
  await Promise.resolve()
  await Promise.resolve()
  await new Promise(resolve => setTimeout(resolve, 0))
  await element.updateComplete
  expect(branch.hasAttribute('data-loading')).toBe(false)
  expect(branch.hasAttribute('data-error')).toBe(false)
})
