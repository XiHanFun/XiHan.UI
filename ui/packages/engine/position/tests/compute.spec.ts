import type { ComputeInput } from '../src'
import { describe, expect, it } from 'vitest'
import { computePlacement, intersectEdges, isFullyClipped, joinPlacement, splitPlacement } from '../src'

/**
 * 摆放计算的判据按"浮层该落在哪儿"写：贴哪条边、交叉轴怎么对齐、
 * 放不下时怎么让、区域退化时不许算出无穷或 NaN。
 */

const ANCHOR = { x: 100, y: 100, width: 100, height: 40 }
const FLOATING = { width: 60, height: 20 }
const ROOMY = { top: 0, right: 1000, bottom: 1000, left: 0 }

function place(overrides: Partial<ComputeInput> = {}): ReturnType<typeof computePlacement> {
  return computePlacement({
    anchor: ANCHOR,
    floating: FLOATING,
    clip: ROOMY,
    placement: 'bottom',
    offset: 8,
    flip: false,
    shift: false,
    padding: 4,
    ...overrides,
  })
}

describe('贴边与对齐', () => {
  it('四条边各自贴在锚点外侧，间距等于 offset', () => {
    expect(place({ placement: 'top' })).toMatchObject({ y: 72 })
    expect(place({ placement: 'bottom' })).toMatchObject({ y: 148 })
    expect(place({ placement: 'left' })).toMatchObject({ x: 32 })
    expect(place({ placement: 'right' })).toMatchObject({ x: 208 })
  })

  it('上下两侧的交叉轴是横轴', () => {
    expect(place({ placement: 'bottom-start' }).x).toBe(100)
    expect(place({ placement: 'bottom' }).x).toBe(120)
    expect(place({ placement: 'bottom-end' }).x).toBe(140)
  })

  it('左右两侧的交叉轴是纵轴', () => {
    expect(place({ placement: 'right-start' }).y).toBe(100)
    expect(place({ placement: 'right' }).y).toBe(110)
    expect(place({ placement: 'right-end' }).y).toBe(120)
  })

  it('offset 只作用在主轴上，交叉轴不受影响', () => {
    expect(place({ placement: 'bottom-start', offset: 40 })).toMatchObject({ x: 100, y: 180 })
  })

  it('offset 为 0 时紧贴', () => {
    expect(place({ placement: 'bottom', offset: 0 }).y).toBe(140)
  })

  it('placement 原样带回，没让位就不该改', () => {
    expect(place({ placement: 'left-end' }).placement).toBe('left-end')
  })
})

describe('翻面', () => {
  const TIGHT_TOP = { anchor: { x: 100, y: 0, width: 100, height: 40 }, flip: true }

  it('这一侧放不下、对侧放得下就翻过去', () => {
    const result = place({ ...TIGHT_TOP, placement: 'top' })
    expect(result.placement).toBe('bottom')
    expect(result.y).toBe(48)
  })

  it('翻面保留交叉轴对齐', () => {
    expect(place({ ...TIGHT_TOP, placement: 'top-end' }).placement).toBe('bottom-end')
  })

  it('两侧都放不下时守着请求的那一侧，不做无谓的跳动', () => {
    const result = place({
      anchor: { x: 100, y: 10, width: 100, height: 40 },
      floating: { width: 60, height: 30 },
      clip: { top: 0, right: 1000, bottom: 60, left: 0 },
      placement: 'top',
      flip: true,
    })
    expect(result.placement).toBe('top')
  })

  it('对侧越出得更少才翻', () => {
    const result = place({
      anchor: { x: 100, y: 4, width: 100, height: 40 },
      floating: { width: 60, height: 30 },
      clip: { top: 0, right: 1000, bottom: 200, left: 0 },
      placement: 'top',
      flip: true,
    })
    expect(result.placement).toBe('bottom')
  })

  it('关掉就不翻，宁可越出去', () => {
    const result = place({ ...TIGHT_TOP, placement: 'top', flip: false })
    expect(result.placement).toBe('top')
    expect(result.y).toBeLessThan(0)
  })
})

