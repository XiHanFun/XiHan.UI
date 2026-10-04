// @vitest-environment jsdom

import type { ComponentType, ReactNode } from 'react'
import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhDialogContent, XhDialogRoot, XhDrawerContent, XhDrawerRoot } from '../src'

/**
 * 浮层内容的挂卸：缺省第一次打开才挂、退场播完就卸；unmountOnExit 为 false 时打开过之后一直挂着，
 * 收起只把定位层以内联 display 收起、遮罩不留，再打开不重挂——内容里的组件不会再走一遍挂载，
 * 输入里的草稿也还在。jsdom 没有动画，presence 在收起当拍就判定退场播完。
 */

interface OverlayRootProps {
  open?: boolean
  unmountOnExit?: boolean
  children?: ReactNode
}

interface Case {
  name: string
  scope: string
  Root: ComponentType<OverlayRootProps>
  Content: ComponentType<{ children?: ReactNode }>
}

const CASES: Case[] = [
  { name: 'Dialog', scope: 'dialog', Root: XhDialogRoot as ComponentType<OverlayRootProps>, Content: XhDialogContent },
  { name: 'Drawer', scope: 'drawer', Root: XhDrawerRoot as ComponentType<OverlayRootProps>, Content: XhDrawerContent },
]

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

function mount(c: Case, unmountOnExit?: boolean) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  let mounts = 0
  function Probe(): ReactNode {
    useEffect(() => {
      mounts++
    }, [])
    return <input data-testid="probe" />
  }
  const render = async (open: boolean): Promise<void> => {
    await act(async () => {
      root!.render(
        <c.Root open={open} unmountOnExit={unmountOnExit}>
          <c.Content><Probe /></c.Content>
        </c.Root>,
      )
    })
    // presence 的收起回调排在下一拍
    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })
  }
  return {
    setOpen: render,
    part: (name: string) => document.querySelector<HTMLElement>(`[data-scope="${c.scope}"][data-part="${name}"]`),
    probe: () => document.querySelector<HTMLInputElement>('[data-testid="probe"]'),
    mounts: () => mounts,
  }
}

describe.each(CASES)('$name 内容挂卸', (c) => {
  it('缺省：没打开过不渲染，打开即挂，退场播完就卸，再打开重新挂', async () => {
    const m = mount(c)
    await m.setOpen(false)
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
    await m.setOpen(false)
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
