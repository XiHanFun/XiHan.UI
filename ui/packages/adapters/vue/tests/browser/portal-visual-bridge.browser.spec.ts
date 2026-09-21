import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
  XhTableBody,
  XhTableCell,
  XhTableRoot,
  XhTableRow,
} from '../../src'
import { XhPortal } from '../../src/runtime/portal'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

const TRANSPARENT = 'rgba(0, 0, 0, 0)'

function shellOf(testId: string): HTMLElement {
  const shell = document.querySelector<HTMLElement>(`[data-testid='${testId}']`)?.closest<HTMLElement>('[data-xh-portal-shell]')
  if (!shell)
    throw new Error(`找不到 ${testId} 所在的 Portal 壳`)
  return shell
}

function inlineCustomProperties(element: HTMLElement): string[] {
  return Array.from({ length: element.style.length }, (_, index) => element.style.item(index)).filter(name => name.startsWith('--'))
}

/**
 * 每行一个开着的菜单：斑马表里奇数行与偶数行各一。打开时首项带键盘锚点、走悬停面，
 * 量静息面要看第二项，它按行打 testid。
 */
function rowMenu(row: string): ReturnType<typeof h> {
  return h(XhMenuRoot, { open: true }, () => [
    h(XhMenuTrigger, null, () => '更多'),
    h(XhMenuPositioner, null, () => [
      h(XhMenuContent, null, () => [
        h(XhMenuItem, { value: `${row}-edit` }, () => '编辑'),
        h(XhMenuItem, { 'value': `${row}-remove`, 'data-testid': `item-${row}` }, () => '删除'),
      ]),
    ]),
  ])
}

describe('portal 视觉环境桥', () => {
  it('真实 Chromium 将透明度轴与来源自定义属性投影到独占壳', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h('section', {
        'data-transparency': 'reduce',
        'style': '--business-color: rebeccapurple',
      }, [
        h(XhPortal, { to: document.body }, () => h('span', { 'data-testid': 'portal-content' }, '内容')),
      ]),
    })
    app.mount(host)
    await settle()

    const shell = document.querySelector<HTMLElement>('[data-testid="portal-content"]')?.closest<HTMLElement>('[data-xh-portal-shell]')
    expect(shell).not.toBeNull()
    expect(shell!.getAttribute('data-transparency')).toBe('reduce')
    expect(shell!.style.getPropertyValue('--business-color')).toBe('rebeccapurple')
    expect(getComputedStyle(shell!).getPropertyValue('--business-color')).toBe('rebeccapurple')
    expect(getComputedStyle(shell!).getPropertyValue('--xh-material-frosted-backdrop')).toBe('none')
  })

  it('壳从落点就能继承到的 :root 令牌不复制成 inline，只投影来源链上的局部覆盖', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h('section', { style: '--business-color: rebeccapurple' }, [
        h(XhPortal, { to: document.body }, () => h('span', { 'data-testid': 'portal-content' }, '内容')),
      ]),
    })
    app.mount(host)
    await settle()

    const shell = document.querySelector<HTMLElement>('[data-testid="portal-content"]')!.closest<HTMLElement>('[data-xh-portal-shell]')!
    const inline = Array.from({ length: shell.style.length }, (_, index) => shell.style.item(index)).filter(name => name.startsWith('--'))
    expect(inline).toEqual(['--business-color'])
    expect(getComputedStyle(shell).getPropertyValue('--xh-color-brand-500'))
      .toBe(getComputedStyle(document.documentElement).getPropertyValue('--xh-color-brand-500'))
    expect(getComputedStyle(shell).getPropertyValue('--business-color')).toBe('rebeccapurple')
  })

  it('斑马行改写的家族槽不顺着行内触发器泄进菜单：两行打开的菜单项都取家族默认面', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const rows = [{ id: 'a' }, { id: 'b' }]
    app = createApp({
      render: () => h(XhTableRoot, { columns: [{ id: 'name', label: '名称' }], rows, striped: true }, {
        default: () => [
          h(XhTableBody, null, {
            default: () => rows.map(row => h(XhTableRow, { key: row.id, value: row.id }, {
              default: () => [h(XhTableCell, { value: 'name' }, { default: () => rowMenu(row.id) })],
            })),
          }),
        ],
      }),
    })
    app.mount(host)
    await settle()

    const [odd, even] = [...host.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="row"]')]
    // 斑马纹确实在第二行生效，否则下面的断言量不出泄漏
    expect(getComputedStyle(even!).backgroundColor).not.toBe(getComputedStyle(odd!).backgroundColor)

    const first = document.querySelector<HTMLElement>('[data-testid="item-a"]')!
    const second = document.querySelector<HTMLElement>('[data-testid="item-b"]')!
    expect(first.hasAttribute('data-highlighted')).toBe(false)
    expect(second.hasAttribute('data-highlighted')).toBe(false)
    expect(getComputedStyle(first).getPropertyValue('--xh-collection-bg-rest')).toBe('')
    expect(getComputedStyle(second).getPropertyValue('--xh-collection-bg-rest')).toBe('')
    expect(getComputedStyle(first).backgroundColor).toBe(TRANSPARENT)
    expect(getComputedStyle(second).backgroundColor).toBe(TRANSPARENT)

    for (const shell of [shellOf('item-a'), shellOf('item-b')]) {
      const leaked = inlineCustomProperties(shell).filter(name => name.startsWith('--xh-collection-') || name.startsWith('--xh-_'))
      expect(leaked).toEqual([])
    }
  })

  it('来源祖先覆盖根上的令牌仍投影到壳；语气经 data-tone 带过去，浮层内自定义节点取得同一族颜色', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h('section', { 'data-tone': 'danger', 'style': '--xh-color-brand-500: rgb(1, 2, 3)' }, [
        h('span', { 'data-testid': 'inline-probe', 'style': 'background: var(--xh-tone-subtle)' }, '行内'),
        h(XhPortal, { to: document.body }, () => h('span', {
          'data-testid': 'portal-probe',
          'style': 'background: var(--xh-tone-subtle)',
        }, '浮层')),
      ]),
    })
    app.mount(host)
    await settle()

    const shell = shellOf('portal-probe')
    expect(shell.style.getPropertyValue('--xh-color-brand-500')).toBe('rgb(1, 2, 3)')
    expect(getComputedStyle(shell).getPropertyValue('--xh-color-brand-500')).toBe('rgb(1, 2, 3)')
    expect(inlineCustomProperties(shell)).toEqual(['--xh-color-brand-500'])

    expect(shell.getAttribute('data-tone')).toBe('danger')
    const inline = document.querySelector<HTMLElement>('[data-testid="inline-probe"]')!
    const probe = document.querySelector<HTMLElement>('[data-testid="portal-probe"]')!
    const subtle = getComputedStyle(inline).getPropertyValue('--xh-tone-subtle')
    expect(subtle).not.toBe('')
    expect(getComputedStyle(probe).getPropertyValue('--xh-tone-subtle')).toBe(subtle)
    expect(getComputedStyle(probe).backgroundColor).toBe(getComputedStyle(inline).backgroundColor)
    expect(getComputedStyle(probe).backgroundColor).not.toBe(TRANSPARENT)
  })
})
