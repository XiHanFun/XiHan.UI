// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

type Family = 'context-menu' | 'menu' | 'menubar'

interface OverlayElement extends HTMLElement {
  open?: boolean
  value?: string | null
  updateComplete: Promise<unknown>
}

defineXhElements()

function markup(family: Family): string {
  if (family === 'context-menu') {
    return `<xh-context-menu open><div data-xh-part="root"><div data-xh-part="trigger">区域</div><i data-before></i><div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="item" value="a">甲</div></div></div><i data-after></i></div></xh-context-menu>`
  }
  if (family === 'menubar') {
    return `<xh-menubar value="file"><div data-xh-part="root"><button data-xh-part="trigger" value="file">文件</button><i data-before></i><div data-xh-part="positioner" value="file"><div data-xh-part="content" value="file"><div data-xh-part="item" value="a">甲</div></div></div><i data-after></i></div></xh-menubar>`
  }
  return `<xh-menu open><button data-xh-part="trigger">菜单</button><i data-before></i><div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="item" value="a">甲</div></div></div><i data-after></i></xh-menu>`
}

async function settle(doc: Document): Promise<void> {
  for (let round = 0; round < 6; round++) {
    await Promise.resolve()
    for (const element of doc.querySelectorAll<OverlayElement>('xh-context-menu,xh-menu,xh-menubar'))
      await element.updateComplete
  }
  await new Promise(resolve => setTimeout(resolve, 0))
}

function close(family: Family, element: OverlayElement): void {
  if (family === 'menubar')
    element.value = null
  else
    element.open = false
}

function fixture(family: Family): {
  stage: HTMLElement
  element: OverlayElement
  positioner: HTMLElement
  content: HTMLElement
  originalParent: Node
  originalPrevious: Node | null
  originalNext: Node | null
} {
  const stage = document.createElement('section')
  stage.dataset.theme = 'dark'
  stage.dataset.density = 'compact'
  stage.innerHTML = markup(family)
  const element = stage.firstElementChild as OverlayElement
  const positioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
  const content = positioner.querySelector<HTMLElement>('[data-xh-part="content"]')!
  const originalParent = positioner.parentNode!
  const originalPrevious = positioner.previousSibling
  const originalNext = positioner.nextSibling
  document.body.append(stage)
  return { stage, element, positioner, content, originalParent, originalPrevious, originalNext }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe.each(['context-menu', 'menu', 'menubar'] as const)('wc %s 根 Portal realm', (family) => {
  it('完整 positioner/content 搬到独占壳，关闭后按占位精确归位', async () => {
    const handles = fixture(family)
    await settle(document)

    const shell = handles.positioner.parentElement!
    expect(shell.dataset.xhPortalShell).toBe('')
    expect(shell.parentElement?.id).toBe('xh-portal-root')
    expect(handles.stage.contains(handles.positioner)).toBe(false)
    expect(handles.positioner.contains(handles.content)).toBe(true)
    expect(handles.content.getAttribute('role')).toBe('menu')
    expect(shell.dataset.theme).toBe('dark')
    expect(shell.dataset.density).toBe('compact')

    close(family, handles.element)
    await settle(document)
    expect(handles.positioner.parentNode).toBe(handles.originalParent)
    expect(handles.positioner.previousSibling).toBe(handles.originalPrevious)
    expect(handles.positioner.nextSibling).toBe(handles.originalNext)
    expect(shell.isConnected).toBe(false)
  })

  it('已打开时 adopt 到 iframe，只在宿主当前 Document 重建租约', async () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const frameDoc = frame.contentDocument!
    const handles = fixture(family)
    await settle(document)
    const oldShell = handles.positioner.parentElement!
    const oldRoot = document.getElementById('xh-portal-root')!

    handles.stage.remove()
    frameDoc.body.append(frameDoc.adoptNode(handles.stage))
    await settle(frameDoc)

    const shell = handles.positioner.parentElement!
    expect(shell.ownerDocument).toBe(frameDoc)
    expect(handles.content.ownerDocument).toBe(frameDoc)
    expect(shell.parentElement).toBe(frameDoc.getElementById('xh-portal-root'))
    expect(oldShell.isConnected).toBe(false)
    expect(oldRoot.querySelector('[data-xh-portal-shell]')).toBeNull()

    close(family, handles.element)
    await settle(frameDoc)
    expect(handles.stage.contains(handles.positioner)).toBe(true)
    frame.remove()
  })
})
