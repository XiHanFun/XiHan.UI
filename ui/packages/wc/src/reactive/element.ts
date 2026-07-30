import type {
  AttributeConverter,
  PropertyDeclaration,
  PropertyDeclarations,
  PropertyValues,
  ReactiveController,
  ReactiveControllerHost,
} from './types'

// 定稿过的类，键是构造器本身；子类各登记一次。
const finalizedClasses = new WeakSet<object>()
// 每个类的：属性名 → 字段名。
const attributeMaps = new WeakMap<object, Map<string, string>>()
// 每个原型上由 createProperty 装过访问器的字段名。
const installedAccessors = new WeakMap<object, Set<string>>()
// 声明里实现了的键，其余一律抛。
const SUPPORTED_DECLARATION_KEYS = new Set(['attribute', 'converter', 'type'])

/** 按声明的 type 解读属性字符串。 */
function defaultFromAttribute(value: string | null, type?: unknown): unknown {
  switch (type) {
    case Boolean:
      return value !== null
    case Number:
      return value === null ? null : Number(value)
    case Object:
    case Array:
      try {
        return JSON.parse(value!) as unknown
      }
      catch {
        return null
      }
    default:
      return value
  }
}

function fromAttributeOf(options: PropertyDeclaration): (value: string | null, type?: unknown) => unknown {
  const converter = options.converter as AttributeConverter | undefined
  if (typeof converter === 'function')
    return converter
  return converter?.fromAttribute ?? defaultFromAttribute
}

/** 判等：Object.is 同值不排更新（NaN 与 NaN 同值，+0 与 -0 不同值）。声明里不接受自定义 hasChanged。 */
function valueChanged(value: unknown, old: unknown): boolean {
  return !Object.is(value, old)
}

/** 让本类持有自己的 elementProperties。未定稿时顺原型链读到的是父类那一个 Map 实例，直接写会污染父类并泄漏给兄弟子类。 */
function prepareOwnProperties(ctor: typeof XhReactiveElement): void {
  if (Object.hasOwn(ctor, 'elementProperties'))
    return
  const superCtor = Object.getPrototypeOf(ctor) as typeof XhReactiveElement
  ctor.elementProperties = new Map(superCtor.elementProperties)
}

/** 声明键只认 attribute / converter / type，其余当场抛（Lit 的那几个键在这里不生效，不能静默吞）。 */
function assertSupportedDeclaration(ctor: typeof XhReactiveElement, name: string, options: PropertyDeclaration): void {
  for (const key of Reflect.ownKeys(options)) {
    if (typeof key === 'string' && SUPPORTED_DECLARATION_KEYS.has(key))
      continue
    throw new TypeError(
      `${ctor.name}.properties.${name}: 不支持的声明键 ${String(key)}。`
      + `本运行时只实现 attribute / converter / type：不回写属性（无 reflect）、判等固定 Object.is（无 hasChanged）、声明必装访问器（无 noAccessor / state）。`,
    )
  }
}

/** 原型上已有同名成员就抛：装访问器会把它整块盖掉，此后作者写的 get/set 或方法永不被调用。 */
function assertPrototypeFree(ctor: typeof XhReactiveElement, name: string): void {
  if (installedAccessors.get(ctor.prototype)?.has(name))
    return
  const existing = Object.getOwnPropertyDescriptor(ctor.prototype, name)
  if (existing === undefined)
    return
  const kind = existing.get !== undefined || existing.set !== undefined ? 'get/set 访问器' : '成员'
  throw new TypeError(
    `${ctor.name}.prototype.${name} 已有 ${kind}，响应式属性会把它整块盖掉。`
    + `本运行时不做 Lit 那样的包装：请给字段改名，或删掉 ${ctor.name}.properties.${name} 这条声明。`,
  )
}

/** 该字段观察哪个属性；undefined 表示不观察。 */
function attributeNameFor(name: string, options: PropertyDeclaration): string | undefined {
  const { attribute } = options
  if (attribute === false)
    return undefined
  return typeof attribute === 'string' ? attribute : name.toLowerCase()
}

