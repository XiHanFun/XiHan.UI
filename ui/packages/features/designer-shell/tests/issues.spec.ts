// @vitest-environment jsdom

import type { DesignerIssueItem, DesignerIssuesEventMap, XhDesignerIssuesElement } from '../src'
import { setXhConfig } from '@xihan-ui/web-components'
import { afterEach, describe, expect, it } from 'vitest'
import { defineDesignerShell } from '../src'
import { designerShellZhCN } from '../src/locale'

defineDesignerShell()

afterEach(() => {
  document.body.innerHTML = ''
  setXhConfig({})
})

const items: DesignerIssueItem[] = [
  { issue: { code: 'node.unreachable', path: ['nodes', 1], target: { kind: 'node', id: 'n2' }, severity: 'warning' }, message: '无法从开始节点到达', subject: '审批' },
  { issue: { code: 'required', path: ['nodes', 0, 'label'], target: { kind: 'node', id: 'n1' } }, message: '名称必填', subject: '开始', source: '校验' },
  { issue: { code: 'graph.no-end', path: [] }, message: '缺少结束节点' },
  { issue: { code: 'edge.dangling', path: ['edges', 0], target: { kind: 'edge', id: 'e1' } }, message: '连线没有终点' },
]

async function mount(setup: (list: XhDesignerIssuesElement) => void = () => {}): Promise<XhDesignerIssuesElement> {
  const list = document.createElement('xh-designer-issues')
  setup(list)
  document.body.append(list)
  await list.updateComplete
  return list
}

function rows(list: Element): HTMLElement[] {
  return Array.from(list.querySelectorAll<HTMLElement>('[data-part="issue"]'))
}

function filterItem(list: Element, severity: 'error' | 'warning'): HTMLButtonElement {
  return list.querySelector<HTMLButtonElement>(`[data-part="filter"] button[value="${severity}"]`)!
}

function record<K extends keyof DesignerIssuesEventMap>(list: Element, type: K): DesignerIssuesEventMap[K]['detail'][] {
  const seen: DesignerIssuesEventMap[K]['detail'][] = []
  list.addEventListener(type, event => seen.push((event as DesignerIssuesEventMap[K]).detail))
  return seen
}

function key(target: Element, name: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }))
}

