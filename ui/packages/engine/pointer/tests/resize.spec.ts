import type { ResizeEdge } from '../src'
import { describe, expect, it } from 'vitest'
import { applyAspectRatio, clampSize, resizeRect, snapSize } from '../src'

/** 一块 100×100 的矩形，左上角在 (100, 100)。 */
const RECT = { x: 100, y: 100, width: 100, height: 100 }

function push(edge: ResizeEdge, x: number, y: number, constraints?: Parameters<typeof resizeRect>[0]['constraints']) {
  return resizeRect({ rect: RECT, edge, delta: { x, y }, constraints })
}

describe('推动一条边', () => {
  it('东边往右推：只长宽，起点不动', () => {
    expect(push('e', 50, 0)).toEqual({ x: 100, y: 100, width: 150, height: 100 })
  })

  it('南边往下推：只长高', () => {
    expect(push('s', 0, 50)).toEqual({ x: 100, y: 100, width: 100, height: 150 })
  })

  it('西边往左推：宽长了，起点跟着往左走', () => {
    expect(push('w', -50, 0)).toEqual({ x: 50, y: 100, width: 150, height: 100 })
  })

  it('北边往上推：高长了，起点跟着往上走', () => {
    expect(push('n', 0, -50)).toEqual({ x: 100, y: 50, width: 100, height: 150 })
  })

  it('西边往右推是把它压小，右边缘不动', () => {
    const r = push('w', 40, 0)
    expect(r).toEqual({ x: 140, y: 100, width: 60, height: 100 })
    expect(r.x + r.width).toBe(200)
  })

  it('北边往下推同理，下边缘不动', () => {
    const r = push('n', 0, 40)
    expect(r.y + r.height).toBe(200)
  })

  it('四条边各只动自己那一轴，另一轴的位移不参与', () => {
    expect(push('e', 50, 999)).toEqual({ x: 100, y: 100, width: 150, height: 100 })
    expect(push('s', 999, 50)).toEqual({ x: 100, y: 100, width: 100, height: 150 })
  })

  it('角同时动两条边', () => {
    expect(push('se', 30, 40)).toEqual({ x: 100, y: 100, width: 130, height: 140 })
    expect(push('nw', -30, -40)).toEqual({ x: 70, y: 60, width: 130, height: 140 })
  })

  it('没动就是原样', () => {
    expect(push('se', 0, 0)).toEqual(RECT)
  })
})

describe('上下限', () => {
  it('压不过下限', () => {
    expect(push('e', -999, 0, { minWidth: 40 }).width).toBe(40)
  })

  it('长不过上限', () => {
    expect(push('e', 999, 0, { maxWidth: 160 }).width).toBe(160)
  })

  it('西边顶到下限之后起点不再往右漂——右边缘要钉住', () => {
    const r = push('w', 999, 0, { minWidth: 40 })
    expect(r.width).toBe(40)
    expect(r.x).toBe(160)
    expect(r.x + r.width).toBe(200)
  })

  it('北边顶到下限之后同理', () => {
    const r = push('n', 0, 999, { minHeight: 30 })
    expect(r.height).toBe(30)
    expect(r.y + r.height).toBe(200)
  })

  it('上限写得比下限还小时以下限为准——尺寸不能是负的', () => {
    expect(clampSize({ width: 100, height: 100 }, { minWidth: 80, maxWidth: 20 }).width).toBe(80)
  })

  it('不给上限就是不封顶', () => {
    expect(push('e', 99999, 0).width).toBe(100 + 99999)
  })
})

describe('宽高比', () => {
  it('推东边时由宽算高', () => {
    // ratio = 2（宽是高的两倍）：宽 200 → 高 100
    const r = push('e', 100, 0, { aspectRatio: 2 })
    expect(r.width).toBe(200)
    expect(r.height).toBe(100)
  })

  it('推南边时由高算宽', () => {
    const r = push('s', 0, 100, { aspectRatio: 2 })
    expect(r.height).toBe(200)
    expect(r.width).toBe(400)
  })

  it('四个角一律以宽为准：两轴同时在动，取其一才有确定落点', () => {
    // 竖直方向拖得更多，但落点仍由宽决定
    const r = push('se', 20, 900, { aspectRatio: 1 })
    expect(r.width).toBe(120)
    expect(r.height).toBe(120)
  })

  it('比例不是正数就不锁', () => {
    for (const ratio of [0, -1, Number.NaN, Number.POSITIVE_INFINITY])
      expect(push('e', 50, 0, { aspectRatio: ratio })).toEqual({ x: 100, y: 100, width: 150, height: 100 })
  })

  it('夹取优先于比例：顶到上下限时比例会破', () => {
    const r = push('e', 900, 0, { aspectRatio: 1, maxWidth: 150 })
    expect(r.width).toBe(150)
    // 高按比例算出来是 1000，但它没有上限，所以留在 1000——破的是比例不是边界
    expect(r.height).toBe(1000)
  })

  it('单独用：由高算宽', () => {
    expect(applyAspectRatio({ width: 0, height: 50 }, 3, 'height')).toEqual({ width: 150, height: 50 })
  })
})

