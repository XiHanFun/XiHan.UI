// 推断字段树：从 JSON 样例推断（类型、日期、图片地址、列表合并、空值与混合类型、深度与样本上限、键名），
// 从 JSON Schema 推断（格式、$ref、循环与外部引用、allOf、oneOf / anyOf、字典、元组、注解），以及把导入的字段并进现有字段。
import type { DataField } from '../src'
import type { FieldInferenceResult } from '../src/field-inference'
import { describe, expect, it } from 'vitest'
import { listDataFields } from '../src'
import { dataFieldsFromJsonSchema, inferDataFields, mergeDataFields } from '../src/field-inference'

function notesOf(result: FieldInferenceResult): string[] {
  return result.notes.map(note => `${note.code} ${JSON.stringify(note.path)}`)
}

describe('inferDataFields', () => {
  it('对象样例：按值推断种类与类型，日期与日期时间单独识别，对象数组合并各项的键', () => {
    const result = inferDataFields({
      no: 'SO-1',
      date: '2026-10-19',
      at: '2026-10-19T08:30:00Z',
      local: '2026-10-19 08:30',
      total: 12.5,
      paid: false,
      customer: { name: '甲', phone: null },
      items: [{ sku: 'A', qty: 2 }, { sku: 'B', qty: 1, note: 'x' }],
      tags: ['a', 'b'],
      empty: [],
    })
    expect(result.fields).toEqual([
      { name: 'no', kind: 'value', type: 'string' },
      { name: 'date', kind: 'value', type: 'date' },
      { name: 'at', kind: 'value', type: 'datetime' },
      { name: 'local', kind: 'value', type: 'datetime' },
      { name: 'total', kind: 'value', type: 'number' },
      { name: 'paid', kind: 'value', type: 'boolean' },
      { name: 'customer', kind: 'object', children: [
        { name: 'name', kind: 'value', type: 'string' },
        { name: 'phone', kind: 'value', type: 'string' },
      ] },
      { name: 'items', kind: 'list', children: [
        { name: 'sku', kind: 'value', type: 'string' },
        { name: 'qty', kind: 'value', type: 'number' },
        { name: 'note', kind: 'value', type: 'string' },
      ] },
      { name: 'tags', kind: 'list', type: 'string' },
      { name: 'empty', kind: 'list' },
    ])
    expect(notesOf(result)).toEqual(['all-null ["customer","phone"]', 'scalar-list ["tags"]', 'empty-list ["empty"]'])
    expect([...result.annotations]).toEqual([['customer.phone', { nullable: true }]])
    expect(() => listDataFields(result.fields)).not.toThrow()
  })

  it('根是数组时包成一个列表字段，名字缺省 items；根是标量或 null 时报 invalid-root', () => {
    expect(inferDataFields([{ a: 1 }]).fields).toEqual([{ name: 'items', kind: 'list', children: [{ name: 'a', kind: 'value', type: 'number' }] }])
    expect(inferDataFields([{ a: 1 }], { rootName: 'rows' }).fields[0]!.name).toBe('rows')
    for (const sample of ['x', 1, true, null]) {
      const result = inferDataFields(sample)
      expect([result.fields, notesOf(result)], String(sample)).toEqual([[], ['invalid-root []']])
    }
  })

  it('同一路径几种标量混在一起按文本并记 mixed-type；数字加 null 仍是数字，只标 nullable', () => {
    const result = inferDataFields([{ v: 1, n: 1 }, { v: 'a', n: null }, { v: null, n: 2 }])
    expect(result.fields).toEqual([{ name: 'items', kind: 'list', children: [
      { name: 'v', kind: 'value', type: 'string' },
      { name: 'n', kind: 'value', type: 'number' },
    ] }])
    expect(result.notes).toEqual([{ code: 'mixed-type', path: ['items', 'v'], params: { types: ['number', 'string'] } }])
    expect(result.annotations.get('items.v')).toEqual({ nullable: true })
    expect(result.annotations.get('items.n')).toEqual({ nullable: true })
  })

  it('既有对象又有标量时取对象；数组的数组只取第一层；只见到 null 的数组按空列表', () => {
    const result = inferDataFields({ v: [{ x: { a: 1 } }, { x: 2 }], m: [[1, 2], [3]], z: [null] })
    expect(result.fields).toEqual([
      { name: 'v', kind: 'list', children: [{ name: 'x', kind: 'object', children: [{ name: 'a', kind: 'value', type: 'number' }] }] },
      { name: 'm', kind: 'list' },
      { name: 'z', kind: 'list' },
    ])
    expect(notesOf(result)).toEqual(['mixed-shape ["v","x"]', 'nested-list ["m"]', 'empty-list ["z"]'])
  })

  it('日期识别：写法不合法的按文本，日期与日期时间混在一起按日期时间，可以关掉', () => {
    expect(inferDataFields({ d: ['2026-10-19', '2026-02-30'] }).fields[0]).toEqual({ name: 'd', kind: 'list', type: 'string' })
    expect(inferDataFields([{ d: '2026-10-19' }, { d: '2026-10-19T08:00:00+08:00' }]).fields[0]!.children).toEqual([{ name: 'd', kind: 'value', type: 'datetime' }])
    expect(inferDataFields({ d: '2026-10-19' }, { detectDates: false }).fields).toEqual([{ name: 'd', kind: 'value', type: 'string' }])
  })

  it('打开 detectImages 时，data:image 与以图片扩展名结尾的地址标成图片内容', () => {
    const sample = { logo: 'https://example.com/a/logo.PNG?v=2', pic: 'data:image/png;base64,AAAA', page: 'https://example.com/a', mixed: ['https://example.com/a.jpg', 'x'] }
    expect(inferDataFields(sample, { detectImages: true }).fields).toEqual([
      { name: 'logo', kind: 'value', type: 'string', content: 'image' },
      { name: 'pic', kind: 'value', type: 'string', content: 'image' },
      { name: 'page', kind: 'value', type: 'string' },
      { name: 'mixed', kind: 'list', type: 'string' },
    ])
    expect(inferDataFields(sample).fields[0]).toEqual({ name: 'logo', kind: 'value', type: 'string' })
  })

  it('空键名跳过并记 invalid-name；键按首次出现的顺序', () => {
    const result = inferDataFields([{ 'b': 1, '': 2 }, { a: 3, b: 4 }])
    expect(result.fields[0]!.children!.map(field => field.name)).toEqual(['b', 'a'])
    expect(notesOf(result)).toEqual(['invalid-name ["items",""]'])
  })

  it('超出深度的对象不再展开，超出样本上限的数组项不看', () => {
    const deep = inferDataFields({ a: { b: { c: 1 } } }, { maxDepth: 2 })
    expect(deep.fields).toEqual([{ name: 'a', kind: 'object', children: [{ name: 'b', kind: 'object' }] }])
    expect(notesOf(deep)).toEqual(['depth-limit ["a","b"]'])
    const many = inferDataFields({ l: [{ a: 1 }, { b: 2 }, { c: 3 }] }, { sampleLimit: 2 })
    expect(many.fields[0]!.children!.map(field => field.name)).toEqual(['a', 'b'])
    expect(many.notes).toEqual([{ code: 'sample-limit', path: ['l'], params: { limit: 2, count: 3 } }])
  })

  it('不改动传入的样例', () => {
    const sample = { a: [{ b: 1 }] }
    const before = JSON.stringify(sample)
    inferDataFields(sample)
    expect(JSON.stringify(sample)).toBe(before)
  })
})

