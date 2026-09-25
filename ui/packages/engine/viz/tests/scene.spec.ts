import type { Mark, RectMark } from '../src'
import { describe, expect, it } from 'vitest'
import { arc, createScene, curveOf, diffScenes, isVizError, markPath, sceneMarks, symbol } from '../src'

const bounds = { x: 0, y: 0, width: 100, height: 100 }
function bar(key: string, height: number, extra: Partial<RectMark> = {}): RectMark {
  return {
    kind: 'rect',
    key,
    part: 'bar',
    x: 0,
    y: 100 - height,
    width: 10,
    height,
    ...extra,
  }
}

function codeOf(run: () => unknown): string | undefined {
  try {
    run()
  }
  catch (error) {
    return isVizError(error) ? error.code : 'other'
  }
  return undefined
}

describe('场景', () => {
  it('缺的层补成空表，整体冻结', () => {
    const scene = createScene({ version: 1, layers: { data: [bar('a', 10)] }, bounds })
    expect(scene.layers.back).toEqual([])
    expect(Object.isFrozen(scene)).toBe(true)
    expect(Object.isFrozen(scene.layers.data[0])).toBe(true)
    expect('frame' in scene).toBe(false)
  })

  it('键在整个场景内唯一，分组里的子标记也算', () => {
    expect(codeOf(() => createScene({ version: 1, layers: { back: [bar('a', 1)], data: [bar('a', 2)] }, bounds }))).toBe('XH_VIZ_DUPLICATE_KEY')
    const group: Mark = { kind: 'group', key: 'g', part: 'series', children: [bar('a', 1)] }
    expect(codeOf(() => createScene({ version: 1, layers: { data: [group, bar('a', 2)] }, bounds }))).toBe('XH_VIZ_DUPLICATE_KEY')
  })

  it('着色引用的取值受约束，场景不含颜色值', () => {
    expect(() => createScene({ version: 1, layers: { data: [bar('a', 1, { paint: { slot: 9 } })] }, bounds })).toThrow(/色槽/)
    expect(() => createScene({ version: 1, layers: { data: [bar('a', 1, { paint: { t: 1.5 } })] }, bounds })).toThrow(/色阶/)
    expect(() => createScene({ version: 1, layers: { data: [bar('a', 1, { opacity: 2 })] }, bounds })).toThrow(/不透明度/)
  })

  it('按层序展开全部标记，分组的平移累计到子标记', () => {
    const scene = createScene({
      version: 1,
      layers: {
        front: [bar('ring', 1)],
        back: [bar('grid', 1)],
        data: [{ kind: 'group', key: 's1', part: 'series', x: 5, y: 7, children: [bar('p1', 3)] }],
      },
      bounds,
    })
    expect(sceneMarks(scene).map(e => [e.layer, e.mark.key, e.offset])).toEqual([
      ['back', 'grid', [0, 0]],
      ['data', 's1', [0, 0]],
      ['data', 'p1', [5, 7]],
      ['front', 'ring', [0, 0]],
    ])
  })
})

describe('场景求差', () => {
  it('按键分出进入、更新、退出，更新标出有无变化', () => {
    const a = createScene({ version: 1, layers: { data: [bar('x', 10), bar('y', 20)] }, bounds })
    const b = createScene({ version: 2, layers: { data: [bar('y', 25), bar('z', 5)], front: [bar('x', 10)] }, bounds })
    const diff = diffScenes(a, b)
    expect(diff.enter.map(e => e.mark.key)).toEqual(['z'])
    expect(diff.exit).toEqual([])
    expect(diff.update.map(u => [u.to.key, u.layer, u.changed])).toEqual([['y', 'data', true], ['x', 'front', false]])
  })

  it('退出的标记', () => {
    const a = createScene({ version: 1, layers: { data: [bar('x', 10)] }, bounds })
    const b = createScene({ version: 2, layers: {}, bounds })
    expect(diffScenes(a, b).exit.map(e => e.mark.key)).toEqual(['x'])
  })
})

describe('标记转路径', () => {
  it('矩形：给了圆角只圆远离基线的一端', () => {
    expect(markPath(bar('a', 20))).toBe('M0,80h10v20h-10Z')
    expect(markPath(bar('a', 20, { cornerRadius: 4 })).startsWith('M4,80')).toBe(true)
  })

  it('扇区与符号按中心平移', () => {
    const mark = { kind: 'arc', key: 'k', part: 'slice', cx: 50, cy: 50, innerRadius: 0, outerRadius: 10, startAngle: 0, endAngle: Math.PI / 2 } as const
    expect(markPath(mark)).toBe('M50,40A10,10,0,0,1,60,50L50,50Z')
    expect(arc(mark)).toBe('M0,-10A10,10,0,0,1,10,0L0,0Z')
    expect(markPath({ kind: 'symbol', key: 's', part: 'point', x: 10, y: 10, size: 16, symbol: 'square' })).toBe('M8,8L12,8L12,12L8,12Z')
    expect(symbol('square', 16)).toBe('M-2,-2L2,-2L2,2L-2,2Z')
  })

  it('折线与面积按曲线名生成，缺失的点处断开', () => {
    const points = [{ key: 'a', x: 0, y: 10 }, { key: 'b', x: 10, y: 20, defined: false }, { key: 'c', x: 20, y: 30 }, { key: 'd', x: 30, y: 0 }]
    expect(markPath({ kind: 'line', key: 'l', part: 'line', points, curve: 'linear' })).toBe('M0,10ZM20,30L30,0')
    expect(markPath({ kind: 'area', key: 'r', part: 'area', points: [{ key: 'a', x: 0, y: 10, y0: 50 }, { key: 'b', x: 10, y: 20, y0: 50 }], curve: 'linear' })).toBe('M0,10L10,20L10,50L0,50Z')
  })

  it('未知的曲线名报错', () => {
    expect(() => curveOf('spline' as 'linear')).toThrow(/曲线/)
  })
})
