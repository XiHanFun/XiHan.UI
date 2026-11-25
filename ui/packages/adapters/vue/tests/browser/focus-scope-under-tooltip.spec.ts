// 陷焦点的区域里，最后一个可聚焦元素带提示：键盘 Tab 过去时提示随聚焦打开，压在层栈上面。
// 再按 Tab 焦点仍要回到区域里第一个，不能因为栈顶换成了提示就走到区域外面去。
// 真实的 Tab 顺序、聚焦打开的提示与层栈的先后只有浏览器里走得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhDialogContent, XhDialogRoot, XhDialogTitle, XhFocusTrap, XhTooltipContent, XhTooltipPositioner, XhTooltipRoot, XhTooltipTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function focusedText(): string | null {
  return document.activeElement?.textContent ?? null
}

function tipState(): string | undefined {
  return document.querySelector<HTMLElement>('[data-test="tip-content"]')?.dataset.state
}

/** 区域里：一颗普通按钮在前，带提示的按钮排在最后。 */
function children() {
  return [
    h('button', { type: 'button' }, '甲'),
    h(XhTooltipRoot, { openDelay: 0, closeDelay: 0 }, () => [
      h(XhTooltipTrigger, null, () => '乙'),
      h(XhTooltipPositioner, null, () => h(XhTooltipContent, { 'data-test': 'tip-content' }, () => '说明')),
    ]),
  ]
}

async function mount(render: () => unknown): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = 'padding:120px 40px'
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
}

describe('提示压在陷焦点的区域上面', () => {
  it('焦点圈定：Tab 到带提示的末项、提示打开后，再按 Tab 回到第一个', async () => {
    await mount(() => [
      h('button', { type: 'button' }, '前面'),
      h(XhFocusTrap, null, children),
      h('button', { type: 'button' }, '外面'),
    ])
    await expect.poll(focusedText).toBe('甲')
    await userEvent.tab()
    expect(focusedText()).toBe('乙')
    await expect.poll(tipState).toBe('open')
    await userEvent.tab()
    await expect.poll(focusedText).toBe('甲')
  })

  it('对话框：Tab 到带提示的末项、提示打开后，再按 Tab 仍留在对话框里', async () => {
    await mount(() => [
      h('button', { type: 'button' }, '外面'),
      h(XhDialogRoot, { open: true }, () =>
        h(XhDialogContent, null, () => [h(XhDialogTitle, null, () => '编辑'), ...children()])),
    ])
    await expect.poll(focusedText).toBe('甲')
    await userEvent.tab()
    expect(focusedText()).toBe('乙')
    await expect.poll(tipState).toBe('open')
    await userEvent.tab()
    const content = document.querySelector('[data-scope="dialog"][data-part="content"]')!
    await expect.poll(() => content.contains(document.activeElement)).toBe(true)
  })
})
