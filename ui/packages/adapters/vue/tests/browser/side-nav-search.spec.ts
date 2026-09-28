// 侧栏搜索：没命中的行整行收起、不留空格；一条都没命中时空态一句次要文字；
// 落成图标栏时搜索框让位——不可见、不可聚焦，但留着高度，下面的行不上下跳。
//
// 判据是布局与计算样式：行的落位、显隐、字色与字号，jsdom 都算不出来。
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchIndicator,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavEmpty,
  XhSideNavInput,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const COLLECTION = [
  { value: 'home', label: '工作台', href: '#home' },
  {
    value: 'user',
    label: '用户管理',
    children: [
      { value: 'user-list', label: '用户列表', href: '#user-list' },
      { value: 'user-role', label: '角色权限', href: '#user-role' },
    ],
  },
  {
    value: 'order',
    label: '订单管理',
    children: [
      { value: 'order-list', label: '订单列表', href: '#order-list' },
      { value: 'order-refund', label: '退款处理', href: '#order-refund' },
    ],
  },
]

async function frames(count = 1): Promise<void> {
  await nextTick()
  await nextTick()
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

/** 等所有过渡与动画播完：折叠要等整栏宽度落定才换排布。 */
async function finishAll(): Promise<void> {
  await Promise.all([...host!.querySelectorAll('*')].flatMap(el => el.getAnimations()).map(a => a.finished.catch(() => undefined)))
  await frames(2)
}

async function mount(collapsed: Ref<boolean> = ref(false)): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  const link = (value: string, label: string) => h(XhSideNavItem, { key: value }, () =>
    h(XhSideNavLink, { value }, () => [h('span', { 'aria-hidden': 'true' }, '◆'), h(XhSideNavLinkText, null, () => label)]))
  app = createApp({
    render: () => h(XhSideNavRoot, { collection: COLLECTION, collapsed: collapsed.value } as Record<string, unknown>, () => [
      h(XhSideNavInput, { placeholder: '搜索导航' }),
      h(XhSideNavList, null, () => [
        link('home', '工作台'),
        ...COLLECTION.slice(1).map(branch => h(XhSideNavBranch, { key: branch.value, value: branch.value }, () => [
          h(XhSideNavBranchTrigger, null, () => [
            h('span', { 'aria-hidden': 'true' }, '◆'),
            h(XhSideNavBranchText, null, () => branch.label),
            h(XhSideNavBranchIndicator),
          ]),
          h(XhSideNavBranchContent, null, () => branch.children!.map(leaf => link(leaf.value, leaf.label))),
        ])),
      ]),
      h(XhSideNavEmpty),
    ]),
  })
  app.mount(host)
  await frames(2)
}

function part(name: string, index = 0): HTMLElement {
  const el = host!.querySelectorAll<HTMLElement>(`[data-scope='side-nav'][data-part='${name}']`)[index]
  if (!el)
    throw new Error(`缺少侧栏部件：${name}[${index}]`)
  return el
}

/** 可见的行（分支按钮与链接），按文档序。 */
function visibleRows(): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>(`[data-scope='side-nav']:is([data-part='link'], [data-part='branch-trigger'])`)]
    .filter(el => el.getClientRects().length > 0)
}

/** 读一支令牌在某个节点上解析出来的计算值。 */
function resolved(on: HTMLElement, property: string, token: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  on.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

describe('side-nav 搜索', () => {
  it('输入检索词：没命中的行整行收起不占位，留下的行一条挨一条，行距与平时同一个 gap', async () => {
    await mount()
    await userEvent.fill(part('input'), '列表')
    await frames()
    const rows = visibleRows()
    expect(rows.map(row => row.textContent)).toEqual(['◆用户管理', '◆用户列表', '◆订单管理', '◆订单列表'])
    const gap = Number.parseFloat(getComputedStyle(part('list')).rowGap)
    expect(gap).toBeGreaterThan(0)
    // 相邻两行之间只隔一个 gap：收起的行没有在列表里留下空的列表项
    for (let i = 1; i < rows.length; i++) {
      const previous = rows[i - 1]!.getBoundingClientRect()
      const current = rows[i]!.getBoundingClientRect()
      expect(current.top - previous.bottom, `第 ${i} 行与上一行之间`).toBeCloseTo(gap, 0)
    }
    expect(getComputedStyle(part('item', 0)).display, '没命中的「工作台」整行收起').toBe('none')
    expect(getComputedStyle(part('empty')).display).toBe('none')
  })

  it('按 Escape 清空检索词：回到整棵树与原来的展开态，焦点留在搜索框', async () => {
    await mount()
    const before = visibleRows().length
    await userEvent.fill(part('input'), '退款')
    await frames()
    expect(visibleRows().map(row => row.textContent)).toEqual(['◆订单管理', '◆退款处理'])
    await userEvent.keyboard('{Escape}')
    await frames()
    expect((part('input') as HTMLInputElement).value).toBe('')
    expect(visibleRows()).toHaveLength(before)
    expect(document.activeElement).toBe(part('input'))
  })

  it('一条都没命中：空态一句次要文字，字色 muted、字号与行同档、居中，块向内距 space-3', async () => {
    await mount()
    await userEvent.fill(part('input'), '不存在的入口')
    await frames()
    const empty = part('empty')
    const style = getComputedStyle(empty)
    expect(style.display).not.toBe('none')
    expect(empty.textContent).toBe('No matches')
    expect(visibleRows()).toHaveLength(0)
    expect(style.color).toBe(resolved(empty, 'color', '--xh-fg-muted'))
    expect(style.fontSize).toBe(getComputedStyle(part('link', 0)).fontSize)
    expect(style.textAlign).toBe('center')
    expect(style.paddingTop).toBe(resolved(empty, 'padding-top', '--xh-space-3'))
  })

  it('落成图标栏：搜索框不可见、不可聚焦，但留着高度，列表不上下跳；过滤暂停，展开回来接着按原词过滤', async () => {
    const collapsed = ref(false)
    await mount(collapsed)
    await userEvent.fill(part('input'), '列表')
    await frames()
    const listTop = part('list').getBoundingClientRect().top
    const inputHeight = part('input').getBoundingClientRect().height
    expect(inputHeight).toBeGreaterThan(0)

    collapsed.value = true
    await frames()
    await finishAll()
    const input = part('input')
    expect(getComputedStyle(input).visibility).toBe('hidden')
    expect(input.getBoundingClientRect().height, '留着高度').toBe(inputHeight)
    expect(part('list').getBoundingClientRect().top, '列表不上下跳').toBe(listTop)
    input.focus()
    expect(document.activeElement, '不可见的框聚焦不上').not.toBe(input)
    // 图标栏里过滤暂停：顶层三条都在
    expect(visibleRows()).toHaveLength(3)

    collapsed.value = false
    await frames()
    await finishAll()
    expect(getComputedStyle(part('input')).visibility).toBe('visible')
    expect(visibleRows().map(row => row.textContent)).toEqual(['◆用户管理', '◆用户列表', '◆订单管理', '◆订单列表'])
  })
})
