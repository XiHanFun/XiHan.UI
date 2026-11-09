// 审批类的退场：工具调用批过之后审批面由替身缩回去；审批卡判过之后待决圆点原地淡出、播完才藏起。
// 宿主带着 [hidden]{display:none!important}（Tailwind preflight 同款）。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhApprovalPendingIndicator, XhApprovalRoot, XhApprovalTitle, XhToolCallApproval, XhToolCallContent, XhToolCallRoot, XhToolCallTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import './hidden-important-host'

let root: Root | null = null
let host: HTMLElement | null = null
const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

async function settle(): Promise<void> {
  for (let index = 0; index < 4; index++) {
    await inAct(async () => {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    })
  }
}

async function mount(node: ReactNode): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  for (const name of ['exit', 'expand', 'collapse'])
    host.style.setProperty(`--xh-motion-duration-${name}`, '10s')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(node))
  await settle()
}

afterEach(async () => {
  if (root)
    await inAct(() => root!.unmount())
  root = null
  host?.remove()
  host = null
})

function tween(el: Element): Animation | undefined {
  return el.getAnimations().find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

let setPhase: (phase: 'awaiting-approval' | 'output-available') => void = () => {}
let setStatus: (status: 'pending' | 'approved') => void = () => {}

function ToolCall(): ReactNode {
  const [phase, set] = useState<'awaiting-approval' | 'output-available'>('awaiting-approval')
  setPhase = set
  return (
    <XhToolCallRoot phase={phase} name="写文件">
      <XhToolCallTrigger>写文件</XhToolCallTrigger>
      <XhToolCallApproval><p style={{ margin: 0, blockSize: '40px' }}>要写入 /tmp/a.txt</p></XhToolCallApproval>
      <XhToolCallContent>结果</XhToolCallContent>
    </XhToolCallRoot>
  )
}

function Approval(): ReactNode {
  const [status, set] = useState<'pending' | 'approved'>('pending')
  setStatus = set
  return (
    <XhApprovalRoot status={status}>
      <XhApprovalTitle>要写文件</XhApprovalTitle>
      <XhApprovalPendingIndicator />
    </XhApprovalRoot>
  )
}

describe('react 审批类的退场', () => {
  it('工具调用批过之后审批面由替身从原高度缩回去', async () => {
    await mount(<ToolCall />)
    const approval = host!.querySelector<HTMLElement>(`[data-scope='tool-call'][data-part='approval']`)!
    const height = approval.getBoundingClientRect().height
    expect(height).toBeGreaterThan(1)
    await inAct(() => setPhase('output-available'))
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
    await mount(<Approval />)
    const dot = host!.querySelector<HTMLElement>(`[data-scope='approval'][data-part='pending-indicator']`)!
    expect(dot.hidden).toBe(false)
    await inAct(() => setStatus('approved'))
    await settle()
    expect(dot.hidden).toBe(false)
    expect(dot.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)).toContain('xh-fade-out')
    for (const animation of dot.getAnimations())
      animation.finish()
    await expect.poll(() => dot.hidden).toBe(true)
  })
})
