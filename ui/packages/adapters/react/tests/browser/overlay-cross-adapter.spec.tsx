// 同一个页面里 React 与 Web Components 的浮层共用一个层级栈：谁后打开谁在上面，焦点与 Esc 只作用在最上层；
// 对话框打开之后再开另一端的 popover、菜单与提示，它们压在对话框之上。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../../web-components/src/define'
import {
  XhDialogBody,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhMenuRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

beforeAll(() => defineXhElements())

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
const roots: Root[] = []
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
  for (let i = 0; i < 4; i++) {
    await inAct(async () => Promise.resolve())
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

afterEach(async () => {
  for (const root of roots.splice(0))
    await inAct(() => root.unmount())
  host?.remove()
  host = null
})

type XhElement = HTMLElement & { open?: boolean, updateComplete: Promise<unknown> }

/** 浮层内容所在定位层的 z-index。 */
function layerOf(content: Element): number {
  const positioner = content.closest('[data-part="positioner"]') ?? content
  return Number(getComputedStyle(positioner).zIndex)
}

/** 元素中心那一点命中的是不是它自己（或它里面的节点）。 */
function isOnTop(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
  return hit !== null && element.contains(hit)
}

async function mountReact(target: Element, node: ReactNode): Promise<Root> {
  const root = createRoot(target)
  roots.push(root)
  await inAct(() => root.render(node))
  await settle()
  return root
}

const WC_DIALOG = `<xh-dialog data-test="wc-dialog">
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner"><div data-xh-part="content">
    <h2 data-xh-part="title">内层</h2>
    <button type="button" data-test="wc-confirm">确定</button>
    <div data-test="react-mount"></div>
  </div></div>
</xh-dialog>`

const WC_OVERLAYS = `
  <xh-popover placement="bottom-start" data-test="wc-popover">
    <button data-xh-part="trigger">浮层</button>
    <div data-xh-part="positioner"><div data-xh-part="content"><button type="button" data-test="wc-popover-target">浮层里的按钮</button></div></div>
  </xh-popover>
  <xh-menu data-test="wc-menu">
    <button data-xh-part="trigger">操作</button>
    <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="item" value="new" data-test="wc-menu-target">新建文件</div></div></div>
  </xh-menu>
  <xh-tooltip data-test="wc-tooltip">
    <button data-xh-part="trigger">保存</button>
    <div data-xh-part="positioner"><div data-xh-part="content" data-test="wc-tooltip-target">写入草稿箱</div></div>
  </xh-tooltip>`

function ReactDialog({ children }: { children: ReactNode }): ReactNode {
  return (
    <XhDialogRoot defaultOpen>
      <XhDialogContent data-test="react-content">
        <XhDialogTitle>外层</XhDialogTitle>
        <XhDialogBody>{children}</XhDialogBody>
      </XhDialogContent>
    </XhDialogRoot>
  )
}

function reactContent(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-test="react-content"]')!
}

function wcContent(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="dialog"][data-part="content"]:has([data-test="wc-confirm"])')!
}

/** 打开一个 WC 对话框：受控写法，作者按 open-change 回写 open。 */
async function openWcDialog(dialog: XhElement): Promise<void> {
  await dialog.updateComplete
  dialog.addEventListener('open-change', (event) => {
    dialog.open = (event as CustomEvent<{ open: boolean }>).detail.open
  })
  dialog.open = true
  await dialog.updateComplete
  await settle()
}

async function mountWcDialog(): Promise<XhElement> {
  host = document.createElement('div')
  host.innerHTML = WC_DIALOG
  document.body.append(host)
  const dialog = host.querySelector<XhElement>('[data-test="wc-dialog"]')!
  await openWcDialog(dialog)
  return dialog
}

describe('react 对话框里开 Web Components 对话框', () => {
  it('后开的 WC 对话框在上面，焦点在它里面，Esc 只关它', async () => {
    host = document.createElement('div')
    document.body.append(host)
    await mountReact(host, <ReactDialog><div dangerouslySetInnerHTML={{ __html: WC_DIALOG }} /></ReactDialog>)
    const inner = document.querySelector<XhElement>('[data-test="wc-dialog"]')!
    await openWcDialog(inner)

    expect(layerOf(wcContent())).toBeGreaterThan(layerOf(reactContent()))
    expect(isOnTop(document.querySelector('[data-test="wc-confirm"]')!)).toBe(true)
    expect(wcContent().contains(document.activeElement)).toBe(true)
    await userEvent.tab()
    await userEvent.tab()
    expect(wcContent().contains(document.activeElement)).toBe(true)

    await userEvent.keyboard('{Escape}')
    await settle()
    expect(inner.open).toBe(false)
    expect(reactContent().getAttribute('data-state')).toBe('open')
  })
})

