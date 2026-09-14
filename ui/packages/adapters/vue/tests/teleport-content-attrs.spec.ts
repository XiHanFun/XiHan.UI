// @vitest-environment jsdom
// 浮层的 content 部件以 Teleport 作根：Vue 只在根 vnode 是元素或组件时才合并直通属性，
// 所以作者写在标签上的 class 与 style 必须由组件自己接住并落到 content 节点上。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhDialogContent,
  XhDialogRoot,
  XhDrawerContent,
  XhDrawerRoot,
  XhImageViewerContent,
  XhImageViewerRoot,
} from '../src'

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

async function mountOverlay(root: unknown, content: unknown, rootProps: Record<string, unknown>, contentProps: Record<string, unknown>): Promise<void> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () => h(root as never, rootProps, () => [h(content as never, contentProps, () => '正文')]),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  await nextTick()
  await nextTick()
}

describe('teleport 作根的 content 部件接住直通属性', () => {
  it('dialog content 收下 class 与内联 style', async () => {
    await mountOverlay(XhDialogRoot, XhDialogContent, { open: true }, { class: 'my-dialog', style: 'width: 96vw' })
    const content = document.querySelector('[data-scope=\'dialog\'][data-part=\'content\']') as HTMLElement

    expect(content).not.toBeNull()
    expect(content.classList.contains('my-dialog')).toBe(true)
    expect(content.style.width).toBe('96vw')
  })

  it('皮肤自己的 data-* 标记不被直通属性挤掉', async () => {
    await mountOverlay(XhDialogRoot, XhDialogContent, { open: true }, { class: 'my-dialog' })
    const content = document.querySelector('.my-dialog') as HTMLElement

    expect(content.getAttribute('data-scope')).toBe('dialog')
    expect(content.getAttribute('data-part')).toBe('content')
  })

  it('drawer content 收下 class 与内联 style', async () => {
    await mountOverlay(XhDrawerRoot, XhDrawerContent, { open: true }, { class: 'my-drawer', style: '--xh-drawer-size: 900px' })
    const content = document.querySelector('[data-scope=\'drawer\'][data-part=\'content\']') as HTMLElement

    expect(content).not.toBeNull()
    expect(content.classList.contains('my-drawer')).toBe(true)
    expect(content.style.getPropertyValue('--xh-drawer-size')).toBe('900px')
  })

  it('image-viewer content 收下 class', async () => {
    await mountOverlay(XhImageViewerRoot, XhImageViewerContent, { open: true, images: ['a.png'] }, { class: 'my-viewer' })
    const content = document.querySelector('[data-scope=\'image-viewer\'][data-part=\'content\']') as HTMLElement

    expect(content).not.toBeNull()
    expect(content.classList.contains('my-viewer')).toBe(true)
  })
})
