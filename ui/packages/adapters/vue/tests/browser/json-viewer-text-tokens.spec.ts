// JSON 查看器原文档按类别着色：键名、字符串、数字、布尔、null 与标点取树档同一组槽、同一套语法令牌，
// 两档切过去同一个值是同一种颜色。亮暗两档一起量：语法令牌随主题换值，两档都得对得上。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhJsonViewerRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const value = { name: 'xihan', count: 2, ok: true, none: null }

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  delete document.documentElement.dataset.theme
  app = null
  host = null
})

async function mount(theme: 'light' | 'dark'): Promise<void> {
  document.documentElement.dataset.theme = theme
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => [
      h('div', { 'data-tree': '' }, [h(XhJsonViewerRoot, { value })]),
      h('div', { 'data-text': '' }, [h(XhJsonViewerRoot, { value, view: 'text' })]),
    ],
  })
  app.mount(host)
  await nextTick()
}

function treePart(selector: string): HTMLElement {
  const el = host!.querySelector<HTMLElement>(`[data-tree] [data-scope='json-viewer']${selector}`)
  if (!el)
    throw new Error(`树档缺少 ${selector}`)
  return el
}

function token(kind: string): HTMLElement {
  const el = host!.querySelector<HTMLElement>(`[data-text] [data-scope='json-viewer'][data-part='token'][data-kind='${kind}']`)
  if (!el)
    throw new Error(`原文档缺少 ${kind} 段`)
  return el
}

describe.each(['light', 'dark'] as const)('json 查看器原文档着色（%s）', (theme) => {
  it('原文拼回去与 JSON 原文一致，键名、字符串、数字、布尔、null 与标点各成段', async () => {
    await mount(theme)
    const pre = host!.querySelector<HTMLElement>(`[data-text] [data-scope='json-viewer'][data-part='text']`)!
    expect(pre.textContent).toBe(JSON.stringify(value, null, 2))
    for (const kind of ['key', 'string', 'number', 'boolean', 'null', 'punctuation'])
      expect(token(kind).textContent!.length, kind).toBeGreaterThan(0)
  })

  it('每一类与树档同一种颜色；键名同字重；标点与树档键名后的冒号同色', async () => {
    await mount(theme)
    const pairs: Array<[string, HTMLElement]> = [
      ['string', treePart(`[data-part='item-value'][data-value-type='string']`)],
      ['number', treePart(`[data-part='item-value'][data-value-type='number']`)],
      ['boolean', treePart(`[data-part='item-value'][data-value-type='boolean']`)],
      ['null', treePart(`[data-part='item-value'][data-value-type='null']`)],
    ]
    for (const [kind, tree] of pairs)
      expect(getComputedStyle(token(kind)).color, kind).toBe(getComputedStyle(tree).color)

    const key = treePart(`[data-part='item-key']`)
    expect(getComputedStyle(token('key')).color).toBe(getComputedStyle(key).color)
    expect(getComputedStyle(token('key')).fontWeight).toBe(getComputedStyle(key).fontWeight)
    expect(getComputedStyle(token('punctuation')).color).toBe(getComputedStyle(key, '::after').color)

    // 着色真的换了颜色：字符串与数字分得开，标点比正文弱
    expect(getComputedStyle(token('string')).color).not.toBe(getComputedStyle(token('number')).color)
  })
})
