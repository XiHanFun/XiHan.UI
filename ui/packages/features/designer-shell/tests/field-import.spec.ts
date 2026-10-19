// @vitest-environment jsdom

// 导入字段对话框：来源页签、解析与推断、预览表的勾选与改动、合并与替换、示例数据、字段来源页，以及内置命令 import-fields。
import type { DataField, DesignerFieldSource, DesignerFieldSourceHost } from '@xihan-ui/designer-kit'
import type { DesignerFieldImportDetail, DesignerFieldImportEventMap, XhDesignerFieldImportElement } from '../src'
import { setXhConfig } from '@xihan-ui/web-components'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineDesignerShell, DESIGNER_COMMANDS_EN_US, DESIGNER_FIELD_IMPORT_EN_US, DESIGNER_SHELL_COMMANDS, designerShellCommands } from '../src'
import { designerShellZhCN } from '../src/locale'

defineDesignerShell()

afterEach(() => {
  document.body.innerHTML = ''
  setXhConfig({})
})

const english = DESIGNER_FIELD_IMPORT_EN_US

type Dialog = XhDesignerFieldImportElement

async function mount(setup: (element: Dialog) => void = () => {}): Promise<Dialog> {
  const element = document.createElement('xh-designer-field-import')
  setup(element)
  document.body.append(element)
  element.show()
  await element.updateComplete
  return element
}

function emit(target: Element, type: string, detail: unknown): void {
  target.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))
}

/** 打开后对话框的内容搬到了浮层根，按 data-part 在整个文档里找。 */
function part<T extends HTMLElement = HTMLElement>(name: string): T {
  return document.querySelector<T>(`[data-scope="designer-field-import"][data-part="${name}"]`)!
}

function all<T extends HTMLElement = HTMLElement>(name: string): T[] {
  return [...document.querySelectorAll<T>(`[data-scope="designer-field-import"][data-part="${name}"]`)]
}

function triggers(): string[] {
  return [...document.querySelectorAll('xh-tabs [data-xh-part="list"] > button')].map(node => node.textContent ?? '')
}

function tabs(): HTMLElement & { value?: string } {
  return document.querySelector('xh-tabs')!
}

/** 当前页的输入框；内置页才有。 */
function input(): HTMLElement & { value?: string } {
  const active = tabs().value
  return document.querySelector(`[data-xh-part="content"][value="${active}"] [data-part="input"]`)!
}

async function type(element: Dialog, text: string): Promise<void> {
  emit(input(), 'value-change', { value: text })
  await element.updateComplete
}

/** 预览表各行：路径、缩进层级、勾没勾、能不能勾。 */
function rows(): { name: string, depth: string, checked: unknown, disabled: unknown }[] {
  return all('row').filter(row => !row.hasAttribute('data-head')).map(row => ({
    name: row.querySelector('[data-scope="designer-field-import"][data-part="name"]')!.textContent ?? '',
    depth: row.style.getPropertyValue('--xh-_designer-field-depth'),
    checked: row.querySelector<HTMLElement & { checked?: unknown }>('[data-scope="designer-field-import"][data-part="include"]')!.checked,
    disabled: row.querySelector<HTMLElement & { disabled?: unknown }>('[data-scope="designer-field-import"][data-part="include"]')!.disabled,
  }))
}

function row(name: string): HTMLElement {
  return all('row').find(item => item.querySelector('[data-scope="designer-field-import"][data-part="name"]')?.textContent === name)!
}

function notes(): string[] {
  return all('note').map(note => note.textContent ?? '')
}

function submit(): HTMLElement & { disabled?: boolean } {
  return part('import')
}

function imported(element: Dialog): DesignerFieldImportDetail[] {
  const seen: DesignerFieldImportDetail[] = []
  element.addEventListener('fields-import', event => seen.push((event as DesignerFieldImportEventMap['fields-import']).detail))
  return seen
}

function clickImport(): void {
  submit().querySelector('button')!.click()
}

const order = { no: 'SO-001', items: [{ sku: 'A1', qty: 2, tags: ['x'] }, { sku: 'B2', qty: 1, tags: [] }] }

