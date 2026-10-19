// 撤销重做历史栈：只依赖「应用操作 → 新文档 + 逆操作」，验证撤销重做往返、合并连续输入、事务分组与回滚、
// 步数上限、封口、保存点、跳过无变化的执行、出错时状态不变，以及变化通知。
import type { ApplyOperation, HistoryChange } from '../src'
import { describe, expect, it, vi } from 'vitest'
import { createHistory, HISTORY_NUDGE_MERGE_WITHIN, nudgeMergeKey, snapshotHistory } from '../src'

type Doc = readonly string[]
type Op
  = | { type: 'insert', index: number, value: string }
    | { type: 'remove', index: number }
    | { type: 'set', index: number, value: string }

const apply: ApplyOperation<Doc, Op> = (doc, op) => {
  if (op.index < 0 || op.index > doc.length || (op.type !== 'insert' && op.index === doc.length))
    throw new RangeError(`index ${op.index} out of range`)
  switch (op.type) {
    case 'insert':
      return { document: [...doc.slice(0, op.index), op.value, ...doc.slice(op.index)], inverse: [{ type: 'remove', index: op.index }] }
    case 'remove':
      return { document: [...doc.slice(0, op.index), ...doc.slice(op.index + 1)], inverse: [{ type: 'insert', index: op.index, value: doc[op.index]! }] }
    case 'set':
      if (doc[op.index] === op.value)
        return { document: doc, inverse: [] }
      return { document: doc.map((v, i) => (i === op.index ? op.value : v)), inverse: [{ type: 'set', index: op.index, value: doc[op.index]! }] }
  }
}

const insert = (index: number, value: string): Op => ({ type: 'insert', index, value })
const set = (index: number, value: string): Op => ({ type: 'set', index, value })
const remove = (index: number): Op => ({ type: 'remove', index })

function setup(options: { limit?: number, mergeWithin?: number, now?: () => number } = {}) {
  return createHistory<Doc, Op>({ document: ['a'], apply, ...options })
}

