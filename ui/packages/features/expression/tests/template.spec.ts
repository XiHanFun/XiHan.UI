import { describe, expect, it } from 'vitest'
import { fillTextTemplate, parseTextTemplate, splitTemplatePath } from '../src/template'

describe('数据路径', () => {
  it('按 . 拆分，宿主变量的 $ 前缀与中文都可以', () => {
    expect(splitTemplatePath('order.items.0.name')).toEqual(['order', 'items', '0', 'name'])
    expect(splitTemplatePath('$page')).toEqual(['$page'])
    expect(splitTemplatePath('客户.名称')).toEqual(['客户', '名称'])
  })

  it.each(['', 'a..b', '.a', 'a.', 'a b', 'a[0]', 'a{b}', '__proto__', 'a.constructor', 'prototype.x'])('%j 不合法', (text) => {
    expect(splitTemplatePath(text)).toBeUndefined()
  })
})

describe('解析文本模板', () => {
  it('切出原样文本与路径占位，占位两侧空白忽略', () => {
    expect(parseTextTemplate('订单 {{ order.no }} 共 {{$pages}} 页')).toEqual({
      segments: [
        { kind: 'text', text: '订单 ' },
        { kind: 'path', path: ['order', 'no'], source: 'order.no' },
        { kind: 'text', text: ' 共 ' },
        { kind: 'path', path: ['$pages'], source: '$pages' },
        { kind: 'text', text: ' 页' },
      ],
      issues: [],
    })
  })

  it('空占位、不合法路径与未闭合的占位都报问题，带区间，原样保留成文本', () => {
    const parsed = parseTextTemplate('a{{ }}b{{x y}}c{{ok}}d{{tail')
    expect(parsed.issues).toEqual([
      { code: 'XH_EXPR_TEMPLATE_EMPTY', start: 1, end: 6 },
      { code: 'XH_EXPR_TEMPLATE_INVALID_PATH', start: 7, end: 14 },
      { code: 'XH_EXPR_TEMPLATE_UNCLOSED', start: 22, end: 28 },
    ])
    expect(parsed.segments).toEqual([
      { kind: 'text', text: 'a{{ }}b{{x y}}c' },
      { kind: 'path', path: ['ok'], source: 'ok' },
      { kind: 'text', text: 'd{{tail' },
    ])
  })

  it('占位里不能写表达式', () => {
    expect(parseTextTemplate('{{ price * qty }}').issues.map(issue => issue.code)).toEqual(['XH_EXPR_TEMPLATE_INVALID_PATH'])
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
    expect(fillTextTemplate('{{order.no}}：{{order.items.1.name}}，合计 {{order.total}}，已付 {{order.paid}}，第 {{$page}} / {{$pages}} 页', data))
      .toEqual({ text: 'SO-1：纸，合计 12.5，已付 false，第 iii / 7 页', nonScalar: [] })
  })

  it('读不到的路径、继承属性与带前导 0 的下标都得到空串', () => {
    expect(fillTextTemplate('[{{missing.x}}][{{order.toString}}][{{order.items.01.name}}][{{order.items.name}}]', data).text).toBe('[][][][]')
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