describe('web Components 对话框里开 React 对话框', () => {
  it('后开的 React 对话框在上面，焦点在它里面，Esc 只关它', async () => {
    const outer = await mountWcDialog()
    await mountReact(document.querySelector('[data-test="react-mount"]')!, <ReactDialog><button type="button" data-test="react-confirm">确定</button></ReactDialog>)

    expect(layerOf(reactContent())).toBeGreaterThan(layerOf(wcContent()))
    expect(isOnTop(document.querySelector('[data-test="react-confirm"]')!)).toBe(true)
    expect(reactContent().contains(document.activeElement)).toBe(true)
    await userEvent.tab()
    await userEvent.tab()
    expect(reactContent().contains(document.activeElement)).toBe(true)

    await userEvent.keyboard('{Escape}')
    await settle()
    expect(document.querySelector('[data-test="react-content"]')?.getAttribute('data-state') ?? 'closed').not.toBe('open')
    expect(outer.open).toBe(true)
  })
})

describe('对话框打开之后再开的非模态浮层压在对话框之上', () => {
  it('react 对话框里逐个打开 WC popover、菜单与提示', async () => {
    host = document.createElement('div')
    document.body.append(host)
    await mountReact(host, <ReactDialog><div dangerouslySetInnerHTML={{ __html: WC_OVERLAYS }} /></ReactDialog>)
    const dialogLayer = layerOf(reactContent())
    for (const kind of ['popover', 'menu', 'tooltip']) {
      const overlay = document.querySelector<XhElement>(`[data-test="wc-${kind}"]`)!
      await overlay.updateComplete
      overlay.open = true
      await overlay.updateComplete
      await settle()
      const target = document.querySelector<HTMLElement>(`[data-test="wc-${kind}-target"]`)!
      expect(layerOf(target.closest('[data-part="content"]') ?? target), kind).toBeGreaterThan(dialogLayer)
      expect(isOnTop(target), kind).toBe(true)
      overlay.open = false
      await overlay.updateComplete
      await settle()
    }
  })

  it('wC 对话框里逐个打开 React popover、菜单与提示', async () => {
    await mountWcDialog()
    const mount = document.querySelector('[data-test="react-mount"]')!
    const render = (which: 'popover' | 'menu' | 'tooltip' | null): ReactNode => (
      <div>
        <XhPopoverRoot open={which === 'popover'}>
          <XhPopoverTrigger>浮层</XhPopoverTrigger>
          <XhPopoverPositioner><XhPopoverContent><button type="button" data-test="react-popover-target">浮层里的按钮</button></XhPopoverContent></XhPopoverPositioner>
        </XhPopoverRoot>
        <XhMenuRoot open={which === 'menu'} collection={[{ value: 'new', label: '新建文件' }]} />
        <XhTooltipRoot open={which === 'tooltip'}>
          <XhTooltipTrigger>保存</XhTooltipTrigger>
          <XhTooltipPositioner><XhTooltipContent data-test="react-tooltip-target">写入草稿箱</XhTooltipContent></XhTooltipPositioner>
        </XhTooltipRoot>
      </div>
    )
    const root = await mountReact(mount, render(null))
    const dialogLayer = layerOf(wcContent())
    for (const kind of ['popover', 'menu', 'tooltip'] as const) {
      await inAct(() => root.render(render(kind)))
      await settle()
      const target = kind === 'menu'
        ? document.querySelector<HTMLElement>('[data-scope="menu"][data-part="item"]')!
        : document.querySelector<HTMLElement>(`[data-test="react-${kind}-target"]`)!
      expect(layerOf(target.closest('[data-part="content"]') ?? target), kind).toBeGreaterThan(dialogLayer)
      expect(isOnTop(target), kind).toBe(true)
      await inAct(() => root.render(render(null)))
      await settle()
    }
  })
})
