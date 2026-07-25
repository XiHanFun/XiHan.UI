import type { Cleanup, Disposable, RuntimeConfig } from '@xihan-ui/core'
import { createPerDocumentRegistry } from '@xihan-ui/core'

export interface ScrollLockOptions {
  config: RuntimeConfig
  /** 白名单：这些子树内仍可滚动。 */
  shards?: () => Element[]
}

export interface ScrollLockHandle extends Disposable {
  addShard: (el: Element) => Cleanup
}

interface LockState {
  count: number
  savedScrollY: number
  saved: { position: string, top: string, width: string, overflow: string }
  shards: Set<Element>
  onViewportChange: (() => void) | null
}

const registry = createPerDocumentRegistry<LockState>(() => ({
  count: 0,
  savedScrollY: 0,
  saved: { position: '', top: '', width: '', overflow: '' },
  shards: new Set(),
  onViewportChange: null,
}))

function applyLock(doc: Document, state: LockState): void {
  const win = doc.defaultView ?? window
  const body = doc.body
  state.savedScrollY = win.scrollY
  state.saved = {
    position: body.style.position,
    top: body.style.top,
    width: body.style.width,
    overflow: body.style.overflow,
  }
  body.style.position = 'fixed'
  body.style.top = `-${state.savedScrollY}px`
  body.style.width = '100%'
  body.style.overflow = 'hidden'

  // 旋屏 / 视口变化时重算负 top，避免内容被推出屏外
  const recalc = (): void => {
    body.style.top = `-${state.savedScrollY}px`
  }
  state.onViewportChange = recalc
  win.addEventListener('orientationchange', recalc)
  win.visualViewport?.addEventListener('resize', recalc)
}

function releaseLock(doc: Document, state: LockState): void {
  const win = doc.defaultView ?? window
  const body = doc.body
  body.style.position = state.saved.position
  body.style.top = state.saved.top
  body.style.width = state.saved.width
  body.style.overflow = state.saved.overflow
  if (state.onViewportChange) {
    win.removeEventListener('orientationchange', state.onViewportChange)
    win.visualViewport?.removeEventListener('resize', state.onViewportChange)
    state.onViewportChange = null
  }
  win.scrollTo(0, state.savedScrollY)
}

/** 加一把滚动锁。多层叠加走引用计数，只有第一次真正加锁、最后一次真正解锁。 */
export function acquireScrollLock(o: ScrollLockOptions): ScrollLockHandle {
  const doc = o.config.scope.getDoc()
  const state = registry.get(doc)
  const ownShards = new Set<Element>()
  let disposed = false

  for (const el of o.shards?.() ?? []) {
    state.shards.add(el)
    ownShards.add(el)
  }

  if (state.count === 0)
    applyLock(doc, state)
  state.count += 1

  return {
    addShard(el) {
      state.shards.add(el)
      ownShards.add(el)
      return () => {
        state.shards.delete(el)
        ownShards.delete(el)
      }
    },
    dispose() {
      if (disposed)
        return
      disposed = true
      for (const el of ownShards) state.shards.delete(el)
      ownShards.clear()
      state.count -= 1
      if (state.count === 0)
        releaseLock(doc, state)
    },
  }
}
