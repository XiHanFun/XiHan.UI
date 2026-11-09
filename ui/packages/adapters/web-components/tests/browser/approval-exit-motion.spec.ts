// 审批类的退场：工具调用批过之后审批面由替身缩回去；审批卡判过之后待决圆点原地淡出、播完才藏起。
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

type XhElement = HTMLElement & { updateComplete: Promise<unknown>, [key: string]: unknown }

let host: HTMLElement | null = null

beforeEach(() => {
  setDiagnosticsLevel('silent')
})

afterEach(() => {
  host?.remove()
  host = null
  setDiagnosticsLevel('warn')
})

async function settle(el: XhElement): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    await el.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function mount(tag: string, attrs: Record<string, string>, markup: string): Promise<XhElement> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  for (const name of ['exit', 'expand', 'collapse'])
    host.style.setProperty(`--xh-motion-duration-${name}`, '10s')
  document.body.append(host)
  const el = document.createElement(tag) as XhElement
  for (const [name, value] of Object.entries(attrs))
    el.setAttribute(name, value)
  el.innerHTML = markup
  host.append(el)
  await settle(el)
  return el
}

function tween(el: Element): Animation | undefined {
  return el.getAnimations().find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

describe('xh-tool-call 与 xh-approval 的退场', () => {
  it('工具调用批过之后审批面由替身从原高度缩回去', async () => {
    const call = await mount('xh-tool-call', { phase: 'awaiting-approval', name: '写文件' }, `<div data-xh-part="root">
      <button data-xh-part="trigger">写文件</button>
      <div data-xh-part="approval"><p style="margin:0; block-size: 40px">要写入 /tmp/a.txt</p></div>
      <div data-xh-part="content">结果</div>
    </div>`)
    const approval = host!.querySelector<HTMLElement>(`[data-scope='tool-call'][data-part='approval']`)!
    const height = approval.getBoundingClientRect().height
    expect(height).toBeGreaterThan(1)
    call.setAttribute('phase', 'output-available')
    await settle(call)
    await expect.poll(() => host!.querySelector(`[data-scope='tool-call'][data-part='approval'][data-xh-ghost]`) !== null).toBe(true)
    const ghost = host!.querySelector<HTMLElement>(`[data-scope='tool-call'][data-part='approval'][data-xh-ghost]`)!
    const collapsing = tween(ghost)!
    collapsing.pause()
    collapsing.currentTime = 0
    expect(Math.abs(ghost.getBoundingClientRect().height - height)).toBeLessThan(1)
    collapsing.finish()
    await expect.poll(() => ghost.isConnected).toBe(false)
  })

  it('审批卡判过之后待决圆点原地淡出，播完才藏起', async () => {
    const card = await mount('xh-approval', { status: 'pending' }, `<div data-xh-part="root"><div data-xh-part="title">要写文件</div><span data-xh-part="pending-indicator"></span></div>`)
    const dot = host!.querySelector<HTMLElement>(`[data-scope='approval'][data-part='pending-indicator']`)!
    const hiddenNow = (): boolean => dot.hidden || getComputedStyle(dot).display === 'none'
    expect(hiddenNow()).toBe(false)
    card.setAttribute('status', 'approved')
    await settle(card)
    expect(hiddenNow()).toBe(false)
    expect(dot.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)).toContain('xh-fade-out')
    for (const animation of dot.getAnimations())
      animation.finish()
    await expect.poll(hiddenNow).toBe(true)
  })
})
