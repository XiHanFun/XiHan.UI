// 侧栏导航自绘的状态字形——分支行尾的展开方向 chevron——是指示符，不是控件内图标：
// 它与自己所在的盒同属 --xh-control-indicator-* 一族，--xh-side-nav-icon-size / --xh-icon-size
// 只管作者放进行里的图标。此前 chevron 读家族按档下发到行的 --xh-icon-size（md 20px），指示符盒又没有
// 自己的尺、被字形撑到 20×20：comfortable 下比同一栏里 16px 的指示符档大一圈，compact 下方盒收到 14 时它仍是 20。
// 两档密度一起量：指示符档 comfortable 16 / compact 14，作者图标两档都恒 20。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhIcon,
  XhSideNavBranch,
  XhSideNavBranchContent,
  XhSideNavBranchIndicator,
  XhSideNavBranchText,
  XhSideNavBranchTrigger,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
} from '../../src'
import { pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const collection = [
  { value: 'home', label: '首页' },
  { value: 'user', label: '用户', children: [{ value: 'user-list', label: '列表' }, { value: 'user-role', label: '角色' }] },
  { value: 'system', label: '系统', children: [{ value: 'settings', label: '设置' }] },
]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  delete document.documentElement.dataset.density
  app = null
  host = null
})

function part(name: string, index = 0): HTMLElement {
  const element = host!.querySelectorAll<HTMLElement>(`[data-scope='side-nav'][data-part='${name}']`)[index]
  if (!element)
    throw new Error(`缺少 side-nav 部件：${name}[${index}]`)
  return element
}

function authorIcon(): ReturnType<typeof h> {
  return h(XhIcon, { label: '作者图标' }, { default: () => h('path', { d: 'M4 12h16' }) })
}

async function mount(density: 'comfortable' | 'compact'): Promise<void> {
  document.documentElement.dataset.density = density
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    // user 分支缺省展开、system 分支收起：chevron 转过 90° 与未转两态都量到；
    // 作者图标塞在链接文字之前与分支文字之前，行上按档下发的 --xh-icon-size 只管它们
    render: () => h(XhSideNavRoot, { collection, defaultValue: 'user-role', defaultExpandedValue: ['user'] }, () => [
      h(XhSideNavList, null, () => [
        h(XhSideNavItem, null, () => h(XhSideNavLink, { value: 'home' }, () => [authorIcon(), h(XhSideNavLinkText, null, () => '首页')])),
        h(XhSideNavBranch, { value: 'user' }, () => [
          h(XhSideNavBranchTrigger, null, () => [authorIcon(), h(XhSideNavBranchText, null, () => '用户'), h(XhSideNavBranchIndicator)]),
          h(XhSideNavBranchContent, null, () => [
            h(XhSideNavItem, null, () => h(XhSideNavLink, { value: 'user-list' }, () => h(XhSideNavLinkText, null, () => '列表'))),
            h(XhSideNavItem, null, () => h(XhSideNavLink, { value: 'user-role' }, () => h(XhSideNavLinkText, null, () => '角色'))),
          ]),
        ]),
        h(XhSideNavBranch, { value: 'system' }, () => [
          h(XhSideNavBranchTrigger, null, () => [h(XhSideNavBranchText, null, () => '系统'), h(XhSideNavBranchIndicator)]),
          h(XhSideNavBranchContent, null, () => [
            h(XhSideNavItem, null, () => h(XhSideNavLink, { value: 'settings' }, () => h(XhSideNavLinkText, null, () => '设置'))),
          ]),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  for (const indicator of host.querySelectorAll<HTMLElement>('[data-scope=\'side-nav\'][data-part=\'branch-indicator\']'))
    indicator.style.transition = 'none'
}

function indicatorSize(): number {
  const value = Number.parseFloat(getComputedStyle(part('root')).getPropertyValue('--xh-control-indicator-size'))
  expect([14, 16]).toContain(value)
  return value
}

function describeGlyph(host: HTMLElement, pseudo: '::before' | '::after'): string {
  const style = getComputedStyle(host, pseudo)
  const rect = host.getBoundingClientRect()
  return `${host.dataset.part}[${host.dataset.state}]${pseudo} ${style.width}×${style.height} position=${style.position} 盒 ${rect.width}×${rect.height}`
}

/** 盒是两轴居中的容器：唯一的行内字形落在盒中心 */
function expectCenteredBox(box: HTMLElement): void {
  const style = getComputedStyle(box)
  expect(['flex', 'inline-flex', 'grid', 'inline-grid']).toContain(style.display)
  expect(style.alignItems).toBe('center')
  if (style.display.endsWith('grid'))
    expect(style.justifyItems).toBe('center')
  else
    expect(style.justifyContent).toBe('center')
}

describe.each(['comfortable', 'compact'] as const)('侧栏导航自绘状态字形按指示符档取尺（%s）', (density) => {
  it('展开方向指示符的盒等于 --xh-control-indicator-size，转过 90° 的开态与收起态同一把尺', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const open = part('branch-indicator', 0)
    const closed = part('branch-indicator', 1)
    expect(open.dataset.state).toBe('open')
    expect(closed.dataset.state).toBe('closed')
    for (const box of [open, closed]) {
      const observed = describeGlyph(box, '::before')
      // 盒自己定尺：旋转时不因盒随字形撑开而抖
      expect(box.offsetWidth, observed).toBe(indicator)
      expect(box.offsetHeight, observed).toBe(indicator)
      expect(box.getBoundingClientRect().width, observed).toBe(indicator)
      expect(box.getBoundingClientRect().height, observed).toBe(indicator)
      expectCenteredBox(box)
    }
  })

  it('兜底 chevron 与盒同边长、边长等于 --xh-control-indicator-size，不读行上按档下发的 --xh-icon-size', async () => {
    await mount(density)
    const indicator = indicatorSize()
    for (const box of [part('branch-indicator', 0), part('branch-indicator', 1)]) {
      const chevron = pseudoBox(box, '::before')
      const observed = describeGlyph(box, '::before')
      expect(chevron.width, observed).toBe(indicator)
      expect(chevron.height, observed).toBe(indicator)
      expect(chevron.width, observed).toBeLessThanOrEqual(box.getBoundingClientRect().width)
    }
  })

  it('作者塞进行里的图标仍按 --xh-icon-size（md 20px）取尺，不随指示符档变', async () => {
    await mount(density)
    for (const row of [part('link', 0), part('branch-trigger', 0)]) {
      const icon = Number.parseFloat(getComputedStyle(row).getPropertyValue('--xh-icon-size'))
      expect(icon, row.dataset.part).toBe(20)
    }
    const icons = [...host!.querySelectorAll<HTMLElement>('[data-scope=\'icon\'][data-part=\'root\']')]
    expect(icons.length).toBe(2)
    for (const svg of icons) {
      expect(svg.getBoundingClientRect().width).toBe(20)
      expect(svg.getBoundingClientRect().height).toBe(20)
    }
  })
})