/**
 * 响应式自定义元素基类：属性 → 字段的单向转换、批量异步更新、控制器生命周期。
 * 不做 shadow DOM、不做样式、不做模板渲染、不回写属性。
 */
export class XhReactiveElement extends HTMLElement implements ReactiveControllerHost {
  /** 子类以 `static properties = { 字段名: 选项 }` 声明响应式属性。 */
  static properties: PropertyDeclarations = {}

  /** 定稿后的全部声明，含从父类继承来的。 */
  static elementProperties: Map<string, PropertyDeclaration> = new Map()

  /** 浏览器在 customElements.define() 时读它，属性声明就在这一刻定稿。本基类自身返回 []（Lit 那边是 undefined）。 */
  static get observedAttributes(): string[] {
    this.finalize()
    const attrs = attributeMaps.get(this)
    return attrs === undefined ? [] : [...attrs.keys()]
  }

  /** 合并父类声明并逐条建访问器。递归到本基类为止（它已预先登记为定稿）；中途抛错时不登记，下次读还抛同一条。 */
  protected static finalize(): void {
    if (finalizedClasses.has(this))
      return
    const superCtor = Object.getPrototypeOf(this) as typeof XhReactiveElement
    superCtor.finalize()
    prepareOwnProperties(this)
    if (Object.hasOwn(this, 'properties')) {
      const declarations = this.properties
      const symbols = Object.getOwnPropertySymbols(declarations)
      if (symbols.length > 0) {
        throw new TypeError(
          `${this.name}.properties 含 symbol 键 ${String(symbols[0])}：只支持字符串键（symbol 键映射不出属性名）。`,
        )
      }
      for (const name of Object.getOwnPropertyNames(declarations))
        this.createProperty(name, declarations[name] ?? {})
    }
    // 声明全部并完再算属性映射：子类给同名字段改了属性名时，基类那个旧属性名要随之作废。
    const attributes = new Map<string, string>()
    for (const [name, options] of this.elementProperties) {
      const attribute = attributeNameFor(name, options)
      if (attribute !== undefined)
        attributes.set(attribute, name)
    }
    attributeMaps.set(this, attributes)
    finalizedClasses.add(this)
  }

  /** 登记一条声明，并在原型上装一个"写入即排更新"的访问器。 */
  protected static createProperty(name: string, options: PropertyDeclaration): void {
    prepareOwnProperties(this)
    assertSupportedDeclaration(this, name, options)
    assertPrototypeFree(this, name)
    this.elementProperties.set(name, options)
    const key = Symbol(name)
    Object.defineProperty(this.prototype, name, {
      configurable: true,
      enumerable: true,
      get(this: Record<symbol, unknown>): unknown {
        return this[key]
      },
      set(this: Record<symbol, unknown> & XhReactiveElement, value: unknown) {
        const old = this[key]
        this[key] = value
        this.requestUpdate(name, old)
      },
    })
    const installed = installedAccessors.get(this.prototype) ?? new Set<string>()
    installed.add(name)
    installedAccessors.set(this.prototype, installed)
  }

  /** createRenderRoot() 的产物。 */
  renderRoot!: HTMLElement | DocumentFragment

  private readonly controllers = new Set<ReactiveController>()
  private changedProperties: PropertyValues = new Map()
  private pendingUpdate = false
  private hasUpdated = false
  /** 升级前就写在实例上的字段值，首轮更新时补写回去。 */
  private instanceProperties: Map<string, unknown> | undefined
  private updatePromise!: Promise<boolean>
  private startUpdating!: (value: boolean) => void

  constructor() {
    super()
    // 首轮更新等这个闸口，connectedCallback 才放行。
    this.updatePromise = new Promise<boolean>((resolve) => {
      this.startUpdating = resolve
    })
    this.saveInstanceProperties()
    this.requestUpdate()
  }

  /** 元素还没 upgrade 时被赋的字段值会盖住原型访问器，先摘下来存着。 */
  private saveInstanceProperties(): void {
    const self = this as unknown as Record<string, unknown>
    for (const name of (this.constructor as typeof XhReactiveElement).elementProperties.keys()) {
      if (!Object.hasOwn(this, name))
        continue
      this.instanceProperties ??= new Map()
      this.instanceProperties.set(name, self[name])
      delete self[name]
    }
  }

