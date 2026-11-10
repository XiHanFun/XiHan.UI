// 审批类的退场：工具调用批过之后审批面由替身缩回去、下面的结果区随之挪过去；审批卡判过之后待决圆点原地淡出、播完才藏起。
// 替身的去留、补间途中的高度与在播的动画只有真实浏览器量得出来。
import type { ApprovalStatus, ToolCallPhase } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhApprovalPendingIndicator, XhApprovalRoot, XhApprovalTitle, XhToolCallApproval, XhToolCallContent, XhToolCallRoot, XhToolCallTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function frames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

function mountHost(): HTMLElement {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  for (const name of ['exit', 'expand', 'collapse'])
    host.style.setProperty(`--xh-motion-duration-${name}`, '10s')
  document.body.append(host)
  return host
}

function tween(el: Element): Animation | undefined {
  return el.getAnimations().find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

describe('工具调用审批面', () => {
  it('批过之后审批面由替身从原高度缩回去、播完即移除', async () => {
    mountHost()
    const phase = ref<ToolCallPhase>('awaiting-approval')
    app = createApp({
      render: () => h(XhToolCallRoot, { phase: phase.value }, () => [
        h(XhToolCallTrigger, null, () => '写文件'),
        h(XhToolCallApproval, null, () => h('p', { style: 'margin:0; block-size: 40px' }, '要写入 /tmp/a.txt')),
        h(XhToolCallContent, null, () => '结果'),
      ]),
    })
    app.mount(host!)
    await frames(3)
    const approval = host!.querySelector<HTMLElement>(`[data-scope='tool-call'][data-part='approval']`)!
    const height = approval.getBoundingClientRect().height
    expect(height).toBeGreaterThan(1)
    phase.value = 'output-available'
    await expect.poll(() => host!.querySelector(`[data-scope='tool-call'][data-part='approval'][data-xh-ghost]`) !== null).toBe(true)
    const ghost = host!.querySelector<HTMLElement>(`[data-scope='tool-call'][data-part='approval'][data-xh-ghost]`)!
    expect(approval.hidden).toBe(true)
    const collapsing = tween(ghost)!
    collapsing.pause()
    collapsing.currentTime = 0
    expect(Math.abs(ghost.getBoundingClientRect().height - height)).toBeLessThan(1)
    collapsing.finish()
    await expect.poll(() => ghost.isConnected).toBe(false)
  })
})

describe('审批卡待决圆点', () => {
  it('判过之后圆点原地淡出，播完才藏起', async () => {
    mountHost()
    const status = ref<ApprovalStatus>('pending')
    app = createApp({
      render: () => h(XhApprovalRoot, { status: status.value }, () => [
        h(XhApprovalTitle, null, () => '要写文件'),
        h(XhApprovalPendingIndicator),
      ]),
    })
    app.mount(host!)
    await frames(2)
    const dot = host!.querySelector<HTMLElement>(`[data-scope='approval'][data-part='pending-indicator']`)!
    expect(dot.hidden).toBe(false)
    status.value = 'approved'
    await frames(1)
    expect(dot.hidden).toBe(false)
    expect(dot.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)).toContain('xh-fade-out')
    for (const animation of dot.getAnimations())
      animation.finish()
    await expect.poll(() => dot.hidden).toBe(true)
  })
})
