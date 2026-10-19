// 带作者结构的元素插进文档、随即有代码同步读一次布局：浏览器在那一刻为部件算出一份样式，
// 那份样式若还没接线（没有 data-scope / data-part），皮肤的 transition 会从浏览器缺省样式播到皮肤色，
// 用户看到的就是「插进来先带一圈深色边框，过一会儿才恢复」。新建与移出再插回两种插入都不该播这段过渡；
// 只取消接线时起播的那一段，之后的状态变化照常过渡。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

afterEach(() => {
  document.body.replaceChildren()
})

function frame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

async function frames(count: number): Promise<void> {
  for (let i = 0; i < count; i++)
    await frame()
}

/** 这个节点上正在跑的 CSS 过渡，按属性名列出。 */
function transitions(el: Element): string[] {
  return el.getAnimations().filter(animation => animation instanceof CSSTransition).map(animation => (animation as CSSTransition).transitionProperty)
}

interface Case {
  readonly name: string
  readonly tag: string
  readonly scope: string
  readonly html: string
  /** 皮肤给它画边框、带 border-color 过渡的部件。 */
  readonly part: string
}

const CASES: readonly Case[] = [
  {
    name: '数字框',
    tag: 'xh-number-field',
    scope: 'number-field',
    html: '<div data-xh-part="root"><div data-xh-part="control"><button data-xh-part="decrement-trigger" type="button"></button><input data-xh-part="input"><button data-xh-part="increment-trigger" type="button"></button></div></div>',
    part: 'control',
  },
  {
    name: '工具条',
    tag: 'xh-toolbar',
    scope: 'toolbar',
    html: '<div data-xh-part="root"><button data-xh-part="item" value="a" type="button">A</button><button data-xh-part="item" value="b" type="button">B</button></div>',
    part: 'item',
  },
]

function create(c: Case): HTMLElement {
  const el = document.createElement(c.tag)
  el.setAttribute('aria-label', c.name)
  el.innerHTML = c.html
  return el
}

function partOf(el: HTMLElement, c: Case): HTMLElement {
  return el.querySelector<HTMLElement>(`[data-xh-part="${c.part}"]`)!
}

/** 皮肤给这个部件声明的过渡属性（不含内联压制）。 */
function skinTransition(part: HTMLElement): string {
  return getComputedStyle(part).transitionProperty
}

describe('插入后紧接着同步读布局：部件不从未接线的样式播过渡', () => {
  it.each(CASES)('$name：新建插入后同步读一次布局，下一帧没有 CSS 过渡，部件上不留内联样式、皮肤的过渡声明照旧', async (c) => {
    const host = document.createElement('div')
    document.body.append(host)
    const el = create(c)
    host.append(el)
    const part = partOf(el, c)
    host.getBoundingClientRect()
    await frame()
    expect(transitions(part)).toEqual([])
    expect(part.getAttribute('data-scope')).toBe(c.scope)
    expect(part.hasAttribute('style')).toBe(false)
    expect(skinTransition(part)).toContain('border')
  })

  it.each(CASES)('$name：移出、等部件交还后插回，同步读一次布局，下一帧没有 CSS 过渡', async (c) => {
    const host = document.createElement('div')
    document.body.append(host)
    const el = create(c)
    host.append(el)
    await frames(2)
    const part = partOf(el, c)
    el.remove()
    await frame()
    // 前提：交还已经跑过，部件上的皮肤属性撤掉了
    expect(part.hasAttribute('data-scope')).toBe(false)
    host.append(el)
    host.getBoundingClientRect()
    await frame()
    expect(transitions(part)).toEqual([])
    expect(part.getAttribute('data-scope')).toBe(c.scope)
  })

  it.each(CASES)('$name：接线之后的样式变化照常起播过渡', async (c) => {
    const el = create(c)
    document.body.append(el)
    const part = partOf(el, c)
    el.getBoundingClientRect()
    await frames(2)
    part.style.borderColor = 'rgb(255, 0, 0)'
    part.getBoundingClientRect()
    expect(transitions(part).some(name => name.startsWith('border'))).toBe(true)
  })
})
