// @vitest-environment jsdom
import type { RuntimeConfig } from '@xihan-ui/kernel'
import { createCounterIdGenerator, createScope } from '@xihan-ui/kernel'
import { afterEach, describe, expect, it } from 'vitest'
import { acquireScrollLock } from '../src/scroll-lock'

const GUTTER_VAR = '--xh-scroll-lock-gutter'

function fakeConfig(scrollRoot?: () => HTMLElement | null): RuntimeConfig {
  const scope = createScope(document.body, createCounterIdGenerator())
  return { scope, scrollRoot } as RuntimeConfig
}

/** jsdom 不排版，几何值直接盖在实例上。 */
function fakeGeometry(el: Element, geometry: Record<string, number>): void {
  for (const [key, value] of Object.entries(geometry))
    Object.defineProperty(el, key, { value, configurable: true })
}

/** 造一个铺满视口且内容溢出的滚动容器。 */
function scrollableBox(geometry: Record<string, number>): HTMLElement {
  const el = document.createElement('div')
  el.style.overflowY = 'auto'
  document.body.append(el)
  fakeGeometry(el, geometry)
  return el
}

afterEach(() => {
  document.body.innerHTML = ''
  document.body.style.cssText = ''
  document.documentElement.style.cssText = ''
  for (const key of ['scrollHeight', 'clientHeight', 'clientWidth'])
    Reflect.deleteProperty(document.documentElement, key)
})

describe('acquireScrollLock（滚动根）', () => {
  it('注入滚动根时锁的是它，body 不动', () => {
    const el = scrollableBox({ scrollHeight: 2000, clientHeight: 600, clientWidth: 800, offsetWidth: 800 })
    const h = acquireScrollLock({ config: fakeConfig(() => el) })

    expect(el.style.overflow).toBe('hidden')
    expect(el.style.position).toBe('')
    expect(document.body.style.position).toBe('')

    h.dispose()
    expect(el.style.overflow).toBe('')
  })

  it('注入 body 时仍走整页那一路', () => {
    const h = acquireScrollLock({ config: fakeConfig(() => document.body) })
    expect(document.body.style.position).toBe('fixed')
    h.dispose()
  })

  it('body 不滚时探测到铺满视口的滚动容器', () => {
    const shell = document.createElement('div')
    document.body.append(shell)
    const content = document.createElement('div')
    content.style.overflowY = 'auto'
    shell.append(content)
    fakeGeometry(content, { scrollHeight: 4000, clientHeight: 700, clientWidth: 1000, offsetWidth: 1000 })

    const h = acquireScrollLock({ config: fakeConfig() })
    expect(content.style.overflow).toBe('hidden')
    expect(document.body.style.position).toBe('')
    h.dispose()
  })

  it('能滚但铺不满视口的容器不当滚动根，回落 body', () => {
    scrollableBox({ scrollHeight: 3000, clientHeight: 700, clientWidth: 240, offsetWidth: 240 })

    const h = acquireScrollLock({ config: fakeConfig() })
    expect(document.body.style.position).toBe('fixed')
    h.dispose()
    expect(document.body.style.position).toBe('')
  })
})

describe('acquireScrollLock（滚动条补偿）', () => {
  it('引用计数下只补一次内距，全部释放后复原', () => {
    const el = scrollableBox({ scrollHeight: 2000, clientHeight: 600, clientWidth: 785, offsetWidth: 800 })
    const config = fakeConfig(() => el)

    const a = acquireScrollLock({ config })
    expect(el.style.paddingInlineEnd).toBe('15px')

    const b = acquireScrollLock({ config })
    expect(el.style.paddingInlineEnd).toBe('15px')

    a.dispose()
    expect(el.style.paddingInlineEnd).toBe('15px')
    b.dispose()
    expect(el.style.paddingInlineEnd).toBe('')
    expect(el.style.overflow).toBe('')
  })

  it('原本就有 padding-inline-end 的元素释放后回到原值', () => {
    const el = scrollableBox({ scrollHeight: 2000, clientHeight: 600, clientWidth: 785, offsetWidth: 800 })
    el.style.paddingInlineEnd = '8px'

    const h = acquireScrollLock({ config: fakeConfig(() => el) })
    expect(el.style.paddingInlineEnd).toBe('23px')

    h.dispose()
    expect(el.style.paddingInlineEnd).toBe('8px')
  })

  it('内容不溢出时不补内距', () => {
    const el = scrollableBox({ scrollHeight: 600, clientHeight: 600, clientWidth: 785, offsetWidth: 800 })
    const h = acquireScrollLock({ config: fakeConfig(() => el) })

    expect(el.style.paddingInlineEnd).toBe('')
    expect(document.documentElement.style.getPropertyValue(GUTTER_VAR)).toBe('0px')
    h.dispose()
  })

  it('整页那一路量文档滚动条，并把值写成自定义属性', () => {
    fakeGeometry(document.documentElement, { scrollHeight: 3000, clientHeight: 768, clientWidth: 1009 })

    const h = acquireScrollLock({ config: fakeConfig() })
    expect(document.body.style.position).toBe('fixed')
    expect(document.body.style.boxSizing).toBe('border-box')
    expect(document.body.style.paddingInlineEnd).toBe('15px')
    expect(document.documentElement.style.getPropertyValue(GUTTER_VAR)).toBe('15px')

    h.dispose()
    expect(document.body.style.paddingInlineEnd).toBe('')
    expect(document.body.style.boxSizing).toBe('')
    expect(document.documentElement.style.getPropertyValue(GUTTER_VAR)).toBe('')
  })
})