describe('createHistory', () => {
  it('执行、撤销、重做往返', () => {
    const history = setup()
    expect(history.canUndo).toBe(false)
    history.execute([insert(1, 'b')], { label: '加 b' })
    history.execute([set(0, 'A'), remove(1)], { label: '改 A 删 b' })
    expect(history.document).toEqual(['A'])
    expect([history.undoCount, history.undoLabel]).toEqual([2, '改 A 删 b'])

    expect(history.undo()).toBe(true)
    expect(history.document).toEqual(['a', 'b'])
    expect([history.redoCount, history.redoLabel, history.undoLabel]).toEqual([1, '改 A 删 b', '加 b'])
    expect(history.undo()).toBe(true)
    expect(history.document).toEqual(['a'])
    expect(history.undo()).toBe(false)

    expect(history.redo()).toBe(true)
    expect(history.redo()).toBe(true)
    expect(history.document).toEqual(['A'])
    expect(history.redo()).toBe(false)
    expect(history.undoCount).toBe(2)
  })

  it('一步里的多个操作按反序撤销', () => {
    const history = setup()
    history.execute([insert(1, 'b'), insert(2, 'c'), remove(0)])
    expect(history.document).toEqual(['b', 'c'])
    history.undo()
    expect(history.document).toEqual(['a'])
  })

  it('新的执行清空重做栈', () => {
    const history = setup()
    history.execute([insert(1, 'b')])
    history.undo()
    expect(history.canRedo).toBe(true)
    history.execute([insert(1, 'c')])
    expect(history.canRedo).toBe(false)
  })

  it('空操作列表什么都不做', () => {
    const history = setup()
    const listener = vi.fn()
    history.subscribe(listener)
    expect(history.execute([])).toEqual(['a'])
    expect(history.canUndo).toBe(false)
    expect(listener).not.toHaveBeenCalled()
  })

  it('同一合并键的连续执行并成一步，撤销一次回到合并前', () => {
    const history = setup()
    history.execute([set(0, 'a1')], { merge: 'node:0:label', label: '改名' })
    history.execute([set(0, 'a12')], { merge: 'node:0:label', label: '另一句' })
    history.execute([set(0, 'a123')], { merge: 'node:0:label' })
    expect([history.undoCount, history.undoLabel]).toEqual([1, '改名'])
    history.undo()
    expect(history.document).toEqual(['a'])
    history.redo()
    expect(history.document).toEqual(['a123'])
  })

  it('合并键不同、封口、撤销之后都不再合并', () => {
    const history = setup()
    history.execute([set(0, 'x')], { merge: 'k' })
    history.execute([set(0, 'y')], { merge: 'other' })
    expect(history.undoCount).toBe(2)
    history.seal()
    history.execute([set(0, 'z')], { merge: 'other' })
    expect(history.undoCount).toBe(3)
    history.undo()
    history.execute([set(0, 'w')], { merge: 'other' })
    expect(history.undoCount).toBe(3)
    history.execute([set(0, 'v')])
    history.execute([set(0, 'u')], { merge: 'other' })
    expect(history.undoCount).toBe(5)
  })

  it('超过合并时限的执行另起一步', () => {
    let time = 0
    const history = setup({ mergeWithin: 500, now: () => time })
    history.execute([set(0, 'x')], { merge: 'k' })
    time = 400
    history.execute([set(0, 'y')], { merge: 'k' })
    time = 1000
    history.execute([set(0, 'z')], { merge: 'k' })
    expect(history.undoCount).toBe(2)
    history.undo()
    expect(history.document).toEqual(['y'])
  })

  it('步数上限丢弃最早的步', () => {
    const history = setup({ limit: 2 })
    history.execute([insert(1, 'b')])
    history.execute([insert(2, 'c')])
    history.execute([insert(3, 'd')])
    expect(history.undoCount).toBe(2)
    history.undo()
    history.undo()
    expect(history.undo()).toBe(false)
    expect(history.document).toEqual(['a', 'b'])
  })

  it('上限为 0 时只应用不记录', () => {
    const history = setup({ limit: 0 })
    history.execute([insert(1, 'b')])
    expect([history.document, history.canUndo]).toEqual([['a', 'b'], false])
  })

  it('事务内的执行提交后记为一步', () => {
    const history = setup()
    history.begin('拖动')
    expect(history.inTransaction).toBe(true)
    history.execute([set(0, 'x')], { merge: 'ignored' })
    history.execute([insert(1, 'y')])
    expect(history.canUndo).toBe(false)
    history.commit()
    expect([history.undoCount, history.undoLabel, history.inTransaction]).toEqual([1, '拖动', false])
    history.undo()
    expect(history.document).toEqual(['a'])
    history.redo()
    expect(history.document).toEqual(['x', 'y'])
  })

  it('嵌套事务在最外层提交时入栈', () => {
    const history = setup()
    history.begin('外')
    history.execute([insert(1, 'b')])
    history.begin('内')
    history.execute([insert(2, 'c')])
    history.commit()
    expect(history.canUndo).toBe(false)
    history.commit()
    expect([history.undoCount, history.undoLabel]).toEqual([1, '外'])
  })

  it('回滚放弃整个事务，文档与重做栈回到事务前', () => {
    const history = setup()
    history.execute([insert(1, 'b')])
    history.undo()
    history.begin()
    history.execute([set(0, 'x')])
    history.begin()
    history.execute([insert(1, 'y')])
    history.rollback()
    expect([history.document, history.inTransaction, history.canRedo, history.canUndo]).toEqual([['a'], false, true, false])
  })

  it('空事务提交不入栈也不清空重做栈', () => {
    const history = setup()
    history.execute([insert(1, 'b')])
    history.undo()
    history.begin()
    history.commit()
    expect([history.canUndo, history.canRedo]).toEqual([false, true])
  })

  it('transact 正常返回则提交，抛错则回滚后重新抛出', () => {
    const history = setup()
    expect(history.transact(() => {
      history.execute([insert(1, 'b')])
      return 42
    }, '批量')).toBe(42)
    expect(history.undoLabel).toBe('批量')
    expect(() => history.transact(() => {
      history.execute([insert(2, 'c')])
      throw new Error('boom')
    })).toThrow('boom')
    expect([history.document, history.undoCount, history.inTransaction]).toEqual([['a', 'b'], 1, false])
  })

  it('嵌套 transact 里层抛错时放弃整个事务', () => {
    const history = setup()
    expect(() => history.transact(() => {
      history.execute([insert(1, 'b')])
      history.transact(() => {
        history.execute([insert(2, 'c')])
        throw new Error('inner')
      })
    })).toThrow('inner')
    expect([history.document, history.inTransaction]).toEqual([['a'], false])
  })

  it('事务中不能撤销、重做、重置或清空', () => {
    const history = setup()
    history.begin()
    expect(() => history.undo()).toThrow(/transaction/)
    expect(() => history.redo()).toThrow(/transaction/)
    expect(() => history.reset([])).toThrow(/transaction/)
    expect(() => history.clear()).toThrow(/transaction/)
  })

  it('没有事务时提交或回滚报错', () => {
    const history = setup()
    expect(() => history.commit()).toThrow(/without an open transaction/)
    expect(() => history.rollback()).toThrow(/without an open transaction/)
  })

  it('应用失败时文档与栈都不变', () => {
    const history = setup()
    history.execute([insert(1, 'b')])
    expect(() => history.execute([insert(2, 'c'), remove(9)])).toThrow(RangeError)
    expect([history.document, history.undoCount]).toEqual([['a', 'b'], 1])
  })

  it('reset 换文档并清空两个栈，clear 只清栈', () => {
    const history = setup()
    history.execute([insert(1, 'b')])
    history.execute([insert(2, 'c')])
    history.undo()
    history.clear()
    expect([history.document, history.canUndo, history.canRedo]).toEqual([['a', 'b'], false, false])
    history.reset(['z'])
    expect([history.document, history.canUndo]).toEqual([['z'], false])
  })

  it('通知带变化种类、变化后的文档与实际应用的操作', () => {
    const history = setup()
    const changes: HistoryChange<Doc, Op>[] = []
    const stop = history.subscribe(change => changes.push(change))
    history.execute([insert(1, 'b')])
    history.undo()
    history.redo()
    history.begin()
    history.execute([set(0, 'x')])
    history.rollback()
    history.begin()
    history.commit()
    history.clear()
    history.reset(['q'])
    stop()
    history.execute([insert(1, 'r')])
    expect(changes.map(change => [change.kind, change.document, change.operations])).toEqual([
      ['execute', ['a', 'b'], [insert(1, 'b')]],
      ['undo', ['a'], [remove(1)]],
      ['redo', ['a', 'b'], [insert(1, 'b')]],
      ['execute', ['x', 'b'], [set(0, 'x')]],
      ['rollback', ['a', 'b'], [set(0, 'a')]],
      ['commit', ['a', 'b'], []],
      ['clear', ['a', 'b'], []],
      ['reset', ['q'], []],
    ])
  })

  it('单次执行可以带自己的合并时限', () => {
    let time = 0
    const history = setup({ mergeWithin: 500, now: () => time })
    history.execute([set(0, 'x')], { merge: 'k' })
    time = 5000
    history.execute([set(0, 'y')], { merge: 'k', mergeWithin: Infinity })
    expect(history.undoCount).toBe(1)
    time = 5100
    history.execute([set(0, 'z')], { merge: 'k', mergeWithin: 50 })
    expect(history.undoCount).toBe(2)
    expect(() => history.execute([set(0, 'w')], { merge: 'k', mergeWithin: -1 })).toThrow(RangeError)
    expect(history.document).toEqual(['z'])
    expect(history.undoCount).toBe(2)
  })

  it('非法配置立即报错', () => {
    expect(() => createHistory<Doc, Op>({ document: [], apply, limit: -1 })).toThrow(RangeError)
    expect(() => createHistory<Doc, Op>({ document: [], apply, limit: 1.5 })).toThrow(RangeError)
    expect(() => createHistory<Doc, Op>({ document: [], apply, mergeWithin: -1 })).toThrow(RangeError)
  })

  it('多个实例互不影响', () => {
    const a = setup()
    const b = setup()
    a.execute([insert(1, 'b')])
    expect([b.document, b.canUndo]).toEqual([['a'], false])
  })
})

