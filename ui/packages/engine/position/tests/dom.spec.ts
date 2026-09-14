// @vitest-environment jsdom

// 包含块解析与裁剪链是纯 DOM 遍历，不需要真实布局，放 jsdom 这层验。
// 真正的几何贴合在 tests/browser/ 里，jsdom 没有布局，量不出来。
import { afterEach, describe, expect, it } from 'vitest'
import { clippingAncestors, getContainingBlock } from '../src/dom'

function el(css = ''): HTMLElement {
  const node = document.createElement('div')
  node.style.cssText = css
  return node
}

/** 按由外到内的顺序串成一条链，返回最内层。 */
function chain(...nodes: HTMLElement[]): HTMLElement {
  document.body.appendChild(nodes[0]!)
  for (let i = 1; i < nodes.length; i++) nodes[i - 1]!.appendChild(nodes[i]!)
  return nodes[nodes.length - 1]!
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('getContainingBlock：absolute', () => {
  it('认祖先的非 static 定位', () => {
    const block = el('position: relative')
    const floating = chain(block, el())
    expect(getContainingBlock(floating)).toBe(block)
  })

  it('static 的祖先跳过，继续往上找', () => {
    const block = el('position: relative')
    const floating = chain(block, el('position: static'), el())
    expect(getContainingBlock(floating)).toBe(block)
  })

  it('一个都没有时返回 null，交给初始包含块', () => {
    const floating = chain(el(), el())
    expect(getContainingBlock(floating)).toBeNull()
  })

  it('transform 的祖先哪怕是 static 也算', () => {
    const block = el('transform: translateX(10px)')
    const floating = chain(block, el())
    expect(getContainingBlock(floating)).toBe(block)
  })

  it('独立的 translate / rotate / scale 属性哪怕祖先是 static 也算', () => {
    for (const css of ['translate: 60px 30px', 'rotate: 45deg', 'scale: 1.2']) {
      document.body.innerHTML = ''
      const block = el(css)
      expect(getContainingBlock(chain(block, el()))).toBe(block)
    }
  })
})

describe('getContainingBlock：fixed', () => {
  // fixed 不认祖先的 relative，这正是它能逃出 overflow 容器的原因
  it('不认祖先的 relative', () => {
    const floating = chain(el('position: relative'), el())
    expect(getContainingBlock(floating, 'fixed')).toBeNull()
  })

  it('不认 absolute / sticky 的祖先', () => {
    expect(getContainingBlock(chain(el('position: absolute'), el()), 'fixed')).toBeNull()
    document.body.innerHTML = ''
    expect(getContainingBlock(chain(el('position: sticky'), el()), 'fixed')).toBeNull()
  })

  // transform / filter / contain 会把 fixed 的包含块一并劫持，这是 fixed 唯一逃不掉的一类
  it('仍认 transform 的祖先', () => {
    const block = el('transform: translateX(10px)')
    const floating = chain(block, el())
    expect(getContainingBlock(floating, 'fixed')).toBe(block)
  })

  it('仍认 filter 的祖先', () => {
    const block = el('filter: blur(1px)')
    const floating = chain(block, el())
    expect(getContainingBlock(floating, 'fixed')).toBe(block)
  })

  it('仍认独立的 translate / rotate / scale 属性', () => {
    for (const css of ['translate: 60px 30px', 'rotate: 45deg', 'scale: 1.2']) {
      document.body.innerHTML = ''
      const block = el(css)
      expect(getContainingBlock(chain(block, el()), 'fixed')).toBe(block)
    }
  })

  it('仍认 will-change 里点名独立变换属性的祖先', () => {
    for (const css of ['will-change: translate', 'will-change: rotate', 'will-change: scale', 'will-change: backdrop-filter']) {
      document.body.innerHTML = ''
      const block = el(css)
      expect(getContainingBlock(chain(block, el()), 'fixed')).toBe(block)
    }
  })

  it('relative 与 transform 同时在场时，取更近的那个能劫持 fixed 的', () => {
    const outer = el('transform: translateX(10px)')
    const inner = el('position: relative')
    const floating = chain(outer, inner, el())
    expect(getContainingBlock(floating, 'absolute')).toBe(inner)
    expect(getContainingBlock(floating, 'fixed')).toBe(outer)
  })

  it('缺省参数等价于 absolute', () => {
    const block = el('position: relative')
    const floating = chain(block, el())
    expect(getContainingBlock(floating)).toBe(getContainingBlock(floating, 'absolute'))
  })
})

describe('clippingAncestors', () => {
  it('由近到远收集会裁剪的祖先', () => {
    const outer = el('overflow: hidden')
    const inner = el('overflow: auto')
    const floating = chain(outer, inner, el())
    expect(clippingAncestors(floating)).toEqual([inner, outer])
  })

  it('overflow: visible 的祖先不算', () => {
    const floating = chain(el('overflow: visible'), el())
    expect(clippingAncestors(floating)).toEqual([])
  })

  // fixed 只被劫持了它包含块的那个祖先及其内层裁；不截断就会躲一条已经不存在的边界
  it('stopAt 给定时走到它为止，且含它自己', () => {
    const outer = el('overflow: hidden')
    const middle = el('overflow: hidden')
    const floating = chain(outer, middle, el())
    expect(clippingAncestors(floating, middle)).toEqual([middle])
  })

  it('stopAt 自己不裁剪时也就此打住', () => {
    const outer = el('overflow: hidden')
    const middle = el('transform: translateX(10px)')
    const floating = chain(outer, middle, el())
    expect(clippingAncestors(floating, middle)).toEqual([])
  })

  it('stopAt 不在链上时退化成走到根', () => {
    const outer = el('overflow: hidden')
    const floating = chain(outer, el())
    expect(clippingAncestors(floating, el('overflow: hidden'))).toEqual([outer])
  })

  it('不给 stopAt 时行为与从前一致', () => {
    const outer = el('overflow: hidden')
    const floating = chain(outer, el())
    expect(clippingAncestors(floating)).toEqual([outer])
  })
})
