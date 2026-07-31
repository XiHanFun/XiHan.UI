import type { Anchor, PositionEnginePort, PositionOptions, PositionResult } from '@xihan-ui/core'

/**
 * 定位套件的场景搭建与几何断言。
 * 判据一律落在"浮层最终出现在屏幕的哪个位置"上，不问引擎内部怎么算的。
 */

/** 断言容差（px）。真实布局有亚像素，差在 1px 以内不算偏。 */
export const POSITION_TOLERANCE = 1

/** 场景要求的最小视口，比这还小时四周留不出空间，避让会混进基本贴合的判据里。 */
const MIN_VIEWPORT = 420

export interface PositionProbe {
  /** 停止跟随。 */
  stop: () => void
  /** 最近一次结果。 */
  last: () => PositionResult
  /** 回调次数。 */
  count: () => number
  /** 等浮层落定：连续两帧读到同一个矩形。 */
  settle: () => Promise<void>
}

export function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

function rectKey(el: HTMLElement): string {
  const r = el.getBoundingClientRect()
  return `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)}`
}

/** 接上引擎并把每次结果落到浮层样式上，与适配器的做法一致。 */
export function attachProbe(
  engine: PositionEnginePort,
  anchor: Anchor,
  floating: HTMLElement,
  options: PositionOptions,
): PositionProbe {
  let last: PositionResult | null = null
  let count = 0

  const stop = engine.attach(anchor, floating, options, (result) => {
    last = result
    count += 1
    floating.style.left = `${result.x}px`
    floating.style.top = `${result.y}px`
  })

  return {
    stop,
    count: () => count,
    last: () => {
      if (!last)
        throw new Error('引擎一次都没回调，浮层位置无从谈起')
      return last
    },
    settle: async () => {
      let previous = ''
      let stable = 0
      for (let frame = 0; frame < 60; frame++) {
        await nextFrame()
        const key = rectKey(floating)
        if (key === previous && last != null) {
          stable += 1
          if (stable >= 2)
            return
        }
        else {
          stable = 0
          previous = key
        }
      }
    },
  }
}

export interface Stage {
  /** 铺满视口的定位容器，锚点与浮层都放在它里面。 */
  root: HTMLElement
  /** 放一个锚点到视口坐标 (x, y)。 */
  putAnchor: (x: number, y: number, width?: number, height?: number) => HTMLElement
  /** 放一个浮层，默认 40×24，够小以便四周都留得出空间。 */
  putFloating: (width?: number, height?: number, host?: HTMLElement) => HTMLElement
  cleanup: () => void
}

/**
 * 铺满视口的固定定位舞台。它自己就是绝对定位子元素的包含块，
 * 页面默认的 body 外边距与文档滚动都影响不到里面的坐标。
 */
export function createStage(): Stage {
  if (window.innerWidth < MIN_VIEWPORT || window.innerHeight < MIN_VIEWPORT)
    throw new Error(`视口 ${window.innerWidth}×${window.innerHeight} 太小，定位套件要求至少 ${MIN_VIEWPORT}×${MIN_VIEWPORT}`)

  const root = document.createElement('div')
  root.style.cssText = 'position:fixed;inset:0;margin:0;padding:0'
  document.body.appendChild(root)
  const extra: HTMLElement[] = []

  return {
    root,
    putAnchor: (x, y, width = 100, height = 40) => {
      const el = document.createElement('button')
      el.type = 'button'
      el.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${width}px;height:${height}px;margin:0;padding:0;border:0`
      root.appendChild(el)
      return el
    },
    putFloating: (width = 40, height = 24, host) => {
      const el = document.createElement('div')
      el.style.cssText = `position:absolute;left:0;top:0;width:${width}px;height:${height}px;margin:0;padding:0;box-sizing:border-box`
      const parent = host ?? root
      parent.appendChild(el)
      if (host)
        extra.push(el)
      return el
    },
    cleanup: () => {
      for (const el of extra) el.remove()
      root.remove()
    },
  }
}

/** 视口中心，基本贴合的用例都把锚点放这儿，四周都留得出空间。 */
export function viewportCenter(width = 100, height = 40): { x: number, y: number } {
  return {
    x: Math.round((window.innerWidth - width) / 2),
    y: Math.round((window.innerHeight - height) / 2),
  }
}

function fail(label: string, actual: number, expected: number): never {
  throw new Error(`${label}：实测 ${actual.toFixed(2)}，应为 ${expected.toFixed(2)}（差 ${Math.abs(actual - expected).toFixed(2)}px）`)
}

export function expectClose(actual: number, expected: number, label: string, tolerance = POSITION_TOLERANCE): void {
  if (!Number.isFinite(actual) || Math.abs(actual - expected) > tolerance)
    fail(label, actual, expected)
}

export function expectAtLeast(actual: number, min: number, label: string): void {
  if (!Number.isFinite(actual) || actual < min - POSITION_TOLERANCE)
    throw new Error(`${label}：实测 ${actual.toFixed(2)}，不应小于 ${min.toFixed(2)}`)
}

export function expectSame<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected)
    throw new Error(`${label}：实测 ${String(actual)}，应为 ${String(expected)}`)
}

/**
 * 断言浮层贴在锚点的指定边上、间距等于 offset、交叉轴按 align 对齐。
 * 两个矩形都取视口坐标，因此不关心谁是谁的包含块、中间隔了几层 transform。
 */
export function expectPlacedAt(
  anchor: DOMRect,
  floating: DOMRect,
  placement: string,
  offset: number,
): void {
  const [side, align = 'center'] = placement.split('-')

  switch (side) {
    case 'top':
      expectClose(floating.bottom, anchor.top - offset, '浮层底缘应贴在锚点上方')
      break
    case 'bottom':
      expectClose(floating.top, anchor.bottom + offset, '浮层顶缘应贴在锚点下方')
      break
    case 'left':
      expectClose(floating.right, anchor.left - offset, '浮层右缘应贴在锚点左侧')
      break
    case 'right':
      expectClose(floating.left, anchor.right + offset, '浮层左缘应贴在锚点右侧')
      break
    default:
      throw new Error(`未知的 side：${side}`)
  }

  const vertical = side === 'top' || side === 'bottom'
  if (align === 'start') {
    expectClose(vertical ? floating.left : floating.top, vertical ? anchor.left : anchor.top, '交叉轴起始缘应与锚点齐平')
  }
  else if (align === 'end') {
    expectClose(vertical ? floating.right : floating.bottom, vertical ? anchor.right : anchor.bottom, '交叉轴结束缘应与锚点齐平')
  }
  else {
    expectClose(
      vertical ? floating.left + floating.width / 2 : floating.top + floating.height / 2,
      vertical ? anchor.left + anchor.width / 2 : anchor.top + anchor.height / 2,
      '交叉轴中心应与锚点对齐',
    )
  }
}
