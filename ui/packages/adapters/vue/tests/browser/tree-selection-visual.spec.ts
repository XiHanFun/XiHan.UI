// 页内树的选中（真源 §7.3 页内持久集合）：品牌淡底行面 + 淡底前景 + 前导对号，
// 悬停 100 → 按下 200 只换面，选中行悬停 20% / 按住 28%；分支行不是 treeitem 本体，
// 选中面与禁用守卫按连接层同步的 data-selected / data-disabled 命中；真实选择不改变行几何。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
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

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
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
          h(XhTreeBranchControl, null, () => [h(XhTreeBranchTrigger), h(XhTreeBranchText, null, () => 'src')]),
          h(XhTreeBranchContent, null, () => [
            h(XhTreeItem, { value: 'index' }, () => [h(XhTreeItemIndicator), h(XhTreeItemText, null, () => 'index.ts')]),
            h(XhTreeItem, { value: 'app' }, () => [h(XhTreeItemIndicator), h(XhTreeItemText, null, () => 'app.vue')]),
          ]),
        ]),
        h(XhTreeBranch, { value: 'docs' }, () => [
          h(XhTreeBranchControl, null, () => [h(XhTreeBranchTrigger), h(XhTreeBranchText, null, () => 'docs')]),
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

describe('页内树的选中与按压反馈', () => {
  it('选中叶子：品牌淡底 + 淡底前景 + 前导对号；未选中行悬停 100，选中行悬停 20%', async () => {
    await mountTree()
    const index = part('item', 'index')
    const app = part('item', 'app')
    const indexMark = index.querySelector<HTMLElement>('[data-part="item-indicator"]')!
    const appMark = app.querySelector<HTMLElement>('[data-part="item-indicator"]')!

    expect(getComputedStyle(index).backgroundColor).toBe(resolve('--xh-bg-brand-subtle'))
    expect(getComputedStyle(index).color).toBe(resolve('--xh-fg-on-brand-subtle', 'color'))
    expect(getComputedStyle(index).fontWeight).toBe(getComputedStyle(app).fontWeight)
    expect(getComputedStyle(indexMark).visibility).toBe('visible')
    expect(getComputedStyle(appMark).visibility).toBe('hidden')
    // 对号在文字之前：起始侧的前导标记
    const text = index.querySelector<HTMLElement>('[data-part="item-text"]')!.getBoundingClientRect()
    expect(indexMark.getBoundingClientRect().right).toBeLessThanOrEqual(text.left)

    await userEvent.hover(app)
    expect(getComputedStyle(app).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    await userEvent.hover(index)
    expect(getComputedStyle(index).backgroundColor).toBe(resolve('--xh-bg-brand-subtle-hover'))
  })

  it('按下只换面不缩放：未选中叶子按住 200 档，选中叶子按住 28%；真实选择不改变行几何', async () => {
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
    expect(getComputedStyle(app).backgroundColor).toBe(resolve('--xh-bg-brand-subtle-active'))
    await releasePointer(app)
  })

  it('分支行：选中面按 data-selected 命中，禁用分支不悬停换底、光标 not-allowed', async () => {
    await mountTree(['src'])
    const src = part('branch-control', 'src')
    const docs = part('branch-control', 'docs')
    // 分支行不是 treeitem：aria-selected 在 branch 上，行上只有连接层同步的 data-selected
    expect(src.hasAttribute('data-selected')).toBe(true)
    expect(src.hasAttribute('aria-selected')).toBe(false)
    expect(part('branch', 'src').getAttribute('aria-selected')).toBe('true')
    expect(getComputedStyle(src).backgroundColor).toBe(resolve('--xh-bg-brand-subtle'))
    expect(getComputedStyle(src).color).toBe(resolve('--xh-fg-on-brand-subtle', 'color'))
    // 点行落焦：焦点行同时是高亮行，选中 + 高亮落 20%
    await userEvent.click(src)
    await nextTick()
    expect(src.hasAttribute('data-highlighted')).toBe(true)
    expect(getComputedStyle(src).backgroundColor).toBe(resolve('--xh-bg-brand-subtle-hover'))

    await userEvent.hover(docs)
    expect(getComputedStyle(docs).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(docs).color).toBe(resolve('--xh-fg-disabled', 'color'))
    expect(getComputedStyle(docs).cursor).toBe('not-allowed')
  })
})
