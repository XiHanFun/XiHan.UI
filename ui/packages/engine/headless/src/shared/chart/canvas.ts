/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 画布数据层的宿主：后备尺寸随视口与 DPR；重绘按微任务合并（同一轮提交里的多次变化只画一次，
// 在宿主提交之后、这一帧上屏之前画，与 SVG 层同帧）；主题与密度、强制色、深浅色、对比度、打印、分辨率变化，
// 以及系列分组的不透明度过渡（淡出由 CSS 驱动）期间逐帧重画。画什么由各图表的 paint 决定，这里不认识标记。

import type { EffectFn, EffectParams, MachineSchema } from '@xihan-ui/core'
import type { ChartSprites } from './canvas-sprite'
import type { ChartStyleCache, ChartStyleReader } from './canvas-style'
import type { ChartSize } from './types'
import { VISUAL_ENVIRONMENT_ATTRIBUTES } from '@xihan-ui/core/visual-environment'
import { frameLoop } from '@xihan-ui/motion'
import { createChartSprites } from './canvas-sprite'
import { createChartStyleCache, createChartStyleReader } from './canvas-style'

/** 画布的后备面积上限（设备像素）：超出时按比例降 DPR，不让浏览器因超限丢掉整块画布。 */
const MAX_BACKING_AREA = 4096 * 4096
/** 打印时的 DPR 下限：印出来不糊。 */
const PRINT_DPR = 2
/** 样式探针还没被框架提交时，最多补画几帧。 */
const MAX_RETRIES = 3

/** 宿主对外的口：排一次重绘。 */
export interface ChartCanvasHost {
  readonly request: () => void
}

/** 交给各图表 paint 的一帧。 */
export interface ChartCanvasFrame {
  readonly ctx: CanvasRenderingContext2D
  /** 画布的 CSS 尺寸：坐标系与 SVG 绘图区相同，DPR 已在变换里。 */
  readonly width: number
  readonly height: number
  readonly dpr: number
  readonly root: HTMLElement
  readonly styles: ChartStyleReader
  /** 符号的精灵图：逐点贴图，按数据次序叠放。 */
  readonly sprites: ChartSprites
  /** 清空整块画布。没有可画的数据时不清：画布淡出期间留着上一帧。 */
  readonly clear: () => void
}

/** 画布宿主用到的那几片状态。 */
export interface ChartCanvasSchema extends MachineSchema {
  context: { size: ChartSize | null }
  refs: {
    getRootEl: () => HTMLElement | null
    getCanvasEl: () => HTMLCanvasElement | null
    canvas: ChartCanvasHost | null
    alive: boolean
  }
}

export interface ChartCanvasOptions<S extends ChartCanvasSchema> {
  /** 此刻是不是画在画布上（渲染器解析成 canvas）。 */
  readonly active: (params: EffectParams<S>) => boolean
  /** 画一帧。返回 false 表示有样式探针还没被提交，下一帧补画。 */
  readonly paint: (params: EffectParams<S>, frame: ChartCanvasFrame) => boolean
}

/** 视觉环境之外还要盯的祖先属性：纹理开关、配色方案、作者改主题的类名与内联的令牌覆盖。 */
const EXTRA_ATTRIBUTES = ['data-xh-chart-patterns', 'data-xh-chart-palette', 'class', 'style'] as const

/** 根自己身上也会写的属性：作者把配色方案直接写在图表上。根的类名与内联样式随状态频繁变，不在此列。 */
const ROOT_ATTRIBUTES = ['data-xh-chart-palette', 'data-xh-chart-patterns'] as const

/** 这些媒体条件一变，探针的计算样式就可能变。 */
const MEDIA = ['(forced-colors: active)', '(prefers-color-scheme: dark)', '(prefers-contrast: more)', '(prefers-reduced-transparency: reduce)'] as const

/**
 * 画布数据层的效应：挂载时建宿主，refs.canvas 交出 request 供机器在状态变化后排重绘。
 * 根与画布节点推迟到宿主提交之后再找：挂载这一刻它们未必就位，画布还会随渲染器切换出现、消失。
 */
