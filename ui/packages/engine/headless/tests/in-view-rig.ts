// 可控的交叉观察器：jsdom 没有 IntersectionObserver，「进入视口才播」的用例由它来报元素进出视口。
// 装在 jsdom 的 window 上，观察即记下元素，不主动报；用例按需 reportAll 报一次进出。

interface FakeEntry {
  target: Element
  isIntersecting: boolean
}

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []
  readonly observed = new Set<Element>()
  constructor(readonly callback: (entries: FakeEntry[]) => void) {
    FakeIntersectionObserver.instances.push(this)
  }

  observe(el: Element): void {
    this.observed.add(el)
  }

  unobserve(el: Element): void {
    this.observed.delete(el)
  }

  disconnect(): void {
    this.observed.clear()
  }
}

export interface InViewRig {
  /** 给所有被观察的元素报一次进出视口。 */
  reportAll: (inView: boolean) => void
  /** 观察中的元素个数。 */
  observedCount: () => number
  /** 撤掉替身，window 回到没有交叉观察器的样子。 */
  restore: () => void
}

export function installInViewRig(): InViewRig {
  FakeIntersectionObserver.instances = []
  const win = window as unknown as Record<string, unknown>
  win.IntersectionObserver = FakeIntersectionObserver
  return {
    reportAll: (inView) => {
      for (const observer of FakeIntersectionObserver.instances) {
        const entries = [...observer.observed].map(target => ({ target, isIntersecting: inView }))
        if (entries.length > 0)
          observer.callback(entries)
      }
    },
    observedCount: () => FakeIntersectionObserver.instances.reduce((n, observer) => n + observer.observed.size, 0),
    restore: () => {
      delete win.IntersectionObserver
    },
  }
}
