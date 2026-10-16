// @vitest-environment jsdom

import type { DesignerPropertiesEventMap, DesignerPropertyEditor, DesignerPropertyTarget, XhDesignerPropertiesElement } from '../src'
import { setXhConfig } from '@xihan-ui/web-components'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineDesignerShell } from '../src'
import { designerShellZhCN } from '../src/locale'

defineDesignerShell()

// jsdom 不排版：多行文本框自动增高要读的计算样式与内容高度给出浏览器里的缺省值
const STYLE_FALLBACK: Readonly<Record<string, string>> = {
  'writing-mode': 'horizontal-tb',
  'box-sizing': 'border-box',
  'max-block-size': 'none',
  'padding-top': '0px',
  'padding-bottom': '0px',
  'border-top-width': '0px',
  'border-bottom-width': '0px',
  'font-size': '14px',
  'line-height': '20px',
}

beforeEach(() => {
  const real = window.getComputedStyle.bind(window)
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => new Proxy(real(element, pseudo), {
    get(target, key) {
      if (key === 'getPropertyValue')
        return (name: string) => target.getPropertyValue(name) || STYLE_FALLBACK[name] || ''
      const value = Reflect.get(target, key) as unknown
      return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(target) : value
    },
  }))
  vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockReturnValue(20)
})

afterEach(() => {
  document.body.innerHTML = ''
  setXhConfig({})
  vi.restoreAllMocks()
})

const task: DesignerPropertyTarget = {
  kind: 'task',
  id: 't1',
  value: { label: '审批', data: { retries: 2, mode: 'any', urgent: false } },
  descriptors: [
    { path: ['label'], control: { kind: 'text' }, group: 'basic', label: '名称', required: true },
    { path: ['data', 'retries'], control: { kind: 'number', integer: true, min: 0, max: 9, unit: 'count' }, group: 'run', label: '重试' },
    { path: ['data', 'mode'], control: { kind: 'select', options: [{ value: 'any', label: '任一' }, { value: 'all', label: '全部' }] }, group: 'run', label: '规则' },
    { path: ['data', 'urgent'], control: { kind: 'boolean' }, group: 'basic', label: '加急' },
    { path: ['data', 'note'], control: { kind: 'text', multiline: true }, label: '备注', visibleWhen: { path: ['data', 'urgent'], equals: true } },
    { path: ['data', 'who'], control: { kind: 'assignees' }, label: '受理人' },
  ],
}

async function mount(setup: (panel: XhDesignerPropertiesElement) => void = () => {}): Promise<XhDesignerPropertiesElement> {
  const panel = document.createElement('xh-designer-properties')
  setup(panel)
  document.body.append(panel)
  await panel.updateComplete
  return panel
}

function row(panel: Element, path: string): HTMLElement {
  return panel.querySelector<HTMLElement>(`[data-part="property"][data-path="${path}"]`)!
}

function emit(target: Element, type: string, detail: unknown): void {
  target.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))
}

function record<K extends keyof DesignerPropertiesEventMap>(panel: Element, type: K): DesignerPropertiesEventMap[K]['detail'][] {
  const seen: DesignerPropertiesEventMap[K]['detail'][] = []
  panel.addEventListener(type, event => seen.push((event as DesignerPropertiesEventMap[K]).detail))
  return seen
}

