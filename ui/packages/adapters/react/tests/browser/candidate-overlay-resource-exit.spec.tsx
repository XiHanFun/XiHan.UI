import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { getLayerRegistry } from '@xihan-ui/core'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxInput,
  XhComboboxPositioner,
  XhComboboxRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Candidate = 'cascader' | 'combobox'

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
  if (kind === 'cascader') {
    return (
      <XhCascaderRoot open={open} collection={[]}>
        <XhCascaderControl><XhCascaderTrigger>选择路径</XhCascaderTrigger></XhCascaderControl>
        <XhCascaderPositioner><XhCascaderContent /></XhCascaderPositioner>
      </XhCascaderRoot>
    )
  }
  return (
    <XhComboboxRoot open={open} collection={[]}>
      <XhComboboxControl><XhComboboxInput /></XhComboboxControl>
      <XhComboboxPositioner><XhComboboxContent /></XhComboboxPositioner>
    </XhComboboxRoot>
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

describe.each(['cascader', 'combobox'] as const)('react %s 真实退场资源', (scope) => {
  it('有限动画完成前保留 Layer，逻辑关闭立即失活，完成后释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-candidate-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='${scope}'][data-part='content'][data-state='closed'] {
        animation: test-candidate-exit 60s linear forwards;
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
    const animation = content.getAnimations().find(item => (item as CSSAnimation).animationName === 'test-candidate-exit')
    expect(animation).toBeDefined()

    animation!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