  /** 渲染根，默认就是元素自己（Light DOM）。 */
  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this
  }

  addController(controller: ReactiveController): void {
    this.controllers.add(controller)
    // 已经连上了就当场补一次 hostConnected（控制器常在字段初始化里注册，那时 connected 已过）。
    if (this.renderRoot !== undefined && this.isConnected)
      controller.hostConnected?.()
  }

  removeController(controller: ReactiveController): void {
    this.controllers.delete(controller)
  }

  connectedCallback(): void {
    this.renderRoot ??= this.createRenderRoot()
    this.startUpdating(true)
    for (const controller of this.controllers) controller.hostConnected?.()
  }

  disconnectedCallback(): void {
    for (const controller of this.controllers) controller.hostDisconnected?.()
  }

  /** 属性变化转成字段值；单向，不回写属性。 */
  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    const ctor = this.constructor as typeof XhReactiveElement
    const property = attributeMaps.get(ctor)?.get(name)
    if (property === undefined)
      return
    const options = ctor.elementProperties.get(property) ?? {}
    const self = this as unknown as Record<string, unknown>
    self[property] = fromAttributeOf(options)(value, options.type)
  }

  /**
   * 排一轮更新。带 name 时先按判等过滤，同值直接返回。
   * 一拍内调多次只排一轮。
   */
  requestUpdate(name?: PropertyKey, oldValue?: unknown): void {
    if (name !== undefined) {
      const value = (this as unknown as Record<PropertyKey, unknown>)[name]
      if (!valueChanged(value, oldValue))
        return
      // 首轮更新跑完之前，changedProperties 里的旧值一律记 undefined。
      if (!this.changedProperties.has(name))
        this.changedProperties.set(name, this.hasUpdated ? oldValue : undefined)
    }
    if (!this.pendingUpdate)
      this.updatePromise = this.enqueueUpdate()
  }

  /**
   * 本轮更新落定后 resolve；值为 false 表示更新过程中又排了新一轮（要等的是新的 updateComplete）。
   * 元素连上之前永不 resolve。
   */
  get updateComplete(): Promise<boolean> {
    return this.updatePromise
  }

  private async enqueueUpdate(): Promise<boolean> {
    this.pendingUpdate = true
    try {
      await this.updatePromise
    }
    catch (error) {
      // 上一轮的失败不拖住这一轮，但也不吞掉，抛成未处理拒绝。
      void Promise.reject(error)
    }
    this.performUpdate()
    return !this.pendingUpdate
  }

  private performUpdate(): void {
    if (!this.pendingUpdate)
      return
    if (!this.hasUpdated && this.instanceProperties) {
      const self = this as unknown as Record<string, unknown>
      for (const [name, value] of this.instanceProperties) self[name] = value
      this.instanceProperties = undefined
    }
    const changed = this.changedProperties
    try {
      for (const controller of this.controllers) controller.hostUpdate?.()
      this.update(changed)
    }
    catch (error) {
      this.markUpdated()
      throw error
    }
    for (const controller of this.controllers) controller.hostUpdated?.()
    if (!this.hasUpdated) {
      this.hasUpdated = true
      this.firstUpdated(changed)
    }
    this.updated(changed)
  }

  private markUpdated(): void {
    this.changedProperties = new Map()
    this.pendingUpdate = false
  }

  /** 更新主体。子类覆盖时必须调 super.update()，否则这轮永远结不掉。 */
  protected update(_changed: PropertyValues): void {
    this.markUpdated()
  }

  /** 首轮更新后调一次。 */
  protected firstUpdated(_changed: PropertyValues): void {}

  /** 每轮更新后调。 */
  protected updated(_changed: PropertyValues): void {}
}

// 递归定稿的终点：本基类自己没有属性声明。
finalizedClasses.add(XhReactiveElement)
attributeMaps.set(XhReactiveElement, new Map())