describe('dataFieldsFromJsonSchema', () => {
  it('对象的 properties 按书写顺序成为字段：格式、整数、布尔、$defs 引用、枚举与注解', () => {
    const result = dataFieldsFromJsonSchema({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      required: ['no'],
      properties: {
        no: { type: 'string', title: '单号', description: '业务单号', minLength: 1 },
        date: { type: 'string', format: 'date' },
        at: { type: 'string', format: 'date-time' },
        mail: { type: 'string', format: 'email' },
        qty: { type: 'integer', default: 1 },
        paid: { type: 'boolean' },
        status: { title: '状态', enum: ['draft', 'done'] },
        logo: { type: 'string', contentMediaType: 'image/png', contentEncoding: 'base64' },
        items: { type: 'array', items: { $ref: '#/$defs/Item' } },
      },
      $defs: {
        Item: { type: 'object', properties: { sku: { type: 'string' }, price: { type: 'number' } } },
      },
    })
    expect(result.fields).toEqual([
      { name: 'no', label: '单号', kind: 'value', type: 'string' },
      { name: 'date', kind: 'value', type: 'date' },
      { name: 'at', kind: 'value', type: 'datetime' },
      { name: 'mail', kind: 'value', type: 'string' },
      { name: 'qty', kind: 'value', type: 'number' },
      { name: 'paid', kind: 'value', type: 'boolean' },
      { name: 'status', label: '状态', kind: 'value', type: 'string' },
      { name: 'logo', kind: 'value', type: 'string', content: 'image' },
      { name: 'items', kind: 'list', children: [
        { name: 'sku', kind: 'value', type: 'string' },
        { name: 'price', kind: 'value', type: 'number' },
      ] },
    ])
    expect(result.notes).toEqual([])
    expect(Object.fromEntries(result.annotations)).toEqual({
      no: { description: '业务单号', required: true },
      mail: { format: 'email' },
      qty: { default: 1 },
      status: { enum: ['draft', 'done'] },
    })
    expect(() => listDataFields(result.fields)).not.toThrow()
  })

  it('可空：type 数组里的 null 与 oneOf 里只差 null 的一支，都只标 nullable', () => {
    const result = dataFieldsFromJsonSchema({ type: 'object', properties: {
      a: { type: ['number', 'null'] },
      b: { oneOf: [{ type: 'string', format: 'date' }, { type: 'null' }] },
      c: { type: 'null' },
    } })
    expect(result.fields).toEqual([
      { name: 'a', kind: 'value', type: 'number' },
      { name: 'b', kind: 'value', type: 'date' },
      { name: 'c', kind: 'value', type: 'string' },
    ])
    expect(Object.fromEntries(result.annotations)).toEqual({ a: { nullable: true }, b: { nullable: true }, c: { nullable: true } })
    expect(notesOf(result)).toEqual(['all-null ["c"]'])
  })

  it('allOf 合并各支，anyOf 全是对象时取并集，其余取第一支，都记 union', () => {
    const result = dataFieldsFromJsonSchema({ type: 'object', properties: {
      all: { allOf: [{ type: 'object', properties: { a: { type: 'string' } } }, { properties: { b: { type: 'number' } }, required: ['b'] }] },
      any: { anyOf: [{ type: 'object', properties: { a: { type: 'string' } } }, { type: 'object', properties: { c: { type: 'boolean' } } }] },
      either: { oneOf: [{ type: 'string' }, { type: 'number' }] },
      many: { type: ['string', 'number'] },
      free: {},
    } })
    expect(result.fields).toEqual([
      { name: 'all', kind: 'object', children: [{ name: 'a', kind: 'value', type: 'string' }, { name: 'b', kind: 'value', type: 'number' }] },
      { name: 'any', kind: 'object', children: [{ name: 'a', kind: 'value', type: 'string' }, { name: 'c', kind: 'value', type: 'boolean' }] },
      { name: 'either', kind: 'value', type: 'string' },
      { name: 'many', kind: 'value', type: 'string' },
      { name: 'free', kind: 'value', type: 'string' },
    ])
    expect(result.notes).toEqual([
      { code: 'union', path: ['any'], params: { count: 2 } },
      { code: 'union', path: ['either'], params: { count: 2 } },
      { code: 'mixed-type', path: ['many'], params: { types: ['number', 'string'] } },
      { code: 'mixed-type', path: ['free'], params: { types: [] } },
    ])
    expect(result.annotations.get('all.b')).toEqual({ required: true })
  })

  it('循环引用第二次出现时截断，外部引用按文本，字典不展开，元组取第一项，draft-07 的 definitions 也认', () => {
    const result = dataFieldsFromJsonSchema({
      $ref: '#/definitions/Node',
      definitions: {
        Node: { type: 'object', properties: {
          name: { type: 'string' },
          children: { type: 'array', items: { $ref: '#/definitions/Node' } },
          owner: { $ref: 'https://example.com/user.json' },
          meta: { type: 'object', additionalProperties: { type: 'string' } },
          point: { type: 'array', prefixItems: [{ type: 'number' }, { type: 'number' }] },
          pair: { type: 'array', items: [{ type: 'string' }] },
          grid: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
        } },
      },
    })
    expect(result.fields).toEqual([
      { name: 'name', kind: 'value', type: 'string' },
      { name: 'children', kind: 'list' },
      { name: 'owner', kind: 'value', type: 'string' },
      { name: 'meta', kind: 'object' },
      { name: 'point', kind: 'list', type: 'number' },
      { name: 'pair', kind: 'list', type: 'string' },
      { name: 'grid', kind: 'list' },
    ])
    expect(notesOf(result)).toEqual([
      'circular-ref ["children"]',
      'unresolved-ref ["owner"]',
      'dictionary ["meta"]',
      'tuple ["point"]',
      'scalar-list ["point"]',
      'tuple ["pair"]',
      'scalar-list ["pair"]',
      'nested-list ["grid"]',
    ])
  })

  it('根是数组时包成列表字段；根不是对象或数组时报 invalid-root', () => {
    expect(dataFieldsFromJsonSchema({ type: 'array', items: { type: 'object', properties: { a: { type: 'string' } } } }, { rootName: 'rows' }).fields)
      .toEqual([{ name: 'rows', kind: 'list', children: [{ name: 'a', kind: 'value', type: 'string' }] }])
    for (const schema of [{ type: 'string' }, 5, null, [{ type: 'object' }]]) {
      const result = dataFieldsFromJsonSchema(schema)
      expect([result.fields, notesOf(result)], JSON.stringify(schema)).toEqual([[], ['invalid-root []']])
    }
  })

  it('超出深度的对象不再展开，空属性名跳过', () => {
    const result = dataFieldsFromJsonSchema({ type: 'object', properties: { 'a': { type: 'object', properties: { b: { type: 'object', properties: { c: { type: 'string' } } } } }, '': { type: 'string' } } }, { maxDepth: 2 })
    expect(result.fields).toEqual([{ name: 'a', kind: 'object', children: [{ name: 'b', kind: 'object' }] }])
    expect(notesOf(result)).toEqual(['depth-limit ["a","b"]', 'invalid-name [""]'])
  })
})

