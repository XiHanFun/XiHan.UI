// 表格与截断的展开动效：树形表格展开子行时新行进场、收起时替身在原处淡出，下面的行从旧位置滑过去；
// 详情行与截断的铺开、收回按实测高度补间。高度、位移与替身的去留只有真实浏览器量得出来。
import type { TableVisibleRow } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableExpandedRow,
  XhTableExpandTrigger,
  XhTableRoot,
  XhTableRow,
  XhTruncate,
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

async function frames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

/** 宿主上把进场、展开、收起与换位都拉长到 10s：按键与点击经 CDP 往返，默认时长回来时早就播完了。 */
function mountHost(): HTMLElement {
  host = document.createElement('div')
  host.style.inlineSize = '360px'
  for (const name of ['enter', 'exit', 'move', 'expand', 'collapse'])
    host.style.setProperty(`--xh-motion-duration-${name}`, '10s')
  document.body.append(host)
  return host
}

function tween(el: Element): Animation | undefined {
  return el.getAnimations().find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
}

function seek(animation: Animation, progress: number): void {
  animation.currentTime = Number(animation.effect!.getComputedTiming().duration) * progress
}

function row(id: string): HTMLElement | null {
  return host!.querySelector<HTMLElement>(`[data-scope='table'][data-part='row'][data-value='${id}']:not([data-xh-ghost])`)
}

function offsetY(el: Element): number {
  const value = getComputedStyle(el).translate
  return !value || value === 'none' ? 0 : Number.parseFloat(value.split(/\s+/)[1] ?? '0') || 0
}

describe('树形表格展开、收起子行', () => {
  async function mountTree(expanded: string[] = []): Promise<void> {
    mountHost()
    const rows = [{ id: 'a' }, { id: 'a1', parentId: 'a' }, { id: 'a2', parentId: 'a' }, { id: 'b' }]
    app = createApp({
      render: () => h(XhTableRoot, {
        'columns': [{ id: 'name', label: '名称' }],
        rows,
        'defaultExpandedValue': expanded,
        'aria-label': '组织',
      }, {
        default: ({ visibleRows }: { visibleRows: TableVisibleRow[] }) => h(XhTableBody, null, () => visibleRows
          .filter(entry => entry.kind === 'data')
          .map(entry => h(XhTableRow, { key: entry.id, value: entry.id }, () => h(XhTableCell, { value: 'name' }, () => `${entry.id} 名称`)))),
      }),
    })
    app.mount(host!)
    await frames()
  }

  it('首帧的行直接呈现；右键展开后新到的子行进场，下面的行从旧位置滑下去', async () => {
    await mountTree()
    expect(running(row('a')!)).toEqual([])
    const below = row('b')!
    const belowTop = below.getBoundingClientRect().top
    row('a')!.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.poll(() => row('a1') !== null).toBe(true)
    await frames(1)
    expect(running(row('a1')!)).toEqual(['xh-item-in'])
    expect(running(row('a2')!)).toEqual(['xh-item-in'])
    expect(offsetY(below)).toBeLessThan(0)
    expect(Math.abs(below.getBoundingClientRect().top - belowTop)).toBeLessThan(2)
  })

  it('左键收起：子行的替身留在原处淡出、播完即移除，下面的行从旧位置滑上去', async () => {
    await mountTree(['a'])
    const childTop = row('a1')!.getBoundingClientRect().top
    const below = row('b')!
    const belowTop = below.getBoundingClientRect().top
    row('a')!.focus()
    await userEvent.keyboard('{ArrowLeft}')
    const ghostSelector = `[data-scope='table'][data-part='row'][data-xh-ghost]`
    await expect.poll(() => host!.querySelectorAll(ghostSelector).length).toBe(2)
    // 两条子行各放一个替身：DOM 里的先后不代表屏上的先后，按位置认
    const ghost = [...host!.querySelectorAll<HTMLElement>(ghostSelector)].find(el => Math.abs(el.getBoundingClientRect().top - childTop) < 1)!
    expect(ghost).toBeDefined()
    expect(running(ghost)).toEqual(['xh-fade-out'])
    expect(offsetY(below)).toBeGreaterThan(0)
    expect(Math.abs(below.getBoundingClientRect().top - belowTop)).toBeLessThan(2)
    for (const animation of ghost.getAnimations())
      animation.finish()
    await expect.poll(() => ghost.isConnected).toBe(false)
  })
})

