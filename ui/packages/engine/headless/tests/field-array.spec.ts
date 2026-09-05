// @vitest-environment jsdom
import type { FieldArraySchema } from '../src/field-array'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectFieldArray, fieldArrayMachine, fieldArrayTriggerId } from '../src/field-array'
import { atRowMax, atRowMin, moveRow, rowBound, sameRows } from '../src/field-array/field-array.machine'

type Props = FieldArraySchema['props']

function makeService(props: Props = {}) {
  const runtime = createVanillaRuntime()
  // 同一个对象原样返回：service 按返回值身份缓存 props，原地改字段即可模拟宿主写回
  const service = createService(fieldArrayMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

type Svc = ReturnType<typeof makeService>

function api(service: Svc) {
  return connectFieldArray(service, normalizeProps)
}

function keys(service: Svc): string[] {
  return api(service).items.map(row => row.key)
}

/** flush 走微任务，等两拍就够；不掐固定毫秒。 */
async function settle(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

/**
 * 按 connect 会写出的 id 造一批真把手节点。
 * 机器还焦点时靠 id 从 scope 里捞节点，这里的算法与 connect 共用同一个导出。
 */
function mountTriggers(service: Svc, rows: number) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const make = (id: string): HTMLButtonElement => {
    const el = document.createElement('button')
    el.id = id
    host.appendChild(el)
    return el
  }
  return {
    add: make(fieldArrayTriggerId(service.scope, 'add-trigger')),
    remove: Array.from({ length: rows }, (_, i) => make(fieldArrayTriggerId(service.scope, 'item-delete-trigger', i))),
    moveUp: Array.from({ length: rows }, (_, i) => make(fieldArrayTriggerId(service.scope, 'move-up-trigger', i))),
    moveDown: Array.from({ length: rows }, (_, i) => make(fieldArrayTriggerId(service.scope, 'move-down-trigger', i))),
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('纯函数：行数与位置', () => {
  it('moveRow 把一项挪到新位置，不改原数组', () => {
    const list = ['a', 'b', 'c']
    expect(moveRow(list, 1, 0)).toEqual(['b', 'a', 'c'])
    expect(moveRow(list, 0, 2)).toEqual(['b', 'c', 'a'])
    expect(moveRow(list, 2, 2)).toEqual(['a', 'b', 'c'])
    expect(list).toEqual(['a', 'b', 'c'])
  })

  it('moveRow 下标越界就原样返回一份拷贝', () => {
    const list = ['a', 'b']
    expect(moveRow(list, 5, 0)).toEqual(['a', 'b'])
    expect(moveRow(list, 0, -1)).toEqual(['a', 'b'])
    expect(moveRow(list, 0, 1)).not.toBe(list)
  })

  it('sameRows 逐项比引用，不比内容', () => {
    const row = { a: 1 }
    expect(sameRows([row], [row])).toBe(true)
    expect(sameRows([{ a: 1 }], [{ a: 1 }])).toBe(false)
    expect(sameRows([1, 2], [1])).toBe(false)
    expect(sameRows([], undefined)).toBe(false)
  })

  it('rowBound 把负数与非有限值当"没给"', () => {
    expect(rowBound(3)).toBe(3)
    expect(rowBound(2.7)).toBe(2)
    expect(rowBound(-1)).toBeUndefined()
    expect(rowBound(Number.NaN)).toBeUndefined()
    expect(rowBound(undefined)).toBeUndefined()
  })

  it('min 缺省为 0，空列表因此也算到底；max 缺省不限', () => {
    expect(atRowMin(0, undefined)).toBe(true)
    expect(atRowMin(1, undefined)).toBe(false)
    expect(atRowMin(2, 2)).toBe(true)
    expect(atRowMax(9, undefined)).toBe(false)
    expect(atRowMax(2, 2)).toBe(true)
  })
})

describe('行号：跟着增删换序走，不跟着行数据走', () => {
  it('删中间一行：剩下的行号原样不动，接位的那一行不会顶用别人的号', () => {
    const service = makeService({ defaultValue: ['甲', '乙', '丙'] })
    const before = keys(service)
    expect(new Set(before).size).toBe(3)

    api(service).remove(1)
    expect(api(service).value).toEqual(['甲', '丙'])
    // 删的是中间那一项，首尾两行的号必须原封不动
    expect(keys(service)).toEqual([before[0], before[2]])
  })

  it('新增一行：末尾补一个从没用过的号', () => {
    const service = makeService({ defaultValue: ['甲'], createItem: () => '乙' })
    const before = keys(service)

    api(service).add()
    const after = keys(service)
    expect(after[0]).toBe(before[0])
    expect(after).toHaveLength(2)
    expect(after[1]).not.toBe(before[0])

    // 删掉再加，新的一行也不许捡回刚退场那个号
    api(service).remove(1)
    api(service).add()
    expect(keys(service)[1]).not.toBe(after[1])
  })

  it('换序：号跟着这一行走', () => {
    const service = makeService({ defaultValue: ['甲', '乙', '丙'], movable: true })
    const before = keys(service)

    api(service).moveUp(1)
    expect(api(service).value).toEqual(['乙', '甲', '丙'])
    expect(keys(service)).toEqual([before[1], before[0], before[2]])

    api(service).moveDown(0)
    expect(keys(service)).toEqual([before[0], before[1], before[2]])
  })

  it('宿主原地改行数据、行数没变：号一个都不动', () => {
    const rows = [{ v: 1 }, { v: 2 }, { v: 3 }]
    const service = makeService({ defaultValue: rows })
    const before = keys(service)

    // 整份重建，每一行都是新对象——正是不可变写法每敲一个字会做的事
    api(service).setValue(rows.map(row => ({ ...row })))
    expect(keys(service)).toEqual(before)
  })

  it('宿主整份换掉且行数变了：按位置续用旧号，长出来的补新号', () => {
    const service = makeService({ defaultValue: ['甲', '乙'] })
    const before = keys(service)

    api(service).setValue(['甲', '乙', '丙', '丁'])
    const after = keys(service)
    expect(after.slice(0, 2)).toEqual(before)
    expect(new Set(after).size).toBe(4)

    api(service).setValue(['甲'])
    expect(keys(service)).toEqual([before[0]])
  })

  it('行号只在列表内唯一，不承诺是宿主数据里的 id；重复的行数据各拿各的号', () => {
    const service = makeService({ defaultValue: ['同', '同', '同'] })
    expect(new Set(keys(service)).size).toBe(3)
  })
})

describe('闸门：上下限与禁用', () => {
  it('到 max 加不动，到 min 删不动，回调一次都不发', () => {
    const onValueChange = vi.fn()
    const service = makeService({ defaultValue: ['甲', '乙'], min: 2, max: 2, onValueChange })

    expect(api(service).atMin).toBe(true)
    expect(api(service).atMax).toBe(true)
    expect(api(service).canAdd).toBe(false)

    api(service).add()
    api(service).remove(0)
    expect(api(service).value).toEqual(['甲', '乙'])
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('没开 movable 就换不了序', () => {
    const service = makeService({ defaultValue: ['甲', '乙'] })
    api(service).moveDown(0)
    expect(api(service).value).toEqual(['甲', '乙'])

    const movable = makeService({ defaultValue: ['甲', '乙'], movable: true })
    api(movable).moveDown(0)
    expect(api(movable).value).toEqual(['乙', '甲'])
  })

  it('disabled 时三路都推不动，整份替换仍走得通', () => {
    const service = makeService({ defaultValue: ['甲', '乙'], movable: true, disabled: true })
    api(service).add()
    api(service).remove(0)
    api(service).moveDown(0)
    expect(api(service).value).toEqual(['甲', '乙'])

    api(service).setValue(['丙'])
    expect(api(service).value).toEqual(['丙'])
  })

  it('没给 createItem 就补一个 null', () => {
    const service = makeService({ defaultValue: [] })
    api(service).add()
    expect(api(service).value).toEqual([null])
  })
})

describe('受控：宿主说了算', () => {
  it('宿主不写回时值与行号都不动，回调照发', () => {
    const onValueChange = vi.fn()
    const props: Props = { value: ['甲', '乙', '丙'], onValueChange }
    const service = makeService(props)
    const before = keys(service)

    api(service).remove(1)
    expect(onValueChange).toHaveBeenCalledWith({ value: ['甲', '丙'] })
    expect(api(service).value).toEqual(['甲', '乙', '丙'])
    expect(keys(service)).toEqual(before)
  })
})

describe('焦点：把手离场或换位之后接得住', () => {
  it('删一行：焦点接给接位的那一行', async () => {
    const service = makeService({ defaultValue: ['甲', '乙', '丙'] })
    const els = mountTriggers(service, 3)
    els.remove[2]!.focus()

    service.send({ type: 'ITEM.REMOVE', index: 2, restoreFocus: true })
    await settle()
    // 删的是末行，接位的是现在的最后一行
    expect(document.activeElement).toBe(els.remove[1])
  })

  it('删到一行不剩：焦点交回新增把手', async () => {
    const service = makeService({ defaultValue: ['甲'] })
    const els = mountTriggers(service, 1)
    els.remove[0]!.focus()

    service.send({ type: 'ITEM.REMOVE', index: 0, restoreFocus: true })
    await settle()
    expect(document.activeElement).toBe(els.add)
  })

  it('换序：焦点落到新位置上同方向的那个把手', async () => {
    const service = makeService({ defaultValue: ['甲', '乙', '丙'], movable: true })
    const els = mountTriggers(service, 3)
    els.moveUp[2]!.focus()

    service.send({ type: 'ITEM.MOVE', from: 2, to: 1, restoreFocus: true })
    await settle()
    expect(document.activeElement).toBe(els.moveUp[1])

    els.moveDown[0]!.focus()
    service.send({ type: 'ITEM.MOVE', from: 0, to: 1, restoreFocus: true })
    await settle()
    expect(document.activeElement).toBe(els.moveDown[1])
  })

  it('程序化调 api.remove 不抢焦点', async () => {
    const service = makeService({ defaultValue: ['甲', '乙'] })
    const els = mountTriggers(service, 2)
    els.add.focus()

    api(service).remove(0)
    await settle()
    expect(document.activeElement).toBe(els.add)
  })
})
