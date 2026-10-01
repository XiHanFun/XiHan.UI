/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 把适配器自己翻译出的回调并进 props 代理。

/**
 * 组件把 emit 翻成 headless 认的回调（`onClear: () => emit('clear')`），并进交给状态机的 props。
 *
 * props 是响应式代理，展开成新对象会丢掉响应；这里再包一层代理：读回调键给回调，
 * 其余照旧穿透到原 props，展开（`{ ...props }`）时回调键也一并列出。
 */
export function withHandlers<T extends object>(props: T, handlers: Readonly<Record<string, unknown>>): T {
  const own = (key: string | symbol): key is string => typeof key === 'string' && Object.hasOwn(handlers, key)
  return new Proxy(props, {
    get: (target, key, receiver) => (own(key) ? handlers[key] : Reflect.get(target, key, receiver)),
    has: (target, key) => own(key) || Reflect.has(target, key),
    ownKeys: target => [...new Set([...Reflect.ownKeys(target), ...Object.keys(handlers)])],
    getOwnPropertyDescriptor: (target, key) => (own(key)
      ? { configurable: true, enumerable: true, writable: false, value: handlers[key] }
      : Reflect.getOwnPropertyDescriptor(target, key)),
  })
}
