/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/**
 * 一份每次读取都从 read() 现取的 props，交给在 getter 里展开 props 的机器（useMachine 的 props 函数）。
 *
 * 组件在 setup 里把 props 展开、再添几个键交给机器，得到的是一份快照：之后宿主改 props，机器读到的还是旧值。
 * 经这一层，机器每次展开都重新调用 read()，Vue 的响应式跟着 read() 里读到的组件 props 走。
 */
export function liveProps<T extends object>(read: () => T): T {
  return new Proxy({} as T, {
    get: (_, key) => Reflect.get(read(), key),
    has: (_, key) => Reflect.has(read(), key),
    ownKeys: () => Reflect.ownKeys(read()),
    getOwnPropertyDescriptor: (_, key) => {
      const current = read()
      return Reflect.has(current, key)
        ? { enumerable: true, configurable: true, writable: false, value: Reflect.get(current, key) }
        : undefined
    },
  })
}
