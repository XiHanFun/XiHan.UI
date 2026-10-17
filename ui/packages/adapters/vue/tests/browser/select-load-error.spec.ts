// 整表取数失败：浮层里露出一句提示与一颗重试钮，空态让位；重试钮在浮层里居中、不占 Tab 位，点它派发 retry。
import type { App } from 'vue'
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectEmpty,
  XhSelectError,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRetryTrigger,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from '../../src'
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

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='select'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 ${name}`)
  return el
}

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mount(error: { value: boolean }, retries: { count: number }): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhSelectRoot, { collection: [], error: error.value, defaultOpen: true, onRetry: () => retries.count++ }, () => [
      h(XhSelectControl, null, () => h(XhSelectTrigger, null, () => h(XhSelectValueText))),
      h(XhSelectPositioner, null, () => h(XhSelectContent, { style: { inlineSize: '240px' } }, () => [
        h(XhSelectList),
        h(XhSelectEmpty, null, () => '暂无选项'),
        h(XhSelectError),
        h(XhSelectRetryTrigger),
      ])),
    ]),
  })
  app.mount(host)
  await settle()
}

describe('select 整表取数失败', () => {
  it('露出提示与重试钮、空态让位；重试钮居中，点它派发 retry；撤掉 error 两者都收起', async () => {
    const error = ref(true)
    const retries = { count: 0 }
    await mount(error, retries)

    expect(getComputedStyle(part('empty')).display).toBe('none')
    expect(getComputedStyle(part('error')).display).not.toBe('none')
    expect(part('error').textContent).toBe('Couldn’t load options')
    const retry = part('retry-trigger')
    expect(getComputedStyle(retry).display).not.toBe('none')
    expect(retry.textContent).toBe('Retry')
    const content = part('content').getBoundingClientRect()
    const box = retry.getBoundingClientRect()
    // 按内容收宽、居中：没有居中规则时它会被浮层的纵向排布拉满整行
    expect(box.width).toBeLessThan(content.width / 2)
    expect(Math.abs((box.left + box.right) / 2 - (content.left + content.right) / 2)).toBeLessThan(1)

    retry.click()
    expect(retries.count).toBe(1)

    const { violations } = await runAxe(part('content'))
    expect(violations.map(v => v.id)).toEqual([])

    error.value = false
    await settle()
    expect(getComputedStyle(part('error')).display).toBe('none')
    expect(getComputedStyle(part('retry-trigger')).display).toBe('none')
    expect(getComputedStyle(part('empty')).display).not.toBe('none')
  })
})