describe('吸附步进', () => {
  it('宽高各自落到最近的整数倍', () => {
    // 宽 100+23=123 → 最近的 10 的倍数是 120
    expect(push('e', 23, 0, { step: 10 }).width).toBe(120)
    expect(push('e', 27, 0, { step: 10 }).width).toBe(130)
  })

  it('两轴各吸各的', () => {
    const r = push('se', 23, 27, { step: 10 })
    expect(r).toMatchObject({ width: 120, height: 130 })
  })

  it('西边吸附之后起点跟着走，右边缘仍然钉住', () => {
    const r = push('w', -23, 0, { step: 10 })
    expect(r.width).toBe(120)
    expect(r.x + r.width).toBe(200)
  })

  it('step 不是正数就不吸', () => {
    for (const step of [0, -5, Number.NaN])
      expect(push('e', 23, 0, { step }).width).toBe(123)
  })

  it('单独用', () => {
    expect(snapSize({ width: 47, height: 52 }, 25)).toEqual({ width: 50, height: 50 })
  })
})

describe('容器夹取', () => {
  // 容器 (0,0)-(300,300)，矩形在正中间
  const bounds = { x: 0, y: 0, width: 300, height: 300 }

  it('东边不许越过容器右缘', () => {
    const r = push('e', 999, 0, { bounds })
    expect(r.x + r.width).toBe(300)
  })

  it('南边不许越过容器下缘', () => {
    const r = push('s', 0, 999, { bounds })
    expect(r.y + r.height).toBe(300)
  })

  it('西边不许越过容器左缘，起点顶在边上', () => {
    const r = push('w', -999, 0, { bounds })
    expect(r.x).toBe(0)
    expect(r.x + r.width).toBe(200)
  })

  it('北边同理', () => {
    const r = push('n', 0, -999, { bounds })
    expect(r.y).toBe(0)
    expect(r.y + r.height).toBe(200)
  })

  it('容器不在原点时按它自己的边算', () => {
    const shifted = { x: 150, y: 150, width: 300, height: 300 }
    const r = push('w', -999, 0, { bounds: shifted })
    expect(r.x).toBe(150)
  })

  it('容器与下限同时顶死时，起点跟着退，对边不会被推出容器', () => {
    // 容器很窄：宽只有 120，而下限要 80
    const narrow = { x: 100, y: 100, width: 120, height: 300 }
    const r = push('w', -999, 0, { bounds: narrow, minWidth: 80 })
    expect(r.width).toBeGreaterThanOrEqual(80)
    expect(r.x).toBeGreaterThanOrEqual(narrow.x)
    expect(r.x + r.width).toBeLessThanOrEqual(narrow.x + narrow.width)
  })

  it('没越界时容器不改任何东西', () => {
    expect(push('e', 20, 0, { bounds })).toEqual(push('e', 20, 0))
  })
})

describe('退化输入', () => {
  it('位移不是有限数时当没动', () => {
    expect(push('e', Number.NaN, 0)).toEqual(RECT)
    expect(push('s', 0, Number.POSITIVE_INFINITY)).toEqual(RECT)
  })

  it('矩形里有非有限数时按 0 处理，不把 NaN 传下去', () => {
    const r = resizeRect({
      rect: { x: Number.NaN, y: 0, width: Number.NaN, height: 50 },
      edge: 'e',
      delta: { x: 10, y: 0 },
    })
    expect(Number.isFinite(r.x)).toBe(true)
    expect(Number.isFinite(r.width)).toBe(true)
  })

  it('八个方向都算得出有限结果', () => {
    const edges: ResizeEdge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']
    for (const edge of edges) {
      const r = push(edge, 37, -19, { minWidth: 10, minHeight: 10, bounds: { x: 0, y: 0, width: 400, height: 400 } })
      for (const v of [r.x, r.y, r.width, r.height]) expect(Number.isFinite(v)).toBe(true)
      expect(r.width).toBeGreaterThanOrEqual(10)
      expect(r.height).toBeGreaterThanOrEqual(10)
    }
  })
})
