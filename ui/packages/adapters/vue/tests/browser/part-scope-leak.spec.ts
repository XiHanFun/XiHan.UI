// 卡片与字段的后代规则只管自己那一份部件，装进去的别家组件不受影响。
//
// 这条必须在真实浏览器里验：判据是层叠之后真正生效的字号与伪元素内容，
// jsdom 既不跑 @layer 的层序也不解析 var()。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhAlertRoot,
  XhAlertTitle,
  XhCardBody,
  XhCardRoot,
  XhFieldLabel,
  XhFieldRoot,
  XhSwitch,
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

async function mount(render: () => unknown): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => () => render() })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function all(selector: string): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>(selector)]
}

describe('部件规则不越过 scope', () => {
  it('大号卡片里的告警标题，字号与卡片外的那条一样', async () => {
    // 两条告警内容相同，一条装进 lg 卡片、一条摆在外面：字号该只由 alert 自己的皮肤决定
    await mount(() => [
      h(XhCardRoot, { size: 'lg' }, () => [
        h(XhCardBody, null, () => [
          h(XhAlertRoot, null, () => [h(XhAlertTitle, null, () => '标题')]),
        ]),
      ]),
      h(XhAlertRoot, null, () => [h(XhAlertTitle, null, () => '标题')]),
    ])

    const titles = all('[data-scope="alert"][data-part="title"]')
    expect(titles).toHaveLength(2)
    expect(getComputedStyle(titles[0]!).fontSize).toBe(getComputedStyle(titles[1]!).fontSize)
  })

  it('必填字段里的开关文字，不被字段的必填星号染上', async () => {
    await mount(() =>
      h(XhFieldRoot, { required: true }, () => [
        h(XhFieldLabel, null, () => '字段'),
        h(XhSwitch, null, () => '开关文字'),
      ]),
    )

    const fieldLabel = all('[data-scope="field"][data-part="label"]')[0]!
    const switchLabel = all('[data-scope="switch"][data-part="label"]')[0]!
    // 字段自己的标签该有星号，开关的标签不该有——两边都断言，免得改成谁都没有也算过
    expect(getComputedStyle(fieldLabel, '::after').content).not.toBe('none')
    expect(getComputedStyle(switchLabel, '::after').content).toBe('none')
  })
})
