// 拖拽重排的共用纯函数。四处（table 行/列、tree 节点、tabs 标签）吃的是同一套判定，
// 这份测试钉的就是那套判定本身。
import { describe, expect, it } from 'vitest'
import { dragAnnouncement, hitAlong, hitAlongNested, insertionIndex } from '../src/shared/drag'

/** 三块等宽、首尾相接：0-100 / 100-200 / 200-300。 */
const RECTS = [
  { value: 'a', start: 0, size: 100 },
  { value: 'b', start: 100, size: 100 },
  { value: 'c', start: 200, size: 100 },
]

describe('沿轴落点 · 两档', () => {
  it('前半是 before，后半是 after', () => {
    expect(hitAlong(RECTS, 120)).toEqual({ targetValue: 'b', position: 'before' })
    expect(hitAlong(RECTS, 180)).toEqual({ targetValue: 'b', position: 'after' })
  })

  it('正中算 after——分界要落在一侧，含糊不得', () => {
    expect(hitAlong(RECTS, 150)).toEqual({ targetValue: 'b', position: 'after' })
  })

  it('落在所有候选之外返回 null，不夹到最近的一端', () => {
    // 夹过去会让指示线一直挂在边上，看起来像「松手就落这儿」
    expect(hitAlong(RECTS, -50)).toBeNull()
    expect(hitAlong(RECTS, 999)).toBeNull()
  })

  it('候选为空时返回 null', () => {
    expect(hitAlong([], 50)).toBeNull()
  })

  it('候选之间有空隙时，落在空隙里不算命中', () => {
    const gapped = [
      { value: 'a', start: 0, size: 40 },
      { value: 'b', start: 60, size: 40 },
    ]
    expect(hitAlong(gapped, 50)).toBeNull()
  })

  it('候选顺序即文档顺序，不按坐标重排——重排会掩盖调用方给错顺序', () => {
    const reversed = [...RECTS].reverse()
    expect(hitAlong(reversed, 120)).toEqual({ targetValue: 'b', position: 'before' })
  })
})

describe('沿轴落点 · 三档', () => {
  const always = (): boolean => true

  it('前四分之一 before、后四分之一 after、当中一半 inside', () => {
    expect(hitAlongNested(RECTS, 110, always)?.position).toBe('before')
    expect(hitAlongNested(RECTS, 150, always)?.position).toBe('inside')
    expect(hitAlongNested(RECTS, 190, always)?.position).toBe('after')
  })

  it('中间那档比两侧宽：放进去是主用途，两条边界线本来就窄', () => {
    // 25% 与 75% 两个分界点各归中间
    expect(hitAlongNested(RECTS, 125, always)?.position).toBe('inside')
    expect(hitAlongNested(RECTS, 175, always)?.position).toBe('inside')
  })

  it('不许放进去的项退回两档均分', () => {
    const leaf = (value: string): boolean => value !== 'b'
    expect(hitAlongNested(RECTS, 140, leaf)).toEqual({ targetValue: 'b', position: 'before' })
    expect(hitAlongNested(RECTS, 160, leaf)).toEqual({ targetValue: 'b', position: 'after' })
    // 别的项不受影响
    expect(hitAlongNested(RECTS, 50, leaf)?.position).toBe('inside')
  })

  it('零高的项不除以零', () => {
    expect(hitAlongNested([{ value: 'a', start: 10, size: 0 }], 10, always))
      .toEqual({ targetValue: 'a', position: 'before' })
  })
})

