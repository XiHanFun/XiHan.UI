import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface ImageViewerElement extends HTMLElement {
  open?: boolean
}

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await Promise.resolve()
}

function disableExitAnimation(): void {
  const style = document.createElement('style')
  style.dataset.testImageViewerPortalExit = ''
  style.textContent = `[data-scope='image-viewer'][data-state='closed'] { animation: none !important; }`
  document.head.append(style)
}

function installLongExitAnimation(): void {
  const style = document.createElement('style')
  style.dataset.testImageViewerPortalAnimation = ''
  style.textContent = `
    @keyframes test-image-viewer-portal-fade { from { opacity: 1 } to { opacity: 0 } }
    @keyframes test-image-viewer-portal-move { from { translate: 0 0 } to { translate: 0 8px } }
    [data-scope='image-viewer'][data-part='content'][data-state='closed'] {
      animation: test-image-viewer-portal-fade 60s linear forwards, test-image-viewer-portal-move 60s linear forwards;
    }
    [data-scope='image-viewer'][data-part='backdrop'][data-state='closed'] {
      animation: test-image-viewer-portal-fade 60s linear forwards;
    }
  `
  document.head.append(style)
}

function finiteAnimations(node: HTMLElement): Animation[] {
  return node.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
}

beforeEach(() => {
  // 该 fixture 故意制造层叠与裁剪陷阱；Portal 的断言不需要旧 Light-DOM 诊断噪声。
  setDiagnosticsLevel('silent')
})

afterEach(() => {
  document.body.innerHTML = ''
  document.head.querySelectorAll('style[data-test-image-viewer-portal-exit]').forEach(style => style.remove())
  document.head.querySelectorAll('style[data-test-image-viewer-portal-animation]').forEach(style => style.remove())
  setDiagnosticsLevel('warn')
})

describe('wc ImageViewer 视口 Portal', () => {
  it('将 backdrop 与 positioner 一起脱离陷阱祖先，并在真实关闭后精确归位', async () => {
    const stage = document.createElement('section')
    stage.style.cssText = 'transform:translateZ(0);contain:paint;overflow:hidden'
    stage.innerHTML = `<xh-image-viewer open>
      <i data-before></i><div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="viewport"><img data-xh-part="image"></div></div></div>
    </xh-image-viewer>`
    document.body.append(stage)
    const element = stage.querySelector<ImageViewerElement>('xh-image-viewer')!
    const backdrop = element.querySelector<HTMLElement>('[data-xh-part="backdrop"]')!
    const positioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    const backdropParent = backdrop.parentNode
    const backdropPrevious = backdrop.previousSibling
    const positionerParent = positioner.parentNode
    const positionerPrevious = positioner.previousSibling
    await settle()

    const shell = backdrop.parentElement!
    expect(shell).toBe(positioner.parentElement)
    expect(shell.dataset.xhPortalShell).toBe('')
    expect(shell.parentElement?.id).toBe('xh-portal-root')
    expect(backdrop.closest('section')).toBeNull()
    expect(positioner.closest('section')).toBeNull()
    expect(getComputedStyle(backdrop).position).toBe('fixed')
    expect(getComputedStyle(positioner).position).toBe('fixed')

    disableExitAnimation()
    element.open = false
    await settle()

    expect(backdrop.parentNode).toBe(backdropParent)
    expect(backdrop.previousSibling).toBe(backdropPrevious)
    expect(positioner.parentNode).toBe(positionerParent)
    expect(positioner.previousSibling).toBe(positionerPrevious)
    expect(shell.isConnected).toBe(false)
  })

  it('内容与遮罩的全部有限动画完成前保持 Portal，完成后才精确归位', async () => {
    installLongExitAnimation()
    const stage = document.createElement('section')
    stage.innerHTML = `<xh-image-viewer open>
      <i data-before></i><div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="viewport"><img data-xh-part="image"></div></div></div>
    </xh-image-viewer>`
    document.body.append(stage)
    const element = stage.querySelector<ImageViewerElement>('xh-image-viewer')!
    const backdrop = element.querySelector<HTMLElement>('[data-xh-part="backdrop"]')!
    const positioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    const content = positioner.querySelector<HTMLElement>('[data-xh-part="content"]')!
    const backdropParent = backdrop.parentNode
    const backdropPrevious = backdrop.previousSibling
    const positionerParent = positioner.parentNode
    const positionerPrevious = positioner.previousSibling
    await settle()

    const shell = backdrop.parentElement!
    expect(shell).toBe(positioner.parentElement)
    element.open = false
    await settle()

    const contentAnimations = finiteAnimations(content)
    const backdropAnimations = finiteAnimations(backdrop)
    expect(contentAnimations).toHaveLength(2)
    expect(backdropAnimations).toHaveLength(1)

    contentAnimations[0]!.finish()
    await settle()
    expect(backdrop.parentElement).toBe(shell)
    expect(positioner.parentElement).toBe(shell)

    contentAnimations[1]!.finish()
    await settle()
    expect(backdrop.parentElement).toBe(shell)
    expect(positioner.parentElement).toBe(shell)

    backdropAnimations[0]!.finish()
    await settle()
    expect(backdrop.parentNode).toBe(backdropParent)
    expect(backdrop.previousSibling).toBe(backdropPrevious)
    expect(positioner.parentNode).toBe(positionerParent)
    expect(positioner.previousSibling).toBe(positionerPrevious)
    expect(shell.isConnected).toBe(false)
  })
})
