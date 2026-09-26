/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 滑动指示器的共用几何：当前项相对列表容器的位置与尺寸，以及几时该重量。
//
// Tabs、Segmented、Anchor、NavigationMenu 的指示器都是容器里一个绝对定位的小元素，
// 位置交给 transform、尺寸交给 inline-size / block-size，数值由这里量出、连接层投成私有槽。

import type { Direction } from '@xihan-ui/core'
import type { SpringValue } from '@xihan-ui/motion'
import { readDirection } from '@xihan-ui/core'
import { isLiquidMaterial } from '@xihan-ui/core/visual-environment'
import { createSpringValue } from '@xihan-ui/motion'

/** 指示器的盒子，逻辑方向：起始缘从行首 / 块首量起，单位 px。 */
export interface IndicatorBox {
  inlineStart: number
  blockStart: number
  inlineSize: number
  blockSize: number
}

/**
 * 量条目相对容器内衬盒的排布位。
 *
 * 沿 offsetParent 链累加到容器，量的是排布位而不是屏幕上的矩形：祖先的 transform
 * （对话框进场时的缩放、标签带的平移）不改变结果；getBoundingClientRect 在这些时候量到的
 * 是缩放后或位移半路上的值，指示器会跟着偏小、偏位。容器必须是条目的定位祖先
 * （指示器绝对定位于它）：条目不在容器里、或定位链越过了容器时返回 null。
 * 链上没有定位祖先可循（宿主不排版、祖先 display: none）时按已经量到的那一段算。
 *
 * 起始缘按书写方向算：RTL 下从容器内衬盒的右缘往左量。方向缺省从容器的计算样式现读，
 * 祖先链上任意一处 dir 或 CSS direction 都算数。
 */
export function measureIndicatorBox(container: HTMLElement, item: HTMLElement, dir?: Direction): IndicatorBox | null {
  if (!container.contains(item))
    return null
  let left = 0
  let top = 0
  let node = item
  while (node !== container) {
    left += node.offsetLeft
    top += node.offsetTop
    const parent = node.offsetParent as HTMLElement | null
    if (!parent)
      break
    // 容器不是定位祖先：偏移量的是容器外的参照系
    if (parent !== container && !container.contains(parent))
      return null
    // offset* 从定位祖先的内衬边量起；越过中间一层定位祖先时补上它自己的描边
    if (parent !== container) {
      left += parent.clientLeft
      top += parent.clientTop
    }
    node = parent
  }
  const rtl = (dir ?? readDirection(container)) === 'rtl'
  return {
    inlineStart: rtl ? container.clientWidth - left - item.offsetWidth : left,
    blockStart: top,
    inlineSize: item.offsetWidth,
    blockSize: item.offsetHeight,
  }
}

/** 两次量测是否一样：作 cell 的 isEqual 用，量到同一结果不多推一次更新。 */
export function sameIndicatorBox(a: IndicatorBox | null, b: IndicatorBox | null | undefined): boolean {
  if (a == null || b == null)
    return a === b
  return a.inlineStart === b.inlineStart && a.blockStart === b.blockStart
    && a.inlineSize === b.inlineSize && a.blockSize === b.blockSize
}

export interface IndicatorLayoutOptions {
  /** 指示器的定位容器。 */
  container: HTMLElement
  /** 会改变指示器落点的条目；条目增减后按它重新取一遍。 */
  items: () => Iterable<Element>
  /** 要重量了。同一帧里的多次变化只回调一次。 */
  onChange: () => void
}

/**
 * 盯住会让指示器错位的变化：容器与各条目的尺寸（容器变窄换行、条目文案变长）、
 * 条目增减、字体加载完成（换上正式字体后字宽变了）。宿主没有哪种观察器就少盯哪一路，
 * 选中值变化与组件自己的显式重量照常生效。
 */
export function trackIndicatorLayout(win: Window & typeof globalThis, options: IndicatorLayoutOptions): () => void {
  const { container, items, onChange } = options
  let disposed = false
  let frame = 0
  const schedule = (): void => {
    if (disposed || frame)
      return
    frame = win.requestAnimationFrame(() => {
      frame = 0
      if (!disposed)
        onChange()
    })
  }

  const ResizeObserverCtor = win.ResizeObserver
  const resizeObserver = typeof ResizeObserverCtor === 'function' ? new ResizeObserverCtor(schedule) : null
  const observeAll = (): void => {
    if (!resizeObserver)
      return
    resizeObserver.disconnect()
    resizeObserver.observe(container)
    for (const item of items())
      resizeObserver.observe(item)
  }
  observeAll()

  const MutationObserverCtor = win.MutationObserver
  const mutationObserver = typeof MutationObserverCtor === 'function'
    ? new MutationObserverCtor(() => {
        observeAll()
        schedule()
      })
    : null
  mutationObserver?.observe(container, { childList: true, subtree: true })

  const fonts = container.ownerDocument.fonts as FontFaceSet | undefined
  fonts?.addEventListener?.('loadingdone', schedule)

  return () => {
    disposed = true
    if (frame)
      win.cancelAnimationFrame(frame)
    resizeObserver?.disconnect()
    mutationObserver?.disconnect()
    fonts?.removeEventListener?.('loadingdone', schedule)
  }
}

