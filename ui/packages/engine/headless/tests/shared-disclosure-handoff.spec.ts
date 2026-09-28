// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { retainDisclosureHandoff } from '../src/shared/disclosure-handoff'

function content(): HTMLElement {
  const el = document.createElement('div')
  el.dataset.scope = 'collapsible'
  el.dataset.part = 'content'
  el.dataset.state = 'closed'
  document.body.append(el)
  return el
}

/** MutationObserver 的回调排在微任务里。 */
function observed(): Promise<void> {
  return Promise.resolve()
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('面级披露接力的宿主能力', () => {
  it('没有 Web Animations 的宿主不接：翻 data-state 不去读正在播的关键帧，也不报错', async () => {
    expect(Element.prototype.getAnimations).toBeUndefined()
    const el = content()
    const errors: unknown[] = []
    const onError = (event: ErrorEvent) => errors.push(event.error)
    window.addEventListener('error', onError)
    const release = retainDisclosureHandoff(document)
    el.dataset.state = 'open'
    await observed()
    release()
    window.removeEventListener('error', onError)
    expect(errors).toEqual([])
  })

  it('有 Web Animations 时接上：翻 data-state 读内容区的动画，释放后不再读', async () => {
    const getAnimations = vi.fn((): Animation[] => [])
    Object.defineProperty(Element.prototype, 'getAnimations', { value: getAnimations, configurable: true })
    try {
      const el = content()
      const release = retainDisclosureHandoff(document)
      el.dataset.state = 'open'
      await observed()
      expect(getAnimations).toHaveBeenCalled()
      release()
      getAnimations.mockClear()
      el.dataset.state = 'closed'
      await observed()
      expect(getAnimations).not.toHaveBeenCalled()
    }
    finally {
      Reflect.deleteProperty(Element.prototype, 'getAnimations')
    }
  })
})
