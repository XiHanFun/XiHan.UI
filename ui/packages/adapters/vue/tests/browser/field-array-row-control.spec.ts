// 字段数组的每一行里放的是作者的控件，行内容给它一条能撑开也能收窄的轨道。字段族控件放进去要铺满这条轨道，
// 与放进 Field 时一样；此前文本框照旧按单独摆放的 16rem 缺省宽，行宽了它也不跟着变，删除钮与输入框之间空出一截。
// 宽度要按真实排版量，只有 Chromium 量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayRoot,
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

async function mount(width: number, fields: number): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = `${width}px`
  document.body.append(host)
  app = createApp({
    render: () => h(XhFieldArrayRoot, { defaultValue: ['https://xihan.fun'] }, () => [
      h(XhFieldArrayItem, { index: 0 }, () => [
        h(XhFieldArrayItemContent, null, () => Array.from({ length: fields }, (_, i) =>
          h(XhTextFieldRoot, { key: i, placeholder: '填一个链接' }, () => h(XhTextFieldControl, null, () => h(XhTextFieldInput))))),
        h(XhFieldArrayItemAction, null, () => h(XhFieldArrayItemDeleteTrigger)),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
}

function content(): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='field-array'][data-part='item-content']`)!
}

function fieldRoots(): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>(`[data-scope='text-field'][data-part='root']`)]
}

describe('field-array 行里的字段族控件', () => {
  it('一个文本框铺满行内容的轨道，行比 16rem 宽也跟着走', async () => {
    await mount(560, 1)
    const track = content().getBoundingClientRect()
    const [field] = fieldRoots()
    expect(track.width).toBeGreaterThan(256)
    expect(field!.getBoundingClientRect().width).toBeCloseTo(track.width, 0)
  })

  it('两个文本框并排时平分轨道，不撑破行', async () => {
    await mount(560, 2)
    const track = content().getBoundingClientRect()
    const [a, b] = fieldRoots().map(field => field.getBoundingClientRect())
    expect(a!.left).toBeGreaterThanOrEqual(track.left - 0.5)
    expect(b!.right).toBeLessThanOrEqual(track.right + 0.5)
    expect(a!.width).toBeCloseTo(b!.width, 0)
  })
})
