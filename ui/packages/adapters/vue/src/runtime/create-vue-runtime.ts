/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 create vue runtime 相关实现。

import type { Bindable, CellParams, Dep, ReactiveRuntime } from '@xihan-ui/core'
import { getCurrentInstance, nextTick, onBeforeUnmount, onMounted, shallowRef, triggerRef, watch } from 'vue'

export interface VueRuntimeOptions {
  /**
   * 机器何时 start。缺省 'mounted'：等宿主组件挂载、节点落定后再进初态，
   * 组件的机器效应（浮层定位、焦点域）一进初态就读自己的节点。
   * 'setup' 在 setup 里当场 start，只给没有 DOM 锚点的机器（命令式服务宿主的队列机器）：
   * 宿主的 mounted 回调排在 Vue 的 post-flush 队列里，从业务组件的 onMounted 懒建宿主时
   * 会被追加到那条队列的队尾，要等调用方的 onMounted 返回后才跑；而服务端口在 setup 已接上，
   * 中间发出的命令会撞上 SEND_BEFORE_MOUNT。组件外调用时没有挂载钩子，两种取值都当场 start。
   */
  start?: 'mounted' | 'setup'
}

// 用 Vue 响应式实现 machine 的 ReactiveRuntime
export function createVueRuntime(options: VueRuntimeOptions = {}): ReactiveRuntime {
  const startInSetup = options.start === 'setup'
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
      if (getCurrentInstance() && !startInSetup)
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
