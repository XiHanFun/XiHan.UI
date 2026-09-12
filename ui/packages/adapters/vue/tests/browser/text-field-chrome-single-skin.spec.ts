import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhTextFieldClearTrigger,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldPrefix,
  XhTextFieldRoot,
  XhTextFieldSuffix,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles/layers.css'
import '@xihan-ui/styles/tone.css'
import '@xihan-ui/styles/text-field.css'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

describe('field Chrome 单皮肤入口', () => {
  it('text-field.css 传递带入 Field Chrome 与 field-inset Action，几何同 full 入口', () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhTextFieldRoot, { defaultValue: 'XiHan', clearable: true }, () => [
        h(XhTextFieldControl, null, () => [
          h(XhTextFieldPrefix, null, () => 'P'),
          h(XhTextFieldInput),
          h(XhTextFieldSuffix, null, () => 'S'),
          h(XhTextFieldClearTrigger),
        ]),
      ]),
    })
    app.mount(host)

    const control = host.querySelector<HTMLElement>('[data-xh-field-chrome]')!
    const input = host.querySelector<HTMLElement>('[data-xh-field-input]')!
    const clear = host.querySelector<HTMLElement>('[data-xh-action-profile=\'field-inset\']')!
    const controlStyle = getComputedStyle(control)
    expect(control.getBoundingClientRect().height).toBe(32)
    // control 是 column flex root 的 flex item，inline-flex 的外 display 会按规范 blockify 成 flex。
    expect(controlStyle.display).toBe('flex')
    expect(controlStyle.borderTopStyle).toBe('solid')
    expect(getComputedStyle(input).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(clear.getBoundingClientRect().width).toBe(clear.getBoundingClientRect().height)
    expect(clear.dataset.xhActionProfile).toBe('field-inset')
  })
})
