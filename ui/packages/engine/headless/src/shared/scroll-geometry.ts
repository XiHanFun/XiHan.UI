import type { Direction, Orientation } from '@xihan-ui/kernel'
import { clamp } from './number'

/**
 * 滚动量 ↔ 滑块几何的换算，纯函数：尺寸由调用方在事件发生那一刻量好传入，不碰 DOM。
 * 内容未布局时四个尺寸全为 0，除法一律先判零；RTL 横轴 scrollLeft 为负，
 * 对外统一用恒非负的"距逻辑起始缘距离"，进出各翻译一次。
 */

/** 某条轴上量到的四个尺寸。 */
export interface ScrollAxisMetrics {
  /** 视口在该轴上的可视长度（clientHeight / clientWidth）。 */
  viewport: number
  /** 内容在该轴上的总长度（scrollHeight / scrollWidth）。 */
  content: number
  /** 距逻辑起始缘的滚动量，恒非负（RTL 横轴已翻译过）。 */
  scroll: number
  /** 滚动条轨道长度；0 表示还没量到（滚动条此刻收着或尚未布局）。 */
  track: number
}

/** 滑块在轨道上的几何，全部是 0-1 的比例。 */
export interface ScrollAxisGeometry {
  /** 内容比视口长才谈得上滚动；为 false 时滚动条整体不该显形。 */
  overflow: boolean
  /** 滑块长度占轨道的比例。 */
  size: number
  /** 滑块起点距轨道逻辑起始缘的比例。 */
  offset: number
}

/** 换算要知道自己在哪条轴上，以及横轴的排版方向。 */
export interface ScrollAxis {
  axis: Orientation
  dir?: Direction
}

/** 矩形的四个数，与 DOMRect 的同名字段对齐；调用方现量后传进来。 */
export interface ScrollRect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 滑块最短多少像素，兜住长文档里按不住的极短滑块。
 * 内联样式的滑块长度按它算出，样式表不得再写 min-block-size，否则两处长度对不上。
 */
export const SCROLL_MIN_THUMB_SIZE = 20

/** 判定溢出时容许的误差（px）：clientHeight 取整而 scrollHeight 不取整，差半像素不算溢出。 */
const OVERFLOW_EPSILON = 1

/** 还能往前滚多少。内容不比视口长时为 0，不产生负数。 */
export function maxScrollOffset(m: Pick<ScrollAxisMetrics, 'viewport' | 'content'>): number {
  return Math.max(0, m.content - m.viewport)
}

/** 这条轴溢出了吗。半像素级的差额不算，见 OVERFLOW_EPSILON。 */
export function isOverflowing(m: Pick<ScrollAxisMetrics, 'viewport' | 'content'>): boolean {
  return m.content - m.viewport > OVERFLOW_EPSILON
}

/**
 * 滑块长度占轨道的比例 = 视口 / 内容，再兜一个像素下限。
 * 尺寸没量到或不溢出时铺满轨道。
 */
export function thumbSizeRatio(m: ScrollAxisMetrics, minThumbSize = SCROLL_MIN_THUMB_SIZE): number {
  if (m.content <= 0 || m.viewport >= m.content)
    return 1
  const raw = clamp(m.viewport / m.content, 0, 1)
  // 轨道还没量到（滚动条收着时 clientHeight 是 0）就没法把像素下限折成比例，此时只用比例
  const floor = m.track > 0 ? clamp(minThumbSize / m.track, 0, 1) : 0
  return Math.max(raw, floor)
}

/** 滑块起点占轨道的比例 = 已滚比例 × 滑块能走的那段 (1 - size)。 */
export function thumbOffsetRatio(m: ScrollAxisMetrics, minThumbSize = SCROLL_MIN_THUMB_SIZE): number {
  const max = maxScrollOffset(m)
  if (max <= 0)
    return 0
  return clamp(m.scroll / max, 0, 1) * (1 - thumbSizeRatio(m, minThumbSize))
}

/** 一条轴的完整几何，连接层每帧读它。 */
export function scrollbarGeometry(
  m: ScrollAxisMetrics,
  minThumbSize = SCROLL_MIN_THUMB_SIZE,
): ScrollAxisGeometry {
  return {
    overflow: isOverflowing(m),
    size: thumbSizeRatio(m, minThumbSize),
    offset: thumbOffsetRatio(m, minThumbSize),
  }
}

/** DOM 的 scrollLeft / scrollTop → 距逻辑起始缘的距离（恒非负）。 */
export function toLogicalScroll(raw: number, o: ScrollAxis): number {
  return o.axis === 'horizontal' && o.dir === 'rtl' ? Math.abs(raw) : raw
}

/** 反向：写回 scrollLeft 时 RTL 横轴取负（0 在右缘，向左滚是负数）。 */
export function toDomScroll(offset: number, o: ScrollAxis): number {
  return o.axis === 'horizontal' && o.dir === 'rtl' ? -offset : offset
}

/**
 * 指针从按下点走了多远，换成"逻辑起始缘方向"的位移。
 * RTL 横轴上手往左移是滚动量变大，屏幕位移与逻辑位移反号。
 */
export function pointerDelta(origin: number, current: number, o: ScrollAxis): number {
  const raw = current - origin
  return o.axis === 'horizontal' && o.dir === 'rtl' ? -raw : raw
}

/** 指针落在轨道上的位置，换成距轨道逻辑起始缘的像素。 */
export function trackOffset(
  point: { clientX: number, clientY: number },
  rect: ScrollRect,
  o: ScrollAxis,
): number {
  if (o.axis === 'vertical')
    return point.clientY - rect.y
  const raw = point.clientX - rect.x
  return o.dir === 'rtl' ? rect.width - raw : raw
}

/** 拖动滑块：按下那一刻的滚动量 + 指针位移 ÷ 滑块能走的距离（轨道减滑块长度）× 最大滚动量。 */
export function scrollFromThumbDrag(
  startScroll: number,
  delta: number,
  m: ScrollAxisMetrics,
  minThumbSize = SCROLL_MIN_THUMB_SIZE,
): number {
  const max = maxScrollOffset(m)
  if (max <= 0)
    return 0
  const travel = m.track * (1 - thumbSizeRatio(m, minThumbSize))
  // 没有可换算的行程，停在原处而不是除出 Infinity
  if (travel <= 0)
    return clamp(startScroll, 0, max)
  return clamp(startScroll + (delta / travel) * max, 0, max)
}

/** 点轨道空白处：把滑块中心挪到落点。 */
export function scrollFromTrackPoint(
  offset: number,
  m: ScrollAxisMetrics,
  minThumbSize = SCROLL_MIN_THUMB_SIZE,
): number {
  const max = maxScrollOffset(m)
  if (max <= 0)
    return 0
  const size = thumbSizeRatio(m, minThumbSize)
  const travel = m.track * (1 - size)
  if (travel <= 0)
    return 0
  return clamp((offset - (m.track * size) / 2) / travel, 0, 1) * max
}
