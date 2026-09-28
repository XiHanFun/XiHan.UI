// 树的尺寸轴：sm / md / lg 走集合家族的尺寸档——行的块向内衬、行内内衬与字号随档，
// 指示符盒（展开箭头、行尾对号、拖拽把手）按指示符档、层级缩进一档一格。md 与缺省逐项相同。
// 两档密度一起量：档位令牌本身随密度换值，树只选档不写数。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
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
  XhTreeNodeDragTrigger,
  XhTreeRoot,
  XhTreeTree,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const collection = [{ value: 'src', label: 'src', children: [{ value: 'index', label: 'index.ts' }] }]
const hosts: HTMLElement[] = []
const apps: App[] = []

afterEach(() => {
  apps.splice(0).forEach(app => app.unmount())
  hosts.splice(0).forEach(host => host.remove())
  delete document.documentElement.dataset.density
})

async function mount(size?: 'sm' | 'md' | 'lg'): Promise<HTMLElement> {
  const host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  const app = createApp({
    render: () => h(XhTreeRoot, { collection, size, nodeDraggable: true, defaultExpandedValue: ['src'], defaultSelection: ['index'] }, () => [
      h(XhTreeTree, null, () => [
        h(XhTreeBranch, { value: 'src' }, () => [
          h(XhTreeBranchControl, null, () => [
            h(XhTreeNodeDragTrigger),
            h(XhTreeBranchTrigger),
            h(XhTreeBranchText, null, () => 'src'),
          ]),
          h(XhTreeBranchContent, null, () => [
            h(XhTreeItem, { value: 'index' }, () => [
              h(XhTreeItemText, null, () => 'index.ts'),
              h(XhTreeItemIndicator),
            ]),
          ]),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  apps.push(app)
  hosts.push(host)
  await nextTick()
  return host
}

/** 在宿主里把长度令牌解析成像素。 */
function px(host: HTMLElement, token: string): string {
  const probe = document.createElement('span')
  probe.style.display = 'block'
  probe.style.paddingTop = `var(${token})`
  host.append(probe)
  const value = getComputedStyle(probe).paddingTop
  probe.remove()
  return value
}

function part(host: HTMLElement, name: string): HTMLElement {
  const el = host.querySelector<HTMLElement>(`[data-scope='tree'][data-part='${name}']`)
  if (!el)
    throw new Error(`缺少 tree 部件：${name}`)
  return el
}

describe('tree 尺寸轴', () => {
  for (const density of ['comfortable', 'compact'] as const) {
    it(`${density}：行内衬、字号、指示符盒与缩进按档取值，缺省即 md`, async () => {
      document.documentElement.dataset.density = density
      const heights: number[] = []
      for (const size of ['sm', 'md', 'lg'] as const) {
        const host = await mount(size)
        const row = part(host, 'item')
        const style = getComputedStyle(row)
        expect(style.paddingTop).toBe(px(host, `--xh-list-option-py-${size}`))
        expect(style.fontSize).toBe(px(host, `--xh-control-font-${size}`))
        expect(getComputedStyle(part(host, 'branch-control')).columnGap).toBe(px(host, `--xh-control-gap-${size}`))
        const indicator = px(host, `--xh-control-indicator-${size}`)
        expect(getComputedStyle(part(host, 'branch-trigger')).width).toBe(indicator)
        expect(getComputedStyle(part(host, 'item-indicator')).width).toBe(indicator)
        expect(getComputedStyle(part(host, 'node-drag-trigger')).width).toBe(indicator)
        heights.push(row.getBoundingClientRect().height)
      }
      expect(heights[0]).toBeLessThan(heights[1]!)
      expect(heights[1]).toBeLessThan(heights[2]!)

      const indents = await Promise.all((['sm', 'md', 'lg'] as const).map(async size => Number.parseFloat(getComputedStyle(part(await mount(size), 'branch-content')).paddingInlineStart)))
      expect(indents[0]).toBeLessThan(indents[1]!)
      expect(indents[1]).toBeLessThan(indents[2]!)

      const plain = await mount()
      const md = await mount('md')
      expect(part(plain, 'root').dataset.size).toBe('md')
      expect(part(plain, 'item').getBoundingClientRect().height).toBe(part(md, 'item').getBoundingClientRect().height)
      expect(getComputedStyle(part(plain, 'branch-content')).paddingInlineStart).toBe(getComputedStyle(part(md, 'branch-content')).paddingInlineStart)
    })
  }
})
