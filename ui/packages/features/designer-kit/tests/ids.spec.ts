// 文档内唯一 id：取最大序号加一、分配器跳过登记过的 id、新旧 id 对照，以及依次应用一组操作的逆操作顺序。
import { describe, expect, it } from 'vitest'
import { applyInSequence, createIdAllocator, nextFreeId, remapIds } from '../src'

describe('nextFreeId', () => {
  it('取同前缀正整数序号的最大值加一', () => {
    expect(nextFreeId('node-', [])).toBe('node-1')
    expect(nextFreeId('node-', new Set(['node-2', 'node-10', 'node-x', 'node-01', 'node-0', 'edge-99']))).toBe('node-11')
    expect(nextFreeId('n', ['n3', 'node-7'])).toBe('n4')
  })
})

describe('createIdAllocator', () => {
  it('从已有最大序号之后连续分配，互不重复', () => {
    const ids = createIdAllocator('text-', ['text-3', 'image-9'])
    expect([ids.next(), ids.next()]).toEqual(['text-4', 'text-5'])
  })

  it('登记过的 id 不再分配，序号从它之后接着编', () => {
    const ids = createIdAllocator('e')
    ids.reserve('e2')
    expect(ids.next()).toBe('e3')
    ids.reserve('custom')
    ids.reserve('e10')
    expect(ids.next()).toBe('e11')
  })

  it('两个分配器各自计数', () => {
    const a = createIdAllocator('n')
    const b = createIdAllocator('n')
    a.next()
    expect(b.next()).toBe('n1')
  })
})

describe('remapIds', () => {
  it('为每个旧 id 分配一次新 id', () => {
    const ids = createIdAllocator('n', ['n1', 'n2'])
    const map = remapIds(['n1', 'n2', 'n1'], () => ids.next())
    expect([...map]).toEqual([['n1', 'n3'], ['n2', 'n4']])
  })

  it('allocate 给出重复的新 id 时抛错', () => {
    expect(() => remapIds(['a', 'b'], () => 'same')).toThrow(/more than once/)
  })
})

describe('applyInSequence', () => {
  it('逆操作按反序拼接，任一步失败时整体抛错', () => {
    const apply = (document: number[], operation: number) => {
      if (operation < 0)
        throw new RangeError('negative')
      return { document: [...document, operation], inverse: [-1, -2].map(step => step * operation) }
    }
    expect(applyInSequence(apply, [], [1, 2])).toEqual({ document: [1, 2], inverse: [-2, -4, -1, -2] })
    expect(applyInSequence(apply, [0], []).document).toEqual([0])
    expect(() => applyInSequence(apply, [], [1, -1])).toThrow('negative')
  })
})