describe('交叉轴避让', () => {
  it('顶到起始缘就挪回来，留出 padding', () => {
    const result = place({
      anchor: { x: 0, y: 100, width: 40, height: 40 },
      floating: { width: 100, height: 20 },
      clip: { top: 0, right: 200, bottom: 1000, left: 0 },
      placement: 'bottom',
      shift: true,
    })
    expect(result.x).toBe(4)
    expect(result.placement).toBe('bottom')
  })

  it('顶到结束缘也挪回来', () => {
    const result = place({
      anchor: { x: 160, y: 100, width: 40, height: 40 },
      floating: { width: 100, height: 20 },
      clip: { top: 0, right: 200, bottom: 1000, left: 0 },
      placement: 'bottom',
      shift: true,
    })
    expect(result.x).toBe(96)
  })

  it('浮层比可用区域还宽时贴住起始缘，不许两头都够不着', () => {
    const result = place({
      anchor: { x: 0, y: 100, width: 40, height: 40 },
      floating: { width: 300, height: 20 },
      clip: { top: 0, right: 200, bottom: 1000, left: 0 },
      placement: 'bottom',
      shift: true,
    })
    expect(result.x).toBe(4)
  })

  it('左右两侧避让走的是纵轴', () => {
    const result = place({
      anchor: { x: 100, y: 0, width: 40, height: 40 },
      floating: { width: 60, height: 100 },
      clip: { top: 0, right: 1000, bottom: 200, left: 0 },
      placement: 'right',
      shift: true,
    })
    expect(result.y).toBe(4)
    expect(result.placement).toBe('right')
  })

  it('关掉就不避让', () => {
    const result = place({
      anchor: { x: 0, y: 100, width: 40, height: 40 },
      floating: { width: 100, height: 20 },
      clip: { top: 0, right: 200, bottom: 1000, left: 0 },
      placement: 'bottom',
      shift: false,
    })
    expect(result.x).toBe(-30)
  })

  it('可用区域退化（右边界跑到左边界左侧）时仍算得出有限值', () => {
    const result = place({
      clip: { top: 100, right: 50, bottom: 40, left: 100 },
      placement: 'bottom',
      shift: true,
      flip: true,
    })
    expect(Number.isFinite(result.x)).toBe(true)
    expect(Number.isFinite(result.y)).toBe(true)
  })
})

describe('箭头落点', () => {
  // 判据一律写成「箭头中心对着锚点中心」：落点 + arrow 应当等于锚点中心的那一坐标
  const ARROW = { size: 8, padding: 4 }

  it('没要箭头就不算', () => {
    expect(place({ placement: 'bottom' }).arrow).toBeUndefined()
  })

  it('三种对齐下箭头都对着锚点中心，而不是浮层中点', () => {
    for (const placement of ['bottom', 'bottom-start', 'bottom-end'] as const) {
      const result = place({ placement, arrow: ARROW })
      expect(result.x + result.arrow!.x!).toBe(ANCHOR.x + ANCHOR.width / 2)
    }
  })

  it('上下两侧只给行内轴，左右两侧只给块轴', () => {
    const vertical = place({ placement: 'bottom', arrow: ARROW }).arrow!
    expect(vertical.y).toBeUndefined()
    const horizontal = place({ placement: 'right', arrow: ARROW }).arrow!
    expect(horizontal.x).toBeUndefined()
    expect(horizontal.y).toBeDefined()
  })

  it('左右两侧对着锚点纵向中心', () => {
    const result = place({ placement: 'right', arrow: ARROW })
    expect(result.y + result.arrow!.y!).toBe(ANCHOR.y + ANCHOR.height / 2)
  })

  it('翻面只动主轴，交叉轴上的箭头落点不变', () => {
    const flipped = place({
      clip: { top: 0, right: 1000, bottom: 130, left: 0 },
      placement: 'bottom',
      flip: true,
      arrow: ARROW,
    })
    expect(flipped.placement).toBe('top')
    expect(flipped.x + flipped.arrow!.x!).toBe(ANCHOR.x + ANCHOR.width / 2)
  })

  it('交叉轴挪位之后箭头跟着走，仍旧对着锚点中心', () => {
    const result = place({
      anchor: { x: 0, y: 100, width: 40, height: 40 },
      floating: { width: 100, height: 20 },
      clip: { top: 0, right: 200, bottom: 1000, left: 0 },
      placement: 'bottom',
      shift: true,
      arrow: ARROW,
    })
    // 浮层被挪到 x=4，锚点中心在 20：箭头得站在浮层内的 16 处
    expect(result.x).toBe(4)
    expect(result.x + result.arrow!.x!).toBe(20)
  })

  it('锚点远在浮层之外时钳在两端余量上，不许指到浮层外面去', () => {
    const margin = ARROW.size / 2 + ARROW.padding
    const width = 200
    // end 对齐把浮层右缘钉在这个 4px 窄锚点上，锚点中心因此远在浮层左缘之外
    const end = place({
      anchor: { x: 0, y: 100, width: 4, height: 40 },
      floating: { width, height: 20 },
      placement: 'bottom-end',
      arrow: ARROW,
    })
    expect(end.arrow!.x).toBe(width - margin)

    // start 对齐则相反：锚点中心落在浮层右缘之外，钳到起始那一端
    const start = place({
      anchor: { x: 0, y: 100, width: 4, height: 40 },
      floating: { width, height: 20 },
      placement: 'bottom-start',
      arrow: ARROW,
    })
    expect(start.arrow!.x).toBe(margin)
  })

  it('浮层比两端余量加起来还窄时退回浮层中点', () => {
    const result = place({
      floating: { width: 12, height: 20 },
      placement: 'bottom',
      arrow: ARROW,
    })
    expect(result.arrow!.x).toBe(6)
  })
})

