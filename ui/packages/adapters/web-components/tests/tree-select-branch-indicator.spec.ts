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

it('手写节点增删由 WC 只上报事实，自动 empty/loading 显隐仍由 Headless 决定', async () => {
  const element = document.createElement('xh-tree-select') as HTMLElement & {
    loading?: boolean
    updateComplete: Promise<unknown>
  }
  element.innerHTML = `
    <button data-xh-part="trigger">选择</button>
    <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="tree"></div></div></div>`
  document.body.append(element)
  await element.updateComplete
  await element.updateComplete

  const empty = element.querySelector<HTMLElement>('[data-xh-part="empty"]')!
  const loading = element.querySelector<HTMLElement>('[data-xh-part="loading"]')!
  expect(empty.textContent).toBe('No data')
  expect(empty.hidden).toBe(false)
  expect(loading.hidden).toBe(true)

  const item = document.createElement('div')
  item.setAttribute('data-xh-part', 'item')
  item.setAttribute('value', 'manual')
  element.querySelector('[data-xh-part="tree"]')!.append(item)
  await Promise.resolve()
  await element.updateComplete
  expect(empty.hidden).toBe(true)

  item.remove()
  await Promise.resolve()
  await element.updateComplete
  expect(empty.hidden).toBe(false)

  element.loading = true
  await element.updateComplete
  expect(empty.hidden).toBe(true)
  expect(loading.hidden).toBe(false)
})

it('wc 作者反馈节点优先，运行期加入时移除自动节点且不重复', async () => {
  const element = document.createElement('xh-tree-select') as HTMLElement & { updateComplete: Promise<unknown> }
  element.innerHTML = `
    <button data-xh-part="trigger">选择</button>
    <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="tree"></div></div></div>`
  document.body.append(element)
  await element.updateComplete
  await element.updateComplete
  expect(element.querySelectorAll('[data-xh-part="empty"]')).toHaveLength(1)

  const authored = document.createElement('div')
  authored.setAttribute('data-xh-part', 'empty')
  authored.textContent = '作者空态'
  element.querySelector('[data-xh-part="content"]')!.append(authored)
  await Promise.resolve()
  await element.updateComplete
  await element.updateComplete
  const empties = element.querySelectorAll<HTMLElement>('[data-xh-part="empty"]')
  expect(empties).toHaveLength(1)
  expect(empties[0]!.textContent).toBe('作者空态')
})
