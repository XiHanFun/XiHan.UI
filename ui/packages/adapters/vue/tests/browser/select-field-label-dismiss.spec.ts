// 字段标题的 for 指向弹出式触发钮（封装把字段的 id 转交给 Select 的 trigger）时，点标题只聚焦、不开合，
// 与原生 select 一致。此前下拉展开时点标题收不起来：按下被判在浮层外、先收起，松手的 click 经标题的原生激活
// 又点了一次触发钮，随即重新展开。标题在纵排的字段里撑满整列宽，它右侧的空白同样是标题。
import type { App } from 'vue'
import { userEvent } from 'vitest/browser'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import {
  XhFieldControl,
  XhFieldLabel,
  XhFieldRoot,
  XhSelectContent,
  XhSelectControl,
  XhSelectItem,
  XhSelectItemText,
  XhSelectList,
  XhSelectPositioner,
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

const collection = [{ value: 'unknown', label: '未知' }, { value: 'male', label: '男' }, { value: 'female', label: '女' }]

/** 薄封装：字段挂来的 id 与 aria-* 转交给触发器。 */
const Wrapper = defineComponent({
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () => h(XhSelectRoot, { collection, placeholder: '全部性别' }, () => [
      h(XhSelectControl, null, () => h(XhSelectTrigger, { ...attrs }, () => h(XhSelectValueText))),
      h(XhSelectPositioner, null, () => h(XhSelectContent, null, () => h(XhSelectList, null, () =>
        collection.map(node => h(XhSelectItem, { key: node.value, value: node.value }, () => h(XhSelectItemText, null, () => node.label)))))),
    ])
  },
})

async function mount(): Promise<{ trigger: HTMLElement, label: HTMLElement }> {
  host = document.createElement('div')
  host.style.padding = '40px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhFieldRoot, { style: 'display: flex; flex-direction: column; inline-size: 240px' }, () => [
      h(XhFieldLabel, null, () => '性别'),
      h(XhFieldControl, null, () => h(Wrapper)),
    ]),
  })
  app.mount(host)
  await nextTick()
  const trigger = host.querySelector<HTMLElement>(`[data-scope='select'][data-part='trigger']`)!
  const label = host.querySelector<HTMLElement>(`[data-scope='field'][data-part='label']`)!
  expect(label.htmlFor).toBe(trigger.id)
  return { trigger, label }
}

/** 点标题右侧的空白：标题撑满整列宽，文字之外也是它。 */
async function clickLabelBlank(label: HTMLElement): Promise<void> {
  const rect = label.getBoundingClientRect()
  await userEvent.click(label, { position: { x: rect.width - 8, y: rect.height / 2 } })
  // 收起与可能的重新展开都要落定再读
  await new Promise(resolve => setTimeout(resolve, 300))
}

describe('字段标题指向弹出式触发钮（Vue）', () => {
  it('展开时点标题收起，焦点回到触发钮', async () => {
    const { trigger, label } = await mount()
    await userEvent.click(trigger)
    await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('true')
    await clickLabelBlank(label)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
  })

  it('收起时点标题只聚焦触发钮，不展开', async () => {
    const { trigger, label } = await mount()
    await clickLabelBlank(label)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
  })
})
