// @vitest-environment jsdom

// JSON 编辑框：打开时写出缩进好的整份文档，改了重新解析与校验；解析失败与错误级问题挡住「应用」，点问题与「转到出错处」
// 把光标移过去；格式化、复制、只读、重新打开从头写起，以及内置命令 edit-json。
import type { JsonValue } from '@xihan-ui/core/json'
import type { DesignerIssueItem, DesignerJsonEditorEventMap, XhDesignerIssuesElement, XhDesignerJsonEditorElement } from '../src'
import { setXhConfig } from '@xihan-ui/web-components'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineDesignerShell, DESIGNER_COMMANDS_EN_US, DESIGNER_JSON_EDITOR_EN_US, DESIGNER_SHELL_COMMANDS, designerShellCommands } from '../src'
import { designerShellZhCN } from '../src/locale'

defineDesignerShell()

afterEach(() => {
  document.body.innerHTML = ''
  setXhConfig({})
  vi.unstubAllGlobals()
})

const english = DESIGNER_JSON_EDITOR_EN_US
const doc: JsonValue = { title: 'Order', nodes: [{ id: 'a', label: 'Start' }, { id: 'b', label: '' }] }

type Editor = XhDesignerJsonEditorElement
type Field = HTMLElement & { value?: string, readOnly?: boolean, invalid?: boolean }
type Button = HTMLElement & { disabled?: boolean }

async function mount(setup: (element: Editor) => void = () => {}): Promise<Editor> {
  const element = document.createElement('xh-designer-json-editor')
  element.value = doc
  setup(element)
  document.body.append(element)
  element.show()
  await element.updateComplete
  return element
}

/** 打开后对话框的内容搬到了浮层根，按 data-part 在整个文档里找。 */
function part<T extends HTMLElement = HTMLElement>(name: string): T {
  return document.querySelector<T>(`[data-scope="designer-json-editor"][data-part="${name}"]`)!
}

function area(): HTMLTextAreaElement {
  return part('input').querySelector('textarea')!
}

async function type(element: Editor, text: string): Promise<void> {
  part('input').dispatchEvent(new CustomEvent('value-change', { detail: { value: text }, bubbles: true }))
  await element.updateComplete
}

