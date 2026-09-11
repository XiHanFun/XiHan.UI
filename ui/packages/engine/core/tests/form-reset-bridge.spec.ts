// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFormResetBridge } from '../src/behavior/form-reset'

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('form reset bridge 的表单品牌', () => {
  it('显式外部表单覆盖祖先，动态改目标与缺席目标按当前属性解析', () => {
    const ancestor = document.createElement('form')
    const first = document.createElement('form')
    const second = document.createElement('form')
    first.id = 'first'
    second.id = 'second'
    const anchor = document.createElement('div')
    anchor.id = 'not-a-form'
    ancestor.append(anchor)
    document.body.append(ancestor, first, second)
    let formId: string | undefined = 'first'
    const onReset = vi.fn()
    const bridge = createFormResetBridge({ getNode: () => anchor, getFormId: () => formId, onReset })

    ancestor.reset()
    expect(onReset).not.toHaveBeenCalled()
    first.reset()
    expect(onReset).toHaveBeenCalledTimes(1)
    formId = 'second'
    first.reset()
    expect(onReset).toHaveBeenCalledTimes(1)
    second.reset()
    expect(onReset).toHaveBeenCalledTimes(2)
    for (const missing of ['', 'missing', 'not-a-form']) {
      formId = missing
      ancestor.reset()
      first.reset()
      second.reset()
    }
    expect(onReset).toHaveBeenCalledTimes(2)
    formId = undefined
    ancestor.reset()
    expect(onReset).toHaveBeenCalledTimes(3)
    bridge.dispose()
    ancestor.reset()
    expect(onReset).toHaveBeenCalledTimes(3)
  })

  it('外部表单重置被取消时不回调，目标尚未创建时不回退祖先', () => {
    const ancestor = document.createElement('form')
    const anchor = document.createElement('div')
    ancestor.append(anchor)
    document.body.append(ancestor)
    const onReset = vi.fn()
    const bridge = createFormResetBridge({ getNode: () => anchor, getFormId: () => 'late', onReset })
    ancestor.reset()
    const late = document.createElement('form')
    late.id = 'late'
    document.body.append(late)
    late.addEventListener('reset', event => event.preventDefault())
    late.reset()
    expect(onReset).not.toHaveBeenCalled()
    bridge.dispose()
  })

  it('显式表单 ID 在组件所属的影子树解析', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const localForm = document.createElement('form')
    localForm.id = 'same-id'
    const outerForm = document.createElement('form')
    outerForm.id = 'same-id'
    document.body.append(outerForm)
    const anchor = document.createElement('div')
    shadow.append(localForm, anchor)
    const onReset = vi.fn()
    const bridge = createFormResetBridge({ getNode: () => anchor, getFormId: () => 'same-id', onReset })
    outerForm.reset()
    expect(onReset).not.toHaveBeenCalled()
    localForm.reset()
    expect(onReset).toHaveBeenCalledTimes(1)
    bridge.dispose()
  })

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
