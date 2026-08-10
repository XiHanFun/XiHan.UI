// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createCounterIdGenerator } from '../src/id-generator'
import { createScope, getActiveElementDeep } from '../src/scope'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('id 生成', () => {
  // 计数器在模块级而非生成器级：调用点大多每个组件实例新建一个生成器，
  // 若计数随生成器走，各实例的首个 scopeId 全是同一个，DOM id 撞车会让 aria 引用串到别的实例
  it('两个生成器产出的 scopeId 互不相同', () => {
    const a = createCounterIdGenerator().scopeId()
    const b = createCounterIdGenerator().scopeId()
    expect(a).not.toBe(b)
  })

  it('同一个生成器连续取也不重复', () => {
    const gen = createCounterIdGenerator()
    expect(gen.scopeId()).not.toBe(gen.scopeId())
  })

  it('前缀可换', () => {
    expect(createCounterIdGenerator('zz').scopeId()).toMatch(/^zz-\d+$/)
  })

  it('partId 格式是 组件:scope:部件', () => {
    expect(createCounterIdGenerator().partId('dialog', 'xh-1', 'content')).toBe('dialog:xh-1:content')
  })
})

describe('scope 的 id 派生', () => {
  it('同一个 scope 里各部件 id 各不相同、且都带同一个 scope id', () => {
    const scope = createScope(null, createCounterIdGenerator())
    const ids = scope.ids('dialog', 'title', 'content')
    expect(ids.title).not.toBe(ids.content)
    expect(ids.title).toBe(scope.partId('dialog', 'title'))
    expect(ids.title).toContain(scope.id)
  })

  it('两个 scope 的同名部件 id 不撞车', () => {
    const gen = createCounterIdGenerator()
    const a = createScope(null, gen)
    const b = createScope(null, gen)
    expect(a.partId('dialog', 'content')).not.toBe(b.partId('dialog', 'content'))
  })
})

describe('scope 的宿主解析', () => {
  it('节点为空时回退到全局 document', () => {
    const scope = createScope(null, createCounterIdGenerator())
    expect(scope.getDoc()).toBe(document)
    expect(scope.isShadow()).toBe(false)
  })

  it('节点在 shadow root 里时认 shadow root', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const inner = document.createElement('div')
    shadow.appendChild(inner)

    const scope = createScope(inner, createCounterIdGenerator())
    expect(scope.isShadow()).toBe(true)
    expect(scope.getRootNode()).toBe(shadow)
    expect(scope.getDoc()).toBe(document)
  })

  it('getById 在自己的 root 里找，找不到外面的', () => {
    const outside = document.createElement('div')
    outside.id = 'outside'
    document.body.appendChild(outside)

    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const inner = document.createElement('div')
    inner.id = 'inner'
    shadow.appendChild(inner)

    const scope = createScope(inner, createCounterIdGenerator())
    expect(scope.getById('inner')).toBe(inner)
    expect(scope.getById('outside')).toBeNull()
  })

  // id 会被拼进选择器，含特殊字符时不转义会直接把查询打崩
  it('id 里的特殊字符不会打崩查询', () => {
    const el = document.createElement('div')
    el.id = 'a:b.c'
    document.body.appendChild(el)
    const scope = createScope(null, createCounterIdGenerator())
    expect(() => scope.getById('a:b.c')).not.toThrow()
    expect(scope.getById('a:b.c')).toBe(el)
  })
})

describe('getActiveElementDeep', () => {
  it('没有 shadow 时就是 document.activeElement', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    expect(getActiveElementDeep(document)).toBe(input)
  })

  it('穿透 shadow root 找到真正聚焦的那个', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const input = document.createElement('input')
    shadow.appendChild(input)
    input.focus()

    expect(document.activeElement).toBe(host)
    expect(getActiveElementDeep(document)).toBe(input)
  })

  it('嵌套多层 shadow 也能挖到底', () => {
    const outer = document.createElement('div')
    document.body.appendChild(outer)
    const outerShadow = outer.attachShadow({ mode: 'open' })
    const inner = document.createElement('div')
    outerShadow.appendChild(inner)
    const innerShadow = inner.attachShadow({ mode: 'open' })
    const input = document.createElement('input')
    innerShadow.appendChild(input)
    input.focus()

    expect(getActiveElementDeep(document)).toBe(input)
  })

  it('scope.getActiveElement 从自己的 root 起算', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const input = document.createElement('input')
    shadow.appendChild(input)
    input.focus()

    const scope = createScope(input, createCounterIdGenerator())
    expect(scope.getActiveElement()).toBe(input)
  })
})
