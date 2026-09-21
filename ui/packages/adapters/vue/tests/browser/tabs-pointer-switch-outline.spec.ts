// 真实指针在 line 档标签页之间切换时，两枚标签在切换后的那几帧都不得闪出描边。
//
// line 档标签归 Collection Item 的 nav 语境：家族在条目根上常驻 solid 描边、静息透明，只有
// :focus-visible / [data-highlighted] 才把描边色灌成 --xh-ring-focus。指针路径的焦点本不带 :focus-visible，
// 任一帧出现非透明描边即是缺陷。修前配方把 outline-color 放在 micro 过渡里，宿主页面的
// `button:focus:not(:focus-visible) { outline: none !important }`（VitePress base.css）把简写复位成 none
// 时颜色落到 currentColor，焦点离开、solid 回来的那几帧颜色还在淡出——上一枚标签闪一圈品牌色描边。
// 过渡的中间帧只有真实 Chromium 能看见。
//
// 按下与松开走 CDP 的真实鼠标事件（不是 .click()）：按下那一刻焦点搬到新标签、松开派 click 翻选中值，
// 两个时刻各自采样。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTabsContent, XhTabsIndicator, XhTabsList, XhTabsRoot, XhTabsTrigger } from '../../src'
import { pressPointer, releasePointer, releasePointerAway } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 松开后连续观察的帧数：micro 与 release 时长跨越的帧都在这个窗口里。 */
const FRAMES_AFTER = 5

let app: App | null = null
let host: HTMLElement | null = null
let hostReset: HTMLStyleElement | null = null

/**
 * 宿主页面常见的焦点复位（VitePress 默认主题 base.css 原文）：无层、带 !important，压过库里
 * 分层的家族描边。指针落焦时它把 outline 简写复位成 none，outline-color 随之落到 currentColor；
 * 焦点离开、规则失效的那一刻家族的 solid 描边立即回来，颜色若还在过渡就画成一圈实心边。
 */
function installHostFocusReset(): void {
  hostReset = document.createElement('style')
  hostReset.textContent = [
    'button:focus, button:focus-visible { outline: 1px dotted; outline: 4px auto -webkit-focus-ring-color; }',
    'button:focus:not(:focus-visible) { outline: none !important; }',
  ].join('\n')
  document.head.append(hostReset)
}

interface Sample {
  frame: number
  outlineColor: string
  outlineStyle: string
  outlineWidth: string
  boxShadow: string
  borderColor: string
  focusVisible: boolean
  highlighted: boolean
  current: boolean
}

function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

/** 过渡中的颜色以 oklab / color-mix 串回报，alpha 为 0 的一律视为透明。 */
function transparent(color: string): boolean {
  return color === 'rgba(0, 0, 0, 0)' || color === 'transparent' || /\/\s*0\)$/.test(color)
}

function sample(frame: number, element: HTMLElement): Sample {
  const style = getComputedStyle(element)
  return {
    frame,
    outlineColor: style.outlineColor,
    outlineStyle: style.outlineStyle,
    outlineWidth: style.outlineWidth,
    boxShadow: style.boxShadow,
    borderColor: style.borderTopColor,
    focusVisible: element.matches(':focus-visible'),
    highlighted: element.hasAttribute('data-highlighted'),
    current: element.hasAttribute('data-current'),
  }
}

/** 这一帧是否画着看得见的描边：style 为 none、宽为 0 或颜色透明都算没画。 */
function outlined(s: Sample): boolean {
  return s.outlineStyle !== 'none' && Number.parseFloat(s.outlineWidth) > 0 && !transparent(s.outlineColor)
}

