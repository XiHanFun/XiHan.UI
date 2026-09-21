// 指针划过集合条目时，焦点跟着指针搬家；上一条目失焦的那几帧不得闪出描边。
//
// Collection Item 配方在根上常驻 solid 描边、静息透明，指针路径下描边色恒为 transparent。
// 皮肤若在 `:focus:not(:focus-visible)` 下写 `outline: none`，简写会把 outline-color 复位成 currentColor；
// 焦点离开时规则失效，outline-style 立即回到 solid，outline-color 若还在从近黑过渡回透明——
// 这段时间上一条目画出一圈实心描边（修前配方把描边色放在 micro 过渡里，正是这样闪的）。
// UA 只在 :focus-visible 画环，这条复位本就是死代码。宿主页面同款复位那条路见 collection-item-host-focus-reset。
// 过渡的中间帧只有真实 Chromium 能看见，jsdom 不算数。
//
// 菜单用真实指针点开（右键菜单用右键）：之后由脚本搬到条目上的焦点不带 :focus-visible，
// 与真实使用一致；键盘打开后再悬停会带环，那是另一条路。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Family = 'menu' | 'context-menu'

/** 划入下一条后连续观察的帧数：micro 时长跨越的帧都在这个窗口里。 */
const FRAMES_AFTER_ENTER = 3

let app: App | null = null
let host: HTMLElement | null = null

function menuTree(): VNode {
  return h(XhMenuRoot, null, () => [
    h(XhMenuTrigger, null, () => '打开'),
    h(XhMenuPositioner, null, () => [
      h(XhMenuContent, null, () => [
        h(XhMenuItem, { value: 'a' }, () => '条目 A'),
        h(XhMenuItem, { value: 'b' }, () => '条目 B'),
        h(XhMenuItem, { value: 'c' }, () => '条目 C'),
      ]),
    ]),
  ])
}

function contextMenuTree(): VNode {
  return h(XhContextMenuRoot, null, () => [
    h(XhContextMenuTrigger, { style: { display: 'block', inlineSize: '200px', blockSize: '80px' } }, () => '右键目标'),
    h(XhContextMenuPositioner, null, () => [
      h(XhContextMenuContent, null, () => [
        h(XhContextMenuItem, { value: 'a' }, () => '条目 A'),
        h(XhContextMenuItem, { value: 'b' }, () => '条目 B'),
        h(XhContextMenuItem, { value: 'c' }, () => '条目 C'),
      ]),
    ]),
  ])
}

async function mountOpen(family: Family): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => family === 'menu' ? menuTree() : contextMenuTree() })
  app.mount(host)
  await nextTick()
  const trigger = document.querySelector<HTMLElement>(`[data-scope='${family}'][data-part='trigger']`)!
  await userEvent.click(trigger, family === 'context-menu' ? { button: 'right' } : undefined)
  await nextTick()
  await nextTick()
  await nextFrame()
}

function item(family: Family, value: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    `[data-scope='${family}'][data-part='item'][data-value='${value}']`,
  )
  if (!element)
    throw new Error(`找不到 ${family}/${value}`)
  return element
}

function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

/** 过渡中的颜色以 oklab 串回报，alpha 为 0 的一律视为透明。 */
function transparent(color: string): boolean {
  return color === 'rgba(0, 0, 0, 0)' || color === 'transparent' || /\/\s*0\)$/.test(color)
}

/** 条目此刻画着的描边色；style 为 none、宽为 0 或颜色透明时为 null。 */
function visibleOutline(element: HTMLElement): string | null {
  const style = getComputedStyle(element)
  if (style.outlineStyle === 'none' || Number.parseFloat(style.outlineWidth) === 0)
    return null
  return transparent(style.outlineColor) ? null : style.outlineColor
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe.each<Family>(['menu', 'context-menu'])('%s 条目的指针落焦描边', (family) => {
  it('指针从 A 划到 B：A 失焦后的首帧与随后几帧都不闪出描边，B 也不画环', async () => {
    await mountOpen(family)
    const a = item(family, 'a')
    const b = item(family, 'b')

    await userEvent.hover(a)
    expect(document.activeElement, '指针划入即把焦点搬到条目上').toBe(a)
    expect(a.matches(':focus-visible'), '指针路径的焦点不带 :focus-visible').toBe(false)
    expect(visibleOutline(a), '划过 A 时 A 自己不画描边').toBeNull()

    await userEvent.hover(b)
    expect(document.activeElement).toBe(b)
    const frames: Array<{ frame: number, a: string | null, b: string | null }> = []
    frames.push({ frame: 0, a: visibleOutline(a), b: visibleOutline(b) })
    for (let frame = 1; frame <= FRAMES_AFTER_ENTER; frame += 1) {
      await nextFrame()
      frames.push({ frame, a: visibleOutline(a), b: visibleOutline(b) })
    }

    const leaked = frames.filter(sample => sample.a !== null || sample.b !== null)
    expect(leaked, `B 划入后各帧：${JSON.stringify(frames)}`).toEqual([])
  })
})
