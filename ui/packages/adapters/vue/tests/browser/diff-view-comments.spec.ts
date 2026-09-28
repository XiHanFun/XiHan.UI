// 差异视图的行评论：评论钮落在正文让出的那一列里、不压字；指针设备上平时透明，
// 悬停到这一行或焦点进了视口才显出来；评论容器在代码下方、同一格里，文字按正文折行。
// 透明度、位置与折行只有真实布局量得出来。
import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { computeTextDiff } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhDiffViewBody, XhDiffViewRoot, XhDiffViewViewport } from '../../src'
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

const frame = (): Promise<unknown> => new Promise(resolve => requestAnimationFrame(resolve))
const settled = (): Promise<unknown> => Promise.all(document.getAnimations().map(animation => animation.finished))
const MODEL = computeTextDiff('const a = 1\nconst b = 2\nconst c = 3', 'const a = 1\nconst b = 20\nconst c = 3')
const LONG_COMMENT = '这一行把默认值从 2 改成 20，会影响所有没有显式传值的调用方，建议在发布说明里写明，并补一条覆盖旧默认值的测试。'

async function mount(): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '520px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhDiffViewRoot, { model: MODEL, commentable: true, commentLines: [{ side: 'new', line: 2 }] }, () => h(
      XhDiffViewViewport,
      null,
      () => h(XhDiffViewBody, null, { comment: () => LONG_COMMENT }),
    )),
  })
  app.mount(host)
  for (let i = 0; i < 3; i++) await frame()
  return host
}

const rows = (root: HTMLElement): HTMLElement[] => [...root.querySelectorAll<HTMLElement>('[data-part="row"]')]
const triggerOf = (row: HTMLElement): HTMLElement => row.querySelector<HTMLElement>('[data-part="comment-trigger"]')!

/** 一格正文里代码的第一个字的左缘（不含评论钮与读屏文字）。 */
function codeStart(row: HTMLElement): number {
  const content = row.querySelector<HTMLElement>('[data-part="line-content"]')!
  const code = [...content.children].find(el => !['change-label', 'comment-trigger', 'comment-thread'].includes(el.getAttribute('data-part') ?? ''))!
  return code.getBoundingClientRect().left
}

describe('diff-view 行评论', () => {
  it('评论钮落在正文让出的一列里、不压字，每行代码起点对齐', async () => {
    const root = await mount()
    const all = rows(root)
    const trigger = triggerOf(all[0]!).getBoundingClientRect()
    expect(Math.round(trigger.width)).toBe(Math.round(trigger.height))
    expect(trigger.right).toBeLessThanOrEqual(codeStart(all[0]!) + 0.5)
    expect(Math.abs(codeStart(all[1]!) - codeStart(all[0]!))).toBeLessThan(0.5)
  })

  it('平时透明，悬停到这一行才显出来；焦点进了视口时整组都显出来', async () => {
    const root = await mount()
    const [first, second] = rows(root)
    expect(getComputedStyle(triggerOf(first!)).opacity).toBe('0')
    await userEvent.hover(first!)
    await settled()
    expect(getComputedStyle(triggerOf(first!)).opacity).toBe('1')
    expect(getComputedStyle(triggerOf(second!)).opacity).toBe('0')
    await userEvent.unhover(first!)
    root.querySelector<HTMLElement>('[data-part="viewport"]')!.focus()
    await settled()
    expect(getComputedStyle(triggerOf(second!)).opacity).toBe('1')
  })

  it('评论容器在代码下方、同一格里，文字按正文折行，行号留在行首', async () => {
    const root = await mount()
    const added = rows(root).find(row => row.getAttribute('data-change') === 'added')!
    const content = added.querySelector<HTMLElement>('[data-part="line-content"]')!
    const comment = content.querySelector<HTMLElement>('[data-part="comment-thread"]')!
    expect(comment.textContent).toBe(LONG_COMMENT)
    const commentBox = comment.getBoundingClientRect()
    const code = content.querySelector<HTMLElement>('[data-part="inline-change"], span:not([data-part])')!
    expect(commentBox.top).toBeGreaterThanOrEqual(code.getBoundingClientRect().bottom - 0.5)
    // 长评论折成几行，而不是把视口撑出横向滚动
    expect(commentBox.height).toBeGreaterThan(2 * Number.parseFloat(getComputedStyle(comment).lineHeight))
    expect(getComputedStyle(comment).whiteSpace).toBe('normal')
    const number = added.querySelector<HTMLElement>('[data-part="line-number"]')!
    expect(Math.abs(number.getBoundingClientRect().top - added.getBoundingClientRect().top)).toBeLessThan(0.5)
  })
})
