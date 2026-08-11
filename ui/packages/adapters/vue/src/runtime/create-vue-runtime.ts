import type { Bindable, CellParams, Dep, ReactiveRuntime } from '@xihan-ui/machine'
import { getCurrentInstance, nextTick, onBeforeUnmount, onMounted, shallowRef, triggerRef, watch } from 'vue'

// 用 Vue 响应式实现 machine 的 ReactiveRuntime
export function createVueRuntime(): ReactiveRuntime {
  return {
    name: 'vue',
    isServer: typeof window === 'undefined',

    cell<V>(params: () => CellParams<V>): Bindable<V> {
      const p0 = params()
      const initial = (p0.defaultValue ?? p0.value) as V
      const eq = p0.isEqual ?? Object.is
      const inner = shallowRef<V>(initial)
      let lastSeen = initial
      let version = 0

      const isControlled = (): boolean => params().value !== undefined
      const read = (): V => (isControlled() ? (params().value as V) : inner.value)

      const set = (next: V | ((prev: V) => V)): void => {
        const prev = read()
        const value = typeof next === 'function' ? (next as (p: V) => V)(prev) : next
        if (!isControlled())
          inner.value = value
        if (!eq(value, prev))
          params().onChange?.(value, prev)
      }

      return {
        initial,
        get: read,
        set,
        // 落点按当下 props 重算，不用挂载时冻结的 initial：宿主换了 defaultValue
        // （比如切去编辑另一条记录）就该回到新的那一份
        reset() {
          const next = params().defaultValue
          if (next === undefined)
            return undefined
          set(next)
          return next
        },
        notify() {
          triggerRef(inner)
        },
        version() {
          const cur = read()
          if (!eq(cur, lastSeen)) {
            lastSeen = cur
            version += 1
          }
          return version
        },
      }
    },

    track(deps: Dep[], fn) {
      watch(deps, fn, { flush: 'pre' })
    },
    flush(fn) {
      // 先让出一次微任务，等这次转移把渲染排上队，再等那一轮渲染跑完才回调
      void nextTick(() => nextTick(fn))
    },
    onMount(fn) {
      if (getCurrentInstance())
        onMounted(fn)
      else
        fn()
    },
    onCleanup(fn) {
      if (getCurrentInstance())
        onBeforeUnmount(fn)
    },
  }
}
