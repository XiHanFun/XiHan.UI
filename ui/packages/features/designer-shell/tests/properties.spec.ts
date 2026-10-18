// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { JsonValue } from '@xihan-ui/core/json'
import type { DataField } from '@xihan-ui/designer-kit'
import type { DesignerPropertiesEventMap, DesignerPropertyEditor, DesignerPropertyTarget, XhDesignerPropertiesElement } from '../src'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
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

/** 收集这一段里的 wc.* 诊断：部件契约不全的库内元素会在这里报出来。 */
function recordWcDiagnostics(): { readonly codes: () => string[], readonly stop: () => void } {
  const seen: DiagnosticRecord[] = []
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsLevel('warn')
  setDiagnosticsDedupe(false)
  const off = onDiagnostic(record => void seen.push(record))
  return {
    codes: () => seen.filter(record => record.code.startsWith('wc.')).map(record => `${record.code} ${record.scope ?? ''}/${record.part ?? ''}`),
    stop: () => {
      off()
      resetDiagnostics()
    },
  }
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
    expect(Array.from(panel.children, child => [child.getAttribute('data-part'), child.hasAttribute('data-xh-gen')])).toEqual([['header', true], ['body', true]])
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

  it('select 的 appearance 压过 toggle-limit：dropdown 总是下拉，toggle 总是切换按钮组，多选的切换按钮组写入数组', async () => {
    const options = (...values: string[]) => values.map(value => ({ value }))
    const panel = await mount((element) => {
      element.toggleLimit = 4
      element.targets = [{
        kind: 'field',
        id: 'f1',
        value: { bind: 'a', mode: 'b', size: 'c', tags: ['a', 'c'] },
        descriptors: [
          { path: ['bind'], control: { kind: 'select', options: options('a', 'b'), appearance: 'dropdown' } },
          { path: ['mode'], control: { kind: 'select', options: options('a', 'b') } },
          { path: ['size'], control: { kind: 'select', options: options('a', 'b', 'c', 'd', 'e', 'f'), appearance: 'toggle' } },
          { path: ['tags'], control: { kind: 'select', options: options('a', 'b', 'c'), multiple: true, appearance: 'toggle' } },
        ],
      }]
    })
    const control = (path: string) => row(panel, path).querySelector<HTMLElement & { value?: unknown }>('[data-xh-part="control"]')!
    expect(['bind', 'mode', 'size', 'tags'].map(path => control(path).localName)).toEqual(['xh-select', 'xh-toggle-group', 'xh-toggle-group', 'xh-toggle-group'])
    expect([control('size').value, control('size').hasAttribute('multiple')]).toEqual(['2', false])
    expect([control('tags').value, control('tags').hasAttribute('multiple')]).toEqual([['0', '2'], true])

    const changes = record(panel, 'property-change')
    emit(control('tags'), 'value-change', { value: ['0', '1'] })
    emit(control('tags'), 'value-change', { value: [] })
    emit(control('size'), 'value-change', { value: '5' })
    expect(changes.map(change => [change.path[0], change.value])).toEqual([['tags', ['a', 'b']], ['tags', undefined], ['size', 'f']])
  })

  it('分组可折叠，正文是组而非地标，折叠状态按分组 id 保留，换对象不重置', async () => {
    const panel = await mount((element) => {
      element.collapsible = true
      element.targets = [task]
    })
    const accordion = panel.querySelector('xh-accordion') as HTMLElement & { value?: string[] }
    expect(Array.from(accordion.querySelectorAll(':scope > [data-xh-part="root"] > [data-xh-part="item"]'), item => item.getAttribute('value'))).toEqual(['basic', 'run'])
    expect(accordion.value).toEqual(['basic', 'run'])
    // 分组正文是以分组标题命名的组，不当地标
    const contents = Array.from(accordion.querySelectorAll('[data-scope="accordion"][data-part="content"]'))
    expect(contents.map(content => content.getAttribute('role'))).toEqual(['group', 'group'])
    expect(accordion.querySelector('[role="region"]')).toBeNull()
    emit(accordion, 'value-change', { value: ['basic'] })
    panel.targets = [{ ...task, id: 't9' }]
    await panel.updateComplete
    expect(accordion.value).toEqual(['basic'])
  })

  it('collapsible 时没有带 id 的分组就平铺、不建手风琴；有了再建，没有 wc.* 诊断', async () => {
    const diagnostics = recordWcDiagnostics()
    const ungrouped: DesignerPropertyTarget = { ...task, descriptors: task.descriptors.map(({ group: _, ...descriptor }) => descriptor) }
    const panel = await mount((element) => {
      element.collapsible = true
      element.targets = [ungrouped]
    })
    expect(panel.querySelector('xh-accordion')).toBeNull()
    expect(row(panel, 'label')).not.toBeNull()
    panel.targets = [task]
    await panel.updateComplete
    expect(panel.querySelector('xh-accordion')).not.toBeNull()
    panel.targets = [ungrouped]
    await panel.updateComplete
    expect(panel.querySelector('xh-accordion')).toBeNull()
    await new Promise(resolve => setTimeout(resolve))
    expect(diagnostics.codes()).toEqual([])
    diagnostics.stop()
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

  it('换了选中对象时同一行照样复用，宿主编辑器的 update 收到的 target 是新选中的对象', async () => {
    const created: Parameters<DesignerPropertyEditor>[0][] = []
    const updated: Parameters<DesignerPropertyEditor>[0][] = []
    const editor: DesignerPropertyEditor = (context) => {
      created.push(context)
      return { element: document.createElement('div'), update: next => updated.push(next) }
    }
    const other: DesignerPropertyTarget = { ...task, id: 'task-2', value: { data: { who: ['u9'] } } }
    const panel = await mount((element) => {
      element.editors = { byControl: { assignees: editor } }
      element.targets = [task]
    })
    panel.targets = [other]
    await panel.updateComplete
    expect(created).toHaveLength(1)
    expect(updated.at(-1)!.target).toEqual([other])
    expect(updated.at(-1)!.value).toEqual(['u9'])
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

  it('数字违反整数、开区间下限或上下限时就地报错、不派发，改回合法值后清掉错误', async () => {
    const panel = await mount((element) => {
      element.unitLabel = unit => unit === 'px' ? '像素' : ''
      element.targets = [{
        ...task,
        value: { data: { retries: 2, width: 120 } },
        descriptors: [
          task.descriptors[1]!,
          { path: ['data', 'width'], control: { kind: 'number', exclusiveMin: 0, unit: 'px' } },
        ],
      }]
    })
    const changes = record(panel, 'property-change')
    const error = (path: string): string | undefined => {
      const field = row(panel, path).querySelector('xh-field')!
      return field.hasAttribute('invalid') ? field.querySelector('[data-xh-part="error-text"]')!.textContent! : undefined
    }
    const input = (path: string, value: string): void => emit(row(panel, path).querySelector('xh-number-field')!, 'value-change', { value, valueAsNumber: Number(value) })

    input('data.retries', '1.5')
    expect(error('data.retries')).toBe('Must be a whole number')
    input('data.retries', '12')
    expect(error('data.retries')).toBe('Must be at most 9')
    input('data.width', '0')
    expect(error('data.width')).toBe('Must be greater than 0 像素')
    expect(changes).toHaveLength(0)

    setXhConfig(designerShellZhCN)
    await panel.updateComplete
    input('data.retries', '-1')
    expect(error('data.retries')).toBe('不能小于 0')
    expect((row(panel, 'data.retries').querySelector('xh-number-field') as HTMLElement & { value?: string }).value).toBe('-1')

    input('data.retries', '3')
    input('data.width', '0.5')
    expect(changes.map(change => [change.path.at(-1), change.value])).toEqual([['retries', 3], ['width', 0.5]])
    expect([error('data.retries'), error('data.width')]).toEqual([undefined, undefined])
  })

  it('单位文案为空串时不渲染后缀部件，有文案时再放回', async () => {
    const panel = await mount((element) => {
      element.unitLabel = () => ''
      element.targets = [task]
    })
    const number = row(panel, 'data.retries').querySelector('xh-number-field')!
    expect(number.querySelector('[data-xh-part="suffix"]')).toBeNull()
    panel.unitLabel = () => '次'
    await panel.updateComplete
    expect(Array.from(number.querySelectorAll(':scope > [data-xh-part="root"] > [data-xh-part="control"] > *'), part => part.getAttribute('data-xh-part'))).toEqual(['decrement-trigger', 'input', 'suffix', 'increment-trigger'])
    expect(number.querySelector('[data-xh-part="suffix"]')!.textContent).toBe('次')
  })

  it('dataField 给了字段树时是树选择：按 kinds 与 base 列字段，不能选的对象是禁用的分支且起初展开，选中写入路径文字', async () => {
    const diagnostics = recordWcDiagnostics()
    const fields: DataField[] = [
      { name: 'order', kind: 'object', label: '订单', children: [
        { name: 'no', kind: 'value', label: '单号' },
        { name: 'items', kind: 'list', label: '明细', children: [{ name: 'sku', kind: 'value' }] },
        { name: 'buyer', kind: 'object', children: [{ name: 'name', kind: 'value', label: '姓名' }] },
      ] },
      { name: 'title', kind: 'value' },
    ]
    const panel = await mount((element) => {
      element.dataFields = fields
      element.targets = [{
        kind: 'table',
        id: 'tb',
        value: { data: 'order.items', cell: '' },
        descriptors: [
          { path: ['data'], control: { kind: 'dataField', kinds: ['list'] }, label: '数据' },
          { path: ['cell'], control: { kind: 'dataField', kinds: ['value'], base: ['order'] }, label: '单元格' },
        ],
      }]
    })
    type TreeSelect = HTMLElement & { collection?: unknown, value?: unknown, expandedValue?: unknown }
    const data = row(panel, 'data').querySelector<TreeSelect>('xh-field > [data-xh-part="root"] > xh-tree-select')!
    const cell = row(panel, 'cell').querySelector<TreeSelect>('xh-tree-select')!
    expect(data.getAttribute('data-xh-part')).toBe('control')
    expect(data.collection).toEqual([{ value: 'order', label: '订单', description: 'order', disabled: true, children: [{ value: 'order.items', label: '明细', description: 'order.items' }] }])
    expect([data.expandedValue, data.value]).toEqual([['order'], ['order.items']])
    expect(cell.collection).toEqual([
      { value: 'no', label: '单号', description: 'no' },
      { value: 'buyer', label: 'buyer', disabled: true, children: [{ value: 'buyer.name', label: '姓名', description: 'buyer.name' }] },
    ])
    expect([cell.expandedValue, cell.value]).toEqual([['buyer'], []])

    const changes = record(panel, 'property-change')
    const commits = record(panel, 'property-commit')
    emit(cell, 'value-change', { value: ['buyer.name'] })
    emit(cell, 'value-change', { value: [] })
    emit(cell, 'expanded-value-change', { value: [] })
    expect(changes.map(change => [change.path[0], change.value])).toEqual([['cell', 'buyer.name'], ['cell', undefined]])
    expect(commits).toHaveLength(2)

    panel.dataFields = [...fields]
    await panel.updateComplete
    expect(cell.expandedValue).toEqual([])
    await new Promise(resolve => setTimeout(resolve))
    expect(diagnostics.codes()).toEqual([])
    diagnostics.stop()
  })

  it('dataField 的字段树：描述里写了 fields 就用它，没写时用面板的 dataFields', async () => {
    type TreeSelect = HTMLElement & { collection?: { value: string }[] }
    const own: DataField[] = [{ name: 'dataset', kind: 'value' }]
    const panel = await mount(element => element.targets = [{
      kind: 'card',
      id: 'c',
      value: {},
      descriptors: [
        { path: ['own'], control: { kind: 'dataField', fields: own } },
        { path: ['shared'], control: { kind: 'dataField' } },
      ],
    }])
    const values = (path: string): string[] | undefined => row(panel, path).querySelector<TreeSelect>('xh-tree-select')?.collection?.map(item => item.value)
    expect([values('own'), row(panel, 'shared').querySelector('xh-text-field') !== null]).toEqual([['dataset'], true])
    panel.dataFields = [{ name: 'order', kind: 'value' }]
    await panel.updateComplete
    expect([values('own'), values('shared')]).toEqual([['dataset'], ['order']])
  })

  it('dataField 没有字段树时是输入路径的文本框：写法不对就地报错、不派发', async () => {
    const panel = await mount(element => element.targets = [{ kind: 'text', id: 'x', value: { field: 'a.b' }, descriptors: [{ path: ['field'], control: { kind: 'dataField' } }] }])
    const field = row(panel, 'field').querySelector<HTMLElement & { value?: string }>('xh-text-field')!
    expect(field.value).toBe('a.b')
    const changes = record(panel, 'property-change')
    emit(field, 'value-change', { value: 'a..b' })
    expect(row(panel, 'field').querySelector('[data-xh-part="error-text"]')!.textContent).toBe('Not a valid field path')
    expect(changes).toHaveLength(0)
    emit(field, 'value-change', { value: ' order.no ' })
    emit(field, 'value-change', { value: '' })
    expect(changes.map(change => change.value)).toEqual(['order.no', undefined])
    expect(row(panel, 'field').querySelector('xh-field')!.hasAttribute('invalid')).toBe(false)

    panel.dataFields = [{ name: 'order', kind: 'value' }]
    await panel.updateComplete
    expect(row(panel, 'field').querySelector('xh-tree-select')).not.toBeNull()
  })

  it('sides 是一组控件：四边相同时一个数字框，关掉开关换成上右下左四个，有边空着或违反约束就地报错、不派发', async () => {
    const margin = (value: JsonValue): DesignerPropertyTarget => ({
      kind: 'page',
      id: 'p1',
      value: { margin: value },
      descriptors: [{ path: ['margin'], control: { kind: 'sides', min: 0, unit: 'mm' }, label: '页边距' }],
    })
    const panel = await mount((element) => {
      element.unitLabel = unit => unit === 'mm' ? '毫米' : unit
      element.targets = [margin({ top: 5, right: 5, bottom: 5, left: 5 })]
    })
    const group = row(panel, 'margin')
    expect([group.getAttribute('role'), group.querySelector('xh-field')]).toEqual(['group', null])
    expect(panel.querySelector(`#${group.getAttribute('aria-labelledby')}`)!.textContent).toBe('页边距')
    const toggle = group.querySelector<HTMLElement & { checked?: boolean }>('xh-switch')!
    const boxes = (): (HTMLElement & { value?: string })[] => Array.from(group.querySelectorAll('xh-number-field'))
    const shown = (): unknown[] => boxes().map(box => [box.value, box.getAttribute('aria-label') ?? box.querySelector('[data-xh-part="label"]')?.textContent])
    expect([toggle.checked, toggle.querySelector('[data-xh-part="text"]')!.textContent]).toEqual([true, 'Same on all sides'])
    expect(shown()).toEqual([['5', 'All sides']])
    expect(boxes()[0]!.querySelector('[data-xh-part="suffix"]')!.textContent).toBe('毫米')

    const changes = record(panel, 'property-change')
    const commits = record(panel, 'property-commit')
    emit(boxes()[0]!, 'value-change', { value: '8', valueAsNumber: 8 })
    expect(changes.at(-1)!.value).toEqual({ top: 8, right: 8, bottom: 8, left: 8 })

    emit(toggle, 'checked-change', { checked: false })
    expect(toggle.checked).toBe(false)
    expect(shown()).toEqual([['5', 'Top'], ['5', 'Right'], ['5', 'Bottom'], ['5', 'Left']])
    const error = (): string | undefined => group.hasAttribute('data-invalid') ? group.querySelector('[data-part="property-error"]')!.textContent! : undefined
    emit(boxes()[1]!, 'value-change', { value: '' })
    expect([error(), boxes()[1]!.hasAttribute('invalid')]).toEqual(['Fill in all four sides', true])
    emit(boxes()[1]!, 'value-change', { value: '-1' })
    expect(error()).toBe('Must be at least 0 毫米')
    const before = changes.length
    emit(boxes()[1]!, 'value-change', { value: '3' })
    expect(changes.slice(before).map(change => change.value)).toEqual([{ top: 5, right: 3, bottom: 5, left: 5 }])
    expect([error(), boxes()[1]!.hasAttribute('invalid')]).toEqual([undefined, false])

    // 自己写入的值回到面板时不改开关
    panel.targets = [margin({ top: 5, right: 3, bottom: 5, left: 5 })]
    await panel.updateComplete
    expect(boxes()).toHaveLength(4)
    emit(toggle, 'checked-change', { checked: true })
    expect(changes.at(-1)!.value).toEqual({ top: 5, right: 5, bottom: 5, left: 5 })
    expect(shown()).toEqual([['5', 'All sides']])
    expect(commits.length).toBeGreaterThan(0)

    // 换成四边不同的对象：开关跟着关掉
    panel.targets = [margin({ top: 1, right: 2, bottom: 3, left: 4 })]
    await panel.updateComplete
    expect([toggle.checked, boxes().map(box => box.value)]).toEqual([false, ['1', '2', '3', '4']])

    // 多个对象取值不同：开关禁用，只能四边一起改
    panel.targets = [margin({ top: 1, right: 1, bottom: 1, left: 1 }), { ...margin({ top: 2, right: 2, bottom: 2, left: 2 }), id: 'p2' }]
    await panel.updateComplete
    expect([toggle.checked, toggle.hasAttribute('disabled'), boxes().map(box => [box.value, box.getAttribute('placeholder')])]).toEqual([true, true, [['', 'Multiple values']]])
  })

  it('format 是格式输入框：种类限在 kinds，必填时不能选「不设格式」，合法的格式说明写入，不设格式即清除', async () => {
    const diagnostics = recordWcDiagnostics()
    const panel = await mount(element => element.targets = [{
      kind: 'text',
      id: 'x',
      value: { format: { kind: 'number', decimals: 2 } },
      descriptors: [
        { path: ['format'], control: { kind: 'format', kinds: ['number', 'percent'] }, label: '格式' },
        { path: ['axis'], control: { kind: 'format' }, label: '轴', required: true },
      ],
    }])
    type FormatInput = HTMLElement & { kinds?: unknown, clearable?: boolean, value?: unknown }
    const format = row(panel, 'format').querySelector<FormatInput>('xh-field > [data-xh-part="root"] > xh-format-input')!
    const axis = row(panel, 'axis').querySelector<FormatInput>('xh-format-input')!
    expect([format.getAttribute('data-xh-part'), format.kinds, format.clearable, format.value]).toEqual(['control', ['number', 'percent'], true, { kind: 'number', decimals: 2 }])
    expect([axis.kinds, axis.clearable, axis.value]).toEqual([undefined, false, null])

    const changes = record(panel, 'property-change')
    const commits = record(panel, 'property-commit')
    emit(format, 'value-change', { value: { kind: 'percent' } })
    emit(format, 'value-change', { value: null })
    format.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    expect(changes.map(change => change.value)).toEqual([{ kind: 'percent' }, undefined])
    expect(commits).toEqual([{ path: ['format'] }])

    // 多个对象取值不同：格式输入框标 mixed（种类显示「多个值」），选了种类就整体写入；取值相同后撤掉 mixed
    const formatOf = (id: string, value: JsonValue): DesignerPropertyTarget => ({ kind: 'text', id, value: { format: value }, descriptors: [{ path: ['format'], control: { kind: 'format' }, label: '格式' }] })
    panel.targets = [formatOf('a', { kind: 'number' }), formatOf('b', { kind: 'percent' })]
    await panel.updateComplete
    const shared = row(panel, 'format').querySelector<FormatInput & { mixed?: boolean }>('xh-format-input')!
    expect([shared.mixed, shared.value]).toEqual([true, null])
    emit(shared, 'value-change', { value: { kind: 'number', decimals: 1 } })
    expect(changes.at(-1)).toMatchObject({ path: ['format'], value: { kind: 'number', decimals: 1 } })
    panel.targets = [formatOf('a', { kind: 'number' }), formatOf('b', { kind: 'number' })]
    await panel.updateComplete
    const same = row(panel, 'format').querySelector<FormatInput & { mixed?: boolean }>('xh-format-input')!
    expect([same.mixed, same.value]).toEqual([false, { kind: 'number' }])
    await new Promise(resolve => setTimeout(resolve))
    expect(diagnostics.codes()).toEqual([])
    diagnostics.stop()
  })

  it('filter 是条件编辑器：字段取描述的 fields，没写时用面板 dataFields 列出的值字段；一次增删改写入即封口，ids 时新节点取未用的 id', async () => {
    const diagnostics = recordWcDiagnostics()
    const tree = { logic: 'and', conditions: [{ id: 'c1', field: 'region', operator: 'eq', value: 'East' }] }
    const target = (id: string, value: JsonValue, control: JsonValue): DesignerPropertyTarget => ({ kind: 'card', id, value: { filter: value }, descriptors: [{ path: ['filter'], control: control as never, label: '筛选' }] })
    const panel = await mount((element) => {
      element.dataFields = [{ name: 'region', label: '区域', kind: 'value' }, { name: 'amount', kind: 'value', type: 'number' }, { name: 'items', kind: 'list', children: [{ name: 'qty', kind: 'value' }] }]
      element.targets = [target('a', tree, { kind: 'filter', ids: true, maxDepth: 1, parameters: [{ name: 'min', type: 'number' }] })]
    })
    type FilterBuilder = HTMLElement & { value?: unknown, fields?: unknown, parameters?: unknown, maxDepth?: number, createId?: (kind: 'condition' | 'group') => string, translations?: { empty?: string } }
    const builder = row(panel, 'filter').querySelector<FilterBuilder>('xh-filter-builder')!
    expect([builder.getAttribute('data-xh-part'), builder.value, builder.fields, builder.parameters, builder.maxDepth]).toEqual([
      'control',
      tree,
      [{ name: 'region', label: '区域', type: 'string' }, { name: 'amount', type: 'number' }],
      [{ name: 'min', type: 'number' }],
      1,
    ])
    expect([builder.createId!('condition'), builder.createId!('group')]).toEqual(['c2', 'g1'])

    const changes = record(panel, 'property-change')
    const commits = record(panel, 'property-commit')
    const next = { logic: 'or', conditions: tree.conditions }
    emit(builder, 'value-change', { value: next })
    expect([changes.map(change => change.value), commits]).toEqual([[next], [{ path: ['filter'] }]])

    // 描述写了 fields 就用描述的；多个对象取值不同时是空树，空态写「多个值」
    const own = [{ name: 'channel', type: 'string' }]
    panel.targets = [target('a', tree, { kind: 'filter', fields: own }), target('b', next, { kind: 'filter', fields: own })]
    await panel.updateComplete
    const shared = row(panel, 'filter').querySelector<FilterBuilder>('xh-filter-builder')!
    expect([shared.fields, shared.value, shared.translations?.empty, shared.createId]).toEqual([own, { logic: 'and', conditions: [] }, 'Multiple values', undefined])
    await new Promise(resolve => setTimeout(resolve))
    expect(diagnostics.codes()).toEqual([])
    diagnostics.stop()
  })

  it('text 写了 secret 时是密码框：缺省不显示明文、浏览器不代填，输入照常派发', async () => {
    const diagnostics = recordWcDiagnostics()
    const panel = await mount((element) => {
      element.targets = [{ kind: 'client', id: 'c1', value: { key: 'k1' }, descriptors: [{ path: ['key'], control: { kind: 'text', secret: true }, label: '密钥' }] }]
    })
    const field = row(panel, 'key').querySelector<HTMLElement & { value?: string }>('xh-password-input')!
    await (field as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete
    const input = field.querySelector('input')!
    expect([field.value, input.type, input.getAttribute('autocomplete')]).toEqual(['k1', 'password', 'off'])
    expect(row(panel, 'key').querySelector('xh-field')).not.toBeNull()
    const changes = record(panel, 'property-change')
    emit(field, 'value-change', { value: 'k2' })
    emit(field, 'value-change', { value: '' })
    expect(changes.map(change => change.value)).toEqual(['k2', undefined])
    expect(diagnostics.codes()).toEqual([])
    diagnostics.stop()
  })

  it('swatch 是一组色块：格子画选项的颜色，选中写入选项的值；custom 时另有颜色框，取值不在选项里时显示在框里、色板不选中', async () => {
    const diagnostics = recordWcDiagnostics()
    const options = [{ value: 'ocean', color: '#2563eb', label: '海蓝' }, { value: 'forest', color: '#16a34a', label: '森绿' }]
    const theme = (value: JsonValue, custom = true): DesignerPropertyTarget => ({
      kind: 'settings',
      id: 's1',
      value: { brand: value },
      descriptors: [{ path: ['brand'], control: { kind: 'swatch', options, custom }, label: '主题色' }],
    })
    const panel = await mount((element) => {
      element.targets = [theme('forest')]
    })
    const group = row(panel, 'brand')
    expect([group.getAttribute('role'), group.querySelector('xh-field')]).toEqual(['group', null])
    const picker = group.querySelector<HTMLElement & { value?: string, swatches?: unknown }>('xh-color-swatch-picker')!
    const custom = group.querySelector<HTMLElement & { value?: string }>('xh-color-field')!
    expect(picker.swatches).toEqual([{ value: '#2563eb', label: '海蓝' }, { value: '#16a34a', label: '森绿' }])
    expect([picker.value, picker.getAttribute('aria-label'), custom.value, custom.getAttribute('aria-label')]).toEqual(['#16a34a', '主题色', '', 'Custom color'])

    const changes = record(panel, 'property-change')
    const commits = record(panel, 'property-commit')
    emit(picker, 'value-change', { value: '#2563eb' })
    expect([changes.at(-1)!.value, commits.length]).toEqual(['ocean', 1])
    emit(custom, 'value-change', { value: '#ff8800' })
    expect([changes.at(-1)!.value, picker.value, commits.length]).toEqual(['#ff8800', '', 2])

    panel.targets = [theme('#123456')]
    await panel.updateComplete
    expect([picker.value, custom.value]).toEqual(['', '#123456'])
    panel.targets = [theme('ocean')]
    await panel.updateComplete
    expect([picker.value, custom.value]).toEqual(['#2563eb', ''])

    // 没写 custom 时只有色板
    panel.targets = [{ ...theme('ocean', false), id: 's2' }]
    await panel.updateComplete
    expect(row(panel, 'brand').querySelector('xh-color-field')).toBeNull()
    expect(diagnostics.codes()).toEqual([])
    diagnostics.stop()
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

describe('<xh-designer-properties> 里层的问题', () => {
  const sheet: DesignerPropertyTarget = {
    kind: 'form',
    id: 'f1',
    value: { options: [{ value: 'a' }, { value: 'b' }, { value: '' }], optionsExtra: 'x', style: { color: 'red', border: { width: 0 } } },
    descriptors: [
      { path: ['options'], control: { kind: 'option-table' }, label: '选项' },
      { path: ['optionsExtra'], control: { kind: 'text' }, label: '附加' },
      { path: ['style'], control: { kind: 'style' }, label: '样式' },
      { path: ['style', 'color'], control: { kind: 'text' }, label: '颜色' },
    ],
  }
  const at = (id: string, path: (string | number)[], message: string): { target: { kind: string, id: string }, path: (string | number)[], message: string } => ({ target: { kind: 'form', id }, path, message })
  const errorText = (panel: Element, path: string): string | undefined => {
    const element = row(panel, path).querySelector<HTMLElement>('[data-xh-part="error-text"], [data-part="property-error"]')
    return element && !element.hidden && element.textContent ? element.textContent : undefined
  }

  /** 两个宿主编辑器：选项表自己标子项（nestedIssues），样式编辑器不标。记下每次拿到的 issues。 */
  function editors(): { seen: Record<string, unknown[]>, table: Record<string, DesignerPropertyEditor> } {
    const seen: Record<string, unknown[]> = { 'option-table': [], 'style': [] }
    const make = (kind: string, nestedIssues: boolean): DesignerPropertyEditor => (context) => {
      seen[kind]!.push(context.issues)
      return { element: document.createElement('div'), nestedIssues, update: next => void seen[kind]!.push(next.issues) }
    }
    return { seen, table: { 'option-table': make('option-table', true), 'style': make('style', false) } }
  }

  it('按路径段归到最长前缀那一行：options 不吃 optionsExtra 的问题，嵌套描述归更具体的那一行；编辑器拿到相对属性的 issues', async () => {
    const { seen, table } = editors()
    const panel = await mount((element) => {
      element.editors = { byControl: table }
      element.targets = [sheet]
      element.errors = [
        at('f1', ['options', 2, 'value'], '第 3 行的值不能为空'),
        at('f1', ['options'], '至少两个选项'),
        at('f1', ['optionsExtra'], '附加不对'),
        at('f1', ['style', 'color'], '颜色不对'),
        at('f1', ['style', 'border', 'width'], '线宽要大于 0'),
        at('f1', ['unknown'], '哪一行都不沾'),
        at('f2', ['options', 0, 'value'], '别的对象'),
      ]
    })
    expect(seen['option-table']!.at(-1)).toEqual([{ path: [], message: '至少两个选项' }, { path: [2, 'value'], message: '第 3 行的值不能为空' }])
    expect(seen.style!.at(-1)).toEqual([{ path: ['border', 'width'], message: '线宽要大于 0' }])
    expect([errorText(panel, 'options'), errorText(panel, 'optionsExtra'), errorText(panel, 'style.color')]).toEqual(['至少两个选项', '附加不对', '颜色不对'])

    // 只有 optionsExtra 的问题时 options 那一行与它的编辑器都不沾
    panel.errors = [at('f1', ['optionsExtra'], '附加不对')]
    await panel.updateComplete
    expect([seen['option-table']!.at(-1), errorText(panel, 'options'), errorText(panel, 'optionsExtra')]).toEqual([[], undefined, '附加不对'])
  })

  it('只有里层问题时：编辑器写了 nestedIssues 的行下不重复，没写的行下显示第一条里层问题；问题清掉后编辑器拿到空数组', async () => {
    const { seen, table } = editors()
    const panel = await mount((element) => {
      element.editors = { byControl: table }
      element.targets = [sheet]
      element.errors = [at('f1', ['options', 2, 'value'], '第 3 行的值不能为空'), at('f1', ['style', 'border', 'width'], '线宽要大于 0')]
    })
    expect([errorText(panel, 'options'), errorText(panel, 'style')]).toEqual([undefined, '线宽要大于 0'])
    expect(row(panel, 'style').hasAttribute('data-invalid') || row(panel, 'style').querySelector('[aria-invalid="true"], [invalid]') !== null).toBe(true)
    panel.errors = []
    await panel.updateComplete
    expect([seen['option-table']!.at(-1), seen.style!.at(-1), errorText(panel, 'style')]).toEqual([[], [], undefined])
  })

  it('多选时合并各对象的问题，按路径排、同一路径只留第一条', async () => {
    const { seen, table } = editors()
    await mount((element) => {
      element.editors = { byControl: table }
      element.targets = [sheet, { ...sheet, id: 'f2' }]
      element.errors = [
        at('f2', ['options', 1, 'value'], '第 2 行（f2）'),
        at('f1', ['options', 0, 'value'], '第 1 行（f1）'),
        at('f2', ['options', 0, 'value'], '第 1 行（f2）'),
        at('f1', ['options', 10, 'value'], '第 11 行'),
      ]
    })
    expect(seen['option-table']!.at(-1)).toEqual([
      { path: [0, 'value'], message: '第 1 行（f1）' },
      { path: [1, 'value'], message: '第 2 行（f2）' },
      { path: [10, 'value'], message: '第 11 行' },
    ])
  })

  it('四边按里层路径把问题标到对应那一边，行下显示问题文字；四边相同时标在那一个框上', async () => {
    const margin = (value: JsonValue): DesignerPropertyTarget => ({
      kind: 'page',
      id: 'p1',
      value: { margin: value },
      descriptors: [{ path: ['margin'], control: { kind: 'sides', min: 0, unit: 'mm' }, label: '页边距' }],
    })
    const panel = await mount((element) => {
      element.targets = [margin({ top: 1, right: 2, bottom: 3, left: 4 })]
      element.errors = [{ target: { kind: 'page', id: 'p1' }, path: ['margin', 'right'], message: '右边太窄' }]
    })
    const group = row(panel, 'margin')
    const invalid = (): boolean[] => Array.from(group.querySelectorAll('xh-number-field'), box => box.hasAttribute('invalid'))
    expect([invalid(), group.querySelector('[data-part="property-error"]')!.textContent]).toEqual([[false, true, false, false], '右边太窄'])
    panel.targets = [margin({ top: 5, right: 5, bottom: 5, left: 5 })]
    await panel.updateComplete
    expect(invalid()).toEqual([true])
    panel.errors = []
    await panel.updateComplete
    expect(invalid()).toEqual([false])
  })
})

describe('<xh-designer-properties> 选项表', () => {
  interface FieldArray extends HTMLElement {
    readonly items: readonly { readonly key: string }[]
    add: () => void
    removeItem: (index: number) => void
    move: (from: number, to: number) => void
    readonly updateComplete: Promise<unknown>
  }
  const field = (value: JsonValue): DesignerPropertyTarget => ({
    kind: 'field',
    id: 'f1',
    value: { data: { options: value } },
    descriptors: [{ path: ['data', 'options'], control: { kind: 'options' }, label: '选项' }],
  })
  const tableOf = (panel: Element): FieldArray => row(panel, 'data.options').querySelector<FieldArray>('xh-field-array')!
  /** 第 index 行（从 0 数）某一列那一格的字段。 */
  const cell = (panel: Element, index: number, column: string): HTMLElement & { errorText?: string, invalid?: boolean } => {
    const array = tableOf(panel)
    return array.querySelector(`[slot="item-cell:${array.items[index]!.key}:${column}"]`)!
  }
  const control = (panel: Element, index: number, column: string): HTMLElement & { value?: string, checked?: boolean } =>
    cell(panel, index, column).querySelector<HTMLElement & { value?: string, checked?: boolean }>(column === 'disabled' ? 'xh-checkbox' : 'xh-text-field')!
  async function settle(panel: XhDesignerPropertiesElement): Promise<void> {
    await panel.updateComplete
    await tableOf(panel).updateComplete
    await tableOf(panel).updateComplete
  }

  it('一项一行：值、文字与禁用三格放进字段，控件以「列名 + 第几项」为名，选项表放进这一行的字段', async () => {
    const diagnostics = recordWcDiagnostics()
    const panel = await mount((element) => {
      element.targets = [field([{ value: 'a', label: '甲' }, { value: 'b', disabled: true, tone: 'danger' }])]
    })
    await settle(panel)
    const array = tableOf(panel)
    expect(array.closest('xh-field')!.closest('[data-part="property"]')).toBe(row(panel, 'data.options'))
    expect(array.items).toHaveLength(2)
    expect([control(panel, 0, 'value').value, control(panel, 0, 'label').value, control(panel, 0, 'disabled').checked]).toEqual(['a', '甲', false])
    expect([control(panel, 1, 'value').value, control(panel, 1, 'label').value, control(panel, 1, 'disabled').checked]).toEqual(['b', '', true])
    expect(['value', 'label', 'disabled'].map(column => control(panel, 1, column).getAttribute('aria-label'))).toEqual(['Value, option 2', 'Label, option 2', 'Disabled, option 2'])
    expect(diagnostics.codes()).toEqual([])
    diagnostics.stop()
  })

  it('改格子写回整份选项：文字为空、不禁用时去掉这两个键，别的键原样留着；输入失焦封口，勾选即封口', async () => {
    const panel = await mount((element) => {
      element.targets = [field([{ value: 'a', label: '甲' }, { value: 'b', disabled: true, tone: 'danger' }])]
    })
    await settle(panel)
    const changes = record(panel, 'property-change')
    const commits = record(panel, 'property-commit')
    emit(control(panel, 1, 'label'), 'value-change', { value: '乙' })
    expect(changes.at(-1)!).toMatchObject({ path: ['data', 'options'], value: [{ value: 'a', label: '甲' }, { value: 'b', disabled: true, tone: 'danger', label: '乙' }] })
    expect(commits).toHaveLength(0)
    control(panel, 1, 'label').dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    expect(commits).toHaveLength(1)
    emit(control(panel, 0, 'label'), 'value-change', { value: '' })
    expect(changes.at(-1)!.value).toEqual([{ value: 'a' }, { value: 'b', disabled: true, tone: 'danger', label: '乙' }])
    emit(control(panel, 1, 'disabled'), 'checked-change', { checked: false })
    expect([changes.at(-1)!.value, commits.length]).toEqual([[{ value: 'a' }, { value: 'b', tone: 'danger', label: '乙' }], 2])
  })

  it('增删与换序各是一步：新增的一项只有空的 value，删掉最后一项即清除；面板换回同一份值时格子不重建', async () => {
    let value: JsonValue = [{ value: 'a' }, { value: 'b' }]
    const panel = await mount((element) => {
      element.targets = [field(value)]
    })
    await settle(panel)
    const changes = record(panel, 'property-change')
    const commits = record(panel, 'property-commit')
    const follow = async (): Promise<void> => {
      value = changes.at(-1)!.value as JsonValue
      panel.targets = [field(value)]
      await settle(panel)
    }
    const first = control(panel, 0, 'value')
    tableOf(panel).add()
    expect([changes.at(-1)!.value, commits.length]).toEqual([[{ value: 'a' }, { value: 'b' }, { value: '' }], 1])
    await follow()
    expect([tableOf(panel).items.length, control(panel, 0, 'value')]).toEqual([3, first])
    tableOf(panel).move(0, 2)
    expect([changes.at(-1)!.value, commits.length]).toEqual([[{ value: 'b' }, { value: '' }, { value: 'a' }], 2])
    await follow()
    expect(control(panel, 2, 'value')).toBe(first)
    tableOf(panel).removeItem(1)
    expect([changes.at(-1)!.value, commits.length]).toEqual([[{ value: 'b' }, { value: 'a' }], 3])
    await follow()
    tableOf(panel).removeItem(0)
    tableOf(panel).removeItem(0)
    expect(changes.at(-1)!.value).toBeUndefined()
  })

  it('里层的问题标到格上：[i, "value"] 等落在那一格的字段，别的键与这一项本身落在值上；行下不重复，清掉后收回', async () => {
    const panel = await mount((element) => {
      element.targets = [field([{ value: 'a' }, { value: 'b', tone: 'pink' }, { value: '' }])]
      element.errors = [
        { target: { kind: 'field', id: 'f1' }, path: ['data', 'options', 2, 'value'], message: '第 3 项的值不能为空' },
        { target: { kind: 'field', id: 'f1' }, path: ['data', 'options', 1, 'tone'], message: '色调不对' },
        { target: { kind: 'field', id: 'f1' }, path: ['data', 'options', 0, 'label'], message: '缺文字' },
      ]
    })
    await settle(panel)
    const marked = (): [string, string | undefined][] => [0, 1, 2].flatMap(index => ['value', 'label', 'disabled'].map((column): [string, string | undefined] => {
      const found = cell(panel, index, column)
      return [`${index}.${column}`, found.invalid ? found.errorText : undefined]
    })).filter(([, message]) => message !== undefined)
    expect(marked()).toEqual([['0.label', '缺文字'], ['1.value', '色调不对'], ['2.value', '第 3 项的值不能为空']])
    const own = row(panel, 'data.options').querySelector<HTMLElement>(':scope > xh-field > [data-xh-part="root"] > [data-xh-part="error-text"]')
    expect(own === null || own.hidden || own.textContent === '').toBe(true)
    panel.errors = []
    await settle(panel)
    expect(marked()).toEqual([])
  })

  it('只读时格子只读、不派发，多个对象取值不同时没有行', async () => {
    const panel = await mount((element) => {
      element.readonly = true
      element.targets = [field([{ value: 'a' }])]
    })
    await settle(panel)
    const changes = record(panel, 'property-change')
    expect([control(panel, 0, 'value').hasAttribute('read-only'), (tableOf(panel) as FieldArray & { readOnly?: boolean }).readOnly]).toEqual([true, true])
    emit(control(panel, 0, 'value'), 'value-change', { value: 'x' })
    expect(changes).toHaveLength(0)
    panel.readonly = false
    panel.targets = [field([{ value: 'a' }]), { ...field([{ value: 'b' }]), id: 'f2' }]
    await settle(panel)
    expect(tableOf(panel).items).toHaveLength(0)
  })
})
