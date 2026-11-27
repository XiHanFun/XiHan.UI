// 颜色选择器的 lazyMount / unmountOnExit 要在真浏览器里验：打开前面板不在；
// Enter 展开那一帧面板才挂上，焦点照样进到面板里；退场动画得真播完才卸；inline 常驻形态不受影响。
import type { Root } from 'react-dom/client'
import type { XhColorPickerRootProps } from '../../src'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhColorPickerRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

let root: Root | null = null
let host: HTMLElement | null = null

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

afterEach(async () => {
  await inAct(() => root?.unmount())
  root = null
  host?.remove()
  host = null
})

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='color-picker'][data-part='${name}']`)
}

const areas = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='color-picker'][data-part='saturation-area']`)]

async function render(props: XhColorPickerRootProps): Promise<(next: XhColorPickerRootProps) => Promise<void>> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(<XhColorPickerRoot label="主题色" defaultValue="#3366ff" {...props} />))
  return next => inAct(() => root!.render(<XhColorPickerRoot label="主题色" defaultValue="#3366ff" {...next} />))
}

describe('颜色选择器 lazyMount', () => {
  it('第一次展开前面板不在；Enter 展开后面板挂上、焦点进到面板里，收起后留着', async () => {
    await render({ lazyMount: true })
    expect(part('content')).not.toBeNull()
    expect(areas()).toHaveLength(0)

    part('trigger')!.focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => part('content')!.contains(document.activeElement)).toBe(true)
    expect(areas()).toHaveLength(1)

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(areas()).toHaveLength(1)
  })

  it('inline 常驻形态：面板首屏就在', async () => {
    await render({ inline: true, lazyMount: true, unmountOnExit: true })
    expect(areas()).toHaveLength(1)
  })
})

describe('颜色选择器 unmountOnExit', () => {
  it('退场播完才撤面板，下次展开重新铺上', async () => {
    const rerender = await render({ unmountOnExit: true, open: true })
    await expect.poll(() => areas().length).toBe(1)
    const first = areas()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    await rerender({ unmountOnExit: true, open: false })
    // 退场正在播：面板还在
    expect(areas()[0]).toBe(first)
    await expect.poll(() => areas().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    await rerender({ unmountOnExit: true, open: true })
    await expect.poll(() => areas().length).toBe(1)
    expect(areas()[0]).not.toBe(first)
  })
})