describe('<xh-designer-issues>', () => {
  it('没有问题时显示空状态，标题与空提示取文案', async () => {
    setXhConfig(designerShellZhCN)
    const list = await mount()
    expect(Array.from(list.children, child => [child.getAttribute('data-part'), child.hasAttribute('data-xh-gen')])).toEqual([['header', true], ['list', true], ['empty', true]])
    expect(list.querySelector('[data-part="title"]')!.textContent).toBe('问题')
    const empty = list.querySelector<HTMLElement>('[data-part="empty"]')!
    expect(empty.hidden).toBe(false)
    expect(empty.textContent).toBe('没有问题')
    expect(list.querySelector('[data-part="list"]')!.getAttribute('aria-labelledby')).toBe(list.querySelector('[data-part="title"]')!.id)
    list.emptyText = '流程没有问题'
    await list.updateComplete
    expect(empty.textContent).toBe('流程没有问题')
  })

  it('缺省按严重程度排列，错误在前；group-by="none" 按传入顺序', async () => {
    const list = await mount((element) => {
      element.items = items
    })
    expect(rows(list).map(row => row.dataset.index)).toEqual(['1', '2', '3', '0'])
    expect(rows(list).map(row => row.dataset.severity)).toEqual(['error', 'error', 'error', 'warning'])
    list.setAttribute('group-by', 'none')
    await list.updateComplete
    expect(rows(list).map(row => row.dataset.index)).toEqual(['0', '1', '2', '3'])
  })

  it('group-by="target" 按对象分组：组标题取 subject，组内错误在前，没有对象的归最后一组', async () => {
    setXhConfig(designerShellZhCN)
    const more: DesignerIssueItem[] = [...items, { issue: { code: 'required', path: ['nodes', 1, 'label'], target: { kind: 'node', id: 'n2' } }, message: '名称必填' }]
    const list = await mount((element) => {
      element.groupBy = 'target'
      element.items = more
    })
    const groups = (): string[][] => Array.from(list.querySelectorAll('[data-part="list"] > [data-part="group"]'), group => [
      group.querySelector('[data-part="group-label"]')!.textContent!,
      ...Array.from(group.querySelectorAll<HTMLElement>('[data-part="issue"]'), item => item.dataset.index!),
    ])
    expect(groups()).toEqual([['审批', '4', '0'], ['开始', '1'], ['e1', '3'], ['整体', '2']])
    const group = list.querySelector('[data-part="group"]')!
    expect(group.querySelector('[data-part="group-items"]')!.getAttribute('aria-labelledby')).toBe(group.querySelector('[data-part="group-label"]')!.id)
    expect(list.querySelector('[data-part="issue-subject"]')).toBeNull()

    const buttons = list.querySelectorAll<HTMLButtonElement>('button[data-part="issue"]')
    buttons[0]!.focus()
    key(buttons[1]!, 'ArrowDown')
    expect(document.activeElement).toBe(buttons[2])

    filterItem(list, 'error').click()
    await list.updateComplete
    expect(groups()).toEqual([['审批', '0']])
  })

  it('条目显示严重程度、对象名、说明与来源标签；过滤开关带计数', async () => {
    setXhConfig(designerShellZhCN)
    const list = await mount((element) => {
      element.items = items
    })
    const first = rows(list)[0]!
    expect(first.querySelector('[data-part="issue-severity"]')!.textContent).toBe('错误')
    expect(first.querySelector('[data-part="issue-subject"]')!.textContent).toBe('开始')
    expect(first.querySelector('[data-part="issue-message"]')!.textContent).toBe('名称必填')
    expect(first.querySelector('xh-tag[data-part="issue-source"]')!.textContent).toBe('校验')
    expect(rows(list)[1]!.querySelector('[data-part="issue-subject"]')).toBeNull()
    expect(filterItem(list, 'error').textContent).toBe('3 个错误')
    expect(filterItem(list, 'warning').textContent).toBe('1 个警告')
    expect(list.querySelector('[data-part="filter"] [data-xh-part="root"]')!.getAttribute('aria-label')).toBe('按严重程度显示问题')
  })

  it('过滤开关按严重程度隐藏条目，换了 items 仍保留过滤状态', async () => {
    const list = await mount((element) => {
      element.items = items
    })
    expect(filterItem(list, 'error').getAttribute('aria-pressed')).toBe('true')
    const changes: unknown[] = []
    document.body.addEventListener('value-change', event => changes.push(event))
    filterItem(list, 'error').click()
    await list.updateComplete
    expect(changes).toEqual([])
    expect(filterItem(list, 'error').getAttribute('aria-pressed')).toBe('false')
    expect(rows(list).map(row => row.dataset.index)).toEqual(['0'])
    list.items = [...items]
    await list.updateComplete
    expect(rows(list).map(row => row.dataset.index)).toEqual(['0'])
    filterItem(list, 'warning').click()
    await list.updateComplete
    expect(rows(list)).toEqual([])
    expect(list.querySelector<HTMLElement>('[data-part="empty"]')!.hidden).toBe(false)
  })

  it('有 target 的条目是原生按钮，点击派发 issue-activate；没有 target 的不可激活', async () => {
    const list = await mount((element) => {
      element.items = items
    })
    const activated = record(list, 'issue-activate')
    const [first, noTarget] = rows(list)
    expect(first!.tagName).toBe('BUTTON')
    expect(noTarget!.tagName).toBe('DIV')
    expect(noTarget!.hasAttribute('tabindex')).toBe(false)
    first!.click()
    noTarget!.click()
    expect(activated).toEqual([{ issue: items[1]!.issue, index: 1 }])
  })

  it('方向键、Home、End 在可激活的条目间移动焦点，Tab 位跟着走', async () => {
    const list = await mount((element) => {
      element.items = items
    })
    const buttons = rows(list).filter(row => row.tagName === 'BUTTON')
    expect(buttons.map(button => button.tabIndex)).toEqual([0, -1, -1])
    buttons[0]!.focus()
    key(buttons[0]!, 'ArrowDown')
    expect(document.activeElement).toBe(buttons[1])
    expect(buttons.map(button => button.tabIndex)).toEqual([-1, 0, -1])
    key(buttons[1]!, 'End')
    expect(document.activeElement).toBe(buttons[2])
    key(buttons[2]!, 'ArrowDown')
    expect(document.activeElement).toBe(buttons[2])
    key(buttons[2]!, 'Home')
    expect(document.activeElement).toBe(buttons[0])
    key(buttons[0]!, 'ArrowUp')
    expect(document.activeElement).toBe(buttons[0])
  })

  it('换了 items 后焦点回到原来那一条', async () => {
    const list = await mount((element) => {
      element.items = items
    })
    const target = rows(list).find(row => row.dataset.index === '3')!
    target.focus()
    list.items = [...items]
    await list.updateComplete
    const again = rows(list).find(row => row.dataset.index === '3')!
    expect(again).not.toBe(target)
    expect(document.activeElement).toBe(again)
    expect(again.tabIndex).toBe(0)
  })

  it('悬停派发 issue-hover，移出列表派发 undefined', async () => {
    const list = await mount((element) => {
      element.items = items
    })
    const hovered = record(list, 'issue-hover')
    const [first, noTarget] = rows(list)
    first!.querySelector('[data-part="issue-message"]')!.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    first!.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    noTarget!.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    list.querySelector('[data-part="list"]')!.dispatchEvent(new MouseEvent('mouseleave'))
    expect(hovered).toEqual([{ issue: items[1]!.issue }, { issue: items[2]!.issue }, { issue: undefined }])
  })

  it('元素自己的 translations 压在全局文案之上', async () => {
    setXhConfig(designerShellZhCN)
    const list = await mount((element) => {
      element.items = items
      element.translations = { title: '检查结果', errors: count => `错误 ${count}` }
    })
    expect(list.querySelector('[data-part="title"]')!.textContent).toBe('检查结果')
    expect(filterItem(list, 'error').textContent).toBe('错误 3')
    expect(filterItem(list, 'warning').textContent).toBe('1 个警告')
  })
})
