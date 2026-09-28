// 代码块按块折叠：折叠钮落在正文让出的那一列里、不压字，没有钮的行照样让出这一列；
// 收起的行不占高度、pre 跟着变矮，块头正文后面画出省略号，钮的字形转向行尾。
// 位置、高度与伪元素只有真实布局量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhCodeViewCode, XhCodeViewPre, XhCodeViewRoot } from '../../src'
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
/** 等字形转完：过渡挂在伪元素上，文档级的动画表里才看得见。 */
const settled = (): Promise<unknown> => Promise.all(document.getAnimations().map(animation => animation.finished))
const CODE = 'function outer() {\n  if (ok) {\n    run()\n    done()\n  }\n}\nconst tail = 1'

async function mount(lineNumbers: boolean, dir: 'ltr' | 'rtl' = 'ltr'): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  host.dir = dir
  document.body.append(host)
  app = createApp({
    render: () => h(XhCodeViewRoot, { code: CODE, complete: true, blockFolding: true, lineNumbers, highlighter: null }, () => h(XhCodeViewPre, null, () => h(XhCodeViewCode))),
  })
  app.mount(host)
  for (let i = 0; i < 3; i++) await frame()
  return host
}

const lines = (root: HTMLElement): HTMLElement[] => [...root.querySelectorAll<HTMLElement>('[data-part="line"]')]
const contentOf = (line: HTMLElement): HTMLElement => line.querySelector<HTMLElement>('[data-part="line-content"]')!
const triggers = (root: HTMLElement): HTMLElement[] => [...root.querySelectorAll<HTMLElement>('[data-part="line-fold-trigger"]')]

/** 一行正文里第一个字的左缘（不含折叠钮）。 */
function textStart(content: HTMLElement): number {
  const range = document.createRange()
  const text = [...content.childNodes].find(node => node.nodeType === Node.TEXT_NODE)!
  range.setStart(text, 0)
  range.setEnd(text, 1)
  return range.getBoundingClientRect().left
}

describe('code-view 按块折叠', () => {
  for (const lineNumbers of [true, false]) {
    it(`折叠钮落在正文让出的一列里，不压字；每行都让出同一列（行号${lineNumbers ? '开' : '关'}）`, async () => {
      const root = await mount(lineNumbers)
      const all = lines(root)
      const [outer, inner] = triggers(root)
      const trigger = outer!.getBoundingClientRect()
      const headContent = contentOf(all[0]!)
      // 钮与一行等高、是正方格
      expect(Math.round(trigger.height)).toBe(Math.round(all[0]!.getBoundingClientRect().height))
      expect(Math.round(trigger.width)).toBe(Math.round(trigger.height))
      // 钮整颗在第一个字的左边
      expect(trigger.right).toBeLessThanOrEqual(textStart(headContent) + 0.5)
      // 没有钮的那行（const tail）与块头行的正文起点对齐
      expect(Math.abs(textStart(contentOf(all[6]!)) - textStart(headContent))).toBeLessThan(0.5)
      // 里层块头的钮与外层的钮在同一列
      expect(Math.abs(inner!.getBoundingClientRect().left - trigger.left)).toBeLessThan(0.5)
      // 展开时字形朝下，没有转
      expect(getComputedStyle(outer!, '::before').rotate).toBe('none')
    })
  }

  it('收起：块里的行不占高度、pre 变矮，块头正文后面画出省略号，字形转向行尾', async () => {
    const root = await mount(true)
    const pre = root.querySelector<HTMLElement>('[data-part="pre"]')!
    const before = pre.getBoundingClientRect().height
    const lineHeight = lines(root)[0]!.getBoundingClientRect().height
    triggers(root)[1]!.click()
    await nextTick()
    for (let i = 0; i < 3; i++) await frame()
    await settled()
    const all = lines(root)
    expect(all.slice(2, 4).every(line => line.getBoundingClientRect().height === 0)).toBe(true)
    // 两行收起，pre 矮两行
    expect(Math.round(before - pre.getBoundingClientRect().height)).toBe(Math.round(lineHeight * 2))
    const ellipsis = getComputedStyle(contentOf(all[1]!), '::after')
    expect(ellipsis.content).not.toBe('none')
    expect(Number.parseFloat(ellipsis.width)).toBeGreaterThan(0)
    expect(getComputedStyle(triggers(root)[1]!, '::before').rotate).toBe('-90deg')
  })

  it('从右往左排：钮在正文的右边，收起时字形转向另一侧', async () => {
    const root = await mount(true, 'rtl')
    const outer = triggers(root)[0]!
    const content = contentOf(lines(root)[0]!)
    const range = document.createRange()
    const text = [...content.childNodes].find(node => node.nodeType === Node.TEXT_NODE)!
    range.setStart(text, 0)
    range.setEnd(text, 1)
    expect(outer.getBoundingClientRect().left).toBeGreaterThanOrEqual(range.getBoundingClientRect().right - 0.5)
    outer.click()
    await nextTick()
    await frame()
    await settled()
    expect(getComputedStyle(outer, '::before').rotate).toBe('90deg')
  })
})
