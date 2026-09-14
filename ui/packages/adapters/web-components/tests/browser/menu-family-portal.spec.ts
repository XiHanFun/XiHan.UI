import { getLayerRegistry, setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

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

async function settle(): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    for (const element of document.querySelectorAll<OverlayElement>('xh-context-menu,xh-menu,xh-menubar'))
      await element.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function close(family: Family, element: OverlayElement): void {
  if (family === 'menubar')
    element.value = null
  else
    element.open = false
}

function finiteAnimations(node: HTMLElement): Animation[] {
  return node.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
}

beforeEach(() => setDiagnosticsLevel('silent'))

afterEach(() => {
  document.body.innerHTML = ''
  document.head.querySelectorAll('style[data-test-menu-family-portal]').forEach(style => style.remove())
  setDiagnosticsLevel('warn')
})

describe.each(['context-menu', 'menu', 'menubar'] as const)('wc %s 根 Portal', (family) => {
  it('脱离裁切祖先并桥接视觉环境，退场完成前持有租约，随后精确归位', async () => {
    const style = document.createElement('style')
    style.dataset.testMenuFamilyPortal = ''
    style.textContent = `
      @keyframes test-menu-portal-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='${family}'][data-part='content'][data-state='closed'] {
        animation: test-menu-portal-exit 60s linear forwards;
      }
    `
    document.head.append(style)

    const stage = document.createElement('section')
    stage.dataset.theme = 'dark'
    stage.dataset.density = 'compact'
    stage.dir = 'rtl'
    stage.style.cssText = 'transform:translateZ(0);contain:paint;overflow:hidden;--test-menu-accent:rgb(1, 2, 3)'
    stage.innerHTML = markup(family)
    const element = stage.firstElementChild as OverlayElement
    const positioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    const content = positioner.querySelector<HTMLElement>('[data-xh-part="content"]')!
    const originalParent = positioner.parentNode
    const originalPrevious = positioner.previousSibling
    const originalNext = positioner.nextSibling
    document.body.append(stage)

    await settle()
    const shell = positioner.parentElement!
    expect(shell.dataset.xhPortalShell).toBe('')
    expect(shell.parentElement?.id).toBe('xh-portal-root')
    expect(stage.contains(positioner)).toBe(false)
    expect(positioner.contains(content)).toBe(true)
    expect(shell.dataset.theme).toBe('dark')
    expect(shell.dataset.density).toBe('compact')
    expect(shell.dir).toBe('rtl')
    expect(shell.style.getPropertyValue('--test-menu-accent')).toBe('rgb(1, 2, 3)')

    close(family, element)
    await settle()
    expect(positioner.parentElement).toBe(shell)
    const animations = finiteAnimations(content)
    expect(animations).toHaveLength(1)

    animations[0]!.finish()
    await settle()
    expect(positioner.parentNode).toBe(originalParent)
    expect(positioner.previousSibling).toBe(originalPrevious)
    expect(positioner.nextSibling).toBe(originalNext)
    expect(shell.isConnected).toBe(false)
  })
})

describe('wc Menubar 多 positioner Portal', () => {
  it('换面时新旧 content 各持有租约，并复用 Headless 的单一行为 Layer', async () => {
    const style = document.createElement('style')
    style.dataset.testMenuFamilyPortal = ''
    style.textContent = `
      @keyframes test-menubar-switch-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='menubar'][data-part='content'][data-state='closed'] {
        animation: test-menubar-switch-exit 60s linear forwards;
      }
    `
    document.head.append(style)

    const stage = document.createElement('section')
    stage.innerHTML = `<xh-menubar value="file"><div data-xh-part="root">
      <button data-xh-part="trigger" value="file">文件</button>
      <button data-xh-part="trigger" value="edit">编辑</button>
      <div data-xh-part="positioner" value="file"><div data-xh-part="content" value="file"><div data-xh-part="item" value="new">新建</div></div></div>
      <div data-xh-part="positioner" value="edit"><div data-xh-part="content" value="edit"><div data-xh-part="item" value="copy">复制</div></div></div>
    </div></xh-menubar>`
    const element = stage.firstElementChild as OverlayElement
    const filePositioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"][value="file"]')!
    const editPositioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"][value="edit"]')!
    const fileContent = filePositioner.querySelector<HTMLElement>('[data-xh-part="content"]')!
    const editContent = editPositioner.querySelector<HTMLElement>('[data-xh-part="content"]')!
    const fileParent = filePositioner.parentNode
    const editParent = editPositioner.parentNode
    document.body.append(stage)

    await settle()
    expect(filePositioner.parentElement?.dataset.xhPortalShell).toBe('')
    expect(editPositioner.parentNode).toBe(editParent)
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    element.value = 'edit'
    await settle()
    expect(filePositioner.parentElement?.dataset.xhPortalShell).toBe('')
    expect(editPositioner.parentElement?.dataset.xhPortalShell).toBe('')
    expect(document.querySelectorAll('#xh-portal-root > [data-xh-portal-shell]')).toHaveLength(2)
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    finiteAnimations(fileContent)[0]!.finish()
    await settle()
    expect(filePositioner.parentNode).toBe(fileParent)
    expect(editPositioner.parentElement?.dataset.xhPortalShell).toBe('')
    // 物理租约按 content 独立完成，Menubar 行为层仍由 Headless 跨换面复用。
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    element.value = null
    await settle()
    finiteAnimations(editContent)[0]!.finish()
    await settle()
    expect(editPositioner.parentNode).toBe(editParent)
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
