// @vitest-environment jsdom

import type { PropertyDeclaration } from '../src/reactive'
import { describe, expect, it } from 'vitest'
import { XhReactiveElement } from '../src/reactive'

// 与 Lit 有意不同的几处：Lit 会包装/接受的写法，本运行时一律当场抛，不留"写了但不生效"的静默态。
// 这些行为在 reactive-parity.spec.ts 里无从对拍（Lit 那边不抛），故单列。

/** 声明只在读 observedAttributes（等价于 customElements.define 那一刻）时定稿，抛错也在那时。 */
function finalizeOf(ctor: typeof XhReactiveElement): () => string[] {
  return () => ctor.observedAttributes
}

/** 绕开 protected 调用扩展点，模拟作者在子类外部加属性。 */
function createPropertyOn(ctor: unknown, name: string, options: PropertyDeclaration): void {
  ;(ctor as { createProperty: (name: string, options: PropertyDeclaration) => void }).createProperty(name, options)
}

describe('原型上已有同名成员', () => {
  it('作者写了 get/set 的字段被声明为响应式属性时抛错', () => {
    class WithAccessor extends XhReactiveElement {
      static override properties = { w: { type: String } }

      private inner = 'DEFAULT'

      get w(): string {
        return this.inner
      }

      set w(value: string) {
        this.inner = value
      }
    }

    expect(finalizeOf(WithAccessor)).toThrow(/prototype\.w 已有 get\/set 访问器/)
  })

  it('同名方法被声明为响应式属性时抛错', () => {
    class WithMethod extends XhReactiveElement {
      static override properties = { open: { type: Boolean } }

      open(): void {}
    }

    expect(finalizeOf(WithMethod)).toThrow(/prototype\.open 已有 成员/)
  })

  it('抛错的类再读一次 observedAttributes 仍抛同一条，不会退化成空数组', () => {
    class Twice extends XhReactiveElement {
      static override properties = { w: { type: String } }

      get w(): string {
        return ''
      }
    }

    expect(finalizeOf(Twice)).toThrow(/已有 get\/set 访问器/)
    expect(finalizeOf(Twice)).toThrow(/已有 get\/set 访问器/)
  })

  it('子类重新声明父类已声明的同名字段不算冲突', () => {
    class Parent extends XhReactiveElement {
      static override properties = { shared: { attribute: 'shared', type: String } }
    }
    class Child extends Parent {
      static override properties = { shared: { attribute: 'shared-num', type: Number } }
    }

    expect(finalizeOf(Child)).not.toThrow()
    expect(Child.observedAttributes).toEqual(['shared-num'])
  })
})

describe('声明键', () => {
  // 这几个键在 PropertyDeclaration 里标了 never，TS 侧已经红；这里守的是 JS 侧与外部调用扩展点的路径。
  it.each(['hasChanged', 'reflect', 'noAccessor', 'state'])('未实现的 %s 抛错而不是被静默吞掉', (key) => {
    class Unsupported extends XhReactiveElement {
      static override properties = { a: { type: String, [key]: true } as PropertyDeclaration }
    }

    expect(finalizeOf(Unsupported)).toThrow(new RegExp(`properties\\.a: 不支持的声明键 ${key}`))
  })

  it('attribute / converter / type 三个键正常通过', () => {
    class Ok extends XhReactiveElement {
      static override properties = {
        a: { attribute: 'a-attr', type: Number },
        b: { converter: (value: string | null) => value ?? 'none' },
      }
    }

    expect(Ok.observedAttributes.sort()).toEqual(['a-attr', 'b'])
  })

  it('symbol 键抛错而不是被静默丢掉', () => {
    const props = { visible: { type: String } } as Record<string, PropertyDeclaration>
    Object.defineProperty(props, Symbol.for('xh-sym'), { enumerable: true, value: { type: String } })

    class WithSymbol extends XhReactiveElement {
      static override properties = props
    }

    expect(finalizeOf(WithSymbol)).toThrow(/含 symbol 键 Symbol\(xh-sym\)/)
  })
})

describe('createProperty 在未定稿的子类上被调用', () => {
  it('不写进父类的 elementProperties，也不泄漏给兄弟子类', () => {
    class Base extends XhReactiveElement {
      static override properties = { p: { type: String } }
    }
    customElements.define('x-guard-base', Base)

    class Injected extends Base {}
    createPropertyOn(Injected, 'injected', { attribute: 'inj', type: String })

    class Sibling extends Base {
      static override properties = { b: { type: String } }
    }
    customElements.define('x-guard-sibling', Sibling)

    expect(Base.elementProperties.has('injected')).toBe(false)
    expect(Base.observedAttributes).toEqual(['p'])
    expect(Object.hasOwn(Injected, 'elementProperties')).toBe(true)
    expect([...Sibling.elementProperties.keys()]).toEqual(['p', 'b'])
    expect(Sibling.observedAttributes.sort()).toEqual(['b', 'p'])

    // 注入的那条只在它自己这一支生效
    expect([...Injected.elementProperties.keys()]).toEqual(['p', 'injected'])
    expect(Injected.observedAttributes.sort()).toEqual(['inj', 'p'])
  })
})

describe('抽象基类自身', () => {
  // 与 Lit 有意不同：Lit 的 ReactiveElement.observedAttributes 是 undefined，展开会炸。
  it('observedAttributes 是空数组，可以直接展开', () => {
    expect(XhReactiveElement.observedAttributes).toEqual([])
    expect([...XhReactiveElement.observedAttributes, 'x']).toEqual(['x'])
  })
})
