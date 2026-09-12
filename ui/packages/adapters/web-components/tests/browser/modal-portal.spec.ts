import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

type OverlayScope = 'dialog' | 'drawer'

interface OverlayElement extends HTMLElement {
  open?: boolean
}

interface OverlayFixture {
  readonly element: OverlayElement
  readonly backdrop: HTMLElement
  readonly positioner: HTMLElement
  readonly backdropParent: ParentNode
  readonly backdropPrevious: ChildNode | null
  readonly positionerParent: ParentNode
  readonly positionerPrevious: ChildNode | null
}

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await Promise.resolve()
}

function mount(scope: OverlayScope, attrs = 'open'): OverlayFixture {
  const stage = document.createElement('section')
  // 三种常见陷阱同时存在；Portal 后浮层不得再是这棵子树的后代。
  stage.style.cssText = 'transform:translateZ(0);contain:paint;overflow:hidden'
  stage.innerHTML = scope === 'dialog'
    ? `<xh-dialog ${attrs}>
        <i data-before></i><div data-xh-part="backdrop"></div>
        <div data-xh-part="positioner"><div data-xh-part="content"><h2 data-xh-part="title">设置</h2></div></div>
      </xh-dialog>`
    : `<xh-drawer ${attrs}>
        <div data-xh-part="root"><i data-before></i><div data-xh-part="backdrop"></div>
          <div data-xh-part="positioner"><div data-xh-part="content"><h2 data-xh-part="title">设置</h2></div></div>
        </div>
      </xh-drawer>`
  document.body.append(stage)
  const element = stage.querySelector<OverlayElement>(`xh-${scope}`)!
  const backdrop = element.querySelector<HTMLElement>('[data-xh-part="backdrop"]')!
  const positioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
  return {
    element,
    backdrop,
    positioner,
    backdropParent: backdrop.parentNode!,
    backdropPrevious: backdrop.previousSibling,
    positionerParent: positioner.parentNode!,
    positionerPrevious: positioner.previousSibling,
  }
}

function disableExitAnimation(scope: OverlayScope): void {
  const style = document.createElement('style')
  style.dataset.testModalPortalExit = scope
  style.textContent = `[data-scope='${scope}'][data-state='closed'] { animation: none !important; }`
  document.head.append(style)
}

afterEach(() => {
  document.body.innerHTML = ''
  document.head.querySelectorAll('style[data-test-modal-portal-exit]').forEach(style => style.remove())
  setDiagnosticsLevel('warn')
})

beforeEach(() => {
  // 此处故意把浮层放进陷阱祖先来验物理脱离；不让旧的 Light-DOM 诊断淹没此回归输出。
  setDiagnosticsLevel('silent')
})

describe.each(['dialog', 'drawer'] as const)('wc %s 视口模态 Portal', (scope) => {
  it('双根脱离 transform/contain/overflow，关闭后各自精确回到作者位置', async () => {
    const f = mount(scope)
    await settle()

    const shell = f.backdrop.parentElement!
    expect(shell).toBe(f.positioner.parentElement)
    expect(shell.dataset.xhPortalShell).toBe('')
    expect(shell.parentElement?.id).toBe('xh-portal-root')
    expect(f.backdrop.closest('section')).toBeNull()
    expect(f.positioner.closest('section')).toBeNull()
    expect(getComputedStyle(f.backdrop).position).toBe('fixed')
    expect(getComputedStyle(f.positioner).position).toBe('fixed')

    disableExitAnimation(scope)
    f.element.open = false
    await settle()

    expect(f.backdrop.parentNode).toBe(f.backdropParent)
    expect(f.backdrop.previousSibling).toBe(f.backdropPrevious)
    expect(f.positioner.parentNode).toBe(f.positionerParent)
    expect(f.positioner.previousSibling).toBe(f.positionerPrevious)
    expect(shell.isConnected).toBe(false)
  })

  it('非模态保持 Light DOM 原位，且作者 backdrop 继续隐藏', async () => {
    const f = mount(scope, 'open modal="false"')
    await settle()

    expect(f.backdrop.parentNode).toBe(f.backdropParent)
    expect(f.positioner.parentNode).toBe(f.positionerParent)
    expect(f.backdrop.style.display).toBe('none')
    expect(document.querySelector('[data-xh-portal-shell]')).toBeNull()
  })
})

describe('wc Drawer 局部坐标', () => {
  it('contained 抽屉不领取视口 Portal', async () => {
    const f = mount('drawer', 'open contained')
    await settle()

    expect(f.backdrop.parentNode).toBe(f.backdropParent)
    expect(f.positioner.parentNode).toBe(f.positionerParent)
    expect(document.querySelector('[data-xh-portal-shell]')).toBeNull()
  })
})
