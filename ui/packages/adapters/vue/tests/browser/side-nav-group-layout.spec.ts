// 侧栏分组的排布：标题与组内的行、组与组之间按侧栏同一个 gap 一条挨一条，组内的行与顶层列表同宽、
// 不因多一层列表容器而缩进或多出外边距；搜索时整组收起不占位。
//
// 判据是真实布局：行的落位与宽度 jsdom 都算不出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhSideNavGroup,
  XhSideNavGroupLabel,
  XhSideNavGroupList,
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
  { value: 'users', label: '用户管理', href: '#users' },
  { value: 'logs', label: '操作日志', href: '#logs' },
]

async function frames(count = 1): Promise<void> {
  await nextTick()
  await nextTick()
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(options: { dir?: 'rtl', density?: 'compact' } = {}): Promise<void> {
  host = document.createElement('div')
  if (options.density)
    host.dataset.density = options.density
  document.body.append(host)
  const link = (value: string, label: string) => h(XhSideNavItem, null, () =>
    h(XhSideNavLink, { value }, () => [h('span', { 'aria-hidden': 'true' }, '◆'), h(XhSideNavLinkText, null, () => label)]))
  app = createApp({
    render: () => h(XhSideNavRoot, { collection: COLLECTION, dir: options.dir } as Record<string, unknown>, () => [
      h(XhSideNavInput),
      h(XhSideNavList, null, () => [
        h(XhSideNavGroup, { value: 'main' }, () => [
          h(XhSideNavGroupLabel, { value: 'main' }, () => '常用'),
          h(XhSideNavGroupList, null, () => [link('home', '工作台')]),
        ]),
        h(XhSideNavGroup, { value: 'admin' }, () => [
          h(XhSideNavGroupLabel, { value: 'admin' }, () => '管理'),
          h(XhSideNavGroupList, null, () => [link('users', '用户管理'), link('logs', '操作日志')]),
        ]),
      ]),
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

function linkOf(value: string): HTMLElement {
  const el = host!.querySelector<HTMLElement>(`[data-scope='side-nav'][data-part='link'][data-value='${value}']`)
  if (!el)
    throw new Error(`缺少链接：${value}`)
  return el
}

const rect = (el: HTMLElement): DOMRect => el.getBoundingClientRect()

describe('side-nav 分组的排布', () => {
  for (const options of [{}, { dir: 'rtl', density: 'compact' }] as const) {
    it(`标题、行与组之间按侧栏的 gap 一条挨一条，组内的行与顶层列表同宽不缩进（${'dir' in options ? 'rtl · compact' : 'ltr · comfortable'}）`, async () => {
      await mount(options)
      const list = rect(part('list'))
      const gap = Number.parseFloat(getComputedStyle(part('list')).rowGap)
      expect(gap, '侧栏的 gap 取间距令牌、不为零').toBeGreaterThan(0)

      const main = rect(part('group-label', 0))
      const admin = rect(part('group-label', 1))
      const home = rect(linkOf('home'))
      const users = rect(linkOf('users'))
      const logs = rect(linkOf('logs'))

      // 分组标题与组内的每一行都铺满顶层列表的行宽：两侧都不缩进
      for (const [name, box] of [['main 标题', main], ['admin 标题', admin], ['home', home], ['users', users], ['logs', logs]] as const) {
        expect(box.left, `${name} 起边与列表对齐`).toBeCloseTo(list.left, 1)
        expect(box.right, `${name} 止边与列表对齐`).toBeCloseTo(list.right, 1)
      }

      // 第一组贴着列表顶，标题 → 行、行 → 行、组 → 组都是同一个 gap，不多出外边距
      expect(main.top, '第一组的标题贴着列表顶').toBeCloseTo(list.top, 1)
      expect(home.top - main.bottom, '标题到组内第一行').toBeCloseTo(gap, 1)
      expect(admin.top - home.bottom, '上一组的末行到下一组的标题').toBeCloseTo(gap, 1)
      expect(users.top - admin.bottom, '标题到组内第一行').toBeCloseTo(gap, 1)
      expect(logs.top - users.bottom, '组内行与行之间').toBeCloseTo(gap, 1)
      expect(list.bottom, '最后一组的末行贴着列表底').toBeCloseTo(logs.bottom, 1)
    })
  }

  it('搜索时一个成员都没命中的分组整组收起、不占位，留下的那组的标题落到列表顶', async () => {
    await mount()
    const input = part('input') as HTMLInputElement
    input.value = '日志'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await frames(2)

    expect(part('group', 0).hasAttribute('hidden')).toBe(true)
    expect(part('group', 0).getClientRects().length, '收起的分组不占位').toBe(0)
    expect(rect(part('group-label', 1)).top, '留下的那组的标题落到列表顶').toBeCloseTo(rect(part('list')).top, 1)
  })
})
