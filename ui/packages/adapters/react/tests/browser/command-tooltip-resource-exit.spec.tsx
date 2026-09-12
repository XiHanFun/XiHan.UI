import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { getLayerRegistry } from '@xihan-ui/core'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhCommandContent,
  XhCommandInput,
  XhCommandList,
  XhCommandRoot,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Candidate = 'command' | 'tooltip'
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
  await inAct(async () => {
    for (let i = 0; i < 4; i++)
      await Promise.resolve()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  })
}

function tree(kind: Candidate, open: boolean): ReactNode {
  if (kind === 'command') {
    return (
      <XhCommandRoot open={open} modal>
        <XhCommandContent>
          <XhCommandInput />
          <XhCommandList />
        </XhCommandContent>
      </XhCommandRoot>
    )
  }
  return (
    <XhTooltipRoot open={open}>
      <XhTooltipTrigger>说明</XhTooltipTrigger>
      <XhTooltipPositioner><XhTooltipContent>提示内容</XhTooltipContent></XhTooltipPositioner>
    </XhTooltipRoot>
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

describe.each(['command', 'tooltip'] as const)('react %s 真实退场资源', (scope) => {
  it('有限动画全部完成前保留 Layer，逻辑关闭立即失活，完成后释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-command-tooltip-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='${scope}'][data-part='content'][data-state='closed'],
      [data-scope='${scope}'][data-part='backdrop'][data-state='closed'] {
        animation: test-command-tooltip-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const outside = document.createElement('button')
    document.body.append(outside)
    const setOpen = await mount(scope)
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    await setOpen(false)
    const content = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='content']`)!
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    if (scope === 'command') {
      expect(document.body.style.overflow).toBe('hidden')
      expect(outside.inert).toBe(true)
    }
    const animations = [
      content,
      document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='backdrop']`),
    ]
      .flatMap(node => node?.getAnimations() ?? [])
      .filter(animation => (animation as CSSAnimation).animationName === 'test-command-tooltip-exit')
    expect(animations).toHaveLength(scope === 'command' ? 2 : 1)

    await inAct(() => animations[0]!.finish())
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(scope === 'command' ? 1 : 0)
    if (scope === 'command') {
      expect(document.body.style.overflow).toBe('hidden')
      expect(outside.inert).toBe(true)
      await inAct(() => animations[1]!.finish())
      await settle()
      expect(getLayerRegistry(document).list()).toHaveLength(0)
      expect(document.body.style.overflow).not.toBe('hidden')
      expect(outside.inert).toBe(false)
    }
  })
})
