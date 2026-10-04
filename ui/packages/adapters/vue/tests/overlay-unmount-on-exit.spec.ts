// @vitest-environment jsdom

import type { Component } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick, onMounted, ref } from 'vue'
import { XhDialogContent, XhDialogRoot, XhDrawerContent, XhDrawerRoot } from '../src'

/**
 * 浮层内容的挂卸：缺省第一次打开才挂、退场播完就卸；unmountOnExit 为 false 时打开过之后一直挂着，
 * 收起只把定位层以内联 display 收起、遮罩不留，再打开不重挂——内容里的组件不会再走一遍 mounted，
 * 输入里的草稿也还在。jsdom 没有动画，presence 在收起当拍就判定退场播完。
 */

interface Case {
  name: string
  scope: string
  Root: Component
  Content: Component
}

const CASES: Case[] = [
  { name: 'Dialog', scope: 'dialog', Root: XhDialogRoot, Content: XhDialogContent },
  { name: 'Drawer', scope: 'drawer', Root: XhDrawerRoot, Content: XhDrawerContent },
]

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let unmount: (() => void) | undefined

afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.innerHTML = ''
})

function mount(c: Case, unmountOnExit?: boolean) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const open = ref(false)
  let mounts = 0
  const Probe = defineComponent({
    setup() {
      onMounted(() => {
        mounts++
      })
      return () => h('input', { 'data-testid': 'probe' })
    },
  })
  const app = createApp({
    setup: () => () => h(c.Root, {
      'open': open.value,
      'onUpdate:open': (v: boolean) => { open.value = v },
      unmountOnExit,
    }, { default: () => [h(c.Content, null, () => [h(Probe)])] }),
  })
  app.mount(host)
  unmount = () => app.unmount()
  return {
    async setOpen(v: boolean) {
      open.value = v
      await tick()
    },
    part: (name: string) => document.querySelector<HTMLElement>(`[data-scope="${c.scope}"][data-part="${name}"]`),
    probe: () => document.querySelector<HTMLInputElement>('[data-testid="probe"]'),
    mounts: () => mounts,
  }
}

describe.each(CASES)('$name 内容挂卸', (c) => {
  it('缺省：没打开过不渲染，打开即挂，退场播完就卸，再打开重新挂', async () => {
    const m = mount(c)
    expect(m.part('content')).toBeNull()
    await m.setOpen(true)
    expect(m.part('content')).not.toBeNull()
    expect(m.mounts()).toBe(1)
    await m.setOpen(false)
    expect(m.part('content')).toBeNull()
    expect(m.part('positioner')).toBeNull()
    await m.setOpen(true)
    expect(m.mounts()).toBe(2)
  })

  it('unmountOnExit 为 false：没打开过同样不渲染', async () => {
    const m = mount(c, false)
    await tick()
    expect(m.part('content')).toBeNull()
    expect(m.mounts()).toBe(0)
  })

  it('unmountOnExit 为 false：收起后常驻并藏起，再打开不重挂，草稿还在', async () => {
    const m = mount(c, false)
    await m.setOpen(true)
    const probe = m.probe()!
    probe.value = '草稿'

    await m.setOpen(false)
    expect(m.part('content')?.hidden).toBe(true)
    // 皮肤给定位层声明过 display，只能内联收起
    expect(m.part('positioner')?.style.display).toBe('none')
    expect(m.part('backdrop')).toBeNull()

    await m.setOpen(true)
    expect(m.mounts()).toBe(1)
    expect(m.probe()).toBe(probe)
    expect(probe.value).toBe('草稿')
    expect(m.part('content')?.hidden).toBe(false)
    expect(m.part('positioner')?.style.display).toBe('')
    expect(m.part('backdrop')).not.toBeNull()
  })
})
