// @vitest-environment jsdom

import type { PropertyDeclaration, ReactiveController } from '@lit/reactive-element'
import { ReactiveElement } from '@lit/reactive-element'
import { afterEach, describe, expect, it } from 'vitest'
import { XhReactiveElement } from '../src/reactive'

// 差分判据：同一份元素定义分别跑在 @lit/reactive-element 与自研基类上，逐条比对可观察结果。
// 断言的是"两边一致"而不是硬编码值：期望值以 Lit 实际行为为准。
// @lit/reactive-element 只为本文件对拍而留在 devDependencies，运行时不依赖它。

const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null || v === '' ? undefined : Number(v)) }
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

const PENDING = '<pending>'

interface CtorInfo {
  elementProperties: Map<PropertyKey, PropertyDeclaration>
  observedAttributes: string[]
}

interface Suite {
  ctors: {
    attr: CtorInfo
    hidden: CtorInfo
    inheritBase: CtorInfo
    inheritOverlap: CtorInfo
    inheritSub: CtorInfo
  }
  defineUpgradeTag: () => void
  log: string[]
  tags: {
    attr: string
    controllers: string
    hidden: string
    inheritBase: string
    inheritOverlap: string
    inheritSub: string
    reentrant: string
    upgrade: string
  }
}

/** 一轮 updated 拿到的 changedProperties，按字段名排序后的 [字段名, 旧值] 列表。 */
type ChangedEntries = [string, unknown][]

interface ParityElement extends HTMLElement {
  readonly renderRoot?: unknown
  readonly updateComplete: Promise<boolean>
  addController: (controller: ReactiveController) => void
  createRenderRootCount: number
  requestUpdate: () => void
  updateCount: number
  updatedEntries: ChangedEntries[]
}

interface AttrElement extends ParityElement {
  count?: number
  flag?: boolean
  label?: string
  longName?: string
  mixedCase?: string
  plainBool?: boolean
  plainNumber?: number | null
  plainString?: string | null
}

interface CtrlElement extends ParityElement {
  tick?: number
}

interface HiddenElement extends ParityElement {
  hiddenKey?: string
  visible?: string
}

interface InheritElement extends ParityElement {
  alpha?: string
  beta?: number
  shared?: unknown
}

interface ReentrantElement extends ParityElement {
  reassignTickInUpdate?: number
  reenterInUpdate: number
  reenterInUpdated: number
  tick?: number
}

interface UpgradeElement extends ParityElement {
  count?: number
  label?: string
}

/** 把四个钩子按调用顺序记进共享数组。 */
function makeRecordingController(log: string[], name: string): ReactiveController {
  return {
    hostConnected: () => log.push(`${name}:hostConnected`),
    hostDisconnected: () => log.push(`${name}:hostDisconnected`),
    hostUpdate: () => log.push(`${name}:hostUpdate`),
    hostUpdated: () => log.push(`${name}:hostUpdated`),
  }
}

