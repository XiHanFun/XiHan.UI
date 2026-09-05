// @vitest-environment jsdom
//
// 浮层族的自绘条：七个宿主一律把条子挂在 positioner 上、排在 content 之后。
// 这里钉住三件事：条子是 content 的兄弟且排在末尾（挂进 content 内部会撑高 scrollHeight）；
// 建出来的节点一个 data-xh-part 都不带；按住条子不会把浮层消解掉
// （条子在 content 之外，positioner 不记进层分支就会被判成层外交互，浮层当场收起）。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import {
  XhContextMenuContent,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhMentionContent,
  XhMentionInput,
  XhMentionItem,
  XhMentionItemText,
  XhMentionPositioner,
  XhMentionRoot,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhPaginationContent,
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationPositioner,
  XhPaginationRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
} from '../src'

let unmount: (() => void) | null = null

afterEach(() => {
  unmount?.()
  unmount = null
  document.body.innerHTML = ''
})

/** 效应推迟一拍才挂监听器与首次测量，浮层落位与退场闸门还要再等一轮。 */
async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => queueMicrotask(resolve))
  await nextTick()
  await nextTick()
}

function render(node: () => unknown): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp(defineComponent({ setup: () => () => node() }))
  app.mount(host)
  unmount = () => {
    app.unmount()
    host.remove()
  }
}

/** 根 + positioner + content 三件套，浮层默认展开。 */
async function mountOverlay(
  root: unknown,
  positioner: unknown,
  content: unknown,
  rootProps: Record<string, unknown>,
  inner: () => unknown[] = () => ['正文'],
): Promise<void> {
  render(() => h(root as never, rootProps, () => [
    h(positioner as never, null, () => [h(content as never, null, inner)]),
  ]))
  await settle()
}

/** 打字：写值、摆光标、派原生 input 事件——提及的入口就是这三件。 */
async function typeAt(el: HTMLTextAreaElement): Promise<void> {
  el.focus()
  el.value = '@'
  el.setSelectionRange(1, 1)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  await settle()
}

async function mountMention(): Promise<void> {
  render(() => h(XhMentionRoot, { collection: [{ value: 'lilei', label: '李雷' }] }, () => [
    h(XhMentionInput),
    h(XhMentionPositioner, null, () => [
      h(XhMentionContent, null, () => [
        h(XhMentionItem, { value: 'lilei' }, () => [h(XhMentionItemText, () => '李雷')]),
      ]),
    ]),
  ]))
  await settle()
  await typeAt(document.querySelector<HTMLTextAreaElement>('[data-scope="mention"][data-part="input"]')!)
}

interface PageItem { type: string, side?: string, value?: number }

async function mountPagination(): Promise<void> {
  // 2000 条 / 每页 10 条 = 200 页，停在第 100 页：两侧各折一段
  render(() => h(XhPaginationRoot, { count: 2000, pageSize: 10, defaultPage: 100 }, {
    default: ({ pageItems }: { pageItems: PageItem[] }) => [
      ...pageItems.map((item, i) =>
        item.type === 'ellipsis'
          ? h(XhPaginationEllipsisTrigger, { key: `e${i}`, side: item.side as 'start' | 'end' })
          : h(XhPaginationItem, { key: `p${i}`, value: item.value! }, () => String(item.value)),
      ),
      h(XhPaginationPositioner, null, () => [
        h(XhPaginationContent, null, {
          default: ({ pages }: { pages: number[] }) =>
            pages.map(p => h(XhPaginationItem, { key: p, value: p }, () => String(p))),
        }),
      ]),
    ],
  }))
  await settle()
  document.querySelector<HTMLElement>('[data-scope="pagination"][data-part="ellipsis-trigger"]')!.click()
  await settle()
}

interface Host {
  scope: string
  mount: () => Promise<void>
}

const HOSTS: Host[] = [
  {
    scope: 'menu',
    mount: () => mountOverlay(XhMenuRoot, XhMenuPositioner, XhMenuContent, { defaultOpen: true }, () => [
      h(XhMenuItem, { value: 'copy' }, () => '复制'),
    ]),
  },
  {
    scope: 'popover',
    mount: () => mountOverlay(XhPopoverRoot, XhPopoverPositioner, XhPopoverContent, { defaultOpen: true }),
  },
  {
    scope: 'context-menu',
    mount: () => mountOverlay(XhContextMenuRoot, XhContextMenuPositioner, XhContextMenuContent, { defaultOpen: true }),
  },
  {
    scope: 'hover-card',
    mount: () => mountOverlay(XhHoverCardRoot, XhHoverCardPositioner, XhHoverCardContent, { defaultOpen: true }),
  },
  { scope: 'mention', mount: mountMention },
  { scope: 'pagination', mount: mountPagination },
]

function positioner(scope: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="positioner"]`)!
}

function content(scope: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="content"]`)!
}

describe.each(HOSTS)('$scope 的自绘条', ({ scope, mount }) => {
  it('挂在 positioner 上，排在 content 之后', async () => {
    await mount()

    const shell = positioner(scope)
    const root = shell.querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="root"]')!
    expect(root).not.toBeNull()
    expect(shell.lastElementChild).toBe(root)
    expect(content(scope).parentElement).toBe(shell)
    expect(root.querySelector('[data-scope="scrollbar"][data-part="track"]')).not.toBeNull()
    expect(root.querySelector('[data-scope="scrollbar"][data-part="thumb"]')).not.toBeNull()
  })

  it('一个 data-xh-part 都不带', async () => {
    await mount()

    const nodes = [...positioner(scope).querySelectorAll<HTMLElement>('[data-scope="scrollbar"]')]
    expect(nodes.length).toBeGreaterThan(0)
    for (const node of nodes)
      expect(node.hasAttribute('data-xh-part')).toBe(false)
  })

  it('按在条子上不会把浮层消解掉', async () => {
    await mount()

    const panel = content(scope)
    expect(panel.getAttribute('data-state')).toBe('open')

    positioner(scope)
      .querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="track"]')!
      .dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, composed: true }))
    await settle()

    expect(panel.getAttribute('data-state')).toBe('open')
  })
})
