import type { ConformanceCase } from '../../conformance/types'

/**
 * 图表的几何要从视口尺寸与文字宽度算出来，jsdom 两样都没有：视口定成 480 × 320，
 * 画布度量器摘掉、改用按字号估算的度量器。三端算出的是同一张场景，逐帧比对才有意义。
 */
export function chartEnvironment(scope: string): NonNullable<ConformanceCase['environment']> {
  return (win) => {
    const proto = win.HTMLElement.prototype
    const canvas = win.HTMLCanvasElement.prototype
    const own = {
      width: Object.getOwnPropertyDescriptor(proto, 'clientWidth'),
      height: Object.getOwnPropertyDescriptor(proto, 'clientHeight'),
      context: Object.getOwnPropertyDescriptor(canvas, 'getContext'),
    }
    const inherited = {
      width: Object.getOwnPropertyDescriptor(win.Element.prototype, 'clientWidth'),
      height: Object.getOwnPropertyDescriptor(win.Element.prototype, 'clientHeight'),
    }
    const viewport = (el: Element): boolean =>
      el.getAttribute('data-scope') === scope && el.getAttribute('data-part') === 'viewport'
    Object.defineProperty(proto, 'clientWidth', {
      configurable: true,
      get(this: HTMLElement) {
        return viewport(this) ? 480 : ((own.width ?? inherited.width)?.get?.call(this) ?? 0)
      },
    })
    Object.defineProperty(proto, 'clientHeight', {
      configurable: true,
      get(this: HTMLElement) {
        return viewport(this) ? 320 : ((own.height ?? inherited.height)?.get?.call(this) ?? 0)
      },
    })
    Object.defineProperty(canvas, 'getContext', { configurable: true, writable: true, value: () => null })
    const restore = (target: object, key: string, descriptor: PropertyDescriptor | undefined): void => {
      if (descriptor)
        Object.defineProperty(target, key, descriptor)
      else
        delete (target as Record<string, unknown>)[key]
    }
    return () => {
      restore(proto, 'clientWidth', own.width)
      restore(proto, 'clientHeight', own.height)
      restore(canvas, 'getContext', own.context)
    }
  }
}
