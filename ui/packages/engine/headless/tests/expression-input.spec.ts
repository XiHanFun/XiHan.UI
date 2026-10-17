// @vitest-environment jsdom
import type { ExpressionCompletion, ExpressionInputIssue } from '@xihan-ui/core'
import type { ExpressionInputIssueView, ExpressionInputSchema, ExpressionInputTranslations } from '../src/expression-input/index'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { createExpressionCheck, createExpressionEngine, createFunctionTable, DEFAULT_FUNCTION_TABLE } from '@xihan-ui/expression'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  applyExpressionCompletion,
  collectExpressionCompletions,
  connectExpressionInput,
  expressionInputMachine,
  expressionLineColumn,
  expressionSegments,
  expressionSignature,
  expressionWordAt,
} from '../src/expression-input/index'
import { EXPRESSION_INPUT_EN_US } from '../src/locale/en-US'
import { zhCN } from '../src/locale/zh-CN'

type Props = ExpressionInputSchema['props']
type Dict = Record<string, unknown>

const ZH = zhCN.translations['expression-input'] as ExpressionInputTranslations

const VARIABLES: readonly ExpressionCompletion[] = [
  { label: 'amount', kind: 'variable', detail: 'number' },
  { label: 'applicant', kind: 'variable' },
  { label: '$row', kind: 'variable' },
]

function makeService(initial: Props = {}) {
  const props: Props = { ...initial }
  const runtime = createVanillaRuntime()
  const service = createService(expressionInputMachine, { props: () => ({ ...props }), runtime })
  runtime.start()
  return {
    service,
    setProps: (next: Props) => Object.assign(props, next),
    api: () => connectExpressionInput(service, normalizeProps),
    value: () => service.context.get('value'),
  }
}

function keyEvent(key: string, mods: Partial<Record<'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey', boolean>> = {}, code?: string) {
  return { key, code, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...mods, preventDefault: vi.fn(), currentTarget: null as unknown }
}

