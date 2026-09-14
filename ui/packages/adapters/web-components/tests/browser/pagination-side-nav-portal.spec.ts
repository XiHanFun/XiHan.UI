import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface Updatable extends HTMLElement {
  updateComplete: Promise<unknown>
}

interface SideNavElement extends Updatable {
  collection: Array<{ value: string, children: Array<{ value: string }> }>
}

async function settle(): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    for (const element of document.querySelectorAll<Updatable>('xh-pagination, xh-side-nav'))
      await element.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function expectPortaled(root: HTMLElement, stage: HTMLElement): HTMLElement {
  const shell = root.parentElement!
  expect(shell.dataset.xhPortalShell).toBe('')
  expect(shell.parentElement?.id).toBe('xh-portal-root')
  expect(stage.contains(root)).toBe(false)
  return shell
}

function expectRestored(root: HTMLElement, parent: Node | null, previous: ChildNode | null, next: ChildNode | null): void {
  expect(root.parentNode).toBe(parent)
  expect(root.previousSibling).toBe(previous)
  expect(root.nextSibling).toBe(next)
}

beforeEach(() => {
  setDiagnosticsLevel('silent')
  const style = document.createElement('style')
  style.dataset.testCore14Portal = ''
  style.textContent = `[data-scope='pagination'][data-state='closed'], [data-scope='select'][data-state='closed'], [data-scope='side-nav'][data-state='closed'] { animation: none !important; transition: none !important; }`
  document.head.append(style)
})

afterEach(() => {
  document.body.innerHTML = ''
  document.head.querySelectorAll('style[data-test-core14-portal]').forEach(style => style.remove())
  setDiagnosticsLevel('warn')
})

describe('wc pagination 物理 Portal', () => {
  it('仅在省略位展开时搬迁 positioner，关闭后精确归位', async () => {
    const stage = document.createElement('section')
    stage.style.cssText = 'contain:paint;overflow:hidden'
    stage.innerHTML = `<xh-pagination count="2000" default-page="100">
      <nav data-xh-part="root">
        <button data-xh-part="item" value="100">100</button>
        <button data-xh-part="ellipsis-trigger" side="start">更多</button><i data-before></i>
        <div data-xh-part="positioner"><div data-xh-part="content"></div></div><i data-after></i>
      </nav>
    </xh-pagination>`
    const element = stage.firstElementChild as Updatable
    const trigger = element.querySelector<HTMLElement>('[data-xh-part="ellipsis-trigger"]')!
    const positioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    const originalParent = positioner.parentNode
    const originalPrevious = positioner.previousSibling
    const originalNext = positioner.nextSibling
    document.body.append(stage)
    await settle()
    expect(stage.contains(positioner)).toBe(true)

    trigger.click()
    await settle()
    const shell = expectPortaled(positioner, stage)

    trigger.click()
    await settle()
    expectRestored(positioner, originalParent, originalPrevious, originalNext)
    expect(shell.isConnected).toBe(false)
  })

  it('每页条数 Select 的自建 positioner 使用独立锚定租约', async () => {
    const stage = document.createElement('section')
    stage.style.cssText = 'contain:paint;overflow:hidden'
    stage.innerHTML = `<xh-pagination count="196" default-page-size="20">
      <nav data-xh-part="root"><div data-xh-part="page-size-select"></div><button data-xh-part="item" value="1">1</button></nav>
    </xh-pagination>`
    document.body.append(stage)
    await settle()
    const element = stage.firstElementChild as Updatable
    const trigger = element.querySelector<HTMLElement>('[data-scope="select"][data-part="trigger"]')!
    const positioner = element.querySelector<HTMLElement>('[data-scope="select"][data-part="positioner"]')!
    const originalParent = positioner.parentNode
    const originalPrevious = positioner.previousSibling
    const originalNext = positioner.nextSibling

    trigger.click()
    await settle()
    const shell = expectPortaled(positioner, stage)

    trigger.click()
    await settle()
    expectRestored(positioner, originalParent, originalPrevious, originalNext)
    expect(shell.isConnected).toBe(false)
  })
})

describe('wc side-nav 物理 Portal', () => {
  function fixture(collapsed = true): { stage: HTMLElement, element: SideNavElement, trigger: HTMLElement, positioner: HTMLElement } {
    const stage = document.createElement('section')
    stage.style.cssText = 'contain:paint;overflow:hidden'
    stage.innerHTML = `<xh-side-nav${collapsed ? ' collapsed' : ''}>
      <nav data-xh-part="root"><ul data-xh-part="list"><li data-xh-part="branch" value="products">
        <button data-xh-part="branch-trigger">产品</button><i data-before></i>
        <div data-xh-part="positioner"><ul data-xh-part="branch-content"><li data-xh-part="item"><a data-xh-part="link" value="product-a">产品一</a></li></ul></div><i data-after></i>
      </li></ul></nav>
    </xh-side-nav>`
    const element = stage.firstElementChild as SideNavElement
    element.collection = [{ value: 'products', children: [{ value: 'product-a' }] }]
    return {
      stage,
      element,
      trigger: element.querySelector<HTMLElement>('[data-xh-part="branch-trigger"]')!,
      positioner: element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!,
    }
  }

  it('折叠顶层分支 popout 展开时搬迁，关闭后精确归位', async () => {
    const f = fixture()
    const originalParent = f.positioner.parentNode
    const originalPrevious = f.positioner.previousSibling
    const originalNext = f.positioner.nextSibling
    document.body.append(f.stage)
    await settle()

    f.trigger.click()
    await settle()
    const shell = expectPortaled(f.positioner, f.stage)

    f.trigger.click()
    await settle()
    expectRestored(f.positioner, originalParent, originalPrevious, originalNext)
    expect(shell.isConnected).toBe(false)
  })

  it('非折叠分支保持行内结构，不创建 Portal', async () => {
    const f = fixture(false)
    const originalParent = f.positioner.parentNode
    document.body.append(f.stage)
    await settle()
    f.trigger.click()
    await settle()

    expect(f.positioner.parentNode).toBe(originalParent)
    expect(f.positioner.closest('[data-xh-portal-shell]')).toBeNull()
  })
})