/** 指示器沿哪条轴走：横排的条目沿行向，竖排的沿块向。 */
export type IndicatorAxis = 'inline' | 'block'

export interface LiquidIndicatorOptions {
  /** 指示器沿哪条轴走，每次落位时现读：运行期改排布方向也跟得上。 */
  axis: () => IndicatorAxis
  /** 取弹簧的宿主元素：据它判断材质轴与减弱动效、取窗口。拿不到时一律直接落定。 */
  host: () => HTMLElement | null
  /**
   * 要投出去的盒子与拉伸比。拉伸比是指示器沿主轴比目标长出的那一截占目标的比例，
   * 皮肤据它在另一个方向上压扁；直接落定与停稳时为 0。
   */
  onFrame: (box: IndicatorBox | null, stretch: number) => void
}

export interface LiquidIndicator {
  /**
   * 落到新盒子。key 是指示器所指的那一项：key 变了、宿主在液态档下、此前已有落点时，
   * 两沿各一支弹簧追过去——去向那一侧的沿用前沿参数，另一侧用后沿参数，途中被拉长、停下时收回；
   * 其余情形（尺寸变化重量、首次落位、标准档）直接落定，由皮肤的过渡接手。
   */
  place: (box: IndicatorBox | null, key: unknown) => void
  dispose: () => void
}

function edgesOf(box: IndicatorBox, axis: IndicatorAxis): [number, number] {
  return axis === 'inline'
    ? [box.inlineStart, box.inlineStart + box.inlineSize]
    : [box.blockStart, box.blockStart + box.blockSize]
}

/** 取到 0.1px：弹簧的尾数对画面没有意义，只会让每一帧都推一次更新。 */
const tenth = (value: number): number => Math.round(value * 10) / 10

/** 液态档的双沿指示器：两条边各一支弹簧，移动中拉长、停下收回。 */
export function createLiquidIndicator(options: LiquidIndicatorOptions): LiquidIndicator {
  let current: IndicatorBox | null = null
  let target: IndicatorBox | null = null
  let lastKey: unknown
  let axis: IndicatorAxis = 'inline'
  // 起始沿、结束沿各一支；谁领先按这一轮的去向定
  const edges: [SpringValue | null, SpringValue | null] = [null, null]
  // 每一轮弹簧一个编号：上一轮被打断后迟到的收尾不再落定
  let round = 0

  const stopEdges = (): void => {
    edges[0]?.stop()
    edges[1]?.stop()
    edges[0] = null
    edges[1] = null
  }

  const emit = (): void => {
    const [startEdge, endEdge] = edges
    if (!target || !startEdge || !endEdge)
      return
    const start = tenth(Math.min(startEdge.value, endEdge.value))
    const end = tenth(Math.max(startEdge.value, endEdge.value))
    const [targetStart, targetEnd] = edgesOf(target, axis)
    const size = Math.max(0, end - start)
    const targetSize = targetEnd - targetStart
    current = axis === 'inline'
      ? { ...target, inlineStart: start, inlineSize: size }
      : { ...target, blockStart: start, blockSize: size }
    const stretch = targetSize > 0 ? Math.max(0, size - targetSize) / targetSize : 0
    options.onFrame(current, Math.round(stretch * 1000) / 1000)
  }

  return {
    place: (box, key) => {
      const host = options.host()
      const moved = key !== lastKey
      lastKey = key
      axis = options.axis()
      const running = Boolean(edges[0]?.animating || edges[1]?.animating)
      // 同一项又量了一遍（量测本就同步、推迟各跑一遍）：落点没变就接着走；
      // 走到一半落点变了（尺寸变化），两沿改追新落点，位置与速度都不跳
      if (!moved && running && box && target) {
        if (!sameIndicatorBox(box, target)) {
          target = box
          const to = edgesOf(box, axis)
          void edges[0]!.to(to[0])
          void edges[1]!.to(to[1])
        }
        return
      }
      if (!box || !current || !moved || !host || !isLiquidMaterial(host)) {
        round++
        stopEdges()
        target = box
        current = box
        options.onFrame(box, 0)
        return
      }
      const from = edgesOf(current, axis)
      const to = edgesOf(box, axis)
      const forward = to[0] + to[1] > from[0] + from[1]
      target = box
      const id = ++round
      const settled = ([0, 1] as const).map((edge) => {
        // 去向那一侧的沿领先：往后走时结束沿用前沿参数，往前走时起始沿用
        const leads = forward ? edge === 1 : edge === 0
        const previous = edges[edge]
        // 上一轮还在走就接着它的位置与速度，位置与速度都不跳
        const value = previous ? previous.value : from[edge]
        const velocity = previous ? previous.velocity : 0
        previous?.stop()
        const next = createSpringValue({ spring: leads ? 'lead' : 'trail', value, target: host, onUpdate: emit })
        edges[edge] = next
        return next.to(to[edge], { velocity })
      })
      emit()
      void Promise.all(settled).then((results) => {
        if (id !== round || results.some(result => result !== 'rest'))
          return
        current = target
        options.onFrame(target, 0)
      })
    },
    dispose: () => {
      round++
      stopEdges()
    },
  }
}
