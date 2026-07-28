import type { Direction, Orientation } from '@xihan-ui/core'
import { clamp } from '../shared/number'

/**
 * 滚动量 ↔ 滑块几何的换算。整块是纯函数：给定量好的尺寸算比例、给定指针位移算新滚动量，
 * 不碰 DOM、不认识状态机——尺寸由调用方在事件发生的那一刻量好传进来。
 *
 * 坑集中在两处：
 * ① 除零。内容还没布局时四个尺寸全是 0，直接除会得到 NaN 并一路写进内联样式的百分比；
 * ② 方向。RTL 下横轴的 scrollLeft 在符合规范的浏览器里是 0 到负数（0 在右缘），
 *    而滑块用的是逻辑属性（inset-inline-start，RTL 下映射到右缘）。
 *    因此对外一律用"距逻辑起始缘的距离"这一个恒非负的量，进出各翻译一次，
 *    别让每个调用点自己判一遍。
 */

/** 某条轴上量到的四个尺寸。 */
export interface ScrollAreaAxisMetrics {
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
export interface ScrollAreaAxisGeometry {
  /** 内容比视口长才谈得上滚动；为 false 时滚动条整体不该显形。 */
  overflow: boolean
  /** 滑块长度占轨道的比例。 */
  size: number
  /** 滑块起点距轨道逻辑起始缘的比例。 */
  offset: number
}

/** 换算要知道自己在哪条轴上，以及横轴的排版方向。 */
export interface ScrollAreaAxis {
  axis: Orientation
  dir?: Direction
}

/** 矩形的四个数，与 DOMRect 的同名字段对齐；调用方现量后传进来。 */
export interface ScrollAreaRect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 滑块最短多少像素。比例算出来的滑块在长文档里会短到按不住
 * （一万像素的内容配两百像素的视口，滑块只有 4px），这里兜一个下限。
 *
 * 刻意不做成 prop、样式层也不许再写 min-block-size：
 * 内联样式里的长度是连接层按这个常量算出来的，样式表再给一个下限就是两个事实源，
 * 两者一旦不一致，滑块的实际长度与它能走的距离就对不上，拖到尽头会差一截。
 */
export const SCROLL_AREA_MIN_THUMB_SIZE = 20

/**
 * 判定溢出时容许的误差（px）。clientHeight 是取整的、scrollHeight 不是，
 * 不留这一格的话，一个根本滚不动的容器会因为半像素的差额常年挂着一条滚动条。
 */
const OVERFLOW_EPSILON = 1

/** 还能往前滚多少。内容不比视口长时为 0，不产生负数。 */
export function maxScrollOffset(m: Pick<ScrollAreaAxisMetrics, 'viewport' | 'content'>): number {
  return Math.max(0, m.content - m.viewport)
}

/** 这条轴溢出了吗。半像素级的差额不算，见 OVERFLOW_EPSILON。 */
export function isOverflowing(m: Pick<ScrollAreaAxisMetrics, 'viewport' | 'content'>): boolean {
  return m.content - m.viewport > OVERFLOW_EPSILON
}

/**
 * 滑块长度占轨道的比例 = 视口 / 内容，再兜一个像素下限。
 * 尺寸没量到或压根不溢出时铺满轨道：没有可滚的余量，滑块也就没有可走的距离。
 */
export function thumbSizeRatio(m: ScrollAreaAxisMetrics, minThumbSize = SCROLL_AREA_MIN_THUMB_SIZE): number {
  if (m.content <= 0 || m.viewport >= m.content)
    return 1
  const raw = clamp(m.viewport / m.content, 0, 1)
  // 轨道还没量到（滚动条收着时 clientHeight 是 0）就没法把像素下限折成比例，此时只用比例
  const floor = m.track > 0 ? clamp(minThumbSize / m.track, 0, 1) : 0
  return Math.max(raw, floor)
}

/**
 * 滑块起点占轨道的比例 = 已滚比例 × 滑块能走的那段。
 * 乘 (1 - size) 而不是直接用已滚比例：滑块自己占着一截轨道，滚到底时它的**起点**
 * 只走到 1 - size，直接用比例会让滑块整个滑出轨道。
 */
export function thumbOffsetRatio(m: ScrollAreaAxisMetrics, minThumbSize = SCROLL_AREA_MIN_THUMB_SIZE): number {
  const max = maxScrollOffset(m)
  if (max <= 0)
    return 0
  return clamp(m.scroll / max, 0, 1) * (1 - thumbSizeRatio(m, minThumbSize))
}

/** 一条轴的完整几何，连接层每帧读它。 */
export function scrollbarGeometry(
  m: ScrollAreaAxisMetrics,
  minThumbSize = SCROLL_AREA_MIN_THUMB_SIZE,
): ScrollAreaAxisGeometry {
  return {
    overflow: isOverflowing(m),
    size: thumbSizeRatio(m, minThumbSize),
    offset: thumbOffsetRatio(m, minThumbSize),
  }
}

/** DOM 的 scrollLeft / scrollTop → 距逻辑起始缘的距离（恒非负）。 */
export function toLogicalScroll(raw: number, o: ScrollAreaAxis): number {
  return o.axis === 'horizontal' && o.dir === 'rtl' ? Math.abs(raw) : raw
}

/** 反向：写回 scrollLeft 时 RTL 横轴取负（0 在右缘，向左滚是负数）。 */
export function toDomScroll(offset: number, o: ScrollAreaAxis): number {
  return o.axis === 'horizontal' && o.dir === 'rtl' ? -offset : offset
}

/**
 * 指针从按下点走了多远，换成"逻辑起始缘方向"的位移。
 * RTL 横轴上手往左移是滚动量变大，屏幕位移与逻辑位移反号。
 */
export function pointerDelta(origin: number, current: number, o: ScrollAreaAxis): number {
  const raw = current - origin
  return o.axis === 'horizontal' && o.dir === 'rtl' ? -raw : raw
}

/** 指针落在轨道上的位置，换成距轨道逻辑起始缘的像素。 */
export function trackOffset(
  point: { clientX: number, clientY: number },
  rect: ScrollAreaRect,
  o: ScrollAreaAxis,
): number {
  if (o.axis === 'vertical')
    return point.clientY - rect.y
  const raw = point.clientX - rect.x
  return o.dir === 'rtl' ? rect.width - raw : raw
}

/**
 * 拖动滑块：按下那一刻的滚动量 + 指针位移换算出的增量。
 * 换算的分母是滑块**能走的距离**（轨道减去滑块自身长度），不是整条轨道——
 * 用整条轨道当分母，手指走到底时内容只滚了 (1 - size) 那么多，永远到不了尽头。
 */
export function scrollFromThumbDrag(
  startScroll: number,
  delta: number,
  m: ScrollAreaAxisMetrics,
  minThumbSize = SCROLL_AREA_MIN_THUMB_SIZE,
): number {
  const max = maxScrollOffset(m)
  if (max <= 0)
    return 0
  const travel = m.track * (1 - thumbSizeRatio(m, minThumbSize))
  // 轨道没量到、或滑块铺满轨道：这一拖没有可换算的行程，停在原处而不是除出 Infinity
  if (travel <= 0)
    return clamp(startScroll, 0, max)
  return clamp(startScroll + (delta / travel) * max, 0, max)
}

/**
 * 点轨道空白处：把滑块**中心**挪到落点，而不是把落点当作滑块起点——
 * 后者会让内容整体偏掉半个滑块的距离，点在正中却滚不到正中。
 */
export function scrollFromTrackPoint(
  offset: number,
  m: ScrollAreaAxisMetrics,
  minThumbSize = SCROLL_AREA_MIN_THUMB_SIZE,
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
