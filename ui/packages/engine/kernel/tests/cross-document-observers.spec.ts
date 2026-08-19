// @vitest-environment jsdom
// 观察器的构造器必须从被观测节点自己的文档取。跨 iframe 时全局的那个来自另一个 window，
// 拿它去观测别的文档里的节点，回调一次都不会来——而且不报错，是静默失效。
import { describe, expect, it, vi } from 'vitest'
import { resetSkinCheck, startSkinCheck } from '../src/diagnostics/skin-check'

/** 造一个独立文档，并记下它自己的 MutationObserver 被构造了几次。 */
function foreignDocument() {
  const frame = document.createElement('iframe')
  document.body.append(frame)
  const doc = frame.contentDocument!
  const view = frame.contentWindow as unknown as { MutationObserver: typeof MutationObserver }
  const spy = vi.fn()
  const Native = view.MutationObserver
  class Counted extends Native {
    constructor(cb: MutationCallback) {
      spy()
      super(cb)
    }
  }
  view.MutationObserver = Counted as unknown as typeof MutationObserver
  return { doc, spy, cleanup: () => frame.remove() }
}

describe('跨文档的观察器', () => {
  it('观测另一个文档里的节点时，用的是那个文档的构造器', () => {
    const { doc, spy, cleanup } = foreignDocument()
    const host = doc.createElement('div')
    doc.body.append(host)

    const stop = startSkinCheck({ root: host })
    expect(spy).toHaveBeenCalled()
    stop()
    resetSkinCheck()
    cleanup()
  })

  it('root 传 Document 本身也认得出文档——它自己的 ownerDocument 是 null', () => {
    const { doc, spy, cleanup } = foreignDocument()
    const stop = startSkinCheck({ root: doc })
    expect(spy).toHaveBeenCalled()
    stop()
    resetSkinCheck()
    cleanup()
  })
})