describe('插入下标 · 先摘后插的修正', () => {
  const V = ['a', 'b', 'c', 'd']

  it('往前搬：目标下标原样', () => {
    // c 落到 a 前面 → 摘掉 c 不影响 a 的位置
    expect(insertionIndex(V, 'c', { targetValue: 'a', position: 'before' })).toBe(0)
    expect(insertionIndex(V, 'd', { targetValue: 'b', position: 'after' })).toBe(2)
  })

  it('往后搬：目标下标减一——摘掉自己会让后面每一项前移一格', () => {
    // a 落到 c 后面：原下标 2，摘掉 a 之后 c 在 1，插到它后面就是 2
    expect(insertionIndex(V, 'a', { targetValue: 'c', position: 'after' })).toBe(2)
    // 少这一下的表现是「往右拖一格纹丝不动」
    expect(insertionIndex(V, 'a', { targetValue: 'b', position: 'after' })).toBe(1)
  })

  it('落到自己身上不是一次移动', () => {
    expect(insertionIndex(V, 'b', { targetValue: 'b', position: 'before' })).toBeNull()
    expect(insertionIndex(V, 'b', { targetValue: 'b', position: 'after' })).toBeNull()
  })

  it('落点算下来还是原位时返回 null，不发一次空提交', () => {
    // b 落到 a 后面 = b 还在原位
    expect(insertionIndex(V, 'b', { targetValue: 'a', position: 'after' })).toBeNull()
    // b 落到 c 前面 = 同样是原位
    expect(insertionIndex(V, 'b', { targetValue: 'c', position: 'before' })).toBeNull()
  })

  it('认不出的标识返回 null', () => {
    expect(insertionIndex(V, 'ghost', { targetValue: 'a', position: 'before' })).toBeNull()
    expect(insertionIndex(V, 'a', { targetValue: 'ghost', position: 'before' })).toBeNull()
  })

  it('搬到最末：下标等于摘掉之后的长度', () => {
    expect(insertionIndex(V, 'a', { targetValue: 'd', position: 'after' })).toBe(3)
  })

  it('结果拿去先摘后插，落点与语义一致', () => {
    // 把这条契约钉死：函数吐的下标是给「splice 摘、splice 插」两步用的
    const move = (values: string[], value: string, target: Parameters<typeof insertionIndex>[2]): string[] => {
      const to = insertionIndex(values, value, target)
      if (to == null)
        return values
      const next = [...values]
      const removed = next.splice(next.indexOf(value), 1)
      next.splice(to, 0, ...removed)
      return next
    }
    expect(move(V, 'a', { targetValue: 'c', position: 'after' })).toEqual(['b', 'c', 'a', 'd'])
    expect(move(V, 'd', { targetValue: 'a', position: 'before' })).toEqual(['d', 'a', 'b', 'c'])
    expect(move(V, 'c', { targetValue: 'b', position: 'before' })).toEqual(['a', 'c', 'b', 'd'])
  })
})

describe('播报', () => {
  const input = { value: 'name', position: 2, total: 5 }

  it('四档各有一句默认英文', () => {
    expect(dragAnnouncement('moved', input)).toBe('Moved name to position 2 of 5.')
    expect(dragAnnouncement('dropped', input)).toBe('name dropped at position 2.')
    expect(dragAnnouncement('canceled', input)).toBe('Move canceled. name returned to position 2.')
    expect(dragAnnouncement('rejected', input)).toBe('name cannot be dropped here.')
  })

  it('rejected 这一档不能省：不合法落点在界面上只是「那条线没出现」', () => {
    expect(dragAnnouncement('rejected', input)).not.toBe('')
  })

  it('item 换名字之后每一档都跟着换', () => {
    const translations = { item: (v: string) => `第 ${v} 列` }
    expect(dragAnnouncement('dropped', { ...input, translations })).toBe('第 name 列 dropped at position 2.')
    expect(dragAnnouncement('rejected', { ...input, translations })).toBe('第 name 列 cannot be dropped here.')
  })

  it('逐句覆盖，只给一句时其余仍走默认', () => {
    const translations = { moved: (n: string, p: number, t: number) => `${n} 移到第 ${p}/${t} 位` }
    expect(dragAnnouncement('moved', { ...input, translations })).toBe('name 移到第 2/5 位')
    expect(dragAnnouncement('dropped', { ...input, translations })).toBe('name dropped at position 2.')
  })
})
