import { describe, expect, it } from 'vitest'
import { createHistory, fitRect, snapRect } from '../src'

// 与 README「用法」一节同一段代码：照抄即可运行
describe('包说明里的用法', () => {
  it('历史栈、视口适配与吸附', () => {
    interface Doc { readonly items: readonly string[] }
    type Op = { type: 'add', value: string } | { type: 'pop' }

    function apply(doc: Doc, op: Op): { document: Doc, inverse: Op[] } {
      if (op.type === 'add')
        return { document: { items: [...doc.items, op.value] }, inverse: [{ type: 'pop' }] }
      const last = doc.items.at(-1)
      if (last === undefined)
        throw new RangeError('nothing to pop')
      return { document: { items: doc.items.slice(0, -1) }, inverse: [{ type: 'add', value: last }] }
    }

    const history = createHistory<Doc, Op>({ document: { items: [] }, apply })
    history.execute([{ type: 'add', value: 'a' }], { label: '添加' })
    history.execute([{ type: 'add', value: 'b' }], { merge: 'typing' })
    history.execute([{ type: 'add', value: 'c' }], { merge: 'typing' })
    history.undo()

    const viewport = fitRect({ x: 0, y: 0, width: 1600, height: 900 }, { width: 800, height: 600 })

    const snap = snapRect({ x: 103, y: 40, width: 120, height: 48 }, {
      targets: [{ x: 100, y: 200, width: 120, height: 48 }],
      threshold: 6 / viewport.zoom,
    })

    expect(history.document.items).toEqual(['a'])
    expect(history.undoLabel).toBe('添加')
    expect(viewport.zoom).toBeCloseTo(0.47)
    expect(snap.dx).toBe(-3)
  })
})
