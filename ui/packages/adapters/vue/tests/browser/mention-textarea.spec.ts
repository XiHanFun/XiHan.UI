// 提及的多行形态：输入框自己就是字段外壳，写成 textarea 之后随 rows 定起始高度、不钉单行控件高；
// 上下内衬与文本字段的多行档同一支令牌，正文不贴着描边。候选浮层仍贴着整个输入框落位。
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
    expect(Math.round(Number.parseFloat(style.paddingBlockStart))).toBe(tokenPx('--xh-space-2'))
    expect(Math.round(Number.parseFloat(style.paddingBlockEnd))).toBe(tokenPx('--xh-space-2'))
    expect(style.resize).toBe('vertical')
  })

  it('多行形态里换行之后敲前缀照样弹候选，浮层落在整个输入框之下', async () => {
    const el = await mountMention('textarea') as HTMLTextAreaElement
    el.focus()
    el.value = '第一行\n@'
    el.setSelectionRange(el.value.length, el.value.length)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    await new Promise(resolve => requestAnimationFrame(resolve))
    const content = document.querySelector<HTMLElement>(`[data-scope='mention'][data-part='content']`)!
    expect(content.hidden).toBe(false)
    expect(content.getBoundingClientRect().top).toBeGreaterThanOrEqual(el.getBoundingClientRect().bottom)
  })
})
