// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFormResetBridge } from '../src/behavior/form-reset'

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('form reset bridge 的表单品牌', () => {
  it('iframe 表单的 reset 能到达所属组件', () => {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const doc = frame.contentDocument!
    const win = frame.contentWindow! as Window & typeof globalThis
    const form = doc.createElement('form')
    const anchor = doc.createElement('div')
    form.appendChild(anchor)
    doc.body.appendChild(form)
    const onReset = vi.fn()
    const bridge = createFormResetBridge({ getNode: () => anchor, onReset })

    form.dispatchEvent(new win.Event('reset', { bubbles: true, cancelable: true }))
    expect(onReset).toHaveBeenCalledTimes(1)
    bridge.dispose()
  })

  it('从 iframe adopt 到主文档后仍按原生 form 身份处理', () => {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const foreignForm = frame.contentDocument!.createElement('form')
    const anchor = frame.contentDocument!.createElement('div')
    foreignForm.appendChild(anchor)
    const form = document.adoptNode(foreignForm)
    document.body.appendChild(form)
    expect(form instanceof HTMLFormElement).toBe(false)
    const onReset = vi.fn()
    const bridge = createFormResetBridge({ getNode: () => anchor, onReset })

    form.dispatchEvent(new Event('reset', { bubbles: true, cancelable: true }))
    expect(onReset).toHaveBeenCalledTimes(1)
    bridge.dispose()
  })

  it('相同事件名的普通元素不会触发表单重置回调', () => {
    const form = document.createElement('form')
    const anchor = document.createElement('div')
    form.appendChild(anchor)
    const ordinary = document.createElement('div')
    document.body.append(form, ordinary)
    const onReset = vi.fn()
    const bridge = createFormResetBridge({ getNode: () => anchor, onReset })

    ordinary.dispatchEvent(new Event('reset', { bubbles: true, cancelable: true }))
    expect(onReset).not.toHaveBeenCalled()
    bridge.dispose()
  })

  it('原生 reset 已被表单监听器取消时不单独重置组件', () => {
    const form = document.createElement('form')
    const anchor = document.createElement('div')
    form.appendChild(anchor)
    document.body.appendChild(form)
    form.addEventListener('reset', event => event.preventDefault())
    const onReset = vi.fn()
    const bridge = createFormResetBridge({ getNode: () => anchor, onReset })

    form.dispatchEvent(new Event('reset', { bubbles: true, cancelable: true }))
    expect(onReset).not.toHaveBeenCalled()
    bridge.dispose()
  })
})
