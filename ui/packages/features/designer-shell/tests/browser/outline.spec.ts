// 页面结构在真实键盘、指针与布局下：整棵树一个 Tab 位，方向键走行、Enter 选中、Delete 删除，焦点与悬停所在的行派发标出；
// 删除钮平时不显、悬停时出现，点它只删不选、不夺焦点；Alt + 方向键挪动经 allowMove 判定；窄面板里长名字收成省略号、删除钮不出界。
import type { DesignerOutlineEventMap, DesignerOutlineNode, XhDesignerOutlineElement } from '../../src'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

let wrapper: HTMLElement | null = null

afterEach(() => {
  wrapper?.remove()
  wrapper = null
})

async function until(check: () => boolean, message = '期望的状态'): Promise<void> {
  const start = performance.now()
  while (!check()) {
    if (performance.now() - start > 2000)
      throw new Error(`等了 2 秒仍没到${message}`)
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

const nodes: DesignerOutlineNode[] = [
  { id: 'name', label: 'Name', description: 'name' },
  { id: 'grid', label: 'Grid', children: [
    { id: 'col-1', label: 'Column 1', movable: false, deletable: false, children: [
      { id: 'phone', label: 'Phone', description: 'phone' },
      { id: 'email', label: 'A very long field label that does not fit in a narrow panel', description: 'email' },
    ] },
  ] },
  { id: 'remark', label: 'Remark' },
]

async function mount(width = 320, setup: (outline: XhDesignerOutlineElement) => void = () => {}): Promise<XhDesignerOutlineElement> {
  const box = document.createElement('div')
  box.style.cssText = `display: flex; flex-direction: column; inline-size: ${width}px; block-size: 360px`
  const before = document.createElement('button')
  before.textContent = 'before'
  const after = document.createElement('button')
  after.textContent = 'after'
  const outline = document.createElement('xh-designer-outline')
  outline.nodes = nodes
  outline.style.cssText = 'flex: 1; min-block-size: 0'
  setup(outline)
  box.append(before, outline, after)
  document.body.append(box)
  wrapper = box
  await outline.updateComplete
  await until(() => outline.querySelector('[role="treeitem"]') !== null, '树铺好')
  return outline
}

function record<K extends keyof DesignerOutlineEventMap>(outline: Element, type: K): DesignerOutlineEventMap[K]['detail'][] {
  const seen: DesignerOutlineEventMap[K]['detail'][] = []
  outline.addEventListener(type, event => seen.push((event as DesignerOutlineEventMap[K]).detail))
  return seen
}

function row(outline: Element, id: string): HTMLElement {
  return outline.querySelector<HTMLElement>(`[data-scope="tree"][data-id="${id}"]`)!
}

describe('页面结构 <xh-designer-outline>', () => {
  it('整棵树一个 Tab 位；方向键走行，焦点所在的行派发标出；Enter 选中，Delete 删除，离开树撤掉标出', async () => {
    const outline = await mount(320, element => element.selection = ['phone'])
    const highlighted = record(outline, 'node-highlight')
    const selected = record(outline, 'node-select')
    const deleted = record(outline, 'node-delete')
    page.getByRole('button', { name: 'before' }).element().focus()
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement?.getAttribute('value')).toBe('phone')
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement?.getAttribute('value')).toBe('email')
    await userEvent.keyboard('{Enter}')
    expect(selected).toEqual([{ ids: ['email'] }])
    await userEvent.keyboard('{Delete}')
    expect(deleted).toEqual([{ ids: ['email'] }])
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'after' }).element())
    expect(highlighted).toEqual([{ id: 'phone' }, { id: 'email' }, { id: null }])
  })

  it('悬停一行派发标出、移开撤掉；删除钮悬停时才出现，点它只删不选', async () => {
    const outline = await mount()
    const highlighted = record(outline, 'node-highlight')
    const selected = record(outline, 'node-select')
    const deleted = record(outline, 'node-delete')
    const remark = row(outline, 'remark')
    const trigger = remark.querySelector<HTMLElement>('[data-part="delete-trigger"]')!
    expect(Number(getComputedStyle(trigger).opacity)).toBe(0)
    await userEvent.hover(remark)
    await until(() => Number(getComputedStyle(trigger).opacity) === 1, '删除钮出现')
    expect(highlighted.at(-1)).toEqual({ id: 'remark' })
    await userEvent.click(trigger)
    expect(deleted).toEqual([{ ids: ['remark'] }])
    expect(selected).toEqual([])
    // 删除钮对读屏隐藏，按下不夺焦点
    expect(document.activeElement).not.toBe(trigger)
    await userEvent.hover(page.getByRole('button', { name: 'before' }).element())
    await until(() => highlighted.at(-1)?.id === null, '移开后撤掉标出')
  })

  it('按 Alt + 方向键挪动经 allowMove 判定：能挪的派发 node-move，movable 为 false 的不动', async () => {
    const outline = await mount(320, element => element.allowMove = move => move.parent !== null)
    const moved = record(outline, 'node-move')
    row(outline, 'phone').closest<HTMLElement>('[role="treeitem"]')!.focus()
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
    expect(moved).toEqual([{ id: 'phone', parent: 'col-1', index: 1 }])
    row(outline, 'col-1').closest<HTMLElement>('[role="treeitem"]')!.focus()
    await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}')
    expect(moved).toHaveLength(1)
    row(outline, 'remark').closest<HTMLElement>('[role="treeitem"]')!.focus()
    await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}')
    expect(moved).toHaveLength(1)
  })

  it('240px 的面板里长名字收成一行省略号，悬停时删除钮整个落在行里，页面不横向溢出', async () => {
    const outline = await mount(240)
    const email = row(outline, 'email')
    const text = email.querySelector<HTMLElement>('[data-scope="tree"][data-part="item-text"]')!
    expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
    expect(getComputedStyle(text).textOverflow).toBe('ellipsis')
    await userEvent.hover(email)
    const trigger = email.querySelector<HTMLElement>('[data-part="delete-trigger"]')!
    await until(() => Number(getComputedStyle(trigger).opacity) === 1, '删除钮出现')
    const box = trigger.getBoundingClientRect()
    const bounds = email.getBoundingClientRect()
    expect(box.width).toBeGreaterThan(0)
    expect(box.right).toBeLessThanOrEqual(bounds.right + 0.5)
    expect(box.left).toBeGreaterThanOrEqual(bounds.left - 0.5)
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth)
  })
})
