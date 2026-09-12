import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface CommandElement extends HTMLElement {
  open: boolean
  updateComplete: Promise<unknown>
}

async function settle(): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    for (const element of document.querySelectorAll<CommandElement>('xh-command'))
      await element.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function mount(modal = true): {
  stage: HTMLElement
  element: CommandElement
  backdrop: HTMLElement
  positioner: HTMLElement
} {
  const stage = document.createElement('section')
  stage.style.cssText = 'transform:translateZ(0);contain:paint;overflow:hidden'
  stage.innerHTML = `<xh-command open modal="${modal}">
    <button data-xh-part="trigger">命令</button><i data-before></i>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner"><div data-xh-part="content">
      <input data-xh-part="input"><div data-xh-part="list"></div>
    </div></div><i data-after></i>
  </xh-command>`
  document.body.append(stage)
  const element = stage.firstElementChild as CommandElement
  return {
    stage,
    element,
    backdrop: element.querySelector<HTMLElement>('[data-xh-part="backdrop"]')!,
    positioner: element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!,
  }
}

beforeEach(() => setDiagnosticsLevel('silent'))

afterEach(() => {
  document.body.innerHTML = ''
  document.head.querySelectorAll('style[data-test-command-portal]').forEach(style => style.remove())
  setDiagnosticsLevel('warn')
})

describe('wc command 视口 Portal', () => {
  it('模态双根脱离裁剪祖先，真实退场完成后精确归位', async () => {
    const style = document.createElement('style')
    style.dataset.testCommandPortal = ''
    style.textContent = `
      @keyframes test-command-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='command'][data-state='closed'] { animation: test-command-exit 60s linear forwards; }
    `
    document.head.append(style)
    const f = mount()
    const backdropParent = f.backdrop.parentNode
    const backdropPrevious = f.backdrop.previousSibling
    const positionerParent = f.positioner.parentNode
    const positionerPrevious = f.positioner.previousSibling
    await settle()

    const shell = f.backdrop.parentElement!
    expect(shell).toBe(f.positioner.parentElement)
    expect(shell.dataset.xhPortalShell).toBe('')
    expect(shell.parentElement?.id).toBe('xh-portal-root')
    expect(f.stage.contains(f.backdrop)).toBe(false)
    expect(f.stage.contains(f.positioner)).toBe(false)

    f.element.open = false
    await settle()
    expect(f.backdrop.parentElement).toBe(shell)
    expect(f.positioner.parentElement).toBe(shell)
    const animations = [...f.backdrop.getAnimations(), ...f.positioner.querySelector<HTMLElement>('[data-part="content"]')!.getAnimations()]
    expect(animations.length).toBeGreaterThan(0)
    for (const animation of animations)
      animation.finish()
    await settle()

    expect(f.backdrop.parentNode).toBe(backdropParent)
    expect(f.backdrop.previousSibling).toBe(backdropPrevious)
    expect(f.positioner.parentNode).toBe(positionerParent)
    expect(f.positioner.previousSibling).toBe(positionerPrevious)
    expect(shell.isConnected).toBe(false)
  })

  it('非模态只搬迁面板，backdrop 保持原位且隐藏', async () => {
    const f = mount(false)
    const backdropParent = f.backdrop.parentNode
    await settle()

    expect(f.positioner.closest('[data-xh-portal-shell]')).not.toBeNull()
    expect(f.backdrop.parentNode).toBe(backdropParent)
    expect(f.backdrop.style.display).toBe('none')
  })
})
