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
    await new Promise(resolve => setTimeout(resolve))
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
