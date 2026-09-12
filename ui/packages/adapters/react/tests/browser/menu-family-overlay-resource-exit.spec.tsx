import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { getLayerRegistry } from '@xihan-ui/core'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhContextMenuContent,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuTrigger,
  XhMenubarContent,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarTrigger,
  XhMenuContent,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Family = 'context-menu' | 'menu' | 'menubar'

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

function tree(family: Family, open: boolean): ReactNode {
  if (family === 'context-menu') {
    return (
      <XhContextMenuRoot open={open}>
        <XhContextMenuTrigger>区域</XhContextMenuTrigger>
        <XhContextMenuPositioner><XhContextMenuContent /></XhContextMenuPositioner>
      </XhContextMenuRoot>
    )
  }
  if (family === 'menubar') {
    const value = open ? 'file' : null
    return (
      <XhMenubarRoot value={value}>
        <XhMenubarTrigger value="file">文件</XhMenubarTrigger>
        <XhMenubarPositioner value="file"><XhMenubarContent value="file" /></XhMenubarPositioner>
      </XhMenubarRoot>
    )
  }
  return (
    <XhMenuRoot open={open}>
      <XhMenuTrigger>菜单</XhMenuTrigger>
      <XhMenuPositioner><XhMenuContent /></XhMenuPositioner>
    </XhMenuRoot>
  )
}

async function mount(family: Family): Promise<(open: boolean) => Promise<void>> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  const render = async (open: boolean): Promise<void> => {
    await inAct(() => root!.render(tree(family, open)))
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

describe.each(['context-menu', 'menu', 'menubar'] as const)('react %s 真实退场资源', (scope) => {
  it('退场完成前保留 Layer，重开取消旧退出，最终完成后释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-menu-family-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='${scope}'][data-part='content'][data-state='closed'] {
        animation: test-menu-family-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const setOpen = await mount(scope)
    const original = getLayerRegistry(document).list()[0]
    expect(original).toBeDefined()

    await setOpen(false)
    const content = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='content']`)!
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    const firstExit = content.getAnimations().find(item => (item as CSSAnimation).animationName === 'test-menu-family-exit')
    expect(firstExit).toBeDefined()
    expect(getLayerRegistry(document).list()).toEqual([original])

    await setOpen(true)
    expect(getLayerRegistry(document).list()).toEqual([original])
    firstExit!.cancel()
    await setOpen(false)
    const finalExit = content.getAnimations().find(item => (item as CSSAnimation).animationName === 'test-menu-family-exit')
    expect(finalExit).toBeDefined()
    finalExit!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
