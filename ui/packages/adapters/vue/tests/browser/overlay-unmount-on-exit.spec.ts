import type { App, Component } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhDialogContent, XhDialogRoot, XhDialogTitle, XhDrawerContent, XhDrawerRoot, XhDrawerTitle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// unmountOnExit 为 false 的浮层收起后内容常驻在 display:none 的定位层里。再打开时内容早就在了，
// 焦点域建起那一刻容器还没显形、可聚焦元素一个也量不到；这里在真浏览器里验它照样把焦点送进去、
// 进场动画照样播、背景照样失活，收起后背景与滚动锁照样还回去。

interface Case {
  name: string
  scope: string
  Root: Component
  Content: Component
  Title: Component
}

const CASES: Case[] = [
  { name: 'Dialog', scope: 'dialog', Root: XhDialogRoot, Content: XhDialogContent, Title: XhDialogTitle },
  { name: 'Drawer', scope: 'drawer', Root: XhDrawerRoot, Content: XhDrawerContent, Title: XhDrawerTitle },
]

let app: App | null = null

async function settle(): Promise<void> {
  await nextTick()
  // 等宿主提交与定位落定：两帧
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

describe.each(CASES)('$name unmountOnExit 为 false 的再次打开', (c) => {
  const part = (name: string): HTMLElement | null => document.querySelector(`[data-scope='${c.scope}'][data-part='${name}']`)

  it('焦点照常进入常驻内容、进场照常播放，收起后背景与滚动锁还回去', async () => {
    const outside = document.createElement('button')
    outside.textContent = '页面按钮'
    document.body.append(outside)
    const host = document.createElement('div')
    document.body.append(host)
    const open = ref(false)
    app = createApp({
      render: () => h(c.Root, {
        'open': open.value,
        'onUpdate:open': (v: boolean) => { open.value = v },
        'unmountOnExit': false,
      }, () => h(c.Content, null, () => [
        h(c.Title, null, () => '偏好设置'),
        h('input', { 'data-testid': 'field' }),
      ])),
    })
    app.mount(host)

    open.value = true
    await settle()
    const field = document.querySelector<HTMLInputElement>('[data-testid="field"]')!
    await expect.poll(() => document.activeElement).toBe(field)

    open.value = false
    await expect.poll(() => getComputedStyle(part('positioner')!).display).toBe('none')
    expect(part('backdrop')).toBeNull()
    await expect.poll(() => outside.hasAttribute('aria-hidden')).toBe(false)
    await expect.poll(() => document.body.style.overflow).not.toBe('hidden')

    open.value = true
    await nextTick()
    // 常驻的那一份重新显形：同一个节点、进场动画在播
    expect(document.querySelector('[data-testid="field"]')).toBe(field)
    await expect.poll(() => part('content')!.getAnimations().length).toBeGreaterThan(0)
    expect(part('backdrop')).not.toBeNull()
    await expect.poll(() => document.activeElement).toBe(field)
    await expect.poll(() => outside.getAttribute('aria-hidden')).toBe('true')
    expect(document.body.style.overflow).toBe('hidden')
  })
})
