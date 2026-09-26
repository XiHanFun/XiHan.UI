import type { ConformanceCase } from '../../conformance/types'

/** 视口桩：哪个部件是尺寸观测的宿主、给它多大。 */
export interface ChartViewportStub {
  readonly part?: string
  readonly width?: number
  readonly height?: number
}

/**
 * 图表的几何要从视口尺寸与文字宽度算出来，jsdom 两样都没有：视口缺省定成 480 × 320，
 * 画布度量器摘掉、改用按字号估算的度量器。三端算出的是同一张场景，逐帧比对才有意义。
 * 迷你图的根就是 `<svg>`，它自己是尺寸观测的宿主：HTML 与 SVG 两条原型链都要桩上。
 */
export function chartEnvironment(scope: string, stub: ChartViewportStub = {}): NonNullable<ConformanceCase['environment']> {
  const part = stub.part ?? 'viewport'
  const width = stub.width ?? 480
  const height = stub.height ?? 320
  return (win) => {
    const protos = [win.HTMLElement.prototype, win.SVGElement.prototype]
    const canvas = win.HTMLCanvasElement.prototype
    const own = protos.map(proto => ({
      width: Object.getOwnPropertyDescriptor(proto, 'clientWidth'),
      height: Object.getOwnPropertyDescriptor(proto, 'clientHeight'),
    }))
    const context = Object.getOwnPropertyDescriptor(canvas, 'getContext')
    const inherited = {
      width: Object.getOwnPropertyDescriptor(win.Element.prototype, 'clientWidth'),
      height: Object.getOwnPropertyDescriptor(win.Element.prototype, 'clientHeight'),
    }
    const viewport = (el: Element): boolean =>
      el.getAttribute('data-scope') === scope && el.getAttribute('data-part') === part
    protos.forEach((proto, i) => {
      Object.defineProperty(proto, 'clientWidth', {
        configurable: true,
        get(this: Element) {
          return viewport(this) ? width : ((own[i]!.width ?? inherited.width)?.get?.call(this) ?? 0)
        },
      })
      Object.defineProperty(proto, 'clientHeight', {
        configurable: true,
        get(this: Element) {
          return viewport(this) ? height : ((own[i]!.height ?? inherited.height)?.get?.call(this) ?? 0)
        },
      })
    })
    Object.defineProperty(canvas, 'getContext', { configurable: true, writable: true, value: () => null })
    const restore = (target: object, key: string, descriptor: PropertyDescriptor | undefined): void => {
      if (descriptor)
        Object.defineProperty(target, key, descriptor)
      else
        delete (target as Record<string, unknown>)[key]
    }
    return () => {
      protos.forEach((proto, i) => {
        restore(proto, 'clientWidth', own[i]!.width)
        restore(proto, 'clientHeight', own[i]!.height)
      })
      restore(canvas, 'getContext', context)
    }
  }
}