/** 模拟一次输入：值与光标一起交给 onInput。 */
function type(api: ReturnType<typeof connectExpressionInput>, value: string, caret = value.length): void {
  const props = api.getInputProps() as Dict
  ;(props.onInput as (e: unknown) => void)({ target: { value, selectionStart: caret } })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('expressionWordAt', () => {
  it('从光标往回取名字字符，首字符不是数字', () => {
    expect(expressionWordAt('amount + ta', 11)).toEqual({ word: 'ta', start: 9, member: null })
    expect(expressionWordAt('SUM($total', 10)).toEqual({ word: '$total', start: 4, member: null })
    expect(expressionWordAt('a + ', 4)).toEqual({ word: '', start: 4, member: null })
    expect(expressionWordAt('a + 12', 6)).toBeNull()
    expect(expressionWordAt('x1y', 2)).toEqual({ word: 'x1', start: 0, member: null })
  })

  it('前面紧挨着点时带上点之前的路径；点之前不是名字时为 null', () => {
    expect(expressionWordAt('$row.am', 7)).toEqual({ word: 'am', start: 5, member: '$row' })
    expect(expressionWordAt('a.b.c', 5)).toEqual({ word: 'c', start: 4, member: 'a.b' })
    expect(expressionWordAt('$row.', 5)).toEqual({ word: '', start: 5, member: '$row' })
    expect(expressionWordAt('(1).x', 5)).toEqual({ word: 'x', start: 4, member: null })
  })

  it('光标在字符串或数字里时为 null；闭合的字符串之后照常取词', () => {
    expect(expressionWordAt('\'abc', 3)).toBeNull()
    expect(expressionWordAt('"a b" + c', 3)).toBeNull()
    expect(expressionWordAt('"a b" + c', 9)).toEqual({ word: 'c', start: 8, member: null })
    expect(expressionWordAt('1.5', 2)).toBeNull()
    expect(expressionWordAt('12ab', 4)).toBeNull()
  })
})

describe('expressionSignature', () => {
  it('可选参数套方括号，可重复的最后一个参数接省略号，没有参数名的按序号显示', () => {
    expect(expressionSignature(DEFAULT_FUNCTION_TABLE.lookup('IF')!, ZH)).toBe('IF(条件, 真值[, 假值])')
    expect(expressionSignature(DEFAULT_FUNCTION_TABLE.lookup('SUM')!, ZH)).toBe('SUM(值…)')
    expect(expressionSignature(DEFAULT_FUNCTION_TABLE.lookup('NOW')!, ZH)).toBe('NOW()')
    expect(expressionSignature(DEFAULT_FUNCTION_TABLE.lookup('ROUND')!, EXPRESSION_INPUT_EN_US)).toBe('ROUND(number[, digits])')
    expect(expressionSignature({ name: 'PICK', minArgs: 1, maxArgs: 2, params: [] }, ZH)).toBe('PICK(参数 1[, 参数 2])')
  })
})

describe('collectExpressionCompletions', () => {
  const base = { functions: DEFAULT_FUNCTION_TABLE, translations: ZH }

  it('宿主条目在前、函数在后，按词前缀过滤且不区分大小写', () => {
    const items = collectExpressionCompletions({ ...base, source: 'a', caret: 1, word: { word: 'a', start: 0, member: null }, completions: VARIABLES })
    expect(items.map(item => item.label)).toEqual(['amount', 'applicant', 'ABS', 'AVG'])
    const fn = items.find(item => item.label === 'AVG')!
    expect(fn).toMatchObject({ kind: 'function', detail: 'AVG(值…)', description: '平均值', insert: 'AVG()', caretOffset: 4 })
    expect(items[0]).toMatchObject({ key: 'variable:amount', detail: 'number', insert: 'amount', caretOffset: 6 })
  })

  it('成员访问只列宿主来源；函数形式的来源拿到查询，由宿主自己过滤', () => {
    const source = vi.fn(() => [{ label: 'price', kind: 'variable' as const }])
    const items = collectExpressionCompletions({ ...base, source: '$row.pr', caret: 7, word: { word: 'pr', start: 5, member: '$row' }, completions: source })
    expect(source).toHaveBeenCalledWith({ source: '$row.pr', caret: 7, word: 'pr', member: '$row' })
    expect(items.map(item => item.label)).toEqual(['price'])
    expect(collectExpressionCompletions({ ...base, source: '$row.', caret: 5, word: { word: '', start: 5, member: '$row' }, completions: VARIABLES })).toEqual([])
  })

  it('空函数表不补函数；同 key 只留一条', () => {
    const items = collectExpressionCompletions({
      functions: createFunctionTable({ builtins: 'none' }),
      translations: ZH,
      source: '',
      caret: 0,
      word: { word: '', start: 0, member: null },
      completions: [...VARIABLES, { label: 'amount', kind: 'variable' }],
    })
    expect(items.map(item => item.key)).toEqual(['variable:amount', 'variable:applicant', 'variable:$row'])
  })
})

describe('applyExpressionCompletion', () => {
  const fn = collectExpressionCompletions({ functions: DEFAULT_FUNCTION_TABLE, translations: ZH, source: 'ro', caret: 2, word: { word: 'ro', start: 0, member: null }, completions: undefined })[0]!

  it('函数插入 NAME() 且光标落在括号里；后面已经跟着括号时只换名字', () => {
    expect(fn.label).toBe('ROUND')
    expect(applyExpressionCompletion('1 + ro', { word: 'ro', start: 4, member: null }, 6, fn)).toEqual({ value: '1 + ROUND()', caret: 10 })
    expect(applyExpressionCompletion('ro(x)', { word: 'ro', start: 0, member: null }, 2, fn)).toEqual({ value: 'ROUND(x)', caret: 6 })
  })

  it('变量插入名字，光标落在名字之后，后文不动', () => {
    const item = collectExpressionCompletions({ functions: createFunctionTable({ builtins: 'none' }), translations: ZH, source: 'am * 2', caret: 2, word: { word: 'am', start: 0, member: null }, completions: VARIABLES })[0]!
    expect(applyExpressionCompletion('am * 2', { word: 'am', start: 0, member: null }, 2, item)).toEqual({ value: 'amount * 2', caret: 6 })
  })
})

describe('问题的位置与分段', () => {
  const view = (issue: ExpressionInputIssue, index = 0): ExpressionInputIssueView => ({ index, issue, line: null, column: 1, message: '', text: '' })

  it('行列从 1 起，按换行算行', () => {
    expect(expressionLineColumn('abc', 2)).toEqual({ line: 1, column: 3 })
    expect(expressionLineColumn('a\nbc', 3)).toEqual({ line: 2, column: 2 })
  })

  it('问题区间单独成段；空区间向前或向后占一个字符；重叠部分归前一段', () => {
    expect(expressionSegments('a + bb', [view({ start: 4, end: 6 })])).toEqual([
      { text: 'a + ', start: 0, end: 4, issue: null, severity: null },
      { text: 'bb', start: 4, end: 6, issue: 0, severity: 'error' },
    ])
    expect(expressionSegments('a +', [view({ start: 3, end: 3 })]).map(s => [s.text, s.issue])).toEqual([['a ', null], ['+', 0]])
    expect(expressionSegments('abcd', [view({ start: 0, end: 3, severity: 'warning' }), view({ start: 2, end: 4 }, 1)]).map(s => [s.text, s.issue, s.severity])).toEqual([
      ['abc', 0, 'warning'],
      ['d', 1, 'error'],
    ])
    expect(expressionSegments('', [view({ start: 0, end: 0 })])).toEqual([{ text: '', start: 0, end: 0, issue: null, severity: null }])
  })
})

describe('expression-input 状态机：补全', () => {
  it('输入名字字符且有匹配才打开，高亮首条；输入非名字字符收起', () => {
    const { api } = makeService({ completions: VARIABLES })
    type(api(), 'am')
    expect(api().open).toBe(true)
    expect(api().items.map(item => item.label)).toEqual(['amount'])
    expect(api().highlightedKey).toBe('variable:amount')
    type(api(), 'am ')
    expect(api().open).toBe(false)
    type(api(), 'zzz')
    expect(api().open).toBe(false)
  })

  it('按 Ctrl+Space 主动打开：光标前没有名字也列出全部，没有匹配时开着显示空态', () => {
    const { api } = makeService({ completions: VARIABLES, functions: createFunctionTable({ builtins: 'none' }) })
    const event = keyEvent(' ', { ctrlKey: true }, 'Space')
    event.currentTarget = { value: '', selectionStart: 0 }
    ;((api().getInputProps() as Dict).onKeyDown as (e: unknown) => void)(event)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(api().open).toBe(true)
    expect(api().items).toHaveLength(3)
    type(api(), 'q')
    expect(api().open).toBe(true)
    expect(api().empty).toBe(true)
    expect(api().emptyText).toBe('No matches')
  })

  it('方向键移高亮并回绕，Enter 接受：函数插入 NAME()，光标落在括号里', () => {
    const select = vi.fn()
    const { api, service } = makeService({ onCompletionSelect: select })
    type(api(), 'TO')
    expect(api().items.map(item => item.label)).toEqual(['TODAY', 'TO_DATE', 'TO_NUMBER'])
    const keydown = (api().getInputProps() as Dict).onKeyDown as (e: unknown) => void
    keydown(keyEvent('ArrowDown'))
    expect(api().highlightedKey).toBe('fn:TO_DATE')
    keydown(keyEvent('ArrowUp'))
    keydown(keyEvent('ArrowUp'))
    expect(api().highlightedKey).toBe('fn:TO_NUMBER')
    const enter = keyEvent('Enter')
    ;((api().getInputProps() as Dict).onKeyDown as (e: unknown) => void)(enter)
    expect(enter.preventDefault).toHaveBeenCalled()
    expect(api().value).toBe('TO_NUMBER()')
    expect(service.context.get('caret')).toBe(10)
    expect(api().open).toBe(false)
    expect(select).toHaveBeenCalledWith({ completion: expect.objectContaining({ key: 'fn:TO_NUMBER' }) })
  })

  it('收起时 Enter 不接管；Escape 只拦冒泡；接着输入名字字符会再打开', () => {
    const { api } = makeService({ completions: VARIABLES })
    const enter = keyEvent('Enter')
    ;((api().getInputProps() as Dict).onKeyDown as (e: unknown) => void)(enter)
    expect(enter.preventDefault).not.toHaveBeenCalled()
    type(api(), 'ap')
    expect(api().open).toBe(true)
    api().close()
    expect(api().open).toBe(false)
    type(api(), 'app')
    expect(api().open).toBe(true)
  })

  it('成员访问的点之后列宿主给的成员', () => {
    const completions = vi.fn(({ member }: { member: string | null }) => (member === '$row' ? [{ label: 'price', kind: 'variable' as const }] : []))
    const { api } = makeService({ completions })
    type(api(), '$row.')
    expect(api().open).toBe(true)
    expect(api().items.map(item => item.label)).toEqual(['price'])
  })

  it('禁用与只读时不打开、不插入', () => {
    const { api } = makeService({ completions: VARIABLES, readOnly: true })
    type(api(), 'am')
    expect(api().open).toBe(false)
    api().insert('x')
    expect(api().value).toBe('')
  })

  it('insert 在选区处插入，替换选区，补全收起', () => {
    const { api, service } = makeService({ defaultValue: 'a + b' })
    const input = document.createElement('input')
    input.value = 'a + b'
    document.body.append(input)
    input.setSelectionRange(2, 3)
    service.refs.set('getInputEl', () => input)
    api().insert('*')
    expect(api().value).toBe('a * b')
    expect(service.context.get('caret')).toBe(3)
    input.remove()
  })

  it('输入法组合中不取词；落定后按落定的值重取', () => {
    const { api } = makeService({ completions: VARIABLES })
    const props = api().getInputProps() as Dict
    ;(props.onCompositionStart as () => void)()
    type(api(), 'am')
    expect(api().open).toBe(false)
    ;((api().getInputProps() as Dict).onCompositionEnd as (e: unknown) => void)({ currentTarget: { value: 'am', selectionStart: 2 } })
    expect(api().open).toBe(true)
  })
})

describe('expression-input 状态机：检查', () => {
  const engine = createExpressionEngine()

  it('值变化后去抖检查，结果变了才通知；值为空时清空问题', () => {
    vi.useFakeTimers()
    const changes = vi.fn()
    const { api } = makeService({ check: createExpressionCheck(engine, { identifiers: ['price'] }), onIssuesChange: changes, checkDelay: 100 })
    vi.runAllTimers()
    type(api(), 'price + amont')
    expect(api().issues).toEqual([])
    vi.advanceTimersByTime(99)
    expect(changes).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(api().issues.map(issue => issue.message)).toEqual(['Unknown name amont'])
    expect(api().issues[0]!.text).toBe('Column 9: Unknown name amont')
    expect(api().invalid).toBe(true)
    expect(changes).toHaveBeenCalledTimes(1)
    type(api(), 'price + amont ')
    vi.advanceTimersByTime(100)
    expect(changes).toHaveBeenCalledTimes(1)
    type(api(), '')
    vi.advanceTimersByTime(100)
    expect(api().issues).toEqual([])
    expect(api().invalid).toBe(false)
  })

  it('失焦立即检查；高亮层只在源码与检查结果对得上时画问题段', () => {
    vi.useFakeTimers()
    const { api } = makeService({ check: createExpressionCheck(engine, { identifiers: [] }), translations: ZH })
    vi.runAllTimers()
    type(api(), 'ab')
    ;((api().getInputProps() as Dict).onBlur as (e: unknown) => void)({ currentTarget: document.createElement('input'), relatedTarget: null })
    expect(api().issues.map(issue => issue.text)).toEqual(['第 1 列：未知的名字 ab'])
    expect(api().segments.map(segment => segment.issue)).toEqual([0])
    type(api(), 'abc')
    expect(api().issues).toHaveLength(1)
    expect(api().segments.map(segment => segment.issue)).toEqual([null])
  })

  it('多行宿主的位置带行号；作者渲染了问题列表且有问题时进描述链', () => {
    vi.useFakeTimers()
    const { api, setProps } = makeService({ check: createExpressionCheck(engine, { identifiers: ['a'] }), multiline: true, translations: ZH })
    vi.runAllTimers()
    type(api(), 'a +\nzz')
    vi.runAllTimers()
    expect(api().issues[0]!.text).toBe('第 2 行第 1 列：未知的名字 zz')
    expect((api().getInputProps({ as: 'textarea' }) as Dict)['aria-describedby']).toBeUndefined()
    setProps({ issuesRendered: true })
    expect((api().getInputProps({ as: 'textarea' }) as Dict)['aria-describedby']).toBe((api().getIssuesProps() as Dict).id)
  })

  it('warning 不让输入框无效；作者给的 invalid 与 error 取或', () => {
    vi.useFakeTimers()
    const { api, setProps } = makeService({ check: () => [{ start: 0, end: 1, message: '留意', severity: 'warning' }] })
    vi.runAllTimers()
    type(api(), 'a')
    vi.runAllTimers()
    expect(api().issues).toHaveLength(1)
    expect(api().invalid).toBe(false)
    setProps({ invalid: true })
    expect(api().invalid).toBe(true)
  })
})

describe('expression-input connect：角色', () => {
  it('单行写 combobox 与 aria-expanded，多行保持 textbox 并不写 aria-expanded', () => {
    const { api } = makeService()
    const single = api().getInputProps() as Dict
    expect([single.role, single['aria-expanded'], single['aria-autocomplete'], single.type]).toEqual(['combobox', 'false', 'list', 'text'])
    const multi = api().getInputProps({ as: 'textarea' }) as Dict
    expect([multi.role, multi['aria-expanded'], multi['aria-autocomplete'], multi.type]).toEqual([undefined, undefined, 'list', undefined])
    expect(multi['aria-controls']).toBe((api().getContentProps() as Dict).id)
  })

  it('打开时 aria-activedescendant 指向高亮条目的 id', () => {
    const { api } = makeService({ completions: VARIABLES })
    type(api(), 'app')
    const item = api().items[0]!
    expect((api().getInputProps() as Dict)['aria-activedescendant']).toBe((api().getItemProps({ item }) as Dict).id)
  })
})
