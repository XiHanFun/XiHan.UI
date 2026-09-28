// @vitest-environment jsdom
// <xh-tooltip-provider> 把子树里的 <xh-tooltip> 放进同一组：没写 open-delay 的取组的缺省，
// 组内另一个开着时下一个直接接替；挪出 Provider 的提示回到页面级的那一组。
// follow-cursor 让定位层带上跟随标记。计时用假时钟，几何交给浏览器用例。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements, XhTooltipProviderElement } from '../src/define'

defineXhElements()

interface TooltipElement extends HTMLElement {
  updateComplete: Promise<unknown>
}

async function settle(): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    for (const element of document.querySelectorAll<TooltipElement>('xh-tooltip'))
      await element.updateComplete
  }
}

function tooltipHtml(label: string, attrs = ''): string {
  return `<xh-tooltip ${attrs}><button data-xh-part="trigger">${label}</button>`
    + `<div data-xh-part="positioner"><div data-xh-part="content">${label}的说明</div></div></xh-tooltip>`
}

function trigger(label: string): HTMLElement {
  return [...document.querySelectorAll<HTMLElement>('[data-part="trigger"]')].find(el => el.textContent === label)!
}

function content(label: string): HTMLElement {
  return [...document.querySelectorAll<HTMLElement>('[data-part="content"]')].find(el => el.textContent?.startsWith(label))!
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('xh-tooltip-provider', () => {
  it('是 display: contents 的容器，导出元素类', async () => {
    document.body.innerHTML = `<xh-tooltip-provider>${tooltipHtml('保存')}</xh-tooltip-provider>`
    await settle()
    const provider = document.querySelector('xh-tooltip-provider') as XhTooltipProviderElement
    expect(provider).toBeInstanceOf(XhTooltipProviderElement)
    expect(provider.style.display).toBe('contents')
    expect(provider.tooltipGroup).toBeTruthy()
  })

  it('组内提示取组的 open-delay；组内另一个开着时下一个直接接替，上一个收起', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 60_000)
    document.body.innerHTML = `<xh-tooltip-provider open-delay="150" skip-delay-duration="300">${tooltipHtml('保存')}${tooltipHtml('撤销')}</xh-tooltip-provider>`
    await settle()
    trigger('保存').dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(149)
    await settle()
    expect(content('保存').getAttribute('data-state')).toBe('closed')
    vi.advanceTimersByTime(1)
    await settle()
    expect(content('保存').getAttribute('data-state')).toBe('open')

    trigger('撤销').dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(0)
    await settle()
    expect(content('撤销').getAttribute('data-state')).toBe('open')
    expect(content('保存').getAttribute('data-state')).toBe('closed')
  })

  it('挪出 Provider 的提示回到页面级那一组：不再取组的缺省', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 120_000)
    document.body.innerHTML = `<xh-tooltip-provider open-delay="50" skip-delay-duration="0">${tooltipHtml('导出', 'skip-delay-duration="0"')}</xh-tooltip-provider>`
    await settle()
    const tooltip = document.querySelector('xh-tooltip')!
    document.body.append(tooltip)
    await settle()
    trigger('导出').dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(50)
    await settle()
    expect(content('导出').getAttribute('data-state')).toBe('closed')
    vi.advanceTimersByTime(650)
    await settle()
    expect(content('导出').getAttribute('data-state')).toBe('open')
  })
})

describe('xh-tooltip follow-cursor', () => {
  it('写了 follow-cursor：定位层带跟随标记；没写不带', async () => {
    document.body.innerHTML = `${tooltipHtml('跟随', 'follow-cursor')}${tooltipHtml('锚定')}`
    await settle()
    const positioners = [...document.querySelectorAll<HTMLElement>('[data-part="positioner"]')]
    expect(positioners[0]!.hasAttribute('data-follow-cursor')).toBe(true)
    expect(positioners[1]!.hasAttribute('data-follow-cursor')).toBe(false)
  })
})