describe('无变化的执行', () => {
  it('文档引用不变时不入栈、不清重做栈、不通知', () => {
    const history = setup()
    history.execute([insert(1, 'b')])
    history.undo()
    const listener = vi.fn()
    history.subscribe(listener)
    expect(history.execute([set(0, 'a')])).toEqual(['a'])
    expect([history.undoCount, history.redoCount]).toEqual([0, 1])
    expect(listener).not.toHaveBeenCalled()
  })

  it('事务里的无变化执行不让事务变脏', () => {
    const history = setup()
    history.begin()
    history.execute([set(0, 'a')])
    expect(history.dirty).toBe(false)
    history.commit()
    expect(history.canUndo).toBe(false)
  })
})

describe('保存点', () => {
  it('初始文档视为已保存；执行后变脏，撤销回保存点后变干净', () => {
    const history = setup()
    expect(history.dirty).toBe(false)
    history.execute([insert(1, 'b')])
    expect(history.dirty).toBe(true)
    history.undo()
    expect(history.dirty).toBe(false)
    history.redo()
    expect(history.dirty).toBe(true)
  })

  it('标记保存点后在它两侧移动', () => {
    const history = setup()
    const changes: string[] = []
    history.subscribe(change => changes.push(change.kind))
    history.execute([insert(1, 'b')])
    history.markSaved()
    expect(history.dirty).toBe(false)
    history.undo()
    expect(history.dirty).toBe(true)
    history.redo()
    expect(history.dirty).toBe(false)
    history.execute([insert(2, 'c')])
    expect(history.dirty).toBe(true)
    history.undo()
    expect(history.dirty).toBe(false)
    expect(changes).toEqual(['execute', 'save', 'undo', 'redo', 'execute', 'undo'])
  })

  it('保存点封口：之后同一合并键的输入另起一步', () => {
    const history = setup()
    history.execute([set(0, 'x')], { merge: 'k' })
    history.markSaved()
    history.execute([set(0, 'y')], { merge: 'k' })
    expect([history.undoCount, history.dirty]).toEqual([2, true])
    history.undo()
    expect([history.document, history.dirty]).toEqual([['x'], false])
  })

  it('保存点被新执行清出重做栈后再也回不去', () => {
    const history = setup()
    history.execute([insert(1, 'b')])
    history.markSaved()
    history.undo()
    history.execute([insert(1, 'c')])
    history.undo()
    expect([history.document, history.dirty]).toEqual([['a'], true])
  })

  it('步数上限丢弃的步：退到最早还能退到的位置时与当时的保存点比对', () => {
    const history = setup({ limit: 2 })
    history.execute([insert(1, 'b')])
    history.markSaved()
    history.execute([insert(2, 'c')])
    history.execute([insert(3, 'd')])
    history.undo()
    history.undo()
    expect([history.document, history.dirty]).toEqual([['a', 'b'], false])
    const fresh = setup({ limit: 1 })
    fresh.execute([insert(1, 'b')])
    fresh.execute([insert(2, 'c')])
    fresh.undo()
    expect([fresh.document, fresh.dirty]).toEqual([['a', 'b'], true])
  })

  it('事务里有改动即为脏，回滚后恢复', () => {
    const history = setup()
    history.begin()
    history.execute([insert(1, 'b')])
    expect(history.dirty).toBe(true)
    history.rollback()
    expect(history.dirty).toBe(false)
    expect(() => {
      history.begin()
      history.markSaved()
    }).toThrow(/transaction/)
  })

  it('reset 后的新文档视为已保存；clear 不改是否已保存', () => {
    const history = setup()
    history.execute([insert(1, 'b')])
    history.clear()
    expect(history.dirty).toBe(true)
    history.reset(['z'])
    expect(history.dirty).toBe(false)
    history.execute([insert(1, 'y')])
    history.markSaved()
    history.clear()
    expect(history.dirty).toBe(false)
  })
})

