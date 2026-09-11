import type { ContextMenuSelectDetails, MenubarSelectDetails } from '@xihan-ui/headless'
import type { Mock } from 'vitest'
import type { App, VNode } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhContextMenuContent,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSub,
  XhContextMenuSubTrigger,
  XhContextMenuTrigger,
  XhMenubarContent,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSub,
  XhMenubarSubTrigger,
  XhMenubarTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuSub,
  XhMenuSubTrigger,
} from '../../src'

type Family = 'context-menu' | 'menubar'
type Select = (details: ContextMenuSelectDetails | MenubarSelectDetails) => void

// trackHoverIntent 的公开缺省：进入 100ms、离开 300ms。本测试不改参数，真实跨过原关闭时限。
const OPEN_SETTLE = 140
const CLOSE_SETTLE = 380

let app: App | null = null
let host: HTMLElement | null = null

async function settle(delay = 0): Promise<void> {
  await nextTick()
  if (delay > 0)
    await new Promise(resolve => setTimeout(resolve, delay))
  await nextTick()
  await nextTick()
}

function nestedMenu(): VNode[] {
  return [
    h(XhMenuPositioner, null, () => [
      h(XhMenuContent, null, () => [
        h(XhMenuItem, { value: 'share-email' }, () => '邮件'),
        h(XhMenuSub, { value: 'share-im' }, () => [
          h(XhMenuSubTrigger, () => '即时通讯…'),
          h(XhMenuPositioner, null, () => [
            h(XhMenuContent, null, () => [
              h(XhMenuItem, { value: 'share-wecom' }, () => '企业微信'),
              h(XhMenuItem, { value: 'share-dingtalk' }, () => '钉钉'),
            ]),
          ]),
        ]),
      ]),
    ]),
  ]
}

function contextTree(select: Select): VNode {
  return h(XhContextMenuRoot, { defaultOpen: true, onSelect: select }, () => [
    h(XhContextMenuTrigger, () => '右键目标'),
    h(XhContextMenuPositioner, null, () => [
      h(XhContextMenuContent, null, () => [
        h(XhContextMenuSub, { value: 'share' }, () => [
          h(XhContextMenuSubTrigger, () => '发送到…'),
          ...nestedMenu(),
        ]),
      ]),
    ]),
  ])
}

function menubarTree(select: Select): VNode {
  return h(XhMenubarRoot, { defaultValue: 'file', onSelect: select }, () => [
    h(XhMenubarTrigger, { value: 'file' }, () => '文件'),
    h(XhMenubarPositioner, { value: 'file' }, () => [
      h(XhMenubarContent, { value: 'file' }, () => [
        h(XhMenubarSub, { value: 'share' }, () => [
          h(XhMenubarSubTrigger, () => '发送到…'),
          ...nestedMenu(),
        ]),
      ]),
    ]),
  ])
}

async function mountTree(family: Family): Promise<{ select: Mock<Select> }> {
  const select = vi.fn<Select>()
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => family === 'context-menu' ? contextTree(select) : menubarTree(select) })
  app.mount(host)
  await settle()
  return { select }
}

function item(scope: Family | 'menu', value: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    `[data-scope='${scope}'][data-part='item'][data-value='${value}']`,
  )
  if (!element)
    throw new Error(`找不到 ${scope}/${value}`)
  return element
}

function contentOf(value: string): HTMLElement {
  const content = item('menu', value).closest<HTMLElement>(`[data-scope='menu'][data-part='content']`)
  if (!content)
    throw new Error(`找不到 ${value} 所属的 menu content`)
  return content
}

function rootIsOpen(family: Family): boolean {
  if (family === 'context-menu') {
    const content = document.querySelector<HTMLElement>(
      `[data-scope='context-menu'][data-part='content']`,
    )
    return content?.hasAttribute('hidden') === false
  }
  return document.querySelector<HTMLElement>(
    `[data-scope='menubar'][data-part='trigger'][data-value='file']`,
  )?.getAttribute('aria-expanded') === 'true'
}

async function openThroughPointer(family: Family): Promise<{
  outer: HTMLElement
  inner: HTMLElement
  leaf: HTMLElement
}> {
  const outer = item(family, 'share')
  await userEvent.hover(outer)
  await settle(OPEN_SETTLE)
  expect(outer.getAttribute('aria-expanded')).toBe('true')

  const inner = item('menu', 'share-im')
  await userEvent.hover(inner)
  await settle(OPEN_SETTLE)
  expect(inner.getAttribute('aria-expanded')).toBe('true')

  return {
    outer,
    inner,
    leaf: contentOf('share-wecom'),
  }
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
  const park = document.querySelector<HTMLElement>('[data-test-park-pointer]')
  if (park)
    await userEvent.hover(park)
})

describe.each<Family>(['context-menu', 'menubar'])('%s 三级 Portal hover 树', (family) => {
  it('进入叶项并等待超过默认 closeDelay 仍保留祖先，返回中层后只收最深层', async () => {
    await mountTree(family)
    const { outer, inner, leaf } = await openThroughPointer(family)

    const leafItem = item('menu', 'share-wecom')
    await userEvent.hover(leafItem)
    leafItem.focus()
    await settle(CLOSE_SETTLE)
    expect(rootIsOpen(family)).toBe(true)
    expect(outer.getAttribute('aria-expanded')).toBe('true')
    expect(inner.getAttribute('aria-expanded')).toBe('true')

    const ancestorItem = item('menu', 'share-email')
    await userEvent.hover(ancestorItem)
    ancestorItem.focus()
    await settle(CLOSE_SETTLE)
    expect(rootIsOpen(family)).toBe(true)
    expect(outer.getAttribute('aria-expanded')).toBe('true')
    expect(inner.getAttribute('aria-expanded')).toBe('false')
    expect(leaf.hasAttribute('hidden')).toBe(true)

    // 测试结束前沿正常选择路径从叶到根收链，避免 Vue 父先卸载制造与本场景无关的非栈顶清理噪音。
    await userEvent.click(ancestorItem)
    await settle()
    expect(rootIsOpen(family)).toBe(false)
  })

  it('点击第三级叶项只上报一次，并按叶到根关闭整链', async () => {
    const { select } = await mountTree(family)
    await openThroughPointer(family)
    const leaf = item('menu', 'share-dingtalk')
    await userEvent.hover(leaf)
    await userEvent.click(leaf)
    await settle()

    expect(select).toHaveBeenCalledTimes(1)
    expect(select).toHaveBeenCalledWith(
      family === 'menubar'
        ? expect.objectContaining({ menu: 'file', value: 'share-dingtalk' })
        : { value: 'share-dingtalk' },
    )
    expect(rootIsOpen(family)).toBe(false)
  })

  it('键盘进入三级后，Escape 每次只收当前栈顶，最终再收根层', async () => {
    await mountTree(family)
    const outer = item(family, 'share')
    outer.focus()
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    const inner = item('menu', 'share-im')
    inner.focus()
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    expect(inner.getAttribute('aria-expanded')).toBe('true')

    item('menu', 'share-wecom').focus()
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(inner.getAttribute('aria-expanded')).toBe('false')
    expect(outer.getAttribute('aria-expanded')).toBe('true')
    expect(rootIsOpen(family)).toBe(true)

    item('menu', 'share-email').focus()
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(outer.getAttribute('aria-expanded')).toBe('false')
    expect(rootIsOpen(family)).toBe(true)

    outer.focus()
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(rootIsOpen(family)).toBe(false)
  })
})
