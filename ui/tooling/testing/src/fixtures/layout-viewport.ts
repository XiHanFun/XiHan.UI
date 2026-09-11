/** Layout 的 jsdom 夹具：明确提供浏览器媒体查询与断点令牌，不由生产代码降级。 */
export function installLayoutViewport(doc: Document): () => void {
  const win = doc.defaultView! as Window & typeof globalThis
  const previous = Object.getOwnPropertyDescriptor(win, 'matchMedia')
  const style = doc.documentElement.style
  const tokens = ['--xh-breakpoint-md', '--xh-breakpoint-lg']
  const saved = tokens.map(name => [name, style.getPropertyValue(name), style.getPropertyPriority(name)] as const)
  style.setProperty(tokens[0]!, '768px')
  style.setProperty(tokens[1]!, '1024px')
  Object.defineProperty(win, 'matchMedia', {
    configurable: true,
    value: (media: string): MediaQueryList => {
      const query = new win.EventTarget()
      Object.defineProperties(query, {
        media: { value: media },
        matches: { value: media === '(min-width: 768px)' },
      })
      return query as MediaQueryList
    },
  })
  return () => {
    if (previous)
      Object.defineProperty(win, 'matchMedia', previous)
    else
      Reflect.deleteProperty(win, 'matchMedia')
    for (const [name, value, priority] of saved) {
      if (value)
        style.setProperty(name, value, priority)
      else
        style.removeProperty(name)
    }
  }
}
