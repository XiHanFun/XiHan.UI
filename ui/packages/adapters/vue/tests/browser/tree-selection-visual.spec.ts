// 树的选中与树选择同一种读法（真源 §7.3）：透明底 + 行尾对号，正文颜色与字重保持 rest，
// 悬停 100 → 按下 200 只换面，选中行叠悬停 / 按下沿用同一条阶梯；分支行不是 treeitem 本体，
// 对号与禁用守卫按连接层同步的 data-selected / data-disabled 命中；真实选择不改变行几何。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeRoot,
  XhTreeTree,
} from '../../src'
import { pressPointer, releasePointer } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const collection = [
  {
    value: 'src',
    label: 'src',
    children: [
      { value: 'index', label: 'index.ts' },
      { value: 'app', label: 'app.vue' },
    ],
  },
  { value: 'docs', label: 'docs', children: [{ value: 'guide', label: 'guide.md' }], disabled: true },
  { value: 'readme', label: 'README.md' },
]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

function part(name: string, value: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='tree'][data-part='${name}'][data-value='${value}']`)
    ?? host?.querySelector<HTMLElement>(`[data-scope='tree'][data-part='branch'][data-value='${value}'] > [data-scope='tree'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 ${name} ${value}`)
  return el
}

/** 在宿主的主题下把令牌解析成最终颜色，断言不写死任何色值。 */
function resolve(token: string, property: 'background-color' | 'color' = 'background-color'): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  host!.append(probe)
  const value = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return value
}

async function mountTree(defaultSelection = ['index']): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '280px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTreeRoot, { collection, defaultSelection, defaultExpandedValue: ['src'] }, () => [
      h(XhTreeTree, null, () => [
        h(XhTreeBranch, { value: 'src' }, () => [
          h(XhTreeBranchControl, null, () => [h(XhTreeBranchTrigger), h(XhTreeItemIndicator), h(XhTreeBranchText, null, () => 'src')]),
          h(XhTreeBranchContent, null, () => [
            h(XhTreeItem, { value: 'index' }, () => [h(XhTreeItemIndicator), h(XhTreeItemText, null, () => 'index.ts')]),
            h(XhTreeItem, { value: 'app' }, () => [h(XhTreeItemIndicator), h(XhTreeItemText, null, () => 'app.vue')]),
          ]),
        ]),
        h(XhTreeBranch, { value: 'docs' }, () => [
          h(XhTreeBranchControl, null, () => [h(XhTreeBranchTrigger), h(XhTreeItemIndicator), h(XhTreeBranchText, null, () => 'docs')]),
          h(XhTreeBranchContent, null, () => [
            h(XhTreeItem, { value: 'guide' }, () => [h(XhTreeItemIndicator), h(XhTreeItemText, null, () => 'guide.md')]),
          ]),
        ]),
        h(XhTreeItem, { value: 'readme' }, () => [h(XhTreeItemIndicator), h(XhTreeItemText, null, () => 'README.md')]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  for (const row of host.querySelectorAll<HTMLElement>('[data-part="item"], [data-part="branch-control"]'))
    row.style.transition = 'none'
}

/** 行里的对号：分支行的对号长在 branch-control 里 */
function mark(row: HTMLElement): HTMLElement {
  return row.querySelector<HTMLElement>('[data-part="item-indicator"]')!
}

describe('树的选中与按压反馈', () => {
  it('选中叶子：透明底 + 行尾对号，字色字重保持 rest；选中与未选中的行悬停同为 100', async () => {
    await mountTree()
    const index = part('item', 'index')
    const app = part('item', 'app')

    expect(getComputedStyle(index).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(index).color).toBe(resolve('--xh-fg-default', 'color'))
    expect(getComputedStyle(index).color).toBe(getComputedStyle(app).color)
    expect(getComputedStyle(index).fontWeight).toBe(getComputedStyle(app).fontWeight)
    expect(getComputedStyle(mark(index)).visibility).toBe('visible')
    expect(getComputedStyle(mark(index)).color).toBe(resolve('--xh-fg-brand', 'color'))
    expect(getComputedStyle(mark(app)).visibility).toBe('hidden')
    // 对号在正文之后、贴着行的末端：作者把它写在行首，皮肤照样排到最后
    const text = index.querySelector<HTMLElement>('[data-part="item-text"]')!.getBoundingClientRect()
    const row = index.getBoundingClientRect()
    expect(mark(index).getBoundingClientRect().left).toBeGreaterThanOrEqual(text.right)
    expect(row.right - mark(index).getBoundingClientRect().right).toBeCloseTo(Number.parseFloat(getComputedStyle(index).paddingInlineEnd), 1)

    await userEvent.hover(app)
    expect(getComputedStyle(app).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    await userEvent.hover(index)
    expect(getComputedStyle(index).backgroundColor).toBe(resolve('--xh-bg-subtle'))
  })

  it('按下只换面不缩放：选中与未选中的叶子按住同为 200 档；真实选择不改变行几何', async () => {
    await mountTree()
    const app = part('item', 'app')
    const before = app.getBoundingClientRect()
    await userEvent.hover(app)
    await pressPointer(app)
    expect(app.matches(':active')).toBe(true)
    expect(getComputedStyle(app).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    expect(getComputedStyle(app).scale).toBe('none')
    await releasePointer(app)
    await nextTick()
    expect(app.getAttribute('aria-selected')).toBe('true')
    expect(app.getBoundingClientRect().width).toBe(before.width)
    expect(app.getBoundingClientRect().height).toBe(before.height)
    await pressPointer(app)
    expect(getComputedStyle(app).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    await releasePointer(app)
  })

  it('分支行：对号按 data-selected 显形，行不换面；禁用分支不悬停换底、光标 not-allowed', async () => {
    await mountTree(['src'])
    const src = part('branch-control', 'src')
    const docs = part('branch-control', 'docs')
    // 分支行不是 treeitem：aria-selected 在 branch 上，行上只有连接层同步的 data-selected
    expect(src.hasAttribute('data-selected')).toBe(true)
    expect(src.hasAttribute('aria-selected')).toBe(false)
    expect(part('branch', 'src').getAttribute('aria-selected')).toBe('true')
    expect(getComputedStyle(src).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(src).color).toBe(resolve('--xh-fg-default', 'color'))
    expect(getComputedStyle(mark(src)).visibility).toBe('visible')
    expect(mark(src).getBoundingClientRect().left).toBeGreaterThanOrEqual(src.querySelector<HTMLElement>('[data-part="branch-text"]')!.getBoundingClientRect().right)
    expect(getComputedStyle(mark(docs)).visibility).toBe('hidden')
    // 点行落焦：焦点行同时是高亮行，选中 + 高亮与未选中行的高亮同为 100
    await userEvent.click(src)
    await nextTick()
    expect(src.hasAttribute('data-highlighted')).toBe(true)
    expect(getComputedStyle(src).backgroundColor).toBe(resolve('--xh-bg-subtle'))

    await userEvent.hover(docs)
    expect(getComputedStyle(docs).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(docs).color).toBe(resolve('--xh-fg-disabled', 'color'))
    expect(getComputedStyle(docs).cursor).toBe('not-allowed')
  })

  it('forced-colors：选中行与未选中行同为静息面，选中只由对号表达', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    await mountTree()
    const index = part('item', 'index')
    const app = part('item', 'app')
    await userEvent.hover(part('item', 'readme'))

    expect(getComputedStyle(index).backgroundColor).toBe(getComputedStyle(app).backgroundColor)
    expect(getComputedStyle(index).color).toBe(getComputedStyle(app).color)
    expect(getComputedStyle(mark(index)).visibility).toBe('visible')
  })

  it('打印：对号是遮罩出来的一块底色，按原样印出，不随打印丢底色', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: 'print', features: [] })
    await mountTree()
    expect(getComputedStyle(mark(part('item', 'index'))).printColorAdjust).toBe('exact')
  })
})
