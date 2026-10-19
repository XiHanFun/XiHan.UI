// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { XhReactiveElement } from '../src/reactive'

// 升级前赋在实例上的值落在子类手写的访问器上：Lit 只取回声明过的属性，这里本运行时一并取回，无从对拍，故单列。

interface Doc {
  readonly name: string
}

const EMPTY: Doc = { name: 'empty' }

let seq = 0

/** 每条用例一个新标签：同一文档里标签只能注册一次。 */
function nextTag(): string {
  return `x-upgrade-accessor-${++seq}`
}

/** schema 是手写的 get/set，值存在私有字段里；set 记下每次收到的值与当时的 label。 */
class SchemaHost extends XhReactiveElement {
  static override properties = {
    label: { attribute: false },
  }

  declare label: string | undefined

  readonly sets: { label: string | undefined, value: Doc }[] = []
  #schema: Doc = EMPTY

  get schema(): Doc {
    return this.#schema
  }

  set schema(value: Doc) {
    this.sets.push({ label: this.label, value })
    this.#schema = value
  }
}

/** 构造里先经访问器写一份缺省值。 */
class DefaultingHost extends SchemaHost {
  constructor() {
    super()
    this.schema = { name: 'from-constructor' }
  }
}

/** 两个手写访问器，按收到的先后记进同一张表。 */
class PairHost extends XhReactiveElement {
  readonly order: string[] = []
  #a = 0
  #b = 0

  get a(): number {
    return this.#a
  }

  set a(value: number) {
    this.order.push(`a=${value}`)
    this.#a = value
  }

  get b(): number {
    return this.#b
  }

  set b(value: number) {
    this.order.push(`b=${value}`)
    this.#b = value
  }
}

/** 只有 get 的访问器。 */
class ReadonlyHost extends XhReactiveElement {
  get dirty(): boolean {
    return false
  }
}

/** 同一个构造器只能注册一次，每条用例注册一个新的子类。 */
function fresh(Base: typeof XhReactiveElement): typeof XhReactiveElement {
  return class extends Base {}
}

function create<T>(tag: string): T {
  return document.createElement(tag) as unknown as T
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('升级前赋给手写访问器的值', () => {
  it('先赋值、后注册再连上：值经访问器写进私有字段，实例上不留自有属性', () => {
    const tag = nextTag()
    const el = create<SchemaHost>(tag)
    const doc = { name: 'host' }
    el.schema = doc

    customElements.define(tag, SchemaHost)
    document.body.append(el)

    expect(Object.hasOwn(el, 'schema')).toBe(false)
    expect(el.schema).toBe(doc)
    expect(el.sets.map(entry => entry.value)).toEqual([doc])
  })

  it('按 Vue 的挂载顺序：建元素、赋属性、插进文档，模块后到再注册', () => {
    const tag = nextTag()
    const el = create<SchemaHost>(tag)
    const doc = { name: 'host' }
    el.schema = doc
    document.body.append(el)

    customElements.define(tag, fresh(SchemaHost))

    expect(Object.hasOwn(el, 'schema')).toBe(false)
    expect(el.schema).toBe(doc)
    expect(el.sets.map(entry => entry.value)).toEqual([doc])
  })

  it('未连上时升级：升级时取下，连上时才经访问器写回', () => {
    const tag = nextTag()
    const el = create<SchemaHost>(tag)
    const doc = { name: 'host' }
    el.schema = doc
    customElements.define(tag, fresh(SchemaHost))
    customElements.upgrade(el)

    expect(Object.hasOwn(el, 'schema')).toBe(false)
    expect(el.sets).toEqual([])

    document.body.append(el)

    expect(el.schema).toBe(doc)
    expect(el.sets.map(entry => entry.value)).toEqual([doc])
  })

  it('子类构造里写的缺省值先到，宿主升级前赋的值后到', () => {
    const tag = nextTag()
    const el = create<DefaultingHost>(tag)
    const doc = { name: 'host' }
    el.schema = doc

    customElements.define(tag, fresh(DefaultingHost))
    document.body.append(el)

    expect(el.schema).toBe(doc)
    expect(el.sets.map(entry => entry.value.name)).toEqual(['from-constructor', 'host'])
  })

  it('声明过的字段先写回，手写访问器的 set 读得到宿主给的值', () => {
    const tag = nextTag()
    const el = create<SchemaHost>(tag)
    el.schema = { name: 'host' }
    el.label = 'from-host'

    customElements.define(tag, fresh(SchemaHost))
    document.body.append(el)

    expect(el.label).toBe('from-host')
    expect(el.sets).toEqual([{ label: 'from-host', value: { name: 'host' } }])
  })

  it('多个手写访问器按升级前的赋值次序写回', () => {
    const tag = nextTag()
    const el = create<PairHost>(tag)
    el.b = 2
    el.a = 1

    customElements.define(tag, fresh(PairHost))
    document.body.append(el)

    expect(el.order).toEqual(['b=2', 'a=1'])
    expect([el.a, el.b]).toEqual([1, 2])
  })

  it('只有 get 的访问器不写回，升级前的值照旧留在实例上', () => {
    const tag = nextTag()
    const el = create<{ dirty: unknown }>(tag)
    el.dirty = 'stale'

    customElements.define(tag, fresh(ReadonlyHost))
    expect(() => document.body.append(el as unknown as Node)).not.toThrow()

    expect(Object.getOwnPropertyDescriptor(el, 'dirty')?.value).toBe('stale')
  })
})
