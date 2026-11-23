// 浏览器给搜索框自带一颗清除钮：有值且悬停或聚焦时出现在输入框行尾。清空归组件自己的 clear-trigger，
// 原生那颗不收掉，开了 clearable 的搜索框行尾就并排两个叉。
// 它是浏览器内部的节点，查不到也量不到，只能按行为判：真实指针点在行尾那一处，值被清掉就说明它还在。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTextFieldClearTrigger, XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from '../../src'
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

async function mount(props: Record<string, unknown>, withClear: boolean): Promise<HTMLInputElement> {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTextFieldRoot, { type: 'search', defaultValue: '杭州', ...props }, () =>
      h(XhTextFieldControl, null, () => [
        h(XhTextFieldInput, { 'aria-label': '关键词' }),
        ...(withClear ? [h(XhTextFieldClearTrigger)] : []),
      ])),
  })
  app.mount(host)
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  return host.querySelector<HTMLInputElement>('input')!
}

/**
 * 真实指针点在输入框行尾。原生清除钮约一个字宽、贴着行尾，先悬停让它露面，再沿行尾那一小段逐处点：
 * 它在哪个落点上都算数。
 */
async function clickRowEnd(input: HTMLInputElement): Promise<void> {
  const rect = input.getBoundingClientRect()
  await userEvent.hover(input)
  for (const inset of [4, 8, 12, 16]) {
    await userEvent.click(input, { position: { x: rect.width - inset, y: rect.height / 2 } })
    if (input.value === '')
      return
  }
}

describe('搜索框不带浏览器自带的清除钮', () => {
  it('点在输入框行尾：值还在，没有被一颗看不见来历的钮清掉', async () => {
    const input = await mount({}, false)
    expect(input.type).toBe('search')
    await clickRowEnd(input)
    expect(input.value).toBe('杭州')
  })

  it('开了 clearable：行尾只有组件自己的清空钮这一颗能清空，点输入框自己的行尾不清', async () => {
    const input = await mount({ clearable: true }, true)
    await clickRowEnd(input)
    expect(input.value).toBe('杭州')

    await userEvent.click(host!.querySelector<HTMLElement>('[data-scope="text-field"][data-part="clear-trigger"]')!)
    expect(input.value).toBe('')
  })
})