describe('mergeDataFields', () => {
  const current: readonly DataField[] = [
    { name: 'no', label: '单号', kind: 'value' },
    { name: 'customer', kind: 'object', children: [{ name: 'name', label: '客户', kind: 'value', type: 'string' }] },
    { name: 'items', kind: 'list', children: [{ name: 'qty', kind: 'value' }] },
  ]

  it('同级按名字对齐：现有的显示名、类型与内容优先，缺的取导入的，新字段追加在后，子字段递归合并', () => {
    const incoming: readonly DataField[] = [
      { name: 'date', kind: 'value', type: 'date' },
      { name: 'no', label: '编号', kind: 'value', type: 'string' },
      { name: 'customer', kind: 'object', children: [{ name: 'name', label: '姓名', kind: 'value', type: 'number' }, { name: 'phone', kind: 'value' }] },
      { name: 'items', kind: 'list', children: [{ name: 'qty', kind: 'value', type: 'number' }] },
    ]
    expect(mergeDataFields(current, incoming)).toEqual({
      fields: [
        { name: 'no', label: '单号', kind: 'value', type: 'string' },
        { name: 'customer', kind: 'object', children: [{ name: 'name', label: '客户', kind: 'value', type: 'string' }, { name: 'phone', kind: 'value' }] },
        { name: 'items', kind: 'list', children: [{ name: 'qty', kind: 'value', type: 'number' }] },
        { name: 'date', kind: 'value', type: 'date' },
      ],
      conflicts: [],
    })
  })

  it('种类不同的保留现有的，记进 conflicts', () => {
    const incoming: readonly DataField[] = [{ name: 'customer', kind: 'value', type: 'string' }, { name: 'items', kind: 'object', children: [] }]
    const merged = mergeDataFields(current, incoming)
    expect(merged.fields).toEqual(current)
    expect(merged.conflicts).toEqual([
      { path: ['customer'], current: current[1], incoming: incoming[0] },
      { path: ['items'], current: current[2], incoming: incoming[1] },
    ])
  })
})
