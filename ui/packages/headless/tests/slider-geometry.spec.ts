import { describe, expect, it } from 'vitest'
import {
  closestThumb,
  percentToValue,
  pointToValue,
  rangeExtent,
  setThumbValue,
  snapToStep,
  thumbBounds,
  valueToPercent,
} from '../src/slider/slider.geometry'

const RECT = { x: 100, y: 50, width: 200, height: 20 }
const V_RECT = { x: 100, y: 50, width: 20, height: 200 }

describe('valueToPercent', () => {
  it('区间退化（min === max）时给 0，不给 NaN', () => {
    // NaN 会一路写进 aria-valuenow 与 style 的百分比
    expect(valueToPercent(5, 5, 5)).toBe(0)
  })

  it('越界值夹在 0-1 内', () => {
    expect(valueToPercent(-10, 0, 100)).toBe(0)
    expect(valueToPercent(999, 0, 100)).toBe(1)
    expect(valueToPercent(25, 0, 100)).toBe(0.25)
  })
})

describe('snapToStep', () => {
  it('以 min 为原点对齐，不是以 0', () => {
    // min=5 step=10 的刻度是 5/15/25；以 0 为原点会给出 0/10/20，第一格就落在区间外
    expect(snapToStep(9, 5, 105, 10)).toBe(5)
    expect(snapToStep(11, 5, 105, 10)).toBe(15)
  })

  it('小数 step 不留浮点尾巴', () => {
    expect(snapToStep(0.30000000000000004, 0, 1, 0.1)).toBe(0.3)
  })

  it('step 为 0 时只夹区间，不做除零', () => {
    expect(snapToStep(42, 0, 100, 0)).toBe(42)
  })
})

describe('percentToValue', () => {
  it('两端取到真正的端点', () => {
    expect(percentToValue(0, 0, 100, 1)).toBe(0)
    expect(percentToValue(1, 0, 100, 1)).toBe(100)
  })
})

describe('pointToValue', () => {
  const base = { min: 0, max: 100, step: 1 }

  it('水平轨道：左端 0、右端 100、正中 50', () => {
    expect(pointToValue({ clientX: 100, clientY: 60 }, RECT, base)).toBe(0)
    expect(pointToValue({ clientX: 300, clientY: 60 }, RECT, base)).toBe(100)
    expect(pointToValue({ clientX: 200, clientY: 60 }, RECT, base)).toBe(50)
  })

  it('轨道外的点被夹回端点', () => {
    expect(pointToValue({ clientX: 0, clientY: 60 }, RECT, base)).toBe(0)
    expect(pointToValue({ clientX: 9999, clientY: 60 }, RECT, base)).toBe(100)
  })

  it('竖直轨道：屏幕向下是值变小', () => {
    // 顶端（y=50）是 max，底端（y=250）是 min——与水平轨道相反
    expect(pointToValue({ clientX: 110, clientY: 50 }, V_RECT, { ...base, orientation: 'vertical' })).toBe(100)
    expect(pointToValue({ clientX: 110, clientY: 250 }, V_RECT, { ...base, orientation: 'vertical' })).toBe(0)
    expect(pointToValue({ clientX: 110, clientY: 150 }, V_RECT, { ...base, orientation: 'vertical' })).toBe(50)
  })

  it('从右往左排版时水平轨道反向：右端是 min', () => {
    expect(pointToValue({ clientX: 300, clientY: 60 }, RECT, { ...base, dir: 'rtl' })).toBe(0)
    expect(pointToValue({ clientX: 100, clientY: 60 }, RECT, { ...base, dir: 'rtl' })).toBe(100)
  })

  it('轨道还没布局（尺寸为 0）时返回下界，不产生 NaN', () => {
    const flat = { x: 0, y: 0, width: 0, height: 0 }
    expect(pointToValue({ clientX: 10, clientY: 10 }, flat, base)).toBe(0)
  })

  it('落点按 step 对齐', () => {
    // 200px 宽、step=25：正中 50，偏一点仍吸到 50
    expect(pointToValue({ clientX: 205, clientY: 60 }, RECT, { ...base, step: 25 })).toBe(50)
    expect(pointToValue({ clientX: 240, clientY: 60 }, RECT, { ...base, step: 25 })).toBe(75)
  })
})

describe('thumbBounds', () => {
  const o = { min: 0, max: 100, step: 1 }

  it('单滑块可走满区间', () => {
    expect(thumbBounds([50], 0, o)).toEqual({ min: 0, max: 100 })
  })

  it('多滑块不许越过邻居', () => {
    expect(thumbBounds([20, 50, 80], 1, o)).toEqual({ min: 20, max: 80 })
    expect(thumbBounds([20, 50, 80], 0, o)).toEqual({ min: 0, max: 50 })
    expect(thumbBounds([20, 50, 80], 2, o)).toEqual({ min: 50, max: 100 })
  })

  it('minStepsBetweenThumbs 换算成值来让位', () => {
    expect(thumbBounds([20, 50, 80], 1, { ...o, step: 2, minStepsBetweenThumbs: 5 }))
      .toEqual({ min: 30, max: 70 })
  })

  it('邻居挤到一起时不返回上下颠倒的空区间', () => {
    // 这个滑块只剩一个落点，upper < lower 时要收敛成一个点
    expect(thumbBounds([50, 50, 50], 1, { ...o, minStepsBetweenThumbs: 10 }))
      .toEqual({ min: 60, max: 60 })
  })
})

describe('setThumbValue', () => {
  const o = { min: 0, max: 100, step: 1 }

  it('原数组不动，返回新数组', () => {
    const before = [20, 50]
    const after = setThumbValue(before, 0, 30, o)
    expect(before).toEqual([20, 50])
    expect(after).toEqual([30, 50])
  })

  it('推过邻居时停在邻居身上，不交换顺序', () => {
    // 交换顺序会让"第 0 个滑块"突然变成右边那个，键盘焦点与值就此错位
    expect(setThumbValue([20, 50], 0, 90, o)).toEqual([50, 50])
    expect(setThumbValue([20, 50], 1, 5, o)).toEqual([20, 20])
  })

  it('夹在整体区间内', () => {
    expect(setThumbValue([50], 0, 999, o)).toEqual([100])
    expect(setThumbValue([50], 0, -999, o)).toEqual([0])
  })
})

describe('closestThumb', () => {
  it('取最近的一个', () => {
    expect(closestThumb([20, 80], 30)).toBe(0)
    expect(closestThumb([20, 80], 70)).toBe(1)
  })

  it('两个重叠时取靠后的，用户才拉得开', () => {
    // 都取靠前的话，重叠在 max 上的两个滑块就再也分不开了
    expect(closestThumb([50, 50], 90)).toBe(1)
  })
})

describe('rangeExtent', () => {
  it('单滑块从起点画到当前值', () => {
    expect(rangeExtent([25], { min: 0, max: 100 })).toEqual({ start: 0, end: 0.25 })
  })

  it('多滑块画首末之间', () => {
    expect(rangeExtent([25, 75], { min: 0, max: 100 })).toEqual({ start: 0.25, end: 0.75 })
  })

  it('值顺序颠倒也按大小取，不按下标', () => {
    expect(rangeExtent([75, 25], { min: 0, max: 100 })).toEqual({ start: 0.25, end: 0.75 })
  })

  it('空值不炸', () => {
    expect(rangeExtent([], { min: 0, max: 100 })).toEqual({ start: 0, end: 0 })
  })
})