/** 用给定基类定义一整组测试元素；两边标签名靠 ns 错开。 */
function createSuite(Base: typeof ReactiveElement, ns: string): Suite {
  const log: string[] = []
  const tag = (name: string): string => `x-${ns}-${name}`

  // 记录生命周期、更新次数与每次更新的 changedProperties（键与旧值都记，旧值也是判据的一维）。
  class Recorded extends Base {
    createRenderRootCount = 0
    updateCount = 0
    updatedEntries: ChangedEntries[] = []

    override connectedCallback(): void {
      log.push('connectedCallback')
      super.connectedCallback()
    }

    override disconnectedCallback(): void {
      log.push('disconnectedCallback')
      super.disconnectedCallback()
    }

    protected override createRenderRoot(): HTMLElement {
      this.createRenderRootCount = (this.createRenderRootCount ?? 0) + 1
      log.push('createRenderRoot')
      return this
    }

    protected override update(changed: Map<PropertyKey, unknown>): void {
      this.updateCount = (this.updateCount ?? 0) + 1
      log.push('update')
      super.update(changed)
    }

    protected override updated(changed: Map<PropertyKey, unknown>): void {
      const entries = [...changed].map(([key, old]): [string, unknown] => [String(key), old])
      entries.sort((a, b) => a[0].localeCompare(b[0]))
      ;(this.updatedEntries ??= []).push(entries)
      log.push('updated')
      super.updated(changed)
    }
  }

  class AttrEl extends Recorded {
    static override properties = {
      count: { converter: NUMBER_CONVERTER },
      flag: { converter: BOOLEAN_CONVERTER },
      label: { converter: STRING_CONVERTER },
      longName: { attribute: 'long-name', converter: STRING_CONVERTER },
      mixedCase: { converter: STRING_CONVERTER },
      plainBool: { attribute: 'plain-bool', type: Boolean },
      plainNumber: { attribute: 'plain-number', type: Number },
      plainString: {},
    }
  }

  class CtrlEl extends Recorded {
    static override properties = {
      tick: { converter: NUMBER_CONVERTER },
    }

    constructor() {
      super()
      this.addController(makeRecordingController(log, 'A'))
      this.addController(makeRecordingController(log, 'B'))
    }
  }

  class ReentrantEl extends Recorded {
    static override properties = {
      tick: { converter: NUMBER_CONVERTER },
    }

    declare tick: number | undefined
    reassignTickInUpdate: number | undefined = undefined
    reenterInUpdate = 0
    reenterInUpdated = 0

    protected override update(changed: Map<PropertyKey, unknown>): void {
      super.update(changed)
      // 在 update() 里改字段：本轮已结，这次变更要排进下一轮
      if (this.reassignTickInUpdate !== undefined) {
        const next = this.reassignTickInUpdate
        this.reassignTickInUpdate = undefined
        this.tick = next
      }
      if (this.reenterInUpdate > 0) {
        this.reenterInUpdate--
        this.requestUpdate()
      }
    }

    protected override updated(changed: Map<PropertyKey, unknown>): void {
      super.updated(changed)
      if (this.reenterInUpdated > 0) {
        this.reenterInUpdated--
        this.requestUpdate()
      }
    }
  }

  class InheritBase extends Recorded {
    static override properties = {
      alpha: { converter: STRING_CONVERTER },
      shared: { converter: STRING_CONVERTER },
    }
  }

  // 字段名与基类不重叠
  class InheritSub extends InheritBase {
    static override properties = {
      beta: { attribute: 'beta-attr', converter: NUMBER_CONVERTER },
    }
  }

  // 字段名与基类重叠，且换了转换器与属性名
  class InheritOverlap extends InheritBase {
    static override properties = {
      shared: { attribute: 'shared-num', converter: NUMBER_CONVERTER },
    }
  }

  // static properties 上挂一个不可枚举的字符串键
  const hiddenProps: Record<string, PropertyDeclaration> = { visible: { converter: STRING_CONVERTER } }
  Object.defineProperty(hiddenProps, 'hiddenKey', {
    configurable: true,
    enumerable: false,
    value: { converter: STRING_CONVERTER },
    writable: true,
  })

  class HiddenEl extends Recorded {
    static override properties = hiddenProps
  }

  // 升级前赋值场景要"先 createElement 再 define"，故延后注册
  class UpgradeEl extends Recorded {
    static override properties = {
      count: { converter: NUMBER_CONVERTER },
      label: { converter: STRING_CONVERTER },
    }
  }

  customElements.define(tag('attr'), AttrEl)
  customElements.define(tag('controllers'), CtrlEl)
  customElements.define(tag('hidden'), HiddenEl)
  customElements.define(tag('reentrant'), ReentrantEl)
  customElements.define(tag('inherit-base'), InheritBase)
  customElements.define(tag('inherit-sub'), InheritSub)
  customElements.define(tag('inherit-overlap'), InheritOverlap)

  return {
    ctors: {
      attr: AttrEl as unknown as CtorInfo,
      hidden: HiddenEl as unknown as CtorInfo,
      inheritBase: InheritBase as unknown as CtorInfo,
      inheritOverlap: InheritOverlap as unknown as CtorInfo,
      inheritSub: InheritSub as unknown as CtorInfo,
    },
    defineUpgradeTag: () => {
      if (!customElements.get(tag('upgrade')))
        customElements.define(tag('upgrade'), UpgradeEl)
    },
    log,
    tags: {
      attr: tag('attr'),
      controllers: tag('controllers'),
      hidden: tag('hidden'),
      inheritBase: tag('inherit-base'),
      inheritOverlap: tag('inherit-overlap'),
      inheritSub: tag('inherit-sub'),
      reentrant: tag('reentrant'),
      upgrade: tag('upgrade'),
    },
  }
}

