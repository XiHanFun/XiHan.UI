// 提及的多行形态：输入框自己就是字段外壳，写成 textarea 之后随 rows 定起始高度、不钉单行控件高；
// 上下内衬与文本字段的多行档同一支令牌，正文不贴着描边。候选浮层锚在提及前缀所在的那个字符处。
//
// 只有真实浏览器量得出来：高度、内衬与浮层的位置都是布局结果。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhMentionContent, XhMentionInput, XhMentionItem, XhMentionItemText, XhMentionPositioner, XhMentionRoot } from '../../src'
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

const PEOPLE = [{ value: 'lilei', label: '李雷' }, { value: 'poly', label: 'Poly' }]

async function mountMention(as: 'input' | 'textarea'): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhMentionRoot, { collection: PEOPLE }, () => [
      h(XhMentionInput, { 'as': as, 'aria-label': '评论', 'rows': 3 }),
      h(XhMentionPositioner, null, () => [
        h(XhMentionContent, null, () => PEOPLE.map(p => h(XhMentionItem, { key: p.value, value: p.value }, () => h(XhMentionItemText, null, () => p.label)))),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  return host.querySelector<HTMLElement>(`[data-scope='mention'][data-part='input']`)!
}

function tokenPx(name: string): number {
  const probe = document.createElement('div')
  probe.style.cssText = `position:absolute;visibility:hidden;block-size:var(${name})`
  document.body.append(probe)
  const px = probe.getBoundingClientRect().height
  probe.remove()
  return Math.round(px)
}

describe('提及的多行形态', () => {
  it('单行形态钉在控件高；多行形态随 rows 长高，上下内衬取多行档', async () => {
    const single = await mountMention('input')
    const controlH = tokenPx('--xh-control-h-md')
    expect(Math.round(single.getBoundingClientRect().height)).toBe(controlH)
    app?.unmount()
    host?.remove()

    const multi = await mountMention('textarea')
    const style = getComputedStyle(multi)
    expect(Math.round(multi.getBoundingClientRect().height)).toBeGreaterThan(controlH)
    // 多行档上下内衬与字段外壳的多行档同为 --xh-space-1
    expect(Math.round(Number.parseFloat(style.paddingBlockStart))).toBe(tokenPx('--xh-space-1'))
    expect(Math.round(Number.parseFloat(style.paddingBlockEnd))).toBe(tokenPx('--xh-space-1'))
    expect(style.resize).toBe('vertical')
  })

  it('多行形态里候选浮层锚在提及前缀处：换行后敲前缀落在那一行之下，前缀往右挪浮层跟着往右', async () => {
    const el = await mountMention('textarea') as HTMLTextAreaElement
    el.focus()
    const type = async (text: string): Promise<DOMRect> => {
      el.value = text
      el.setSelectionRange(text.length, text.length)
      el.dispatchEvent(new Event('input', { bubbles: true }))
      await nextTick()
      for (let i = 0; i < 3; i++)
        await new Promise(resolve => requestAnimationFrame(resolve))
      return document.querySelector<HTMLElement>(`[data-scope='mention'][data-part='content']`)!.getBoundingClientRect()
    }
    const box = el.getBoundingClientRect()
    const atLineStart = await type('第一行\n@')
    expect(document.querySelector<HTMLElement>(`[data-scope='mention'][data-part='content']`)!.hidden).toBe(false)
    // 前缀在第二行：浮层贴着那一行落下，顶边还在三行高的输入框里，不落到整个输入框之下
    expect(atLineStart.top).toBeGreaterThan(box.top)
    expect(atLineStart.top).toBeLessThan(box.bottom)
    const afterText = await type('第一行\n一段文字 @')
    expect(afterText.left).toBeGreaterThan(atLineStart.left + 20)
    // 同一行：前面是中文时那一行的字形度量略有出入，上下差不到一行高
    expect(Math.abs(afterText.top - atLineStart.top)).toBeLessThan(8)
  })
})