describe('<xh-designer-field-import>', () => {
  it('两张内置页在前，字段来源按 order 排在后面；打开时预览处是提示，导入钮不可用', async () => {
    const source = (id: string, order?: number): DesignerFieldSource => ({ id, label: id, ...(order === undefined ? {} : { order }), create: host => ({ element: host.document.createElement('div') }) })
    const element = await mount((el) => {
      el.sources = [source('@acme/later'), source('@acme/early', 50)]
    })
    expect(triggers()).toEqual([english.sample, english.schema, '@acme/early', '@acme/later'])
    expect([tabs().value, element.open]).toEqual(['sample', true])
    expect([part('empty').hidden, part('empty').textContent, part('preview').hidden, submit().disabled]).toEqual([false, english.empty, true, true])
    expect(input().getAttribute('aria-label')).toBe(english.sampleInput)
  })

  it('粘贴 JSON 样例：推断出字段树，按层级缩进，推断说明列在下面', async () => {
    const element = await mount()
    await type(element, JSON.stringify(order))
    expect(rows()).toEqual([
      { name: 'no', depth: '0', checked: true, disabled: false },
      { name: 'items', depth: '0', checked: true, disabled: false },
      { name: 'sku', depth: '1', checked: true, disabled: false },
      { name: 'qty', depth: '1', checked: true, disabled: false },
      { name: 'tags', depth: '1', checked: true, disabled: false },
    ])
    expect(row('qty').querySelector<HTMLElement & { value?: string[] }>('[data-scope="designer-field-import"][data-part="type"]')!.value).toEqual(['number'])
    expect([row('items').querySelector<HTMLElement>('[data-scope="designer-field-import"][data-part="type"]')!.hidden, row('items').querySelector('[data-scope="designer-field-import"][data-part="kind"]')!.textContent]).toEqual([true, english.kinds.list])
    expect(notes()).toEqual([english.noteAt('items.tags', english.notes['scalar-list'])])
    expect([part('empty').hidden, submit().disabled]).toEqual([true, false])
  })

  it('解析失败写出第几行第几列与原因，导入钮不可用；改对了就消失', async () => {
    const element = await mount()
    await type(element, '{\n  "a": 1,\n  "b": }')
    const error = document.querySelector<HTMLElement>('[data-part="error"]:not([hidden])')!
    expect(error.textContent).toBe(english.parseError(3, 8, english.parseErrors['unexpected-token']))
    expect([part('preview').hidden, part('empty').hidden, submit().disabled]).toEqual([true, true, true])
    await type(element, '{ "a": 1 }')
    expect(document.querySelector('[data-part="error"]:not([hidden])')).toBeNull()
    expect(rows().map(item => item.name)).toEqual(['a'])
  })

  it('改显示名、类型，去掉一行：导入时按改过的算；去掉父行连同下级，下级的勾选框不可用', async () => {
    const element = await mount()
    const seen = imported(element)
    const opens: boolean[] = []
    element.addEventListener('open-change', event => opens.push((event as DesignerFieldImportEventMap['open-change']).detail.open))
    await type(element, JSON.stringify(order))
    emit(row('no').querySelector('[data-scope="designer-field-import"][data-part="label"]')!, 'value-change', { value: '单号' })
    emit(row('qty').querySelector('[data-scope="designer-field-import"][data-part="type"]')!, 'value-change', { value: ['string'] })
    emit(row('tags').querySelector('[data-scope="designer-field-import"][data-part="include"]')!, 'checked-change', { checked: false })
    await element.updateComplete
    clickImport()
    expect(seen).toHaveLength(1)
    expect(seen[0]!.fields).toEqual([
      { name: 'no', label: '单号', kind: 'value', type: 'string' },
      { name: 'items', kind: 'list', children: [{ name: 'sku', kind: 'value', type: 'string' }, { name: 'qty', kind: 'value', type: 'string' }] },
    ])
    expect([seen[0]!.mode, seen[0]!.source, seen[0]!.sample, element.open, opens]).toEqual(['replace', 'sample', undefined, false, [false]])

    element.show()
    await element.updateComplete
    expect([input().value, rows()]).toEqual(['', []])
    await type(element, JSON.stringify(order))
    emit(row('items').querySelector('[data-scope="designer-field-import"][data-part="include"]')!, 'checked-change', { checked: false })
    await element.updateComplete
    expect(rows().filter(item => item.depth === '1').map(item => item.disabled)).toEqual([true, true, true])
    clickImport()
    expect(seen[1]!.fields).toEqual([{ name: 'no', kind: 'value', type: 'string' }])
  })

  it('给了 contents 才有「内容」列，值字段只能在这几种里选；导入时写进 content，文本不写', async () => {
    const element = await mount(el => (el.contents = ['text', 'image', 'barcode']))
    const seen = imported(element)
    await type(element, '{ "photo": "https://example.com/a.png", "code": "690123" }')
    const select = row('code').querySelector<HTMLElement & { collection?: { value: string }[], value?: string[] }>('[data-scope="designer-field-import"][data-part="content"]')!
    expect([part('preview').querySelector('[data-column="content"]')!.hasAttribute('hidden'), select.collection!.map(item => item.value), select.value]).toEqual([false, ['text', 'image', 'barcode'], ['text']])
    emit(select, 'value-change', { value: ['barcode'] })
    await element.updateComplete
    clickImport()
    expect(seen[0]!.fields).toEqual([{ name: 'photo', kind: 'value', type: 'string' }, { name: 'code', kind: 'value', type: 'string', content: 'barcode' }])

    const plain = await mount()
    await type(plain, '{ "a": 1 }')
    expect(all('preview').map(table => table.querySelector<HTMLElement>('[data-column="content"]')!.hidden)).toEqual([false, true])
  })

  it('现有字段不为空时出合并与替换，缺省合并并预先标出种类不同的；示例数据缺省勾上', async () => {
    const current: DataField[] = [{ name: 'no', label: '订单号', kind: 'value', type: 'string' }, { name: 'items', kind: 'object' }]
    const element = await mount((el) => {
      el.fields = current
      el.offerSample = true
    })
    const seen = imported(element)
    await type(element, JSON.stringify(order))
    const mode = part<HTMLElement & { value?: string | null }>('mode')
    expect([mode.hidden, mode.value, part<HTMLElement & { checked?: unknown }>('sample').hidden, part<HTMLElement & { checked?: unknown }>('sample').checked]).toEqual([false, 'merge', false, true])
    expect(notes()).toContain(english.conflict('items'))
    clickImport()
    expect(seen[0]!.mode).toBe('merge')
    expect(seen[0]!.fields.map(field => [field.name, field.label, field.kind])).toEqual([['no', '订单号', 'value'], ['items', undefined, 'object']])
    expect(seen[0]!.sample).toEqual(order)

    element.show()
    await element.updateComplete
    await type(element, JSON.stringify(order))
    emit(part('mode'), 'value-change', { value: 'replace' })
    emit(part('sample'), 'checked-change', { checked: false })
    await element.updateComplete
    expect(notes()).not.toContain(english.conflict('items'))
    clickImport()
    expect([seen[1]!.mode, seen[1]!.fields.map(field => field.kind), seen[1]!.sample]).toEqual(['replace', ['value', 'list'], undefined])
  })

  it('jSON Schema 页：title 成为显示名，说明与必填进注解；没有样例时不出「同时作为示例数据」', async () => {
    const element = await mount((el) => {
      el.source = 'json-schema'
      el.offerSample = true
    })
    const seen = imported(element)
    expect(input().getAttribute('aria-label')).toBe(english.schemaInput)
    await type(element, JSON.stringify({ type: 'object', required: ['no'], properties: { no: { type: 'string', title: '单号', description: '销售单号' } } }))
    expect([row('no').querySelector<HTMLElement & { value?: string }>('[data-scope="designer-field-import"][data-part="label"]')!.value, part('sample').hidden]).toEqual(['单号', true])
    clickImport()
    expect([seen[0]!.source, seen[0]!.fields, seen[0]!.annotations.get('no')]).toEqual(['json-schema', [{ name: 'no', label: '单号', kind: 'value', type: 'string' }], { description: '销售单号', required: true }])
  })

  it('字段来源页切到时才建，交来的内容照样推断；切走时中止并销毁，之后交来的不算；出错显示页给的话', async () => {
    let host: DesignerFieldSourceHost | undefined
    const destroy = vi.fn()
    const request: DesignerFieldSource = {
      id: '@acme/request',
      label: 'From an API',
      create: (given) => {
        host = given
        const element = given.document.createElement('form')
        element.setAttribute('data-test', 'request')
        return { element, destroy }
      },
    }
    const element = await mount(el => (el.sources = [request]))
    expect(host).toBeUndefined()
    emit(tabs(), 'value-change', { value: '@acme/request' })
    await element.updateComplete
    expect([element.source, document.querySelector('[data-test="request"]') !== null, host!.signal.aborted]).toEqual(['@acme/request', true, false])
    host!.provide({ kind: 'fields', fields: [{ name: 'total', kind: 'value', type: 'number' }], sample: { total: 3 } })
    await element.updateComplete
    expect(rows().map(item => item.name)).toEqual(['total'])
    host!.fail('401 Unauthorized')
    await element.updateComplete
    expect(document.querySelector('[data-part="error"]:not([hidden])')!.textContent).toBe('401 Unauthorized')

    const first = host!
    emit(tabs(), 'value-change', { value: 'sample' })
    await element.updateComplete
    expect([first.signal.aborted, destroy.mock.calls.length, document.querySelector('[data-test="request"]')]).toEqual([true, 1, null])
    first.provide({ kind: 'sample', value: { late: 1 } })
    emit(tabs(), 'value-change', { value: '@acme/request' })
    await element.updateComplete
    expect([host === first, rows()]).toEqual([false, []])
  })

  it('字段来源的 id 与内置页重名时抛 TypeError', async () => {
    const element = document.createElement('xh-designer-field-import')
    document.body.append(element)
    await element.updateComplete
    element.sources = [{ id: 'sample', label: 'x', create: host => ({ element: host.document.createElement('div') }) }]
    await expect(element.updateComplete).rejects.toThrow(TypeError)
  })

  it('取消钮与对话框自己的关闭都关上并派发 open-change；文案随语言', async () => {
    setXhConfig({ translations: designerShellZhCN.translations })
    const element = await mount()
    const zh = designerShellZhCN.translations!['xh-designer-field-import']!
    expect([document.querySelector('h2')!.textContent, triggers()[0], part('cancel').textContent, submit().textContent]).toEqual([zh.title, zh.sample, zh.cancel, zh.import])
    const opens: boolean[] = []
    element.addEventListener('open-change', event => opens.push((event as DesignerFieldImportEventMap['open-change']).detail.open))
    part('cancel').querySelector('button')!.click()
    await element.updateComplete
    element.show()
    await element.updateComplete
    emit(element.querySelector('xh-dialog')!, 'open-change', { open: false })
    expect([element.open, opens]).toEqual([false, [false, false]])
  })
})

describe('内置命令 import-fields', () => {
  interface Ctx { readonly readonly: boolean }
  it('给了 openFieldImport 才有；文字取 xh-designer-commands，fieldImportDisabled 为真时不可用，执行即打开', () => {
    const open = vi.fn()
    const base = { translations: () => DESIGNER_COMMANDS_EN_US }
    expect(designerShellCommands<Ctx>(base).some(command => command.id === DESIGNER_SHELL_COMMANDS.importFields)).toBe(false)
    const command = designerShellCommands<Ctx>({ ...base, openFieldImport: open, fieldImportDisabled: context => context.readonly }).find(item => item.id === 'import-fields')!
    expect([typeof command.label === 'function' ? command.label({ readonly: false }) : command.label, command.placement, command.enabled!({ readonly: true }), command.enabled!({ readonly: false })]).toEqual(['Import fields', undefined, false, true])
    command.run!({ readonly: false })
    expect(open).toHaveBeenCalledTimes(1)
  })
})
