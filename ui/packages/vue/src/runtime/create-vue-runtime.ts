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

      return {
        initial,
        get: read,
        set(next) {
          const prev = read()
          const value = typeof next === 'function' ? (next as (p: V) => V)(prev) : next
          if (!isControlled())
            inner.value = value
          if (!eq(value, prev))
            params().onChange?.(value, prev)
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
      void nextTick(fn)
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