describe('步骤列表与跳转', () => {
  it('entries 按先后列出已做与已撤销的步，position 是最后一个已做的步，起点在它们之前；位置号随步不变', () => {
    const history = setup()
    expect([history.entries, history.position === history.origin, history.truncated, history.originSaved]).toEqual([[], true, false, true])
    history.execute([insert(1, 'b')], { label: '加 b' })
    history.execute([insert(2, 'c')], { label: '加 c' })
    history.execute([insert(3, 'd')], { label: '加 d' })
    history.undo()
    const [b, c, d] = history.entries
    expect(history.entries.map(entry => [entry.label, entry.state])).toEqual([['加 b', 'done'], ['加 c', 'done'], ['加 d', 'undone']])
    expect(history.position).toBe(c!.position)
    expect(new Set([history.origin, b!.position, c!.position, d!.position]).size).toBe(4)
    history.undo()
    history.redo()
    expect(history.entries.map(entry => entry.position)).toEqual([b!.position, c!.position, d!.position])
  })

  it('goTo 往前连续撤销、往后连续重做，只通知一次，steps 是走过的步数', () => {
    const history = setup()
    history.execute([insert(1, 'b')])
    history.execute([insert(2, 'c')])
    history.execute([insert(3, 'd')])
    const [b, , d] = history.entries
    const changes: HistoryChange<Doc, Op>[] = []
    history.subscribe(change => changes.push(change))
    expect(history.goTo(history.origin)).toBe(true)
    expect([history.document, history.entries.map(entry => entry.state)]).toEqual([['a'], ['undone', 'undone', 'undone']])
    expect(history.goTo(d!.position)).toBe(true)
    expect(history.document).toEqual(['a', 'b', 'c', 'd'])
    expect(history.goTo(b!.position)).toBe(true)
    expect([history.document, history.position]).toEqual([['a', 'b'], b!.position])
    expect(changes.map(change => [change.kind, change.steps, change.operations])).toEqual([
      ['undo', 3, [remove(3), remove(2), remove(1)]],
      ['redo', 3, [insert(1, 'b'), insert(2, 'c'), insert(3, 'd')]],
      ['undo', 2, [remove(3), remove(2)]],
    ])
    expect([history.goTo(b!.position), history.goTo(-1)]).toEqual([false, false])
    expect(changes).toHaveLength(3)
  })

  it('undo、redo 的通知 steps 为 1，其余种类为 0', () => {
    const history = setup()
    const changes: HistoryChange<Doc, Op>[] = []
    history.subscribe(change => changes.push(change))
    history.execute([insert(1, 'b')])
    history.undo()
    history.redo()
    history.transact(() => history.execute([set(0, 'x')]))
    history.markSaved()
    history.clear()
    expect(changes.map(change => [change.kind, change.steps])).toEqual([['execute', 0], ['undo', 1], ['redo', 1], ['execute', 0], ['commit', 0], ['save', 0], ['clear', 0]])
  })

  it('跳转是原子的：有一步应用失败时文档、位置与栈都不变，错误照样抛出', () => {
    let fail = false
    const history = createHistory<Doc, Op>({
      document: ['a'],
      apply: (doc, op) => {
        if (fail && op.type === 'remove' && op.index === 1)
          throw new Error('boom')
        return apply(doc, op)
      },
    })
    history.execute([insert(1, 'b')])
    history.execute([insert(2, 'c')])
    const position = history.position
    const notified = vi.fn()
    history.subscribe(notified)
    fail = true
    expect(() => history.goTo(history.origin)).toThrow('boom')
    expect([history.document, history.position, history.entries.map(entry => entry.state)]).toEqual([['a', 'b', 'c'], position, ['done', 'done']])
    expect(notified).not.toHaveBeenCalled()
  })

  it('跳转后封口；之后的修改丢掉已撤销的步（线性历史）', () => {
    const history = setup()
    history.execute([set(0, 'x')], { merge: 'k' })
    history.execute([insert(1, 'b')])
    history.goTo(history.entries[0]!.position)
    history.execute([set(0, 'y')], { merge: 'k' })
    expect([history.document, history.entries.map(entry => entry.state), history.canRedo]).toEqual([['y'], ['done', 'done'], false])
  })

  it('事务中不能跳转', () => {
    const history = setup()
    history.execute([insert(1, 'b')])
    history.begin()
    expect(() => history.goTo(history.origin)).toThrow(/transaction/)
  })

  it('超过步数上限丢过步之后 truncated 为 true，起点是丢掉的最后一步之后；clear、reset 之后清掉', () => {
    const history = setup({ limit: 2 })
    history.execute([insert(1, 'b')])
    history.execute([insert(2, 'c')])
    expect(history.truncated).toBe(false)
    history.execute([insert(3, 'd')])
    expect([history.truncated, history.entries.length]).toEqual([true, 2])
    history.goTo(history.origin)
    expect(history.document).toEqual(['a', 'b'])
    history.clear()
    expect([history.truncated, history.origin === history.position]).toEqual([false, true])
    history.execute([insert(2, 'c')])
    history.execute([insert(3, 'd')])
    history.execute([insert(4, 'e')])
    history.reset(['z'])
    expect(history.truncated).toBe(false)
  })

  it('保存点标在那一步或起点上', () => {
    const history = setup()
    expect(history.originSaved).toBe(true)
    history.execute([insert(1, 'b')])
    history.execute([insert(2, 'c')])
    history.goTo(history.entries[0]!.position)
    history.markSaved()
    expect([history.originSaved, history.entries.map(entry => entry.saved)]).toEqual([false, [true, false]])
    history.clear()
    expect([history.originSaved, history.entries]).toEqual([true, []])
  })
})