export function trackChartCanvas<S extends ChartCanvasSchema>(options: ChartCanvasOptions<S>): EffectFn<S> {
  return (params) => {
    const { refs, scope, context, flush } = params
    const win = scope.getWin()
    const cache: ChartStyleCache = createChartStyleCache()
    let sprites: ChartSprites | null = null
    let disposed = false
    let queued = false
    let retries = 0
    let printing = false
    let stopLoop: VoidFunction | null = null
    const running = new Set<EventTarget>()
    const cleanups: VoidFunction[] = []

    const devicePixelRatio = (size: ChartSize): number => {
      const base = Math.max(1, win.devicePixelRatio || 1)
      const dpr = printing ? Math.max(PRINT_DPR, base) : base
      const area = size.width * size.height
      return area > 0 ? Math.min(dpr, Math.sqrt(MAX_BACKING_AREA / area)) : dpr
    }

    function paintNow(): void {
      if (disposed)
        return
      const canvas = refs.get('getCanvasEl')()
      const root = refs.get('getRootEl')()
      const size = context.get('size')
      if (!canvas || !root || !size || !options.active(params))
        return
      const dpr = devicePixelRatio(size)
      const width = Math.max(1, Math.round(size.width * dpr))
      const height = Math.max(1, Math.round(size.height * dpr))
      if (canvas.width !== width)
        canvas.width = width
      if (canvas.height !== height)
        canvas.height = height
      let ctx: CanvasRenderingContext2D | null = null
      try {
        ctx = canvas.getContext('2d')
      }
      catch {
        ctx = null
      }
      // 没有 2D 上下文（jsdom、受限环境）：结构照常输出，只是不画
      if (!ctx)
        return
      const target = ctx
      sprites ??= createChartSprites(root.ownerDocument)
      target.setTransform(dpr, 0, 0, dpr, 0, 0)
      const complete = options.paint(params, {
        ctx: target,
        width: size.width,
        height: size.height,
        dpr,
        root,
        styles: createChartStyleReader(target, dpr, cache),
        sprites,
        clear: () => {
          target.save()
          target.setTransform(1, 0, 0, 1, 0, 0)
          target.clearRect(0, 0, width, height)
          target.restore()
        },
      })
      if (complete) {
        retries = 0
      }
      else if (retries < MAX_RETRIES) {
        retries += 1
        win.requestAnimationFrame(() => request())
      }
    }

    function request(): void {
      if (queued || disposed)
        return
      queued = true
      queueMicrotask(() => {
        queued = false
        paintNow()
      })
    }

    refs.set('canvas', { request })

    // —— 分辨率：浏览器缩放、窗口拖到另一块屏 ——
    let resolution: MediaQueryList | null = null
    const watchResolution = (): void => {
      resolution?.removeEventListener('change', onResolution)
      resolution = typeof win.matchMedia === 'function' ? win.matchMedia(`(resolution: ${win.devicePixelRatio || 1}dppx)`) : null
      resolution?.addEventListener('change', onResolution)
    }
    function onResolution(): void {
      watchResolution()
      request()
    }
    watchResolution()
    cleanups.push(() => resolution?.removeEventListener('change', onResolution))

    // —— 媒体条件：强制色、深浅色、对比度、减弱透明；打印单独处理 DPR ——
    for (const query of MEDIA) {
      const list = typeof win.matchMedia === 'function' ? win.matchMedia(query) : null
      list?.addEventListener('change', request)
      cleanups.push(() => list?.removeEventListener('change', request))
    }
    // 打印时浏览器在 beforeprint 之后立刻截图：同步重画，不排微任务
    const setPrinting = (value: boolean): void => {
      if (printing === value)
        return
      printing = value
      paintNow()
    }
    const print = typeof win.matchMedia === 'function' ? win.matchMedia('print') : null
    const onPrintMedia = (event: MediaQueryListEvent): void => setPrinting(event.matches)
    const beforePrint = (): void => setPrinting(true)
    const afterPrint = (): void => setPrinting(false)
    print?.addEventListener('change', onPrintMedia)
    win.addEventListener('beforeprint', beforePrint)
    win.addEventListener('afterprint', afterPrint)
    cleanups.push(() => {
      print?.removeEventListener('change', onPrintMedia)
      win.removeEventListener('beforeprint', beforePrint)
      win.removeEventListener('afterprint', afterPrint)
    })

    // —— 根一就位：盯祖先的主题属性、系列分组的不透明度过渡 ——
    flush(() => {
      const root = refs.get('getRootEl')()
      if (disposed || !root)
        return
      if (typeof win.MutationObserver === 'function') {
        const observer = new win.MutationObserver(request)
        observer.observe(root, { attributes: true, attributeFilter: [...ROOT_ATTRIBUTES] })
        for (let el: Element | null = root.parentElement; el; el = el.parentElement)
          observer.observe(el, { attributes: true, attributeFilter: [...VISUAL_ENVIRONMENT_ATTRIBUTES, ...EXTRA_ATTRIBUTES] })
        cleanups.push(() => observer.disconnect())
      }
      // 淡出与强调由系列分组的 CSS 过渡驱动：过渡期间逐帧读它此刻的不透明度重画
      const isSeries = (target: EventTarget | null): target is Element =>
        target != null && typeof (target as Element).getAttribute === 'function' && (target as Element).getAttribute('data-part') === 'series'
      const onRun = (event: Event): void => {
        const e = event as TransitionEvent
        if (e.propertyName !== 'opacity' || !isSeries(e.target))
          return
        running.add(e.target)
        stopLoop ??= frameLoop(win, paintNow)
      }
      const onEnd = (event: Event): void => {
        const e = event as TransitionEvent
        if (e.propertyName !== 'opacity' || !running.delete(e.target as EventTarget) || running.size > 0)
          return
        stopLoop?.()
        stopLoop = null
        request()
      }
      root.addEventListener('transitionrun', onRun)
      root.addEventListener('transitionend', onEnd)
      root.addEventListener('transitioncancel', onEnd)
      cleanups.push(() => {
        root.removeEventListener('transitionrun', onRun)
        root.removeEventListener('transitionend', onEnd)
        root.removeEventListener('transitioncancel', onEnd)
      })
      request()
    })

    return () => {
      disposed = true
      stopLoop?.()
      stopLoop = null
      for (const cleanup of cleanups.splice(0))
        cleanup()
      refs.set('canvas', null)
    }
  }
}
