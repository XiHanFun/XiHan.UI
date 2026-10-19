// 页面结构在真实键盘、指针与布局下：整棵树一个 Tab 位，方向键走行、Enter 选中、Delete 删除，焦点与悬停所在的行派发标出；
// 多选照文件管理器：裸点换选、Ctrl 点与 Ctrl + Space 加选取消、Shift 点从锚点选一段，画布换了选中后锚点跟过去；
// 删除钮平时不显、悬停时出现，点它只删不选、不夺焦点；Alt + 方向键挪动经 allowMove 判定；movable 为 false 的行真实鼠标拖不起来、
// 仍能当落点；窄面板里长名字收成省略号、删除钮不出界。
import type { DesignerOutlineEventMap, DesignerOutlineNode, XhDesignerOutlineElement } from '../../src'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, page, userEvent } from 'vitest/browser'
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

/** 当设计器：node-select 照着写回 selection，记下每一次交出的选中。 */
function echo(outline: XhDesignerOutlineElement): string[][] {
  const seen: string[][] = []
  outline.addEventListener('node-select', (event) => {
    const { ids } = (event as DesignerOutlineEventMap['node-select']).detail
    seen.push(ids)
    outline.selection = ids
  })
  return seen
}

/** 此刻报 aria-selected=true 的行，按文档顺序。 */
function selectedRows(outline: Element): string[] {
  return [...outline.querySelectorAll<HTMLElement>('[role="treeitem"][aria-selected="true"]')].map(item => item.getAttribute('value')!)
}

/** CDP 修饰键位：Ctrl 2、Shift 8。 */
const CTRL = 2
const SHIFT = 8

/** 真实鼠标按着修饰键点这一行的名字。 */
async function clickRow(target: Element, modifiers = 0): Promise<void> {
  const scale = await mouseScale()
  const text = target.querySelector('[data-scope="tree"][data-part="item-text"], [data-scope="tree"][data-part="branch-text"]')!
  const { x, y } = center(text)
  const point = { x: x / scale, y: y / scale }
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', modifiers, ...point })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, modifiers, ...point })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, modifiers, ...point })
  await frame()
  await frame()
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

  it('真实鼠标多选：裸点换选，按住 Ctrl 点加选与取消，按住 Shift 点从锚点选一段；画布换了选中后 Shift 点从新选上的最后一行连起', async () => {
    const outline = await mount()
    const selected = echo(outline)
    expect(outline.querySelector('[role="tree"]')!.getAttribute('aria-multiselectable')).toBe('true')
    await clickRow(row(outline, 'name'))
    await clickRow(row(outline, 'remark'), CTRL)
    expect(selectedRows(outline)).toEqual(['name', 'remark'])
    // 可见序 name / grid / col-1 / phone / email / remark，锚点在 remark
    await clickRow(row(outline, 'phone'), SHIFT)
    expect(selectedRows(outline)).toEqual(['phone', 'email', 'remark'])
    await clickRow(row(outline, 'email'), CTRL)
    expect(selectedRows(outline)).toEqual(['phone', 'remark'])
    // 画布上改选了栅格
    outline.selection = ['grid']
    await outline.updateComplete
    await frame()
    await clickRow(row(outline, 'email'), SHIFT)
    expect(selectedRows(outline)).toEqual(['grid', 'col-1', 'phone', 'email'])
    await clickRow(row(outline, 'col-1'))
    expect(selected).toEqual([['name'], ['name', 'remark'], ['phone', 'email', 'remark'], ['phone', 'remark'], ['grid', 'col-1', 'phone', 'email'], ['col-1']])
  })

  it('真实键盘多选：Ctrl + Space 加选焦点所在的行，Delete 删全部选中的行，Enter 换成焦点所在的行', async () => {
    const outline = await mount(320, element => element.selection = ['phone'])
    const selected = echo(outline)
    const deleted = record(outline, 'node-delete')
    page.getByRole('button', { name: 'before' }).element().focus()
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement?.getAttribute('value')).toBe('phone')
    await userEvent.keyboard('{ArrowDown}{Control>} {/Control}')
    await frame()
    await userEvent.keyboard('{ArrowDown}{Control>} {/Control}')
    await frame()
    expect(selectedRows(outline)).toEqual(['phone', 'email', 'remark'])
    await userEvent.keyboard('{Delete}')
    expect(deleted).toEqual([{ ids: ['phone', 'email', 'remark'] }])
    await userEvent.keyboard('{ArrowUp}{Enter}')
    await frame()
    expect(selectedRows(outline)).toEqual(['email'])
    expect(selected).toEqual([['phone', 'email'], ['phone', 'email', 'remark'], ['email']])
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

  it('movable 为 false 的行真实鼠标按住拖不起来、行上不报可拖；别的行照样能拖进它里面', async () => {
    const outline = await mount(320, element => element.allowMove = () => true)
    const moved = record(outline, 'node-move')
    const column = row(outline, 'col-1')
    expect([column.hasAttribute('data-draggable'), row(outline, 'phone').hasAttribute('data-draggable')]).toEqual([false, true])
    const scale = await mouseScale()
    const at = (point: { x: number, y: number }) => ({ x: point.x / scale, y: point.y / scale })
    const from = center(column)
    const to = center(row(outline, 'remark'))
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(from) })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(from) })
    for (let i = 1; i <= 10; i++) {
      await frame()
      await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at({ x: from.x + ((to.x - from.x) * i) / 10, y: from.y + ((to.y - from.y) * i) / 10 }) })
    }
    expect(outline.querySelector('[data-dragging]')).toBeNull()
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(to) })
    expect(moved).toEqual([])
    await drag(center(row(outline, 'remark')), center(column))
    await until(() => moved.length > 0, '拖进第 1 列')
    expect(moved).toEqual([{ id: 'remark', parent: 'col-1', index: 2 }])
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

  it('展开的分支箭头朝下、收起的指向行尾：箭头只转一次', async () => {
    const outline = await mount()
    const grid = row(outline, 'grid')
    expect(arrowAngle(grid)).toBe(90)
    await userEvent.click(grid.querySelector('[data-scope="tree"][data-part="branch-trigger"]')!)
    await until(() => arrowAngle(grid) === 0, '箭头转回行尾')
  })
})

/** 分支箭头实际转了多少度：展开箭头与它里面各节点的旋转角加起来。 */
function arrowAngle(control: Element): number {
  const trigger = control.querySelector<HTMLElement>('[data-scope="tree"][data-part="branch-trigger"]')!
  return [trigger, ...trigger.querySelectorAll<HTMLElement>('*')].reduce((sum, element) => {
    const value = getComputedStyle(element).rotate
    return sum + (value === 'none' ? 0 : Number.parseFloat(value))
  }, 0)
}

/** 一帧。 */
function frame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

function center(element: Element): { x: number, y: number } {
  const box = element.getBoundingClientRect()
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 }
}

/** 真实鼠标的坐标换算：页面坐标除以它就是 CDP 要的坐标。 */
async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

/** 真实鼠标按住 from、分十步拖到 to 再松开，每步隔一帧。 */
async function drag(from: { x: number, y: number }, to: { x: number, y: number }): Promise<void> {
  const scale = await mouseScale()
  const at = (x: number, y: number) => ({ x: x / scale, y: y / scale })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(from.x, from.y) })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(from.x, from.y) })
  for (let i = 1; i <= 10; i++) {
    await frame()
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(from.x + ((to.x - from.x) * i) / 10, from.y + ((to.y - from.y) * i) / 10) })
  }
  await frame()
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(to.x, to.y) })
}
