import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { getLayerRegistry } from '@xihan-ui/core'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerTrigger,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTitle,
  XhHoverCardTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Candidate = 'color-picker' | 'hover-card'

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

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await inAct(async () => Promise.resolve())
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function tree(kind: Candidate, open: boolean): ReactNode {
  if (kind === 'color-picker') {
    return (
      <XhColorPickerRoot open={open} defaultValue="#ff0000">
        <XhColorPickerControl><XhColorPickerTrigger>选择颜色</XhColorPickerTrigger></XhColorPickerControl>
        <XhColorPickerPositioner><XhColorPickerContent /></XhColorPickerPositioner>
      </XhColorPickerRoot>
    )
  }
  return (
    <XhHoverCardRoot open={open}>
      <XhHoverCardTrigger>资料</XhHoverCardTrigger>
      <XhHoverCardPositioner><XhHoverCardContent><XhHoverCardTitle>标题</XhHoverCardTitle></XhHoverCardContent></XhHoverCardPositioner>
    </XhHoverCardRoot>
  )
}

async function mount(kind: Candidate): Promise<(open: boolean) => Promise<void>> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  const render = async (open: boolean): Promise<void> => {
    await inAct(() => root!.render(tree(kind, open)))
    await settle()
  }
  await render(true)
  return render
}

afterEach(async () => {
  if (root)
    await inAct(() => root!.unmount())
  root = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

describe.each(['color-picker', 'hover-card'] as const)('react %s 真实退场资源', (scope) => {
  it('有限动画完成前保留 Layer，逻辑关闭立即失活，完成后释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-color-hover-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='${scope}'][data-part='content'][data-state='closed'] {
        animation: test-color-hover-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const setOpen = await mount(scope)
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    await setOpen(false)
    const content = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='content']`)!
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    const animation = content.getAnimations().find(item => (item as CSSAnimation).animationName === 'test-color-hover-exit')
    expect(animation).toBeDefined()

    animation!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
