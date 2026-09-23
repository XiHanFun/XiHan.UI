// 穿梭框条目接入 Collection Item 的 page 语境（页内持久集合）：勾选行铺品牌淡底 + 淡底前景，
// 标记仍是行首的勾选方框；悬停 100 → 按下 200 只换面，勾选行悬停 20%；搬运钮接 Action Control icon outline 档，
// 按下 0.97 并同时换底；两侧列表接自绘条，条子贴在列表盒上而不是壳边。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSelectAllTrigger,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from '../../src'
import { pressPointer, releasePointer } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const collection = Array.from({ length: 12 }, (_, i) => ({ value: `v${i}`, label: `条目 ${i}` }))

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

/** 在宿主的主题下把令牌解析成最终颜色，断言不写死任何色值。 */
function resolve(token: string, property: 'background-color' | 'color' = 'background-color'): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  host!.append(probe)
  const value = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return value
}

function item(value: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='transfer'][data-part='item'][data-value='${value}']:not([hidden])`)
  if (!el)
    throw new Error(`找不到条目 ${value}`)
  return el
}

async function mountTransfer(): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  // 两侧各挂一份全集，不属于本侧的那一份由组件打上 hidden
  const items = () => collection.map(entry => h(XhTransferItem, { key: entry.value, value: entry.value }, () => [
    h(XhTransferItemCheckbox),
    h(XhTransferItemText, null, () => entry.label),
  ]))
  app = createApp({
    render: () => h(XhTransferRoot, { collection, defaultSelection: ['v0'] }, () => [
      h(XhTransferSourcePanel, null, () => [
        h(XhTransferPanelHeader, null, () => [h(XhTransferSelectAllTrigger, null, () => '全选'), h(XhTransferPanelTitle, null, () => '待选')]),
        h(XhTransferList, null, items),
      ]),
      h(XhTransferToTargetTrigger),
      h(XhTransferToSourceTrigger),
      h(XhTransferTargetPanel, null, () => [
        h(XhTransferPanelHeader, null, () => [h(XhTransferPanelTitle, null, () => '已选')]),
        h(XhTransferList, null, items),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  for (const row of host.querySelectorAll<HTMLElement>('[data-scope="transfer"][data-part="item"]'))
    row.style.transition = 'none'
}

describe('穿梭框的页内选中与按压反馈', () => {
  it('勾选行：品牌淡底 + 淡底前景，方框在文字之前；未勾行悬停 100、按住 200 只换面，勾选行悬停 20%', async () => {
    await mountTransfer()
    const checked = item('v0')
    const plain = item('v1')
    expect(checked.getAttribute('aria-selected')).toBe('true')
    expect(getComputedStyle(checked).backgroundColor).toBe(resolve('--xh-bg-brand-subtle'))
    expect(getComputedStyle(checked).color).toBe(resolve('--xh-fg-on-brand-subtle', 'color'))
    expect(getComputedStyle(checked).fontWeight).toBe(getComputedStyle(plain).fontWeight)
    const box = checked.querySelector<HTMLElement>('[data-part="item-checkbox"]')!
    const text = checked.querySelector<HTMLElement>('[data-part="item-text"]')!
    expect(box.getBoundingClientRect().right).toBeLessThanOrEqual(text.getBoundingClientRect().left)
    // 勾选方框仍是实心品牌面：标记不靠行面一个通道
    expect(getComputedStyle(box).backgroundColor).toBe(resolve('--xh-bg-brand'))

    await userEvent.hover(plain)
    expect(getComputedStyle(plain).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    const before = plain.getBoundingClientRect()
    await pressPointer(plain)
    expect(plain.matches(':active')).toBe(true)
    expect(getComputedStyle(plain).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    expect(getComputedStyle(plain).scale).toBe('none')
    expect(plain.getBoundingClientRect().height).toBe(before.height)
    await releasePointer(plain)
    await userEvent.hover(checked)
    expect(getComputedStyle(checked).backgroundColor).toBe(resolve('--xh-bg-brand-subtle-hover'))
  })

  it('全选格：text ghost 档，24px 命中地板里 16px 方框居中，悬停 100 / 按住 200 只换面不缩放', async () => {
    await mountTransfer()
    const trigger = host!.querySelector<HTMLElement>('[data-scope="transfer"][data-part="select-all-trigger"]')!
    trigger.style.transition = 'none'
    expect(trigger.getAttribute('data-xh-action-profile')).toBe('text')
    expect(trigger.getAttribute('data-xh-action-variant')).toBe('ghost')
    const rest = getComputedStyle(trigger)
    expect(rest.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(rest.paddingInlineStart).toBe('0px')
    expect(trigger.getBoundingClientRect().height).toBe(24)
    const box = getComputedStyle(trigger, '::before')
    expect(box.width).toBe('16px')
    // v0 已勾中：源侧是半选，方框描边与底都是品牌色
    expect(trigger.dataset.state).toBe('indeterminate')
    expect(box.borderTopColor).toBe(resolve('--xh-bg-brand', 'color'))
    expect(box.backgroundColor).toBe(resolve('--xh-bg-brand'))
    await userEvent.hover(trigger)
    expect(getComputedStyle(trigger).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    await pressPointer(trigger)
    expect(getComputedStyle(trigger).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    expect(getComputedStyle(trigger).scale).toBe('none')
    await releasePointer(trigger)
  })

  it('搬运钮：icon outline 档，中性描边透明底、无抬升影；按住 0.97 并换到 200 档', async () => {
    await mountTransfer()
    const trigger = host!.querySelector<HTMLElement>('[data-scope="transfer"][data-part="to-target-trigger"]')!
    trigger.style.transition = 'none'
    // v0 已勾中：钮可用
    expect(trigger.hasAttribute('disabled')).toBe(false)
    const rest = getComputedStyle(trigger)
    expect(rest.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(rest.borderTopColor).toBe(resolve('--xh-border-control', 'color'))
    expect(rest.boxShadow).toBe('none')
    expect(rest.width).toBe(rest.height)
    await userEvent.hover(trigger)
    expect(getComputedStyle(trigger).backgroundColor).toBe(resolve('--xh-bg-subtle'))
    expect(getComputedStyle(trigger).boxShadow).toBe('none')
    await pressPointer(trigger)
    expect(getComputedStyle(trigger).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    expect(getComputedStyle(trigger).scale).toBe('0.97')
    await releasePointer(trigger)
  })

  it('两侧列表各挂一路自绘条：条子贴在列表盒上、住在面板里，纵向溢出时竖条量得出列表的高度', async () => {
    await mountTransfer()
    // 条子的偏移盒在效应里量，推迟一拍才写进内联样式
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    const root = host!.querySelector<HTMLElement>('[data-scope="transfer"][data-part="root"]')!
    const lists = [...host!.querySelectorAll<HTMLElement>('[data-scope="transfer"][data-part="list"]')]
    expect(lists).toHaveLength(2)
    expect(getComputedStyle(root).position).toBe('relative')
    for (const list of lists) {
      const bar = list.nextElementSibling as HTMLElement
      expect(bar.dataset.scope).toBe('scrollbar')
      expect(bar.dataset.orientation).toBe('vertical')
      expect(bar.parentElement).toBe(list.parentElement)
      const listRect = list.getBoundingClientRect()
      const barRect = bar.getBoundingClientRect()
      expect(Math.round(barRect.top)).toBe(Math.round(listRect.top))
      expect(Math.round(barRect.height)).toBe(Math.round(listRect.height))
    }
    // 左侧 12 条溢出，指针进列表时竖条淡入（scroll-hover 档静止隐形）；右侧空，不溢出
    const [source, target] = lists as [HTMLElement, HTMLElement]
    expect(source.scrollHeight).toBeGreaterThan(source.clientHeight)
    expect(target.scrollHeight).toBeLessThanOrEqual(target.clientHeight)
    await userEvent.hover(source)
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    expect((source.nextElementSibling as HTMLElement).dataset.state).not.toBe('hidden')
  })
})
