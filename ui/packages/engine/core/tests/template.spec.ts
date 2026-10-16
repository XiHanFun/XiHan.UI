// 文本模板：路径写法与 formatJsonPath 一致（下标明写、引号键、宿主变量）、问题区间、占位里不能写表达式、
// 填充时只读自有属性与数组下标、显示规则与 nonScalar、已解析模板与自定义显示、单独调用缺省显示规则。
import { describe, expect, it } from 'vitest'
import { displayText, fillTextTemplate, parseTextTemplate } from '../src/template'

describe('解析文本模板', () => {
  it('切出原样文本与路径占位，占位两侧空白忽略，下标写成 [0]', () => {
    expect(parseTextTemplate('订单 {{ order.items[0].name }} 共 {{$pages}} 页')).toEqual({
      segments: [
        { kind: 'text', text: '订单 ' },
        { kind: 'path', path: ['order', 'items', 0, 'name'], source: 'order.items[0].name' },
        { kind: 'text', text: ' 共 ' },
        { kind: 'path', path: ['$pages'], source: '$pages' },
        { kind: 'text', text: ' 页' },
      ],
      issues: [],
    })
  })

  it('不是标识符的键用引号写，中文名可以直接写', () => {
    expect(parseTextTemplate('{{客户.名称}}{{row["unit price"]}}').segments).toEqual([
      { kind: 'path', path: ['客户', '名称'], source: '客户.名称' },
      { kind: 'path', path: ['row', 'unit price'], source: 'row["unit price"]' },
    ])
  })

  it('空占位、不合法路径与未闭合的占位都报问题，带区间，原样保留成文本', () => {
    const parsed = parseTextTemplate('a{{ }}b{{x y}}c{{ok}}d{{tail')
    expect(parsed.issues).toEqual([
      { code: 'empty-placeholder', start: 1, end: 6 },
      { code: 'invalid-path', start: 7, end: 14 },
      { code: 'unclosed-placeholder', start: 22, end: 28 },
    ])
    expect(parsed.segments).toEqual([
      { kind: 'text', text: 'a{{ }}b{{x y}}c' },
      { kind: 'path', path: ['ok'], source: 'ok' },
      { kind: 'text', text: 'd{{tail' },
    ])
  })

  it.each(['price * qty', 'a..b', 'a.0', 'items[01]', 'a.constructor', '__proto__'])('占位 %j 不合法', (content) => {
    expect(parseTextTemplate(`{{${content}}}`).issues.map(issue => issue.code)).toEqual(['invalid-path'])
  })

  it('结果冻结，source 不是字符串时抛 TypeError', () => {
    expect(Object.isFrozen(parseTextTemplate('{{a}}').segments[0])).toBe(true)
    expect(() => parseTextTemplate(1 as never)).toThrow(TypeError)
  })
})

describe('填充文本模板', () => {
  const data = {
    order: { no: 'SO-1', items: [{ name: '笔' }, { name: '纸' }], total: 12.5, paid: false, at: new Date('2026-10-16T08:00:00Z') },
    $page: 'iii',
    $pages: 7,
  }

  it('按数据替换占位，数组按下标读，宿主变量与数据一样读取', () => {
    expect(fillTextTemplate('{{order.no}}：{{order.items[1].name}}，合计 {{order.total}}，已付 {{order.paid}}，第 {{$page}} / {{$pages}} 页', data))
      .toEqual({ text: 'SO-1：纸，合计 12.5，已付 false，第 iii / 7 页', nonScalar: [] })
  })

  it('读不到的路径、继承属性、越界下标与对数组按键读都得到空串', () => {
    expect(fillTextTemplate('[{{missing.x}}][{{order.toString}}][{{order.items[5].name}}][{{order.items.name}}]', data).text).toBe('[][][][]')
  })

  it('日期转 ISO 文本，非有限数字为空串，对象与数组记入 nonScalar', () => {
    const filled = fillTextTemplate('{{order.at}}|{{n}}|{{order.items}}|{{order}}', { ...data, n: Number.NaN })
    expect(filled).toEqual({ text: '2026-10-16T08:00:00.000Z|||', nonScalar: ['order.items', 'order'] })
  })

  it('不合法的占位按原样保留', () => {
    expect(fillTextTemplate('{{ a b }} {{order.no}}', data).text).toBe('{{ a b }} SO-1')
  })

  it('可以传入已解析的模板与自定义显示规则', () => {
    const parsed = parseTextTemplate('{{order.total}} / {{order.items}}')
    const display = (value: unknown, path: string): string | undefined => (typeof value === 'number' ? value.toFixed(2) : path === 'order.items' ? undefined : String(value))
    expect(fillTextTemplate(parsed, data, { display })).toEqual({ text: '12.50 / ', nonScalar: ['order.items'] })
  })
})

describe('缺省显示规则', () => {
  it('空值为空串，字符串原样，有限数字、布尔与 bigint 转字符串', () => {
    expect([null, undefined, '', 'a b', 1.5, -0, false, 12n].map(displayText)).toEqual(['', '', '', 'a b', '1.5', '0', 'false', '12'])
  })

  it('非有限数字与无效日期为空串，有效日期转 ISO 文本', () => {
    expect([Number.NaN, Number.POSITIVE_INFINITY, new Date(Number.NaN), new Date(Date.UTC(2026, 9, 16))].map(displayText))
      .toEqual(['', '', '', '2026-10-16T00:00:00.000Z'])
  })

  it('对象、数组、函数与 symbol 不能直接显示，返回 undefined', () => {
    expect([{ a: 1 }, [1], () => 1, Symbol('s')].map(displayText)).toEqual([undefined, undefined, undefined, undefined])
  })

  it('与 fillTextTemplate 的缺省显示一致', () => {
    const values = { a: 1.5, b: null, c: new Date(Date.UTC(2026, 0, 1)), d: [1] }
    const filled = fillTextTemplate('{{a}}|{{b}}|{{c}}|{{d}}', values)
    expect(filled.text).toBe([values.a, values.b, values.c, values.d].map(value => displayText(value) ?? '').join('|'))
  })
})