const litSuite = createSuite(ReactiveElement, 'lit')
const ownSuite = createSuite(XhReactiveElement as unknown as typeof ReactiveElement, 'own')

function create<T extends ParityElement>(tag: string): T {
  return document.createElement(tag) as unknown as T
}

/**
 * 等 updateComplete，超时就记成 PENDING 继续往下跑。
 * 一律走它而不是裸 await：某一侧永不 resolve 时要的是"两边结果不一致"，不是整个用例挂到超时。
 */
async function settle<T>(promise: Promise<T>): Promise<T | typeof PENDING> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const guard = new Promise<typeof PENDING>((resolve) => {
    timer = setTimeout(resolve, 250, PENDING)
  })
  try {
    return await Promise.race([promise, guard])
  }
  finally {
    if (timer !== undefined)
      clearTimeout(timer)
  }
}

/** 同一段操作在两边各跑一遍，返回两份结果供比对。 */
async function parity<T>(scenario: (suite: Suite) => Promise<T>): Promise<{ lit: T, own: T }> {
  litSuite.log.length = 0
  const lit = await scenario(litSuite)
  document.body.innerHTML = ''
  ownSuite.log.length = 0
  const own = await scenario(ownSuite)
  document.body.innerHTML = ''
  return { lit, own }
}

