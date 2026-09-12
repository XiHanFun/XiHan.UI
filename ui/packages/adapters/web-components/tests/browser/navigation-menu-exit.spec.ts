// NavigationMenu 的 CSS 退场要在真实 Chromium 验：jsdom 不会从样式表解析 animation 简写。
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
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

function mount(options: { viewport?: boolean } = {}): HTMLElement {
  const content = `<div data-xh-part="content" value="products"><a data-xh-part="link" href="#products">产品入口</a></div>`
  host = document.createElement('div')
  host.innerHTML = `
    <xh-navigation-menu default-value="products">
      <nav data-xh-part="root"><ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="products">产品</button>
          ${options.viewport ? '' : content}
        </li>
        <li data-xh-part="item"><a data-xh-part="link" href="#home">首页</a></li>
        <li data-xh-part="indicator"></li>
      </ul>${options.viewport ? `<div data-xh-part="viewport">${content}</div>` : ''}</nav>
    </xh-navigation-menu>
  `
  document.body.append(host)
  return host.firstElementChild as HTMLElement
}

describe('wc navigation-menu 的退出资源', () => {
  it('面板退场动画完成前保留 Layer，完成后才释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-navigation-menu-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='navigation-menu'][data-part='content'][data-state='closed'] {
        animation: test-navigation-menu-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const element = mount()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    element.querySelector<HTMLElement>('[data-xh-part="trigger"]')!.click()
    await settle()
    const content = element.querySelector<HTMLElement>('[data-xh-part="content"]')!
    expect(content.getAttribute('data-state')).toBe('closed')
    expect(getComputedStyle(content).display).not.toBe('none')
    const animations = content.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
    expect(animations).toHaveLength(1)
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    animations[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(content.style.display).toBe('none')
  })

  it('viewport 保持到面板真实退场完成，关闭同拍内容即不可交互', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-navigation-menu-viewport-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='navigation-menu'][data-part='content'][data-state='closed'] {
        animation: test-navigation-menu-viewport-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const element = mount({ viewport: true })
    await settle()

    element.querySelector<HTMLElement>('[data-xh-part="trigger"]')!.click()
    await settle()
    const content = element.querySelector<HTMLElement>('[data-xh-part="content"]')!
    const viewport = element.querySelector<HTMLElement>('[data-xh-part="viewport"]')!
    const link = content.querySelector<HTMLAnchorElement>('a')!
    const animations = content.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))

    expect(animations).toHaveLength(1)
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(getComputedStyle(content).display).not.toBe('none')
    expect(viewport.hidden).toBe(false)
    expect(getComputedStyle(viewport).display).not.toBe('none')
    link.focus()
    expect(document.activeElement).not.toBe(link)
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    animations[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(content.style.display).toBe('none')
    expect(viewport.hidden).toBe(true)
    expect(viewport.style.display).toBe('none')
  })

  it('活动 content 被作者动态移除时注销对应 Presence 并立即释放 Layer', async () => {
    const element = mount({ viewport: true })
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    const content = element.querySelector<HTMLElement>('[data-xh-part="content"]')!
    content.remove()
    await settle()

    expect(content.isConnected).toBe(false)
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })

  it('宿主断开时精确注销全部 Presence，不把活动 Layer 留在所属 Document', async () => {
    const element = mount()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    element.remove()
    await settle()

    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