function click(name: string): void {
  part(name).querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

/** 标签必填的校验：label 为空的节点报一条错误，路径落在 label 上。 */
function requireLabels(value: JsonValue): DesignerIssueItem[] {
  const nodes = (value as { nodes?: { label?: string }[] }).nodes ?? []
  return nodes.flatMap((node, index) => node.label === '' ? [{ issue: { code: 'required', path: ['nodes', index, 'label'] }, message: 'Label is required' }] : [])
}

describe('<xh-designer-json-editor>', () => {
  it('打开时写出缩进两格的整份文档；没改时「应用」不可用，改成另一份合法的值后按「应用」派发 json-apply 并关上', async () => {
    const element = await mount()
    expect(part<Field>('input').value).toBe(JSON.stringify(doc, null, 2))
    expect(part('input').getAttribute('aria-label')).toBe(english.input)
    expect(part<Button>('apply').disabled).toBe(true)
    expect(part<Button>('format').disabled).toBe(true)
    const applied: JsonValue[] = []
    const opens: boolean[] = []
    element.addEventListener('json-apply', event => applied.push((event as DesignerJsonEditorEventMap['json-apply']).detail.value))
    element.addEventListener('open-change', event => opens.push((event as DesignerJsonEditorEventMap['open-change']).detail.open))
    await type(element, '{"title":"Invoice","nodes":[]}')
    expect([part<Button>('apply').disabled, part<Button>('format').disabled, part('error').hidden]).toEqual([false, false, true])
    click('apply')
    expect(applied).toEqual([{ title: 'Invoice', nodes: [] }])
    expect([element.open, opens]).toEqual([false, [false]])
  })

  it('解析失败：写出第几行第几列与原因，编辑框标成 invalid，「应用」「格式化」不可用；「转到出错处」把光标放到出错处', async () => {
    const element = await mount()
    await type(element, '{\n  "a": 1,\n}')
    expect(part('error').hidden).toBe(false)
    expect(part('error').textContent).toContain(english.parseError(3, 1, english.parseErrors['unexpected-token']))
    expect([part<Field>('input').invalid, part<Button>('apply').disabled, part<Button>('format').disabled]).toEqual([true, true, true])
    click('go-to-error')
    expect([document.activeElement, area().selectionStart, area().selectionEnd]).toEqual([area(), 12, 12])
    await type(element, '{"a":1}')
    expect([part('error').hidden, part<Field>('input').invalid]).toEqual([true, false])
  })

  it('校验：问题交给问题列表，有错误级问题时「应用」不可用、只有警告时可用；点一条，光标选中那个路径的值，路径不在文字里时退到上级', async () => {
    const element = await mount(el => el.validate = requireLabels)
    const issues = part<XhDesignerIssuesElement>('issues')
    expect(issues.hidden).toBe(false)
    expect(issues.items?.map(item => item.message)).toEqual(['Label is required'])
    expect(issues.getAttribute('aria-label')).toBe(english.issues)
    await type(element, JSON.stringify({ title: 'Order', nodes: [{ id: 'a', label: '' }] }, null, 2))
    expect(part<Button>('apply').disabled).toBe(true)
    const text = area().value
    issues.dispatchEvent(new CustomEvent('issue-activate', { detail: { issue: issues.items![0]!.issue, index: 0 }, bubbles: true }))
    const start = text.indexOf('""')
    expect([document.activeElement, area().selectionStart, area().selectionEnd]).toEqual([area(), start, start + 2])
    issues.dispatchEvent(new CustomEvent('issue-activate', { detail: { issue: { code: 'required', path: ['nodes', 0, 'missing'] }, index: 0 }, bubbles: true }))
    expect(area().selectionStart).toBe(text.indexOf('{', text.indexOf('"nodes"')))
    expect(text.slice(area().selectionStart, area().selectionEnd)).toBe('{')
    element.validate = value => requireLabels(value).map(item => ({ ...item, issue: { ...item.issue, severity: 'warning' as const } }))
    await element.updateComplete
    expect([part<Button>('apply').disabled, issues.items?.length]).toEqual([false, 1])
    await type(element, JSON.stringify(doc).replace('""', '"B"'))
    expect(issues.hidden).toBe(true)
  })

  it('格式化把紧凑的文字写成缩进两格；已是这个写法时不可用', async () => {
    const element = await mount()
    await type(element, '{"a":[1,2]}')
    click('format')
    await element.updateComplete
    expect([part<Field>('input').value, part<Button>('format').disabled]).toEqual(['{\n  "a": [\n    1,\n    2\n  ]\n}', true])
  })

  it('只读：编辑框只读、没有「应用」，改动不收；格式化与复制照样能用', async () => {
    const element = await mount(el => el.readonly = true)
    expect([part<Field>('input').readOnly, part('apply').hidden]).toEqual([true, true])
    await type(element, '{}')
    expect(part<Field>('input').value).toBe(JSON.stringify(doc, null, 2))
    expect(part<Button>('copy').disabled).not.toBe(true)
  })

  it('复制：写进剪贴板后钮旁写「已复制」，失败写「复制失败」，再改文字时清掉', async () => {
    const writeText = vi.fn(async () => {})
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
    const element = await mount()
    click('copy')
    await vi.waitFor(() => expect(part('status').textContent).toBe(english.copied))
    expect(writeText).toHaveBeenCalledWith(JSON.stringify(doc, null, 2))
    expect(part('status').getAttribute('role')).toBe('status')
    await type(element, '{}')
    expect(part('status').textContent).toBe('')
    writeText.mockRejectedValueOnce(new Error('denied'))
    click('copy')
    await vi.waitFor(() => expect(part('status').textContent).toBe(english.copyFailed))
  })

  it('关上再打开：从此刻的 value 重新写起，之前没应用的改动丢掉；Esc 等关上时派发 open-change', async () => {
    const element = await mount()
    await type(element, '{"draft":true}')
    const opens: boolean[] = []
    element.addEventListener('open-change', event => opens.push((event as DesignerJsonEditorEventMap['open-change']).detail.open))
    document.querySelector('xh-dialog')!.dispatchEvent(new CustomEvent('open-change', { detail: { open: false }, bubbles: true }))
    await element.updateComplete
    expect([element.open, opens]).toEqual([false, [false]])
    element.value = { next: 1 }
    element.show()
    await element.updateComplete
    expect(part<Field>('input').value).toBe('{\n  "next": 1\n}')
  })

  it('文案取全局配置：中文包里有这一桶', async () => {
    setXhConfig(designerShellZhCN)
    await mount()
    expect(document.querySelector('[data-xh-part="title"]')!.textContent).toBe(designerShellZhCN.translations!['xh-designer-json-editor']!.title)
    expect(part('apply').textContent).toBe('应用')
  })
})

describe('内置命令 edit-json', () => {
  it('给了 openJsonEditor 才有，快捷键 Mod+Shift+J，不上工具栏，执行即打开', () => {
    const open = vi.fn()
    const commands = designerShellCommands<object>({ translations: () => DESIGNER_COMMANDS_EN_US, openJsonEditor: open })
    const command = commands.find(item => item.id === DESIGNER_SHELL_COMMANDS.editJson)!
    expect([typeof command.label === 'function' ? command.label({}) : command.label, command.shortcut, command.placement]).toEqual([DESIGNER_COMMANDS_EN_US.editJson, ['Mod', 'Shift', 'J'], undefined])
    command.run?.({})
    expect(open).toHaveBeenCalledTimes(1)
    expect(designerShellCommands<object>({ translations: () => DESIGNER_COMMANDS_EN_US }).some(item => item.id === 'edit-json')).toBe(false)
  })
})
