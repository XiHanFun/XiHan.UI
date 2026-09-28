// 字段外壳的焦点环即时出现：键盘用户要焦点当场落位，环不淡入；描边换色照常淡变。
// 过渡是否在播只有真实浏览器看得见。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from '../../src'
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

describe('字段外壳焦点环', () => {
  it('键盘聚焦：环当场画出，没有 outline-color 过渡；描边换色仍在淡变', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhTextFieldRoot, null, () => h(XhTextFieldControl, null, () => h(XhTextFieldInput))),
    })
    app.mount(host)
    await nextTick()
    const control = host.querySelector<HTMLElement>(`[data-scope='text-field'][data-part='control']`)!
    await userEvent.tab()
    const running = control.getAnimations()
      .filter((animation): animation is CSSTransition => animation instanceof CSSTransition)
      .map(animation => animation.transitionProperty)
    expect(running).not.toContain('outline-color')
    expect(running.some(name => name.startsWith('border'))).toBe(true)
    expect(getComputedStyle(control).outlineColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})
