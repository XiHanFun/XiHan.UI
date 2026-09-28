// 文本框的字数上限按字素计：真实浏览器里的插入文本、光标与输入法组合。
// jsdom 没有输入法，也不会在改写 value 之后移动光标；这几件事只能在 Chromium 里看。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTextFieldControl, XhTextFieldInput, XhTextFieldLabel, XhTextFieldRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const FAMILY = '👨‍👩‍👧'
const FLAG = '🇨🇳'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(props: Record<string, unknown>): Promise<{ root: HTMLElement, input: HTMLInputElement }> {
  host = document.createElement('div')
  document.body.prepend(host)
  app = createApp({
    render: () => h(XhTextFieldRoot, props, () => [
      h(XhTextFieldLabel, null, () => '昵称'),
      h(XhTextFieldControl, null, () => [h(XhTextFieldInput)]),
    ]),
  })
  app.mount(host)
  await nextTick()
  return {
    root: host.querySelector<HTMLElement>(`[data-scope='text-field'][data-part='root']`)!,
    input: host.querySelector<HTMLInputElement>(`[data-scope='text-field'][data-part='input']`)!,
  }
}

async function insertText(text: string): Promise<void> {
  await cdp().send('Input.insertText', { text })
  await nextTick()
}

describe('text-field 字数上限按字素计（Chromium）', () => {
  it('组合 emoji 与国旗各占一个字：两个正好顶到上限，再打的被截掉', async () => {
    const { root, input } = await mount({ maxLength: 2 })
    input.focus()
    await insertText(FAMILY)
    await insertText(FLAG)
    expect(input.value).toBe(`${FAMILY}${FLAG}`)
    expect(root.hasAttribute('data-at-max')).toBe(true)
    await insertText('x')
    expect(input.value).toBe(`${FAMILY}${FLAG}`)
  })

  it('在中间插入一串：只收得下的那一截，光标落在它之后，光标后的原文不动', async () => {
    const { input } = await mount({ maxLength: 5, defaultValue: 'abcd' })
    input.focus()
    input.setSelectionRange(2, 2)
    await insertText('XYZ')
    expect(input.value).toBe('abXcd')
    expect(input.selectionStart).toBe(3)
    expect(input.selectionEnd).toBe(3)
  })

  it('输入法组合中不截，落定时才按上限收住', async () => {
    const { input } = await mount({ maxLength: 3, defaultValue: '一二' })
    input.focus()
    input.setSelectionRange(2, 2)
    await cdp().send('Input.imeSetComposition', { text: 'zhongguo', selectionStart: 8, selectionEnd: 8 })
    await nextTick()
    // 拼音字母还在候选框里，截了会把组合打断
    expect(input.value).toBe('一二zhongguo')
    await insertText('中国')
    expect(input.value).toBe('一二中')
  })
})
