// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { vueNormalize } from '../src/runtime/normalize-props'

// IR 的事件名大小写不该影响绑定结果：Vue 由 hyphenate 推导事件名，
// onKeyDown 会被推成 'key-down' 这个永不触发的事件；WC 的 spreader 取全小写。
// 归一化前两个适配器会绑到不同事件（Vue 侧静默失效），这里钉死两种写法等价。
describe('vueNormalize 事件名归一', () => {
  it('onKeyDown 与 onKeydown 归一到同一个键', () => {
    const a = vueNormalize.element({ onKeyDown: () => {} }) as Record<string, unknown>
    const b = vueNormalize.element({ onKeydown: () => {} }) as Record<string, unknown>
    expect(Object.keys(a)).toEqual(Object.keys(b))
  })

  it('onFocusOut 与 onFocusout 归一到同一个键', () => {
    const a = vueNormalize.element({ onFocusOut: () => {} }) as Record<string, unknown>
    const b = vueNormalize.element({ onFocusout: () => {} }) as Record<string, unknown>
    expect(Object.keys(a)).toEqual(Object.keys(b))
  })

  it('单词事件与非事件属性原样保留', () => {
    const out = vueNormalize.element({
      'onClick': () => {},
      'data-part': 'root',
      'aria-checked': 'true',
      'tabindex': 0,
    }) as Record<string, unknown>
    expect(Object.keys(out).sort()).toEqual(['aria-checked', 'data-part', 'onClick', 'tabindex'])
  })

  it.each(['onKeyDown', 'onKeydown'])('%s 挂到真实 DOM 后 keydown 事件确实触发', (key) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    let fired = 0
    const app = createApp({
      setup: () => () =>
        h('button', vueNormalize.element({ [key]: () => { fired += 1 } }) as Record<string, unknown>, 'x'),
    })
    app.mount(host)

    host.querySelector('button')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(fired).toBe(1)

    app.unmount()
    host.remove()
  })
})