async function mount(withIndicator: boolean): Promise<{ a: HTMLElement, b: HTMLElement }> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhTabsRoot, { defaultValue: 'a', style: { inlineSize: '360px' } }, () => [
      h(XhTabsList, { 'aria-label': '视图' }, () => [
        h(XhTabsTrigger, { value: 'a' }, () => '概览'),
        h(XhTabsTrigger, { value: 'b' }, () => '分析'),
        h(XhTabsTrigger, { value: 'c' }, () => '报告'),
        withIndicator ? h(XhTabsIndicator) : null,
      ]),
      h(XhTabsContent, { value: 'a' }, () => '概览内容'),
      h(XhTabsContent, { value: 'b' }, () => '分析内容'),
      h(XhTabsContent, { value: 'c' }, () => '报告内容'),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextFrame()
  const a = host.querySelector<HTMLElement>('[data-part="trigger"][data-value="a"]')!
  const b = host.querySelector<HTMLElement>('[data-part="trigger"][data-value="b"]')!
  return { a, b }
}

afterEach(async () => {
  await releasePointerAway()
  app?.unmount()
  host?.remove()
  hostReset?.remove()
  app = null
  host = null
  hostReset = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe.each([
  { label: '无 indicator 部件', withIndicator: false, reset: false },
  { label: '有 indicator 部件', withIndicator: true, reset: false },
  { label: '无 indicator 部件 + 宿主焦点复位', withIndicator: false, reset: true },
  { label: '有 indicator 部件 + 宿主焦点复位', withIndicator: true, reset: true },
])('line 档标签页真实指针切换（$label）', ({ withIndicator, reset }) => {
  it('从 A 点到 B：按下、松开与随后各帧，A 与 B 都不出现非透明描边，也不命中 :focus-visible', async () => {
    if (reset)
      installHostFocusReset()
    const { a, b } = await mount(withIndicator)
    expect(a.getAttribute('data-current')).toBe('')
    expect(b.hasAttribute('data-current')).toBe(false)

    // 先真实点一次 A：让焦点已经在集合里，再切换才是用户看到的那条路
    await pressPointer(a)
    await releasePointer(a)
    await nextTick()
    await nextFrame()
    expect(document.activeElement).toBe(a)

    const frames: Array<{ a: Sample, b: Sample, phase: string }> = []
    await pressPointer(b)
    frames.push({ phase: 'down', a: sample(0, a), b: sample(0, b) })
    expect(document.activeElement, '按下即把焦点搬到 B').toBe(b)
    await releasePointer(b)
    await nextTick()
    frames.push({ phase: 'up', a: sample(0, a), b: sample(0, b) })
    for (let frame = 1; frame <= FRAMES_AFTER; frame += 1) {
      await nextFrame()
      frames.push({ phase: 'up', a: sample(frame, a), b: sample(frame, b) })
    }

    expect(b.getAttribute('data-current'), '松开后 B 成为当前页').toBe('')
    expect(a.hasAttribute('data-current')).toBe(false)

    const leaked = frames.filter(f => outlined(f.a) || outlined(f.b) || f.a.focusVisible || f.b.focusVisible)
    expect(leaked, `逐帧采样：${JSON.stringify(frames, null, 1)}`).toEqual([])
    // 松开后 5 帧内两枚标签都没有描边、边框色与投影都保持透明 / none
    for (const f of frames) {
      expect(f.a.boxShadow, `A ${f.phase}+${f.a.frame} box-shadow`).toBe('none')
      expect(f.b.boxShadow, `B ${f.phase}+${f.b.frame} box-shadow`).toBe('none')
      expect(transparent(f.a.borderColor) || Number.parseFloat(getComputedStyle(a).borderTopWidth) === 0).toBe(true)
    }
  })
})

// 键盘落焦的标签合法地带环：这是对照，确认上面的红断言不是把焦点环整个打没了
describe('line 档标签页键盘落焦', () => {
  it('按 Tab 进入集合后，锚点标签命中 :focus-visible 并画 ring-focus 描边', async () => {
    const { a } = await mount(false)
    const before = document.createElement('button')
    before.textContent = '前一个'
    host!.prepend(before)
    before.focus()
    await userEvent.keyboard('{Tab}')
    await nextTick()
    await nextFrame()
    expect(document.activeElement).toBe(a)
    expect(a.matches(':focus-visible')).toBe(true)
    // 描边色不进过渡：落焦当帧即画出环
    expect(outlined(sample(0, a))).toBe(true)
  })
})