describe('<xh-designer-properties>', () => {
  it('没有对象时显示空状态，标题与副标题取文案与 heading', async () => {
    const panel = await mount(element => element.heading = '任务 · t1')
    expect(panel.querySelector('[data-part="title"]')!.textContent).toBe('Properties')
    expect(panel.querySelector<HTMLElement>('[data-part="heading"]')!.hidden).toBe(false)
    expect(panel.querySelector('[data-part="empty"]')!.textContent).toBe('No properties to edit')
    panel.emptyText = '选中一个元素'
    setXhConfig(designerShellZhCN)
    await panel.updateComplete
    expect(panel.querySelector('[data-part="title"]')!.textContent).toBe('属性')
    expect(panel.querySelector('[data-part="empty"]')!.textContent).toBe('选中一个元素')
  })

  it('按分组列出显示中的属性，字段包在 xh-field 里，标签、说明、必填与错误接上', async () => {
    const panel = await mount((element) => {
      element.targets = [task]
      element.groupOrder = ['run']
      element.groupLabel = group => ({ run: '执行', basic: '基本' })[group] ?? group
      element.hintOf = descriptor => descriptor.path.at(-1) === 'retries' ? '最多 9 次' : undefined
      element.errors = [{ target: { kind: 'task', id: 't1' }, path: ['label'], message: '必填' }]
    })
    const groups = Array.from(panel.querySelectorAll('[data-part="group"]'), group => [
      group.querySelector('[data-part="group-label"]')?.textContent ?? '',
      ...Array.from(group.querySelectorAll<HTMLElement>('[data-part="property"]'), item => item.dataset.path),
    ])
    expect(groups).toEqual([['执行', 'data.retries', 'data.mode'], ['基本', 'label', 'data.urgent'], ['', 'data.who']])
    const label = row(panel, 'label')
    const field = label.querySelector('xh-field')!
    expect(field.querySelector('[data-xh-part="label"]')!.textContent).toBe('名称')
    expect(field.querySelector('xh-text-field')!.getAttribute('data-xh-part')).toBe('control')
    expect([field.hasAttribute('required'), field.hasAttribute('invalid')]).toEqual([true, true])
    expect(field.querySelector('[data-xh-part="error-text"]')!.textContent).toBe('必填')
    expect(row(panel, 'data.retries').querySelector('[data-xh-part="description"]')!.textContent).toBe('最多 9 次')
    expect(row(panel, 'data.who').querySelector('[data-control="unsupported"]')!.textContent).toBe('assignees')
  })

  it('输入派发 property-change（带合并键与对象），失焦派发 property-commit', async () => {
    const panel = await mount(element => element.targets = [task])
    const changes = record(panel, 'property-change')
    const commits = record(panel, 'property-commit')
    const field = row(panel, 'label').querySelector('xh-text-field')!
    emit(field, 'value-change', { value: '审批人' })
    emit(field, 'value-change', { value: '' })
    field.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    expect(changes).toEqual([
      { path: ['label'], value: '审批人', targets: [{ kind: 'task', id: 't1' }], merge: 'property:label:task/t1' },
      { path: ['label'], value: undefined, targets: [{ kind: 'task', id: 't1' }], merge: 'property:label:task/t1' },
    ])
    expect(commits).toEqual([{ path: ['label'] }])
  })

  it('换了对象只换数据时字段元素原样复用，焦点不丢；显示条件随值重算', async () => {
    const panel = await mount(element => element.targets = [task])
    const input = row(panel, 'label').querySelector('input')!
    input.focus()
    panel.targets = [{ ...task, value: { label: '审批 2', data: { urgent: true } } }]
    await panel.updateComplete
    expect(row(panel, 'label').querySelector('input')).toBe(input)
    expect(document.activeElement).toBe(input)
    expect((row(panel, 'label').querySelector('xh-text-field') as HTMLElement & { value?: string }).value).toBe('审批 2')
    expect(row(panel, 'data.note')).not.toBeNull()
  })

  it('多选只显示共同属性，取值不同时显示占位「多个值」，写入对每个对象各一份', async () => {
    const other: DesignerPropertyTarget = {
      kind: 'task',
      id: 't2',
      value: { label: '复核', data: { retries: 2 } },
      descriptors: task.descriptors.filter(descriptor => descriptor.path.at(-1) !== 'mode'),
    }
    const panel = await mount(element => element.targets = [task, other])
    expect(Array.from(panel.querySelectorAll<HTMLElement>('[data-part="property"]'), item => item.dataset.path)).toEqual(['label', 'data.urgent', 'data.retries', 'data.who'])
    const label = row(panel, 'label').querySelector('xh-text-field') as HTMLElement & { value?: string }
    expect([label.value, label.getAttribute('placeholder')]).toEqual(['', 'Multiple values'])
    expect((row(panel, 'data.retries').querySelector('xh-number-field') as HTMLElement & { value?: string }).value).toBe('2')
    const changes = record(panel, 'property-change')
    emit(label, 'value-change', { value: '同名' })
    expect(changes[0]!.targets).toEqual([{ kind: 'task', id: 't1' }, { kind: 'task', id: 't2' }])
  })

  it('数字接上下限、步长与单位，选择按选项文案显示，选项少时可改用切换按钮组', async () => {
    const panel = await mount((element) => {
      element.targets = [task]
      element.unitLabel = unit => unit === 'count' ? '次' : unit
      element.optionLabel = (_, option) => `规则：${option.label}`
    })
    const number = row(panel, 'data.retries').querySelector('xh-number-field')!
    expect(['min', 'max', 'step'].map(name => number.getAttribute(name))).toEqual(['0', '9', '1'])
    expect(number.querySelector('[data-xh-part="suffix"]')!.textContent).toBe('次')
    expect(row(panel, 'data.mode').querySelector('[data-xh-part="item-text"]')!.textContent).toBe('规则：任一')

    panel.toggleLimit = 4
    panel.targets = [{ ...task }]
    await panel.updateComplete
    const toggle = row(panel, 'data.mode').querySelector('xh-toggle-group')!
    expect(Array.from(toggle.querySelectorAll('[data-xh-part="item"]'), item => item.textContent)).toEqual(['规则：任一', '规则：全部'])
    const changes = record(panel, 'property-change')
    emit(toggle, 'value-change', { value: '1' })
    expect(changes[0]!.value).toBe('all')
  })

  it('分组可折叠，折叠状态按分组 id 保留，换对象不重置', async () => {
    const panel = await mount((element) => {
      element.collapsible = true
      element.targets = [task]
    })
    const accordion = panel.querySelector('xh-accordion') as HTMLElement & { value?: string[] }
    expect(Array.from(accordion.querySelectorAll(':scope > [data-xh-part="root"] > [data-xh-part="item"]'), item => item.getAttribute('value'))).toEqual(['basic', 'run'])
    expect(accordion.value).toEqual(['basic', 'run'])
    emit(accordion, 'value-change', { value: ['basic'] })
    panel.targets = [{ ...task, id: 't9' }]
    await panel.updateComplete
    expect(accordion.value).toEqual(['basic'])
  })

  it('页头与页尾插槽搬进对应区域', async () => {
    const panel = document.createElement('xh-designer-properties')
    const nav = document.createElement('nav')
    nav.slot = 'header'
    const action = document.createElement('button')
    action.slot = 'footer'
    panel.append(nav, action)
    document.body.append(panel)
    await panel.updateComplete
    expect(nav.parentElement!.dataset.part).toBe('header-slot')
    expect(action.parentElement!.dataset.part).toBe('footer-slot')
  })

  it('宿主编辑器拿到全部对象，setValue 与 commit 走同一对事件', async () => {
    const contexts: Parameters<DesignerPropertyEditor>[0][] = []
    const editor: DesignerPropertyEditor = (context) => {
      contexts.push(context)
      return { element: document.createElement('div'), update: next => contexts.push(next) }
    }
    const panel = await mount((element) => {
      element.editors = { byControl: { assignees: editor } }
      element.targets = [task]
    })
    expect(row(panel, 'data.who').querySelector('[data-control="custom"]')).not.toBeNull()
    const changes = record(panel, 'property-change')
    const commits = record(panel, 'property-commit')
    contexts[0]!.setValue(['u1'])
    contexts[0]!.commit()
    expect([changes[0]!.value, commits[0]!.path]).toEqual([['u1'], ['data', 'who']])
    expect(contexts[0]!.target).toEqual([task])
  })

  it('不合法的 JSON 就地报错、不派发', async () => {
    const panel = await mount(element => element.targets = [{ ...task, descriptors: [{ path: ['data', 'extra'], control: { kind: 'json' } }] }])
    const changes = record(panel, 'property-change')
    const json = row(panel, 'data.extra')
    emit(json.querySelector('xh-text-field')!, 'value-change', { value: '{"a":' })
    expect(json.querySelector('xh-field')!.hasAttribute('invalid')).toBe(true)
    expect(json.querySelector('[data-xh-part="error-text"]')!.textContent).toBe('Not valid JSON')
    expect(changes).toHaveLength(0)
    emit(json.querySelector('xh-text-field')!, 'value-change', { value: '{"a":1}' })
    expect(changes[0]!.value).toEqual({ a: 1 })
    expect(json.querySelector('xh-field')!.hasAttribute('invalid')).toBe(false)
  })

  it('只读时字段只读、不派发；focusField 把焦点交给字段', async () => {
    const panel = await mount((element) => {
      element.readonly = true
      element.targets = [task]
    })
    const changes = record(panel, 'property-change')
    const field = row(panel, 'label').querySelector('xh-field')!
    expect(field.hasAttribute('read-only')).toBe(true)
    emit(field.querySelector('xh-text-field')!, 'value-change', { value: 'x' })
    expect(changes).toHaveLength(0)
    expect(panel.focusField(['data', 'retries'])).toBe(true)
    expect(document.activeElement).toBe(row(panel, 'data.retries').querySelector('input'))
    expect(panel.focusField(['missing'])).toBe(false)
  })
})
