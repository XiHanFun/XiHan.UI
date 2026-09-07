import type { RefCallback } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

// connect 产出的事件处理器改挂原生监听器。
//
// React 的合成事件委派在根容器上，onXxx 这一档只在冒泡阶段派发。于是**直接派到节点上、
// 又不冒泡的事件**（`new Event('pointerdown')`、`new Event('focus')` 这类）到不了处理器；
// 同一段代码在 Vue 与 Web Components 上照常触发，那两家把处理器直接装在节点上。
//
// 这一层把 connect 交下来的处理器从 React props 里摘出去、原样装到节点上，事件到达路径
// 于是与另外两家一致。作者写在组件上的 onXxx 不动，仍走 React 合成事件。

/** 服务端没有提交这一步，layout effect 换成永不执行的 useEffect，避开 React 的警告。 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** 摘出处理器之后剩下的 props，与要装到节点上的那只 ref。 */
export interface NativeEventBinding {
  /** 事件处理器已被摘走的那部分 props。 */
  attrs: Record<string, unknown>
  /** 装到节点上：节点换了就把监听器搬过去，卸载时摘掉。 */
  ref: RefCallback<HTMLElement>
}

/** props 里的这一项是不是事件处理器。 */
function isHandler(key: string, value: unknown): boolean {
  return typeof value === 'function' && /^on[A-Z]/.test(key)
}

/** onPointerDown → pointerdown。 */
function eventName(key: string): string {
  return key.slice(2).toLowerCase()
}

export function useNativeEvents(props: Record<string, unknown>): NativeEventBinding {
  const attrs: Record<string, unknown> = {}
  const handlers = new Map<string, (event: Event) => void>()
  for (const [key, value] of Object.entries(props)) {
    if (isHandler(key, value))
      handlers.set(eventName(key), value as (event: Event) => void)
    else
      attrs[key] = value
  }

  // 处理器每渲染都是新闭包，监听器只装一次：装的是转发器，触发时现读这一份
  const latest = useRef(handlers)
  latest.current = handlers
  const node = useRef<HTMLElement | null>(null)
  const attached = useRef(new Map<string, () => void>())

  /** 让节点上装着的监听器与此刻这份处理器名单对齐；反复调是幂等的。 */
  const sync = useCallback(() => {
    const on = attached.current
    const wanted = node.current ? new Set(latest.current.keys()) : new Set<string>()
    for (const [type, off] of on) {
      if (!wanted.has(type)) {
        off()
        on.delete(type)
      }
    }
    const host = node.current
    if (!host)
      return
    for (const type of wanted) {
      if (on.has(type))
        continue
      const forward = (event: Event): void => latest.current.get(type)?.(event)
      host.addEventListener(type, forward)
      on.set(type, () => host.removeEventListener(type, forward))
    }
  }, [])

  const ref = useCallback<RefCallback<HTMLElement>>((el) => {
    if (node.current === el)
      return
    // 节点换了：旧节点上的监听器先摘干净，再装到新节点上
    for (const [type, off] of attached.current) {
      off()
      attached.current.delete(type)
    }
    node.current = el
    sync()
  }, [sync])

  // 不给依赖数组：处理器名单换了也就地补齐
  useIsomorphicLayoutEffect(sync)

  return { attrs, ref }
}
