// 路径编辑操作：set / insert / remove / move 的结果与逆操作、无变化返回同一引用、补齐中间层、错误码，以及接上历史栈。
import type { JsonObject, JsonValue } from '@xihan-ui/core/json'
import type { PathOperation } from '../src'
import { describe, expect, it } from 'vitest'
import { applyPathOperation, applyPathOperations, createHistory, PathOperationError } from '../src'

function sample(): JsonObject {
  return { title: 'a', rows: [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }], meta: { tags: ['x'] } }
}

/** 应用操作后再应用逆操作，必须回到原文档。 */
function roundTrip(document: JsonValue, operations: readonly PathOperation[]): JsonValue {
  const forward = applyPathOperations(document, operations)
  const back = applyPathOperations(forward.document, forward.inverse)
  expect(back.document).toEqual(document)
  return forward.document
}

function codeOf(run: () => unknown): string | undefined {
  try {
    run()
  }
  catch (error) {
    expect(error).toBeInstanceOf(PathOperationError)
    return (error as PathOperationError).code
  }
  return undefined
}

describe('set', () => {
  it('写入、新增与删除对象键，逆操作精确还原', () => {
    const document = sample()
    const result = applyPathOperation(document, { type: 'set', path: ['title'], value: 'b' })
    expect(result).toEqual({ document: { ...document, title: 'b' }, inverse: [{ type: 'set', path: ['title'], value: 'a' }] })
    expect((result.document as JsonObject).rows).toBe(document.rows)
    expect(applyPathOperation(document, { type: 'set', path: ['note'], value: 1 }).inverse).toEqual([{ type: 'remove', path: ['note'] }])
    expect(applyPathOperation(document, { type: 'set', path: ['title'] }).inverse).toEqual([{ type: 'set', path: ['title'], value: 'a' }])
    roundTrip(document, [
      { type: 'set', path: ['rows', 1, 'id'], value: 'r9' },
      { type: 'set', path: ['meta'] },
      { type: 'set', path: ['rows', 0], value: 'x' },
    ])
  })

  it('补齐中间层时，逆操作删掉补出的最上面一层', () => {
    const result = applyPathOperation(sample(), { type: 'set', path: ['style', 'font', 'size'], value: 12, createMissing: true })
    expect((result.document as JsonObject).style).toEqual({ font: { size: 12 } })
    expect(result.inverse).toEqual([{ type: 'remove', path: ['style'] }])
    roundTrip(sample(), [{ type: 'set', path: ['meta', 'font', 'size'], value: 12, createMissing: true }])
    expect(codeOf(() => applyPathOperation(sample(), { type: 'set', path: ['style', 'size'], value: 1 }))).toBe('path-not-found')
  })

  it('空路径替换整个文档', () => {
    const result = applyPathOperation(sample(), { type: 'set', path: [], value: { title: 'z' } })
    expect(result.document).toEqual({ title: 'z' })
    expect(result.inverse).toEqual([{ type: 'set', path: [], value: sample() }])
    expect(codeOf(() => applyPathOperation(sample(), { type: 'set', path: [] }))).toBe('invalid-value')
  })
})

describe('insert / remove / move', () => {
  it('插入数组项，缺省追加到末尾', () => {
    const document = sample()
    const result = applyPathOperation(document, { type: 'insert', path: ['rows'], index: 1, value: { id: 'n' } })
    expect((result.document as JsonObject).rows).toEqual([{ id: 'r1' }, { id: 'n' }, { id: 'r2' }, { id: 'r3' }])
    expect(result.inverse).toEqual([{ type: 'remove', path: ['rows', 1] }])
    expect((applyPathOperation(document, { type: 'insert', path: ['meta', 'tags'], value: 'y' }).document as JsonObject).meta).toEqual({ tags: ['x', 'y'] })
    roundTrip([1, 2], [{ type: 'insert', path: [], index: 0, value: 0 }])
  })

  it('删除数组项与对象键', () => {
    const document = sample()
    const result = applyPathOperation(document, { type: 'remove', path: ['rows', 0] })
    expect(result.inverse).toEqual([{ type: 'insert', path: ['rows'], index: 0, value: { id: 'r1' } }])
    expect(applyPathOperation(document, { type: 'remove', path: ['meta'] }).inverse).toEqual([{ type: 'set', path: ['meta'], value: { tags: ['x'] } }])
    roundTrip(document, [{ type: 'remove', path: ['rows', 2] }, { type: 'remove', path: ['title'] }])
  })

  it('移动数组项，原位不动时返回同一文档', () => {
    const document = sample()
    const result = applyPathOperation(document, { type: 'move', path: ['rows', 0], index: 2 })
    expect((result.document as JsonObject).rows).toEqual([{ id: 'r2' }, { id: 'r3' }, { id: 'r1' }])
    expect(result.inverse).toEqual([{ type: 'move', path: ['rows', 2], index: 0 }])
    roundTrip(document, [{ type: 'move', path: ['rows', 2], index: 0 }])
    expect(applyPathOperation(document, { type: 'move', path: ['rows', 1], index: 1 })).toEqual({ document, inverse: [] })
  })
})

