// 宿主带 [hidden]{display:none!important}（Tailwind 4 的 preflight 就是这条）时面级披露的退场照样播完。
// 真实布局与 CSS 动画只有浏览器量得出来。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  XhAccordionContent,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
  XhReasoningContent,
  XhReasoningRoot,
  XhReasoningTrigger,
  XhToolCallContent,
  XhToolCallRoot,
  XhToolCallTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const BODY = Array.from({ length: 12 }, (_, i) => `第 ${i + 1} 行说明文字`).join('。')
const MOTION_SLOTS = ['--xh-motion-duration-expand', '--xh-motion-duration-collapse', '--xh-motion-ease-disclosure']

let root: Root | null = null
let host: HTMLElement | null = null
let preflight: HTMLStyleElement | null = null

beforeEach(() => {
  const style = document.documentElement.style
  style.setProperty('--xh-motion-duration-expand', '600ms')
  style.setProperty('--xh-motion-duration-collapse', '600ms')
  style.setProperty('--xh-motion-ease-disclosure', 'linear')
  preflight = document.createElement('style')
  preflight.textContent = '@layer base { [hidden]:where(:not([hidden="until-found"])) { display: none !important; } }'
  document.head.append(preflight)
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  host?.remove()
  host = null
  preflight?.remove()
  preflight = null
  for (const slot of MOTION_SLOTS)
    document.documentElement.style.removeProperty(slot)
})

function frame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

interface Case {
  readonly scope: string
  readonly tree: (open: boolean) => ReactNode
}

const CASES: Case[] = [
  {
    scope: 'collapsible',
    tree: open => (
      <XhCollapsibleRoot open={open}>
        <XhCollapsibleTrigger>详情</XhCollapsibleTrigger>
        <XhCollapsibleContent>{BODY}</XhCollapsibleContent>
      </XhCollapsibleRoot>
    ),
  },
  {
    scope: 'accordion',
    tree: open => (
      <XhAccordionRoot value={open ? ['a'] : []} collapsible>
        <XhAccordionItem value="a">
          <XhAccordionTrigger>第一项</XhAccordionTrigger>
          <XhAccordionContent>{BODY}</XhAccordionContent>
        </XhAccordionItem>
      </XhAccordionRoot>
    ),
  },
  {
    scope: 'reasoning',
    tree: open => (
      <XhReasoningRoot open={open}>
        <XhReasoningTrigger>想了想</XhReasoningTrigger>
        <XhReasoningContent>{BODY}</XhReasoningContent>
      </XhReasoningRoot>
    ),
  },
  {
    scope: 'tool-call',
    tree: open => (
      <XhToolCallRoot open={open} phase="output-available">
        <XhToolCallTrigger>搜索</XhToolCallTrigger>
        <XhToolCallContent>{BODY}</XhToolCallContent>
      </XhToolCallRoot>
    ),
  },
]

describe('accordion 第一次开合', () => {
  it('非受控：首帧展开的条目第一次收起也播收起，不带 data-instant', async () => {
    host = document.createElement('div')
    host.style.inlineSize = '320px'
    document.body.append(host)
    root = createRoot(host)
    await act(async () => root!.render(
      <XhAccordionRoot defaultValue={['a']} collapsible>
        <XhAccordionItem value="a">
          <XhAccordionTrigger>第一项</XhAccordionTrigger>
          <XhAccordionContent>{BODY}</XhAccordionContent>
        </XhAccordionItem>
      </XhAccordionRoot>,
    ))
    const content = host.querySelector<HTMLElement>('[data-scope="accordion"][data-part="content"]')!
    expect(content.hasAttribute('data-instant')).toBe(true)

    await act(async () => host!.querySelector<HTMLElement>('[data-scope="accordion"][data-part="trigger"]')!.click())
    await frame()
    expect(content.hasAttribute('data-instant')).toBe(false)
    expect(getComputedStyle(content).display).not.toBe('none')
    expect(content.getAnimations().some(a => a instanceof CSSAnimation && a.animationName === 'xh-disclosure-collapse')).toBe(true)
  })
})

describe.each(CASES)('$scope 在带 [hidden] 强制规则的宿主里', (item) => {
  async function mount(open: boolean): Promise<HTMLElement> {
    host = document.createElement('div')
    host.style.inlineSize = '320px'
    document.body.append(host)
    root = createRoot(host)
    await act(async () => root!.render(item.tree(open)))
    return host.querySelector<HTMLElement>(`[data-scope="${item.scope}"][data-part="content"]`)!
  }

  async function render(open: boolean): Promise<void> {
    await act(async () => root!.render(item.tree(open)))
  }

  it('收起播完才打 hidden，途中高度在两端之间', async () => {
    const content = await mount(true)
    await frame()
    const full = content.getBoundingClientRect().height

    await render(false)
    await wait(300)
    await frame()
    expect(getComputedStyle(content).display, '退场窗口内节点还在布局里').not.toBe('none')
    expect(content.hidden, '退场窗口内不打 hidden').toBe(false)
    const height = content.getBoundingClientRect().height
    expect(height).toBeGreaterThan(full * 0.15)
    expect(height).toBeLessThan(full * 0.85)

    await act(async () => {
      await wait(400)
      await frame()
    })
    expect(content.hidden, '退场播完打上 hidden').toBe(true)
    expect(getComputedStyle(content).display).toBe('none')
  })

  it('展开时撤掉 hidden、播展开动画', async () => {
    const content = await mount(false)
    await frame()
    expect(content.hidden).toBe(true)

    await render(true)
    expect(content.hidden).toBe(false)
    expect(content.getAnimations().some(a => a instanceof CSSAnimation && a.animationName === 'xh-disclosure-expand')).toBe(true)
  })
})
