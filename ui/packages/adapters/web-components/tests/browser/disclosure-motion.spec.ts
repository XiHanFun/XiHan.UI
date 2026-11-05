// 宿主带 [hidden]{display:none!important}（Tailwind 4 的 preflight 就是这条）时面级披露的退场照样播完。
// 真实布局与 CSS 动画只有浏览器量得出来。
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const BODY = Array.from({ length: 12 }, (_, i) => `第 ${i + 1} 行说明文字`).join('。')
const MOTION_SLOTS = ['--xh-motion-duration-expand', '--xh-motion-duration-collapse', '--xh-motion-ease-disclosure']

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

async function settle(): Promise<void> {
  await Promise.resolve()
  await frame()
  await Promise.resolve()
}

interface OpenHost extends HTMLElement {
  open?: boolean
  value?: string[]
}

interface Case {
  readonly scope: string
  readonly html: (open: boolean) => string
  readonly set: (el: OpenHost, open: boolean) => void
}

function setOpen(el: OpenHost, open: boolean): void {
  el.open = open
}

const CASES: Case[] = [
  {
    scope: 'collapsible',
    html: open => `<xh-collapsible style="display:block;inline-size:320px"${open ? ' open' : ''}>
      <div data-xh-part="root"><button data-xh-part="trigger">详情</button><div data-xh-part="content">${BODY}</div></div>
    </xh-collapsible>`,
    set: setOpen,
  },
  {
    scope: 'accordion',
    html: () => `<xh-accordion style="display:block;inline-size:320px" collapsible>
      <div data-xh-part="root"><div data-xh-part="item" value="a">
        <h3 data-xh-part="header"><button data-xh-part="trigger">第一项</button></h3>
        <div data-xh-part="content">${BODY}</div>
      </div></div>
    </xh-accordion>`,
    set: (el, open) => { el.value = open ? ['a'] : [] },
  },
  {
    scope: 'reasoning',
    html: open => `<xh-reasoning style="display:block;inline-size:320px"${open ? ' open' : ''}>
      <div data-xh-part="root"><button data-xh-part="trigger">想了想</button><div data-xh-part="content">${BODY}</div></div>
    </xh-reasoning>`,
    set: setOpen,
  },
  {
    scope: 'tool-call',
    html: open => `<xh-tool-call style="display:block;inline-size:320px" phase="output-available"${open ? ' open' : ''}>
      <div data-xh-part="root"><button data-xh-part="trigger">搜索</button><div data-xh-part="content">${BODY}</div></div>
    </xh-tool-call>`,
    set: setOpen,
  },
]

describe.each(CASES)('$scope 在带 [hidden] 强制规则的宿主里', (item) => {
  async function mount(open: boolean): Promise<{ el: OpenHost, content: HTMLElement }> {
    host = document.createElement('div')
    host.innerHTML = item.html(open)
    document.body.append(host)
    const el = host.firstElementChild as OpenHost
    item.set(el, open)
    await settle()
    // 手风琴的展开集合是连上之后才给的，算一次开合：等它播完再量
    await Promise.all((el.querySelector<HTMLElement>('[data-part="content"]')?.getAnimations() ?? []).map(a => a.finished))
    await settle()
    return { el, content: el.querySelector<HTMLElement>(`[data-scope="${item.scope}"][data-part="content"]`)! }
  }

  it('收起播完才打 hidden，途中高度在两端之间', async () => {
    const { el, content } = await mount(true)
    const full = content.getBoundingClientRect().height
    expect(full).toBeGreaterThan(40)

    item.set(el, false)
    await settle()
    await wait(300)
    await frame()
    expect(getComputedStyle(content).display, '退场窗口内节点还在布局里').not.toBe('none')
    expect(content.hidden, '退场窗口内不打 hidden').toBe(false)
    const height = content.getBoundingClientRect().height
    expect(height).toBeGreaterThan(full * 0.15)
    expect(height).toBeLessThan(full * 0.85)

    await wait(400)
    await settle()
    expect(content.hidden, '退场播完打上 hidden').toBe(true)
    expect(getComputedStyle(content).display).toBe('none')
  })

  it('展开时撤掉 hidden、播展开动画', async () => {
    const { el, content } = await mount(false)
    expect(content.hidden).toBe(true)

    item.set(el, true)
    await settle()
    expect(content.hidden).toBe(false)
    expect(content.getAnimations().some(a => a instanceof CSSAnimation && a.animationName === 'xh-disclosure-expand')).toBe(true)
  })
})
