import type { ComboboxNode, ComboboxSchema } from '../src/combobox'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { comboboxMachine, connectCombobox, filterComboboxNodes } from '../src/combobox'

const CITIES: ComboboxNode[] = [
  { value: 'beijing', label: 'Beijing 北京' },
  { value: 'berlin', label: 'Berlin 柏林' },
  { value: 'bern', label: 'Bern 伯尔尼' },
  { value: 'london', label: 'London 伦敦' },
  { value: 'lisbon' },
]

/** 不接 DOM：候选全按 collection 结算，flush 推迟的收尾等一拍微任务。 */
function mount(props: ComboboxSchema['props']) {
  const runtime = createVanillaRuntime()
  const own = runtime.signal<ComboboxSchema['props']>(props)
  const service = createService(comboboxMachine, { props: () => own.get(), runtime })
  runtime.start()
  return {
    service,
    api: () => connectCombobox(service, normalizeProps),
    shown: () => connectCombobox(service, normalizeProps).collection.map(meta => meta.value),
    setProps: (next: ComboboxSchema['props']) => own.set({ ...own.get(), ...next }),
  }
}

async function settle(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

describe('filterComboboxNodes', () => {
  it('contains 按显示文本包含检索词，不分大小写；没有 label 的按 value 比', () => {
    expect(filterComboboxNodes(CITIES, 'BER', 'contains').map(n => n.value)).toEqual(['berlin', 'bern'])
    expect(filterComboboxNodes(CITIES, '伦敦', 'contains').map(n => n.value)).toEqual(['london'])
    expect(filterComboboxNodes(CITIES, 'lis', 'contains').map(n => n.value)).toEqual(['lisbon'])
  })

  it('startsWith 只认以检索词开头的', () => {
    expect(filterComboboxNodes(CITIES, 'b', 'startsWith').map(n => n.value)).toEqual(['beijing', 'berlin', 'bern'])
    expect(filterComboboxNodes(CITIES, '北京', 'startsWith')).toEqual([])
  })

  it('自定义函数拿到 trim 过的检索词；保持 collection 原序', () => {
    const filter = vi.fn((node: ComboboxNode, query: string) => node.value.endsWith(query))
    expect(filterComboboxNodes(CITIES, '  n ', filter).map(n => n.value)).toEqual(['berlin', 'bern', 'london', 'lisbon'])
    expect(filter).toHaveBeenCalledWith(CITIES[0], 'n')
  })

  it('没给 filter 或检索词为空白时原样返回', () => {
    expect(filterComboboxNodes(CITIES, 'ber', undefined)).toBe(CITIES)
    expect(filterComboboxNodes(CITIES, '   ', 'contains')).toBe(CITIES)
  })

  it('认不得的口径直接报错，原型链上的名字也不算', () => {
    expect(() => filterComboboxNodes(CITIES, 'b', 'fuzzy' as never)).toThrow(/只认/)
    expect(() => filterComboboxNodes(CITIES, 'b', 'toString' as never)).toThrow(/只认/)
  })
})

describe('组合框的内置过滤', () => {
  it('没给 filter 时与从前一样：collection 原样就是候选', async () => {
    const h = mount({ collection: CITIES })
    h.service.send({ type: 'INPUT.CHANGE', value: 'ber' })
    await settle()
    expect(h.shown()).toEqual(CITIES.map(c => c.value))
  })

  it('打字即按检索词筛，条数与空态跟着候选走', async () => {
    const h = mount({ collection: CITIES, filter: 'contains' })
    h.service.send({ type: 'INPUT.CHANGE', value: 'ber' })
    await settle()
    expect(h.api().open).toBe(true)
    expect(h.shown()).toEqual(['berlin', 'bern'])

    h.service.send({ type: 'INPUT.CHANGE', value: 'zzz' })
    h.service.send({ type: 'ITEMS.SYNC' })
    await settle()
    expect(h.shown()).toEqual([])
    expect(h.api().empty).toBe(true)
  })

  it('单选选中后输入框回显选中项文字，但再展开看到全部候选', async () => {
    const h = mount({ collection: CITIES, filter: 'contains' })
    h.service.send({ type: 'INPUT.CHANGE', value: 'ber' })
    h.service.send({ type: 'ITEM.SELECT', value: 'berlin', label: 'Berlin 柏林' })
    await settle()
    expect(h.api().inputValue).toBe('Berlin 柏林')
    expect(h.api().open).toBe(false)

    h.service.send({ type: 'OPEN' })
    expect(h.shown()).toEqual(CITIES.map(c => c.value))
    // 接着改字又按新打的字筛
    h.service.send({ type: 'INPUT.CHANGE', value: 'Bern' })
    expect(h.shown()).toEqual(['bern'])
  })

  it('内联补全把输入框补成整段文字，候选仍按用户打的那几个字筛', async () => {
    const h = mount({ collection: CITIES, filter: 'startsWith', inputBehavior: 'autocomplete' })
    // 内联补全只用到输入框的 value 与 setSelectionRange
    const input = { value: '', setSelectionRange: vi.fn(), focus: vi.fn() }
    h.service.refs.set('getInputEl', () => input as never)
    h.service.send({ type: 'INPUT.CHANGE', value: 'be' })
    await settle()
    expect(h.api().inputValue).toBe('Beijing 北京')
    expect(h.api().highlightedValue).toBe('beijing')
    expect(h.shown()).toEqual(['beijing', 'berlin', 'bern'])
  })

  it('失焦对齐、清空与多选选中都让检索词作废', async () => {
    const h = mount({ collection: CITIES, filter: 'contains', multiple: true })
    h.service.send({ type: 'INPUT.CHANGE', value: 'lon' })
    expect(h.shown()).toEqual(['london'])
    h.service.send({ type: 'ITEM.SELECT', value: 'london', label: 'London 伦敦' })
    expect(h.api().inputValue).toBe('')
    expect(h.shown()).toEqual(CITIES.map(c => c.value))

    h.service.send({ type: 'INPUT.CHANGE', value: 'ber' })
    h.service.send({ type: 'INPUT.BLUR' })
    expect(h.shown()).toEqual(CITIES.map(c => c.value))
  })

  it('已选项不在当下候选里时，标签文字照样从全集取', async () => {
    const h = mount({ collection: CITIES, filter: 'contains', multiple: true, defaultValue: ['london'] })
    h.service.send({ type: 'INPUT.CHANGE', value: 'ber' })
    expect(h.shown()).toEqual(['berlin', 'bern'])
    expect(h.api().tags).toEqual([{ value: 'london', key: 'london', label: 'London 伦敦' }])
  })

  it('程序化 setInputValue 也按写进来的串筛', () => {
    const h = mount({ collection: CITIES, filter: 'contains' })
    h.api().setInputValue('伯尔尼')
    expect(h.shown()).toEqual(['bern'])
  })
})
