/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 图表标签的落位与避让：一列标签按纵坐标推开，放不下时去掉最不重要的；散落的标签按优先级
// 逐个落位，与已落位的重叠就不画。标签只是增强，读者总能从提示框、摘要与数据表读到同一个数。

/** 标签占的矩形（px）。 */
export interface ChartLabelBox {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/**
 * 一列标签按纵坐标排开：先自上而下推开、再自下而上回推，挤不下时去掉数值最小的那个再排，
 * 直到整列都落在 [min, max] 里。返回留下的项，y 换成排开后的位置。
 */
export function settleColumn<T extends { y: number, value: number }>(items: readonly T[], min: number, max: number, lineHeight: number): T[] {
  let kept = [...items].sort((a, b) => a.y - b.y)
  for (;;) {
    const ys = kept.map(item => item.y)
    for (let i = 0; i < ys.length; i++)
      ys[i] = Math.max(ys[i]!, i === 0 ? min : ys[i - 1]! + lineHeight)
    for (let i = ys.length - 1; i >= 0; i--)
      ys[i] = Math.min(ys[i]!, i === ys.length - 1 ? max : ys[i + 1]! - lineHeight)
    if (ys.length === 0 || ys[0]! >= min - 0.5)
      return kept.map((item, i) => ({ ...item, y: ys[i]! }))
    let smallest = 0
    kept.forEach((item, i) => {
      if (item.value < kept[smallest]!.value)
        smallest = i
    })
    kept = kept.filter((_, i) => i !== smallest)
  }
}

function overlaps(a: ChartLabelBox, b: ChartLabelBox): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

function inside(box: ChartLabelBox, bounds: ChartLabelBox): boolean {
  return box.x >= bounds.x - 0.5
    && box.y >= bounds.y - 0.5
    && box.x + box.width <= bounds.x + bounds.width + 0.5
    && box.y + box.height <= bounds.y + bounds.height + 0.5
}

/**
 * 按优先级从高到低逐个落位：越出边界或与已落位的标签重叠就不画。
 * 优先级相同时保持输入次序，结果按输入次序返回。
 */
export function placeWithoutOverlap<T extends { box: ChartLabelBox, priority: number }>(items: readonly T[], bounds: ChartLabelBox): T[] {
  const order = items.map((item, i) => ({ item, i })).sort((a, b) => b.item.priority - a.item.priority || a.i - b.i)
  const placed: ChartLabelBox[] = []
  const kept = new Set<number>()
  for (const { item, i } of order) {
    if (!inside(item.box, bounds) || placed.some(box => overlaps(box, item.box)))
      continue
    placed.push(item.box)
    kept.add(i)
  }
  return items.filter((_, i) => kept.has(i))
}

/** 文字按对齐方式与基线换成它占的矩形。 */
export function labelBox(
  x: number,
  y: number,
  width: number,
  height: number,
  anchor: 'start' | 'middle' | 'end',
  baseline: 'top' | 'middle' | 'bottom',
): ChartLabelBox {
  const left = anchor === 'start' ? x : anchor === 'end' ? x - width : x - width / 2
  const top = baseline === 'top' ? y : baseline === 'bottom' ? y - height : y - height / 2
  return { x: left, y: top, width, height }
}