function serializeProps(ctor: CtorInfo): unknown[] {
  const rows = [...ctor.elementProperties].map(([key, opts]) => {
    const decl = opts as { attribute?: unknown, converter?: unknown, type?: { name?: string } }
    return {
      attribute: decl.attribute === undefined ? null : decl.attribute,
      hasConverterObject: typeof decl.converter === 'object' && decl.converter !== null,
      key: String(key),
      type: decl.type?.name ?? null,
    }
  })
  return rows.sort((a, b) => a.key.localeCompare(b.key))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('属性 → 字段', () => {
  it('三种转换器在缺席/空串/false/移除下逐步结果一致', async () => {
    const { lit, own } = await parity(async (suite) => {
      const el = create<AttrElement>(suite.tags.attr)
      document.body.appendChild(el)
      await settle(el.updateComplete)

      const steps: unknown[] = []
      const snap = async (step: string): Promise<void> => {
        await settle(el.updateComplete)
        steps.push({
          count: el.count,
          flag: el.flag,
          label: el.label,
          lastChanged: el.updatedEntries.at(-1) ?? null,
          longName: el.longName,
          mixedCase: el.mixedCase,
          plainBool: el.plainBool,
          plainNumber: el.plainNumber,
          plainString: el.plainString,
          step,
          updateCount: el.updateCount,
        })
      }

      await snap('initial')

      el.setAttribute('label', 'hello')
      await snap('label=hello')
      el.setAttribute('label', '')
      await snap('label=empty')
      el.setAttribute('label', '')
      await snap('label=empty-again')
      el.removeAttribute('label')
      await snap('label removed')

      el.setAttribute('count', '42')
      await snap('count=42')
      el.setAttribute('count', '')
      await snap('count=empty')
      el.setAttribute('count', 'x')
      await snap('count=NaN')
      el.setAttribute('count', 'y')
      await snap('count=NaN-again')
      el.removeAttribute('count')
      await snap('count removed')

      el.setAttribute('flag', '')
      await snap('flag=empty')
      el.setAttribute('flag', 'false')
      await snap('flag=false')
      el.setAttribute('flag', 'FALSE')
      await snap('flag=FALSE')
      el.setAttribute('flag', 'true')
      await snap('flag=true')
      el.removeAttribute('flag')
      await snap('flag removed')

      el.setAttribute('long-name', 'renamed')
      await snap('long-name')
      el.setAttribute('longname', 'ignored')
      await snap('longname 默认名不再被观察')

      el.setAttribute('mixedcase', 'lower')
      await snap('mixedcase 默认名是全小写')

      el.setAttribute('plain-bool', '')
      await snap('plain-bool=empty')
      el.setAttribute('plain-bool', 'false')
      await snap('plain-bool=false')
      el.removeAttribute('plain-bool')
      await snap('plain-bool removed')

      el.setAttribute('plain-number', '7')
      await snap('plain-number=7')
      el.setAttribute('plain-number', '')
      await snap('plain-number=empty')
      el.removeAttribute('plain-number')
      await snap('plain-number removed')

      el.setAttribute('plainstring', 'raw')
      await snap('plainstring=raw')
      el.removeAttribute('plainstring')
      await snap('plainstring removed')

      // 字段赋值不回写属性
      el.label = 'via-field'
      await snap('field 赋值')
      steps.push({ reflected: el.getAttribute('label'), step: 'field 赋值后属性仍缺席' })

      // 字段赋过值后属性再变，属性覆盖字段
      el.setAttribute('label', 'attr-wins')
      await snap('属性覆盖字段')

      el.remove()
      return steps
    })

    expect((lit as unknown[]).length).toBeGreaterThan(0)
    expect(own).toEqual(lit)
  })

  // 判等口径：Object.is。-0 与 0 是两个值，NaN 与 NaN 是同一个值。
  it('0 与 -0 算不同值、NaN 与 NaN 算同值', async () => {
    const { lit, own } = await parity(async (suite) => {
      const el = create<AttrElement>(suite.tags.attr)
      document.body.appendChild(el)
      await settle(el.updateComplete)
      const base = el.updateCount

      el.count = 0
      await settle(el.updateComplete)
      const afterZero = el.updateCount - base

      el.count = -0
      await settle(el.updateComplete)
      const afterNegZero = el.updateCount - base
      const changedAtNegZero = el.updatedEntries.at(-1) ?? null
      const isNegZero = Object.is(el.count, -0)

      el.count = Number.NaN
      await settle(el.updateComplete)
      const afterNaN = el.updateCount - base

      el.count = Number.NaN
      await settle(el.updateComplete)
      const afterNaNAgain = el.updateCount - base

      return { afterNaN, afterNaNAgain, afterNegZero, afterZero, changedAtNegZero, isNegZero }
    })

    // 锚住 Lit 侧的绝对值，免得两边一起错也算"一致"
    expect(lit.afterZero).toBe(1)
    expect(lit.afterNegZero).toBe(2)
    expect(lit.afterNaN).toBe(3)
    expect(lit.afterNaNAgain).toBe(3)
    expect(own).toEqual(lit)
  })

  it('static properties 上不可枚举的字符串键同样算一条声明', async () => {
    const { lit, own } = await parity(async (suite) => {
      const el = create<HiddenElement>(suite.tags.hidden)
      document.body.appendChild(el)
      await settle(el.updateComplete)
      el.setAttribute('hiddenkey', 'from-attr')
      el.setAttribute('visible', 'v')
      await settle(el.updateComplete)
      return {
        hiddenKey: el.hiddenKey,
        observed: [...suite.ctors.hidden.observedAttributes].sort(),
        props: [...suite.ctors.hidden.elementProperties.keys()].map(String).sort(),
        visible: el.visible,
      }
    })

    expect(lit.observed).toContain('hiddenkey')
    expect(own).toEqual(lit)
  })

  it('标记里带属性的元素首帧一致', async () => {
    const { lit, own } = await parity(async (suite) => {
      const box = document.createElement('div')
      document.body.appendChild(box)
      box.innerHTML = `<${suite.tags.attr} label="parsed" count="3" flag="false" long-name="ln" plain-bool="false"></${suite.tags.attr}>`
      const el = box.firstElementChild as unknown as AttrElement
      await settle(el.updateComplete)
      return {
        count: el.count,
        firstChanged: el.updatedEntries[0] ?? null,
        flag: el.flag,
        label: el.label,
        longName: el.longName,
        plainBool: el.plainBool,
        updateCount: el.updateCount,
      }
    })

    expect(own).toEqual(lit)
  })
})

describe('更新调度', () => {
  it('一拍内多次赋值只更新一次，updateComplete 返回值一致', async () => {
    const { lit, own } = await parity(async (suite) => {
      const el = create<AttrElement>(suite.tags.attr)
      document.body.appendChild(el)
      await settle(el.updateComplete)
      const base = el.updateCount

      el.label = 'a'
      el.label = 'b'
      el.count = 1
      el.count = 2
      el.flag = true
      const syncDelta = el.updateCount - base

      const requestUpdateReturn = (el.requestUpdate as () => unknown)()
      const first = await settle(el.updateComplete)
      const afterFirst = el.updateCount - base
      const changed = el.updatedEntries.at(-1) ?? null

      // 无待处理更新时再 await，不应再跑一轮
      const second = await settle(el.updateComplete)
      const afterSecond = el.updateCount - base

      // 赋同值不触发更新
      el.label = 'b'
      const third = await settle(el.updateComplete)
      const afterThird = el.updateCount - base

      return {
        afterFirst,
        afterSecond,
        afterThird,
        changed,
        first,
        requestUpdateReturn: typeof requestUpdateReturn,
        second,
        syncDelta,
        third,
      }
    })

    expect(own).toEqual(lit)
  })

  it('未接入文档前 updateComplete 不 resolve，接入后才 resolve', async () => {
    const { lit, own } = await parity(async (suite) => {
      const el = create<AttrElement>(suite.tags.attr)
      const beforeConnect = await settle(el.updateComplete)
      const updateCountBefore = el.updateCount ?? 0
      document.body.appendChild(el)
      const afterConnect = await settle(el.updateComplete)
      return { afterConnect, beforeConnect, updateCountAfter: el.updateCount, updateCountBefore }
    })

    expect(own).toEqual(lit)
  })

  it('updated 里再 requestUpdate 时 updateComplete 的返回值与轮次一致', async () => {
    const { lit, own } = await parity(async (suite) => {
      const el = create<ReentrantElement>(suite.tags.reentrant)
      document.body.appendChild(el)
      await settle(el.updateComplete)
      const base = el.updateCount

      el.reenterInUpdated = 1
      el.tick = 1
      const first = await settle(el.updateComplete)
      const afterFirst = el.updateCount - base
      const second = await settle(el.updateComplete)
      const afterSecond = el.updateCount - base
      const changed = el.updatedEntries.slice(-2)

      return { afterFirst, afterSecond, changed, first, second }
    })

    expect(own).toEqual(lit)
  })

  // changedProperties 的值也是判据：首轮更新跑完之前记进去的旧值一律是 undefined。
  it('首轮更新期间再赋值时 changedProperties 的旧值一致', async () => {
    const { lit, own } = await parity(async (suite) => {
      const el = create<ReentrantElement>(suite.tags.reentrant)
      el.tick = 5
      el.reassignTickInUpdate = 999
      document.body.appendChild(el)
      await settle(el.updateComplete)
      await settle(el.updateComplete)
      return { entries: el.updatedEntries.slice(0, 2), tick: el.tick, updateCount: el.updateCount }
    })

    expect(lit.entries).toEqual([[['tick', undefined]], [['tick', undefined]]])
    expect(own).toEqual(lit)
  })

  it('update 里再 requestUpdate 时的轮次一致', async () => {
    const { lit, own } = await parity(async (suite) => {
      const el = create<ReentrantElement>(suite.tags.reentrant)
      document.body.appendChild(el)
      await settle(el.updateComplete)
      const base = el.updateCount

      el.reenterInUpdate = 1
      el.tick = 2
      const first = await settle(el.updateComplete)
      const afterFirst = el.updateCount - base
      const second = await settle(el.updateComplete)
      const afterSecond = el.updateCount - base
      const changed = el.updatedEntries.slice(-2)

      return { afterFirst, afterSecond, changed, first, second }
    })

    expect(own).toEqual(lit)
  })
})

describe('升级', () => {
  it('升级前赋的字段值与已在场的属性一致地被消化', async () => {
    const { lit, own } = await parity(async (suite) => {
      const el = create<UpgradeElement>(suite.tags.upgrade)
      const beforeDefine = {
        hasOwnLabel: Object.hasOwn(el, 'label'),
        hasUpdateComplete: 'updateComplete' in el,
      }

      el.label = 'from-property'
      el.setAttribute('label', 'from-attribute')
      el.setAttribute('count', '5')
      document.body.appendChild(el)

      suite.log.length = 0
      suite.defineUpgradeTag()
      const logAtUpgrade = [...suite.log]
      await settle(el.updateComplete)

      return {
        beforeDefine,
        count: el.count,
        firstChanged: el.updatedEntries[0] ?? null,
        hasOwnLabelAfter: Object.hasOwn(el, 'label'),
        label: el.label,
        logAtUpgrade,
        logAfterFirstUpdate: [...suite.log],
        updateCount: el.updateCount,
      }
    })

    expect(own).toEqual(lit)
  })
})

describe('控制器', () => {
  it('首次连接到首帧更新的钩子顺序与次数一致', async () => {
    const { lit, own } = await parity(async (suite) => {
      const el = create<CtrlElement>(suite.tags.controllers)
      suite.log.length = 0
      suite.log.push('--append')
      document.body.appendChild(el)
      suite.log.push('--awaited')
      await settle(el.updateComplete)
      suite.log.push('--set-prop')
      el.tick = 1
      await settle(el.updateComplete)
      suite.log.push('--end')
      return { log: [...suite.log], updateCount: el.updateCount }
    })

    expect(lit.log.length).toBeGreaterThan(0)
    expect(own).toEqual(lit)
  })

  it('已连接后再 addController 的时机一致', async () => {
    const { lit, own } = await parity(async (suite) => {
      const el = create<CtrlElement>(suite.tags.controllers)
      document.body.appendChild(el)
      await settle(el.updateComplete)

      suite.log.length = 0
      suite.log.push('--addLate')
      el.addController(makeRecordingController(suite.log, 'C'))
      suite.log.push('--afterAdd')
      el.tick = 9
      await settle(el.updateComplete)
      suite.log.push('--afterUpdate')
      el.remove()
      return { log: [...suite.log] }
    })

    expect(own).toEqual(lit)
  })

  it('未连接就 addController 的控制器在连接时才 hostConnected', async () => {
    const { lit, own } = await parity(async (suite) => {
      const el = create<CtrlElement>(suite.tags.controllers)
      suite.log.length = 0
      el.addController(makeRecordingController(suite.log, 'D'))
      const beforeConnect = [...suite.log]
      document.body.appendChild(el)
      await settle(el.updateComplete)
      return { afterConnect: [...suite.log], beforeConnect }
    })

    expect(own).toEqual(lit)
  })

  it('反复 connect/disconnect 与移动父节点的钩子序列一致', async () => {
    const { lit, own } = await parity(async (suite) => {
      const parentA = document.createElement('div')
      const parentB = document.createElement('div')
      document.body.append(parentA, parentB)

      const el = create<CtrlElement>(suite.tags.controllers)
      suite.log.length = 0

      suite.log.push('--connect-1')
      parentA.appendChild(el)
      await settle(el.updateComplete)

      suite.log.push('--disconnect')
      el.remove()
      await settle(el.updateComplete)

      suite.log.push('--connect-2')
      parentA.appendChild(el)
      await settle(el.updateComplete)

      suite.log.push('--move-to-B')
      parentB.appendChild(el)
      await settle(el.updateComplete)

      suite.log.push('--set-prop-while-connected')
      el.tick = 1
      await settle(el.updateComplete)

      suite.log.push('--detach')
      el.remove()
      suite.log.push('--set-prop-while-detached')
      el.tick = 2
      const detachedResolved = await settle(el.updateComplete)

      suite.log.push('--end')
      return {
        createRenderRootCount: el.createRenderRootCount,
        detachedResolved,
        log: [...suite.log],
        updateCount: el.updateCount,
      }
    })

    expect(lit.log.length).toBeGreaterThan(0)
    expect(own).toEqual(lit)
  })
})

describe('继承', () => {
  it('字段名不重叠的两级继承行为一致', async () => {
    const { lit, own } = await parity(async (suite) => {
      const sub = create<InheritElement>(suite.tags.inheritSub)
      document.body.appendChild(sub)
      await settle(sub.updateComplete)
      sub.setAttribute('alpha', 'a')
      sub.setAttribute('shared', 's')
      sub.setAttribute('beta-attr', '3')
      sub.setAttribute('beta', '99')
      await settle(sub.updateComplete)

      const base = create<InheritElement>(suite.tags.inheritBase)
      document.body.appendChild(base)
      await settle(base.updateComplete)
      base.setAttribute('alpha', 'a')
      base.setAttribute('beta-attr', '3')
      await settle(base.updateComplete)

      return {
        baseHasSubProp: suite.ctors.inheritBase.elementProperties.has('beta'),
        baseObserved: [...suite.ctors.inheritBase.observedAttributes].sort(),
        baseValues: { alpha: base.alpha, beta: base.beta, shared: base.shared },
        subObserved: [...suite.ctors.inheritSub.observedAttributes].sort(),
        subValues: { alpha: sub.alpha, beta: sub.beta, shared: sub.shared },
      }
    })

    expect(own).toEqual(lit)
  })

  it('字段名重叠时子类声明覆盖基类声明的行为一致', async () => {
    const { lit, own } = await parity(async (suite) => {
      const el = create<InheritElement>(suite.tags.inheritOverlap)
      document.body.appendChild(el)
      await settle(el.updateComplete)

      el.setAttribute('shared', 'text')
      await settle(el.updateComplete)
      const afterBaseAttr = el.shared

      el.setAttribute('shared-num', '7')
      await settle(el.updateComplete)
      const afterOwnAttr = el.shared

      return {
        afterBaseAttr,
        afterOwnAttr,
        baseAttrStillObserved: suite.ctors.inheritOverlap.observedAttributes.includes('shared'),
        observed: [...suite.ctors.inheritOverlap.observedAttributes].sort(),
        updateCount: el.updateCount,
      }
    })

    expect(own).toEqual(lit)
  })

  it('elementProperties 的内容一致', async () => {
    const { lit, own } = await parity(async (suite) => {
      return {
        attr: serializeProps(suite.ctors.attr),
        inheritBase: serializeProps(suite.ctors.inheritBase),
        inheritOverlap: serializeProps(suite.ctors.inheritOverlap),
        inheritSub: serializeProps(suite.ctors.inheritSub),
        isMap: suite.ctors.attr.elementProperties instanceof Map,
      }
    })

    expect(lit.attr.length).toBeGreaterThan(0)
    expect(own).toEqual(lit)
  })

  it('elementProperties 的迭代顺序一致（基类在前、自身在后）', async () => {
    const { lit, own } = await parity(async (suite) => {
      return {
        attr: [...suite.ctors.attr.elementProperties.keys()].map(String),
        inheritOverlap: [...suite.ctors.inheritOverlap.elementProperties.keys()].map(String),
        inheritSub: [...suite.ctors.inheritSub.elementProperties.keys()].map(String),
      }
    })

    expect(own).toEqual(lit)
  })

  it('observedAttributes 与 define 时定稿的一致', async () => {
    const { lit, own } = await parity(async (suite) => {
      const registered = customElements.get(suite.tags.attr) as unknown as CtorInfo
      return {
        fromClass: [...suite.ctors.attr.observedAttributes].sort(),
        fromRegistry: [...registered.observedAttributes].sort(),
      }
    })

    expect(lit.fromClass.length).toBeGreaterThan(0)
    expect(own).toEqual(lit)
  })
})

describe('createRenderRoot 返回 this', () => {
  it('renderRoot 的建立时机、次数与 shadowRoot 缺席一致', async () => {
    const { lit, own } = await parity(async (suite) => {
      const el = create<AttrElement>(suite.tags.attr)
      const beforeConnect = {
        createRenderRootCount: el.createRenderRootCount ?? 0,
        renderRootIsSelf: el.renderRoot === el,
        renderRootType: typeof el.renderRoot,
      }

      suite.log.length = 0
      document.body.appendChild(el)
      const logAfterConnect = [...suite.log]
      await settle(el.updateComplete)

      el.remove()
      document.body.appendChild(el)
      await settle(el.updateComplete)

      return {
        beforeConnect,
        createRenderRootCount: el.createRenderRootCount,
        hasShadowRoot: el.shadowRoot !== null,
        logAfterConnect,
        renderRootIsSelf: el.renderRoot === el,
      }
    })

    expect(own).toEqual(lit)
  })
})