describe('表格详情行', () => {
  it('展开从 0 补到实测高度；收起由替身缩回去、播完即移除', async () => {
    mountHost()
    const orders = [{ id: 'o1', detail: '键盘 ×1、鼠标 ×2' }, { id: 'o2', detail: '显示器支架 ×1' }]
    app = createApp({
      render: () => h(XhTableRoot, {
        'columns': [{ id: 'expand', width: '2.5rem' }, { id: 'order', label: '订单号' }],
        'rows': orders.map(o => ({ id: o.id, expandable: true })),
        'aria-label': '订单',
      }, () => h(XhTableBody, null, () => orders.flatMap(o => [
        h(XhTableRow, { key: o.id, value: o.id }, () => [
          h(XhTableCell, { value: 'expand' }, () => h(XhTableExpandTrigger)),
          h(XhTableCell, { value: 'order' }, () => o.id),
        ]),
        h(XhTableExpandedRow, { key: `${o.id}-detail`, value: o.id }, () => h(XhTableCell, { value: 'expand', colspan: 2 }, () => o.detail)),
      ]))),
    })
    app.mount(host!)
    await frames()
    const detail = host!.querySelector<HTMLElement>(`[data-scope='table'][data-part='expanded-row']`)!
    await userEvent.click(host!.querySelector<HTMLElement>(`[data-scope='table'][data-part='expand-trigger']`)!)
    await expect.poll(() => tween(detail) !== undefined).toBe(true)
    const expanding = tween(detail)!
    expanding.pause()
    seek(expanding, 0)
    expect(detail.getBoundingClientRect().height).toBeLessThan(1)
    expanding.finish()
    const height = detail.getBoundingClientRect().height
    expect(height).toBeGreaterThan(1)

    await userEvent.click(host!.querySelector<HTMLElement>(`[data-scope='table'][data-part='expand-trigger']`)!)
    const ghostSelector = `[data-scope='table'][data-part='expanded-row'][data-xh-ghost]`
    await expect.poll(() => host!.querySelector(ghostSelector) !== null).toBe(true)
    const ghost = host!.querySelector<HTMLElement>(ghostSelector)!
    const collapsing = tween(ghost)!
    collapsing.pause()
    seek(collapsing, 0)
    expect(Math.abs(ghost.getBoundingClientRect().height - height)).toBeLessThan(1)
    collapsing.finish()
    await expect.poll(() => ghost.isConnected).toBe(false)
  })
})

describe('截断', () => {
  const TEXT = '这是一段足够长的说明文字，用来把三行的盒子撑满再多出几行，好让铺开与收回都有高度可补。'.repeat(3)

  /** 夹紧态的 display 计算值：Chrome 把行数夹紧的 -webkit-box 报成 flow-root，按它自己报的认。 */
  let clampedDisplay = ''

  async function mountTruncate(): Promise<HTMLElement> {
    mountHost()
    app = createApp({
      render: () => h('div', { style: { inlineSize: '200px' } }, h(XhTruncate, { lines: 2, expandable: true }, () => TEXT)),
    })
    app.mount(host!)
    await frames(3)
    const root = host!.querySelector<HTMLElement>(`[data-scope='truncate'][data-part='root']`)!
    clampedDisplay = getComputedStyle(root).display
    return root
  }

  it('铺开：盒子从夹紧的高度补到全文的高度', async () => {
    const root = await mountTruncate()
    const clamped = root.getBoundingClientRect().height
    await userEvent.click(host!.querySelector<HTMLElement>(`[data-scope='truncate'][data-part='trigger']`)!)
    await expect.poll(() => tween(root) !== undefined).toBe(true)
    const animation = tween(root)!
    animation.pause()
    seek(animation, 0)
    expect(Math.abs(root.getBoundingClientRect().height - clamped)).toBeLessThan(1)
    animation.finish()
    expect(root.getBoundingClientRect().height).toBeGreaterThan(clamped + 1)
  })

  it('收回：补间里仍按铺开的排法摆着，盒子收到夹紧的高度才换回行数夹紧', async () => {
    const root = await mountTruncate()
    const trigger = host!.querySelector<HTMLElement>(`[data-scope='truncate'][data-part='trigger']`)!
    await userEvent.click(trigger)
    await expect.poll(() => tween(root) !== undefined).toBe(true)
    tween(root)!.finish()
    const full = root.getBoundingClientRect().height
    await userEvent.click(trigger)
    await expect.poll(() => tween(root) !== undefined).toBe(true)
    const animation = tween(root)!
    animation.pause()
    seek(animation, 0)
    expect(Math.abs(root.getBoundingClientRect().height - full)).toBeLessThan(1)
    expect(getComputedStyle(root).display).toBe('block')
    // 补间途中仍是收着的那一档：展开钮与 data-state 不因为排法还铺着就被撤掉
    expect(root.getAttribute('data-state')).toBe('closed')
    expect(host!.querySelector<HTMLElement>(`[data-scope='truncate'][data-part='trigger']`)!.hidden).toBe(false)
    animation.finish()
    expect(root.getBoundingClientRect().height).toBeLessThan(full - 1)
    expect(getComputedStyle(root).display).toBe(clampedDisplay)
  })
})