describe('步骤说明', () => {
  it('说明可以是函数，读的时候现取：换语言后跟着变', () => {
    let language = 'zh'
    const history = setup()
    history.execute([insert(1, 'b')], { label: () => (language === 'zh' ? '加 b' : 'Add b') })
    expect(history.undoLabel).toBe('加 b')
    language = 'en'
    expect([history.undoLabel, snapshotHistory(history).entries[0]!.label]).toEqual(['Add b', 'Add b'])
    history.undo()
    expect(history.redoLabel).toBe('Add b')
  })

  it('describe 给没写说明的步生成说明：新起一步时按正向操作与应用前的文档调用，并入的不调；事务按整段正向操作调一次', () => {
    const calls: [readonly Op[], Doc][] = []
    const history = createHistory<Doc, Op>({
      document: ['a'],
      apply,
      describe: (operations, before) => {
        calls.push([operations, before])
        return `${operations.length} 步`
      },
    })
    history.execute([insert(1, 'b')])
    history.execute([set(0, 'x')], { merge: 'k' })
    history.execute([set(0, 'y')], { merge: 'k' })
    history.execute([insert(1, 'z')], { label: '自己写的' })
    history.transact(() => {
      history.execute([insert(0, 'p')])
      history.execute([insert(0, 'q')])
    })
    history.transact(() => history.execute([insert(0, 'r')]), () => '事务的说明')
    expect(snapshotHistory(history).entries.map(entry => entry.label)).toEqual(['1 步', '1 步', '自己写的', '2 步', '事务的说明'])
    expect(calls).toEqual([
      [[insert(1, 'b')], ['a']],
      [[set(0, 'x')], ['a', 'b']],
      [[insert(0, 'p'), insert(0, 'q')], ['y', 'z', 'b']],
    ])
  })
})

