// NavigationMenu 面板里的子级在真实 Chromium 验：作者写的子级容器由元素按开合落内联 display，
// 当前页所在的那一枝在首轮接线之后才认得出来（aria-current 与 id 都是那时才写上的）。
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
  await Promise.resolve()
}

function mount(options: { defaultValue?: string, current?: string } = {}): HTMLElement {
  const link = (href: string, text: string): string =>
    `<a data-xh-part="link" href="${href}"${href === options.current ? ' current' : ''}>${text}</a>`
  host = document.createElement('div')
  host.innerHTML = `
    <xh-navigation-menu${options.defaultValue ? ` default-value="${options.defaultValue}"` : ''}>
      <nav data-xh-part="root"><ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="products">产品</button>
          <div data-xh-part="content" value="products">
            ${link('#overview', '产品概览')}
            <button data-xh-part="branch-trigger" value="adapters">框架适配器<span data-xh-part="branch-indicator" value="adapters"></span></button>
            <div data-xh-part="branch-content" value="adapters">${link('#vue', 'Vue')}${link('#react', 'React')}</div>
            <button data-xh-part="branch-trigger" value="tools" disabled>开发工具<span data-xh-part="branch-indicator" value="tools"></span></button>
            <div data-xh-part="branch-content" value="tools">${link('#cli', '命令行')}</div>
          </div>
        </li>
        <li data-xh-part="indicator"></li>
      </ul></nav>
    </xh-navigation-menu>
  `
  document.body.append(host)
  return host.firstElementChild as HTMLElement
}

const q = (root: HTMLElement, selector: string): HTMLElement => root.querySelector<HTMLElement>(selector)!

describe('wc navigation-menu 面板里的子级', () => {
  it('子级容器随开合落内联 display；禁用的开关摘掉原生 disabled、点不开', async () => {
    const element = mount({ defaultValue: 'products' })
    await settle()
    const trigger = q(element, '[data-xh-part="branch-trigger"][value="adapters"]')
    const content = q(element, '[data-xh-part="branch-content"][value="adapters"]')
    expect(content.hasAttribute('hidden')).toBe(true)
    expect(getComputedStyle(content).display).toBe('none')
    expect(trigger.getAttribute('aria-controls')).toBe(content.id)

    trigger.click()
    await settle()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(getComputedStyle(content).display).toBe('flex')
    expect(content.getBoundingClientRect().height).toBeGreaterThan(0)

    trigger.click()
    await settle()
    expect(getComputedStyle(content).display).toBe('none')

    const disabled = q(element, '[data-xh-part="branch-trigger"][value="tools"]')
    expect(disabled.hasAttribute('disabled')).toBe(false)
    expect(disabled.getAttribute('aria-disabled')).toBe('true')
    disabled.click()
    await settle()
    expect(getComputedStyle(q(element, '[data-xh-part="branch-content"][value="tools"]')).display).toBe('none')
  })

  it('挂载即展开且当前页在子级里：首轮接线之后那一枝直接展开', async () => {
    const element = mount({ defaultValue: 'products', current: '#react' })
    await settle()
    expect(q(element, '[data-xh-part="branch-trigger"][value="adapters"]').getAttribute('aria-expanded')).toBe('true')
    expect(getComputedStyle(q(element, '[data-xh-part="branch-content"][value="adapters"]')).display).toBe('flex')
    expect(q(element, '[href="#react"]').getAttribute('aria-current')).toBe('page')
  })

  it('子级里 Escape 只收这一枝、焦点回开关；再按一次收起面板、焦点回入口', async () => {
    const element = mount({ defaultValue: 'products' })
    await settle()
    const trigger = q(element, '[data-xh-part="branch-trigger"][value="adapters"]')
    trigger.click()
    await settle()
    q(element, '[href="#vue"]').focus()
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
    expect(q(element, '[data-xh-part="trigger"]').getAttribute('aria-expanded')).toBe('true')
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(q(element, '[data-xh-part="trigger"]').getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(q(element, '[data-xh-part="trigger"]'))
  })
})
