// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

beforeEach(() => {
  document.body.innerHTML = ''
})

async function settle(el: Updatable): Promise<void> {
  await el.updateComplete
  await el.updateComplete
}

function mount(html: string): Updatable {
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.appendChild(host)
  return host.firstElementChild as Updatable
}

/**
 * 自定义元素声明了响应式属性（static properties），作者就有两条等价的写法：
 * 写 HTML 特性，或给 DOM property 赋值。框架绑定（Vue 的 :prop、Lit 的 .prop）
 * 走的都是后者。
 *
 * wire() 若绕过属性、直接 getAttribute 回读，property 这条路就完全空转：
 * 赋值只排一轮更新，产出还是老样子。更糟的是先写过 property 之后，
 * 再写同值的 attribute 会被 Lit 的 hasChanged 吞掉，从此再也改不动。
 */
describe('wC 元素的 property 写法与 attribute 等价', () => {
  it('xh-separator：给 orientation 赋值（property）生效', async () => {
    const el = mount('<xh-separator><div data-xh-part="root"></div></xh-separator>')
    await settle(el)
    const root = el.querySelector('[data-xh-part="root"]')!
    expect(root.getAttribute('data-orientation')).toBe('horizontal')

    ;(el as unknown as { orientation: string }).orientation = 'vertical'
    await settle(el)
    expect(root.getAttribute('data-orientation')).toBe('vertical')
    expect(root.getAttribute('aria-orientation')).toBe('vertical')
  })

  it('xh-separator：decorative 用 property 赋值同样生效', async () => {
    const el = mount('<xh-separator><div data-xh-part="root"></div></xh-separator>')
    await settle(el)
    const root = el.querySelector('[data-xh-part="root"]')!
    expect(root.getAttribute('role')).toBe('separator')

    ;(el as unknown as { decorative: boolean }).decorative = true
    await settle(el)
    // 装饰性分隔退出无障碍树
    expect(root.getAttribute('role')).toBe('none')
  })

  it('xh-badge：给 variant 赋值（property）生效', async () => {
    const el = mount('<xh-badge variant="solid"><span data-xh-part="root">徽标</span></xh-badge>')
    await settle(el)
    const root = el.querySelector('[data-xh-part="root"]')!
    expect(root.getAttribute('data-variant')).toBe('solid')

    ;(el as unknown as { variant: string }).variant = 'outline'
    await settle(el)
    expect(root.getAttribute('data-variant')).toBe('outline')
  })

  it('xh-badge：先写 property 再写同值 attribute，不会被吞掉', async () => {
    const el = mount('<xh-badge><span data-xh-part="root">徽标</span></xh-badge>')
    await settle(el)
    ;(el as unknown as { variant: string }).variant = 'subtle'
    await settle(el)
    el.setAttribute('variant', 'subtle')
    await settle(el)
    expect(el.querySelector('[data-xh-part="root"]')!.getAttribute('data-variant')).toBe('subtle')
  })
})