describe('snapshotHistory', () => {
  it('取成快照：说明现取成字符串，带当前位置、起点、丢过步与保存点', () => {
    const history = setup()
    history.execute([insert(1, 'b')], { label: '加 b' })
    history.markSaved()
    history.execute([insert(2, 'c')])
    history.undo()
    const [b, c] = history.entries
    expect(snapshotHistory(history)).toEqual({
      entries: [
        { position: b!.position, label: '加 b', state: 'done', saved: true },
        { position: c!.position, label: undefined, state: 'undone', saved: false },
      ],
      position: b!.position,
      origin: history.origin,
      truncated: false,
      originSaved: false,
    })
  })
})

describe('键盘微移的合并', () => {
  it('合并键与选中对象的先后无关，选中不同就不同；时限是 1 秒', () => {
    expect(nudgeMergeKey(['b', 'a'])).toBe(nudgeMergeKey(['a', 'b']))
    expect(nudgeMergeKey(['a'])).not.toBe(nudgeMergeKey(['a', 'b']))
    expect(nudgeMergeKey(['a,b'])).not.toBe(nudgeMergeKey(['a', 'b']))
    expect(HISTORY_NUDGE_MERGE_WITHIN).toBe(1000)
  })

  it('连续微移在时限内并成一步，超过时限或封口后另起一步', () => {
    let time = 0
    const history = setup({ now: () => time })
    const key = nudgeMergeKey(['a'])
    history.execute([set(0, 'x')], { merge: key, mergeWithin: HISTORY_NUDGE_MERGE_WITHIN })
    time = 900
    history.execute([set(0, 'y')], { merge: key, mergeWithin: HISTORY_NUDGE_MERGE_WITHIN })
    expect(history.undoCount).toBe(1)
    time = 2000
    history.execute([set(0, 'z')], { merge: key, mergeWithin: HISTORY_NUDGE_MERGE_WITHIN })
    expect(history.undoCount).toBe(2)
    history.seal()
    history.execute([set(0, 'w')], { merge: key, mergeWithin: HISTORY_NUDGE_MERGE_WITHIN })
    expect(history.undoCount).toBe(3)
  })
})