describe('没有变化与错误', () => {
  it('没有变化时返回同一文档、逆操作为空', () => {
    const document = sample()
    expect(applyPathOperation(document, { type: 'set', path: ['meta'], value: { tags: ['x'] } })).toEqual({ document, inverse: [] })
    expect(applyPathOperation(document, { type: 'set', path: ['missing'] }).document).toBe(document)
    expect(applyPathOperations(document, []).document).toBe(document)
  })

  it('错误码', () => {
    const document = sample()
    const cases: [PathOperation, string][] = [
      [{ type: 'set', path: ['__proto__'], value: 1 }, 'invalid-path'],
      [{ type: 'set', path: ['rows', -1], value: 1 }, 'invalid-path'],
      [{ type: 'set', path: ['rows', 5], value: 1 }, 'path-not-found'],
      [{ type: 'set', path: ['rows', 0] }, 'invalid-value'],
      [{ type: 'set', path: ['title'], value: Number.NaN }, 'invalid-value'],
      [{ type: 'insert', path: ['title'], value: 1 }, 'not-an-array'],
      [{ type: 'insert', path: ['nope'], value: 1 }, 'path-not-found'],
      [{ type: 'insert', path: ['rows'], index: 4, value: 1 }, 'index-out-of-range'],
      [{ type: 'insert', path: ['rows'], value: undefined as unknown as JsonValue }, 'invalid-value'],
      [{ type: 'remove', path: [] }, 'invalid-path'],
      [{ type: 'remove', path: ['rows', 3] }, 'path-not-found'],
      [{ type: 'remove', path: ['meta', 'size'] }, 'path-not-found'],
      [{ type: 'move', path: ['meta', 'tags'], index: 0 }, 'not-an-array'],
      [{ type: 'move', path: ['rows', 'r1'], index: 0 }, 'path-not-found'],
      [{ type: 'move', path: ['rows', 0], index: 3 }, 'index-out-of-range'],
      [{ type: 'rename', path: [] } as unknown as PathOperation, 'invalid-operation'],
      [{ type: 'set' } as unknown as PathOperation, 'invalid-operation'],
    ]
    for (const [operation, code] of cases)
      expect(codeOf(() => applyPathOperation(document, operation)), JSON.stringify(operation)).toBe(code)
    expect(document).toEqual(sample())
  })

  it('一组操作中途失败时整体抛错，带出失败的那一个操作', () => {
    const bad: PathOperation = { type: 'remove', path: ['gone'] }
    let thrown: unknown
    try {
      applyPathOperations(sample(), [{ type: 'set', path: ['title'], value: 'b' }, bad])
    }
    catch (error) {
      thrown = error
    }
    expect(thrown).toMatchObject({ name: 'PathOperationError', code: 'path-not-found', message: 'path-not-found', operation: bad })
  })
})

describe('接上历史栈', () => {
  it('applyPathOperation 直接作为 apply', () => {
    const history = createHistory<JsonValue, PathOperation>({ document: sample(), apply: applyPathOperation })
    history.execute([{ type: 'insert', path: ['rows'], value: { id: 'r4' } }, { type: 'move', path: ['rows', 3], index: 0 }])
    expect((history.document as JsonObject).rows).toEqual([{ id: 'r4' }, { id: 'r1' }, { id: 'r2' }, { id: 'r3' }])
    history.undo()
    expect(history.document).toEqual(sample())
    history.redo()
    expect(((history.document as JsonObject).rows as JsonObject[])[0]).toEqual({ id: 'r4' })
  })
})
