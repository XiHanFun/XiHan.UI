import type { App, Component, Ref } from 'vue'
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhDialogContent, XhDialogRoot, XhDialogTitle, XhDrawerContent, XhDrawerRoot, XhDrawerTitle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | undefined
let style: HTMLStyleElement | undefined
afterEach(() => {
  app?.unmount()
  app = undefined
  style?.remove()
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

function fixture(scope: 'dialog' | 'drawer') {
  const components: [Component, Component, Component] = scope === 'dialog'
    ? [XhDialogRoot, XhDialogContent, XhDialogTitle]
    : [XhDrawerRoot, XhDrawerContent, XhDrawerTitle]
  const [Root, Content, Title] = components
  const open: Ref<boolean> = ref(true)
  const modal = ref(true)
  const completed: number[] = []
  const host = document.createElement('div')
  const outside = document.createElement('button')
  outside.textContent = '页面按钮'
  document.body.append(outside, host)
  style = document.createElement('style')
  style.textContent = `
    @keyframes presence-fade { from { opacity: 1 } to { opacity: 0 } }
    @keyframes presence-move { from { translate: 0 0 } to { translate: 0 8px } }
    @keyframes presence-shine { from { outline-color: transparent } to { outline-color: transparent } }
    [data-scope='${scope}'][data-part='content'][data-state='closed'] {
      animation: presence-fade 60s linear forwards, presence-move 60s linear forwards, presence-shine 60s linear infinite;
    }
    [data-scope='${scope}'][data-part='backdrop'][data-state='closed'] { animation: presence-fade 60s linear forwards }
  `
  document.head.append(style)
  app = createApp({
    setup: () => () => h(Root, {
      open: open.value,
      modal: modal.value,
      onExitComplete: () => completed.push(getLayerRegistry(document).list().length),
    }, () => h(Content, null, () => [h(Title, null, () => '退场测试'), h('button', { 'data-test-action': '' }, '内部动作')])),
  })
  app.mount(host)
  const part = (name: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)!
  return { open, modal, completed, part, outside }
}

function finite(node: HTMLElement): Animation[] {
  return node.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
}

describe.each(['dialog', 'drawer'] as const)('%s 的真实退场与模态资源', (scope) => {
  it('退场中切换模态策略后重开，资源按新策略建立', async () => {
    const f = fixture(scope)
    await settle()
    f.open.value = false
    await settle()
    f.modal.value = false
    f.open.value = true
    await settle()
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(f.outside.inert).toBe(false)
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    expect(f.completed).toEqual([])
    f.open.value = false
    await settle()
    f.modal.value = true
    f.open.value = true
    await settle()
    expect(document.body.style.overflow).toBe('hidden')
    expect(f.outside.inert).toBe(true)
    expect(getLayerRegistry(document).list()).toHaveLength(1)
  })

  it('内容即时失活，全部有限内容动画及遮罩完成后释放', async () => {
    const f = fixture(scope)
    await settle()
    f.open.value = false
    await settle()
    const content = f.part('content')
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    const action = content.querySelector('button')!
    action.focus()
    expect(document.activeElement).not.toBe(action)
    expect(f.outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    const animations = finite(content)
    expect(animations).toHaveLength(2)
    animations[0]!.finish()
    await settle()
    expect(f.completed).toEqual([])
    animations[1]!.finish()
    await settle()
    expect(f.completed).toEqual([])
    expect(f.part('content')).not.toBeNull()
    for (const animation of finite(f.part('backdrop'))) animation.finish()
    await settle()
    expect(f.completed).toEqual([0])
    expect(f.outside.inert).toBe(false)
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(f.part('content')).toBeNull()
  })

  it('重开撤销旧退出，卸载立即释放而不误发完成', async () => {
    const f = fixture(scope)
    await settle()
    f.open.value = false
    await settle()
    const old = finite(f.part('content'))
    f.part('content').querySelector('button')!.blur()
    f.open.value = true
    await settle()
    for (const animation of old) animation.cancel()
    await settle()
    expect(f.part('content').inert).toBe(false)
    expect(f.part('content').contains(document.activeElement)).toBe(true)
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    expect(f.completed).toEqual([])
    f.open.value = false
    await settle()
    app!.unmount()
    app = undefined
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(f.completed).toEqual([])
  })
})

it('内层退出完成后仍保留外层模态资源，最后退出才解锁页面', async () => {
  const parentOpen = ref(true)
  const childOpen = ref(false)
  const host = document.createElement('div')
  document.body.append(host)
  style = document.createElement('style')
  style.textContent = `
    @keyframes nested-exit { from { opacity: 1 } to { opacity: 0 } }
    [data-scope='dialog'][data-state='closed']:is([data-part='content'], [data-part='backdrop']) { animation: nested-exit 60s linear forwards; }
  `
  document.head.append(style)
  app = createApp({ render: () => h(XhDialogRoot, { open: parentOpen.value }, () =>
    h(XhDialogContent, { 'data-test-parent': '' }, () => [
      h(XhDialogTitle, null, () => '外层'),
      h('button', '外层操作'),
      h(XhDialogRoot, { open: childOpen.value }, () =>
        h(XhDialogContent, null, () => [h(XhDialogTitle, null, () => '内层'), h('button', '内层操作')])),
    ])) })
  app.mount(host)
  await settle()
  childOpen.value = true
  await settle()
  expect(getLayerRegistry(document).list()).toHaveLength(2)
  childOpen.value = false
  await settle()
  expect(getLayerRegistry(document).list()).toHaveLength(2)
  const finishClosed = (): void => {
    for (const node of document.querySelectorAll<HTMLElement>(`[data-scope='dialog'][data-state='closed']`)) {
      for (const animation of finite(node)) animation.finish()
    }
  }
  finishClosed()
  await settle()
  expect(getLayerRegistry(document).list()).toHaveLength(1)
  expect(document.body.style.overflow).toBe('hidden')
  await settle()
  expect(document.querySelector('[data-test-parent]')!.contains(document.activeElement)).toBe(true)
  parentOpen.value = false
  await settle()
  finishClosed()
  await settle()
  expect(getLayerRegistry(document).list()).toHaveLength(0)
  expect(document.body.style.overflow).not.toBe('hidden')
})
