// 多行文本框的拖拽角在外框的角上：原生拖拽角画在 textarea 自己的盒角，外壳的行内衬与盒尾的清除钮会把它挤离外框；
// 拖拽改由外壳承担，textarea 跟着外壳的高伸缩。拖拽角落在哪、拉高后内容跟不跟，只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTextFieldClearTrigger,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
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

/** 挂一个 400px 宽、带清除钮且有值的多行文本框，返回外壳与 textarea */
async function mount(autoSize = false): Promise<{ control: HTMLElement, textarea: HTMLTextAreaElement }> {
  host = document.createElement('div')
  host.style.inlineSize = '400px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTextFieldRoot, { defaultValue: '申请原因', clearable: true, autoSize: autoSize || undefined, style: { inlineSize: '100%' } }, () =>
      h(XhTextFieldControl, { style: { inlineSize: '100%' } }, () => [
        h(XhTextFieldInput, { as: 'textarea', rows: 2 }),
        h(XhTextFieldClearTrigger),
      ])),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  return {
    control: host.querySelector<HTMLElement>('[data-scope="text-field"][data-part="control"]')!,
    textarea: host.querySelector<HTMLTextAreaElement>('textarea')!,
  }
}

describe('多行文本框的拖拽角', () => {
  it('拖拽由外壳承担，textarea 自己不出拖拽角', async () => {
    const { control, textarea } = await mount()
    expect(getComputedStyle(control).resize).toBe('vertical')
    expect(getComputedStyle(control).overflow).toBe('hidden')
    expect(getComputedStyle(textarea).resize).toBe('none')
    // 清除钮仍排在盒尾，textarea 的右缘停在它前面：拖拽角若还画在 textarea 上就离外框的角有一截
    const clear = host!.querySelector<HTMLElement>('[data-part="clear-trigger"]')!
    expect(clear.hidden).toBe(false)
    expect(textarea.getBoundingClientRect().right).toBeLessThan(control.getBoundingClientRect().right - clear.getBoundingClientRect().width)
  })

  it('外壳拉高后 textarea 撑满外壳的高', async () => {
    const { control, textarea } = await mount()
    const before = textarea.getBoundingClientRect().height
    control.style.blockSize = '160px'
    await nextTick()
    const after = textarea.getBoundingClientRect().height
    expect(after).toBeGreaterThan(before)
    expect(after).toBeCloseTo(control.clientHeight, 0)
  })

  it('自动高度的不出拖拽角', async () => {
    const { control, textarea } = await mount(true)
    expect(getComputedStyle(control).resize).toBe('none')
    expect(getComputedStyle(textarea).resize).toBe('none')
  })
})