describe('placement 拆装', () => {
  it('无后缀即居中', () => {
    expect(splitPlacement('bottom')).toEqual({ side: 'bottom', align: 'center' })
    expect(splitPlacement('bottom-end')).toEqual({ side: 'bottom', align: 'end' })
  })

  it('装回去时居中不带后缀', () => {
    expect(joinPlacement('top', 'center')).toBe('top')
    expect(joinPlacement('top', 'start')).toBe('top-start')
  })
})

describe('区域运算', () => {
  it('交集取两者更靠内的那条边', () => {
    expect(intersectEdges(
      { top: 0, right: 100, bottom: 100, left: 0 },
      { top: 20, right: 80, bottom: 200, left: -20 },
    )).toEqual({ top: 20, right: 80, bottom: 100, left: 0 })
  })

  it('锚点整个出界才算被挡住，露一点都不算', () => {
    const clip = { top: 0, right: 200, bottom: 200, left: 0 }
    expect(isFullyClipped({ x: 10, y: 10, width: 20, height: 20 }, clip)).toBe(false)
    // 压在边界上、只露出一半
    expect(isFullyClipped({ x: 10, y: -10, width: 20, height: 20 }, clip)).toBe(false)
    expect(isFullyClipped({ x: 10, y: -20, width: 20, height: 20 }, clip)).toBe(true)
    expect(isFullyClipped({ x: 10, y: 200, width: 20, height: 20 }, clip)).toBe(true)
    expect(isFullyClipped({ x: -20, y: 10, width: 20, height: 20 }, clip)).toBe(true)
    expect(isFullyClipped({ x: 200, y: 10, width: 20, height: 20 }, clip)).toBe(true)
  })

  it('零尺寸锚点按点判：压在边界上仍算露着，越过边界才算被挡住', () => {
    const clip = { top: 0, right: 200, bottom: 200, left: 0 }
    expect(isFullyClipped({ x: 0, y: 0, width: 0, height: 0 }, clip)).toBe(false)
    expect(isFullyClipped({ x: 200, y: 200, width: 0, height: 0 }, clip)).toBe(false)
    expect(isFullyClipped({ x: 100, y: -1, width: 0, height: 0 }, clip)).toBe(true)
    expect(isFullyClipped({ x: -1, y: 100, width: 0, height: 0 }, clip)).toBe(true)
    expect(isFullyClipped({ x: 201, y: 100, width: 0, height: 0 }, clip)).toBe(true)
    expect(isFullyClipped({ x: 100, y: 201, width: 0, height: 0 }, clip)).toBe(true)
  })
})
