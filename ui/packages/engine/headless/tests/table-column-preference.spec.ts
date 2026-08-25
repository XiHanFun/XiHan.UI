// 列偏好：一份可序列化的状态，说的是「这张表这次要怎么显示列」。
//
// 库只负责把它算进生效列，存到哪儿归使用者——把存储通道焊进组件库
// 只会让它绑死一种后端。
import type { TableColumnDef } from '../src/table'
import { describe, expect, it } from 'vitest'
import { orderColumnIds, resolveTableColumns } from '../src/table'

const columns: TableColumnDef[] = [
  { id: 'name', label: '名称' },
  { id: 'owner', label: '负责人' },
  { id: 'status', label: '状态' },
  { id: 'time', label: '时间' },
]

function ids(pref?: Parameters<typeof resolveTableColumns>[2]): string[] {
  return resolveTableColumns(columns, [], pref).map(c => c.id)
}

describe('列序', () => {
  it('不给偏好就是作者给的原顺序', () => {
    expect(ids()).toEqual(['name', 'owner', 'status', 'time'])
  })

  it('只列一部分：列到的排在前面，没列到的按原顺序跟在后面', () => {
    // 「把时间挪到最前」不必把全表列一遍
    expect(ids({ order: ['time'] })).toEqual(['time', 'name', 'owner', 'status'])
  })

  it('order 里指向已不存在的列时跳过，不留空位', () => {
    expect(orderColumnIds(['a', 'b'], ['ghost', 'b'])).toEqual(['b', 'a'])
  })

  it('order 里重复的只认第一次', () => {
    expect(orderColumnIds(['a', 'b', 'c'], ['c', 'c', 'a'])).toEqual(['c', 'a', 'b'])
  })
})

describe('隐藏列', () => {
  it('藏掉的列整个不进网格', () => {
    expect(ids({ hidden: ['owner'] })).toEqual(['name', 'status', 'time'])
  })

  it('隐藏列不占列号：其余列跟着重排', () => {
    // 让隐藏列继续占列号，会让读屏报出一个数不到的格子
    const list = resolveTableColumns(columns, [], { hidden: ['name', 'status'] })
    expect(list.map(c => c.id)).toEqual(['owner', 'time'])
  })

  it('藏与排同时给：先排后藏，结果稳定', () => {
    expect(ids({ order: ['time', 'status'], hidden: ['status'] })).toEqual(['time', 'name', 'owner'])
  })
})

describe('覆盖列宽与冻结', () => {
  it('偏好里的宽盖过列定义里的宽', () => {
    const defs: TableColumnDef[] = [{ id: 'a', width: 100 }]
    expect(resolveTableColumns(defs, [], { widths: { a: 240 } })[0]!.width).toBe(240)
  })

  it('没覆盖的列保留自己的宽', () => {
    const defs: TableColumnDef[] = [{ id: 'a', width: 100 }, { id: 'b', width: 50 }]
    const out = resolveTableColumns(defs, [], { widths: { a: 240 } })
    expect(out.map(c => c.width)).toEqual([240, 50])
  })

  it('冻结同理', () => {
    const defs: TableColumnDef[] = [{ id: 'a' }]
    expect(resolveTableColumns(defs, [], { sticky: { a: 'end' } })[0]!.sticky).toBe('end')
  })
})

describe('前缀列不受偏好摆布', () => {
  it('恒排在最前，藏不掉也挪不动', () => {
    const out = resolveTableColumns(columns, ['index', 'select'], {
      order: ['time'],
      hidden: ['__index__', 'name'],
    })
    // 前缀列是结构性的，由 prefixColumns 说了算；偏好只作用于作者定义的那些列
    expect(out.map(c => c.kind)).toEqual(['index', 'select', 'data', 'data', 'data'])
    expect(out.map(c => c.id)).toEqual(['__index__', '__select__', 'time', 'owner', 'status'])
  })
})
