/** 无布局测试显式提供可控动画对象；真实动画几何另由浏览器套件验证。 */
export function installCssAnimationMock(node: Element, name: string): { finish: () => void, restore: () => void } {
  const descriptor = Object.getOwnPropertyDescriptor(node, 'getAnimations')
  let finished = false
  let resolve!: () => void
  const animation = {
    animationName: name,
    get playState() { return finished ? 'finished' : 'running' },
    effect: { getComputedTiming: () => ({ endTime: 60_000 }) },
    finished: new Promise<void>((done) => { resolve = done }),
  }
  const finish = (): void => {
    finished = true
    resolve()
  }
  const onEnd = (event: Event): void => {
    if (event.target === node && (event as AnimationEvent).animationName === name)
      finish()
  }
  node.addEventListener('animationend', onEnd)
  Object.defineProperty(node, 'getAnimations', { configurable: true, value: () => [animation] })
  return {
    finish,
    restore() {
      node.removeEventListener('animationend', onEnd)
      if (descriptor)
        Object.defineProperty(node, 'getAnimations', descriptor)
      else
        Reflect.deleteProperty(node, 'getAnimations')
    },
  }
}
