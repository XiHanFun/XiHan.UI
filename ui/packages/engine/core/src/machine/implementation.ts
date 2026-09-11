type CallableImplementation = (...args: never[]) => unknown

/** 只接受对象自身的数据属性函数；不触发 getter，也不借用原型链实现。 */
export function getOwnCallableImplementation(group: unknown, name: string): CallableImplementation | undefined {
  if ((typeof group !== 'object' && typeof group !== 'function') || group === null)
    return undefined
  const descriptor = Object.getOwnPropertyDescriptor(group, name)
  return descriptor && 'value' in descriptor && typeof descriptor.value === 'function'
    ? descriptor.value as CallableImplementation
    : undefined
}
