// 表格与截断的展开动效：树形表格展开子行时新行进场、收起时替身在原处淡出，下面的行从旧位置滑过去；
// 详情行与截断的铺开、收回按实测高度补间。宿主带着 [hidden]{display:none!important}（Tailwind preflight 同款）。
import type { TableVisibleRow } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
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
import './hidden-important-host'

let root: Root | null = null
let host: HTMLElement | null = null
const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

async function settle(): Promise<void> {
  for (let index = 0; index < 4; index++) {
    await inAct(async () => {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    })
  }
}

/** 宿主上把进场、退场、换位、展开与收起都拉长到 10s：按键与点击经 CDP 往返，默认时长回来时早就播完了。 */
async function mount(node: ReactNode): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '360px'
  for (const name of ['enter', 'exit', 'move', 'expand', 'collapse'])
    host.style.setProperty(`--xh-motion-duration-${name}`, '10s')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(node))
  await settle()
}

afterEach(async () => {
  if (root)
    await inAct(() => root!.unmount())
  root = null
  host?.remove()
  host = null
})

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

const TREE_ROWS = [{ id: 'a' }, { id: 'a1', parentId: 'a' }, { id: 'a2', parentId: 'a' }, { id: 'b' }]

function TreeTable({ expanded = [] }: { expanded?: string[] }): ReactNode {
  return (
    <XhTableRoot columns={[{ id: 'name', label: '名称' }]} rows={TREE_ROWS} defaultExpandedValue={expanded} aria-label="组织">
      {({ visibleRows }: { visibleRows: TableVisibleRow[] }) => (
        <XhTableBody>
          {visibleRows.filter(entry => entry.kind === 'data').map(entry => (
            <XhTableRow key={entry.id} value={entry.id}><XhTableCell value="name">{`${entry.id} 名称`}</XhTableCell></XhTableRow>
          ))}
        </XhTableBody>
      )}
    </XhTableRoot>
  )
}

describe('react 树形表格展开、收起子行', () => {
  it('右键展开：新到的子行进场，下面的行从旧位置滑下去', async () => {
    await mount(<TreeTable />)
    expect(running(row('a')!)).toEqual([])
    const below = row('b')!
    row('a')!.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.poll(() => row('a1') !== null).toBe(true)
    await settle()
    expect(running(row('a1')!)).toEqual(['xh-item-in'])
    expect(offsetY(below)).toBeLessThan(0)
  })

  it('左键收起：子行的替身留在原处淡出，下面的行从旧位置滑上去', async () => {
    await mount(<TreeTable expanded={['a']} />)
    const childTop = row('a1')!.getBoundingClientRect().top
    const below = row('b')!
    row('a')!.focus()
    await userEvent.keyboard('{ArrowLeft}')
    const ghostSelector = `[data-scope='table'][data-part='row'][data-xh-ghost]`
    await expect.poll(() => host!.querySelectorAll(ghostSelector).length).toBe(2)
    // 两条子行各放一个替身：DOM 里的先后不代表屏上的先后，按位置认
    const ghost = [...host!.querySelectorAll<HTMLElement>(ghostSelector)].find(el => Math.abs(el.getBoundingClientRect().top - childTop) < 1)!
    expect(ghost).toBeDefined()
    expect(running(ghost)).toEqual(['xh-fade-out'])
    expect(offsetY(below)).toBeGreaterThan(0)
  })
})

describe('react 表格详情行与截断', () => {
  it('详情行展开从 0 补到实测高度；收起由替身缩回去', async () => {
    const orders = [{ id: 'o1', detail: '键盘 ×1、鼠标 ×2' }, { id: 'o2', detail: '显示器支架 ×1' }]
    await mount(
      <XhTableRoot columns={[{ id: 'expand', width: '2.5rem' }, { id: 'order', label: '订单号' }]} rows={orders.map(o => ({ id: o.id, expandable: true }))} aria-label="订单">
        <XhTableBody>
          {orders.flatMap(o => [
            <XhTableRow key={o.id} value={o.id}>
              <XhTableCell value="expand"><XhTableExpandTrigger /></XhTableCell>
              <XhTableCell value="order">{o.id}</XhTableCell>
            </XhTableRow>,
            <XhTableExpandedRow key={`${o.id}-detail`} value={o.id}><XhTableCell value="expand" colSpan={2}>{o.detail}</XhTableCell></XhTableExpandedRow>,
          ])}
        </XhTableBody>
      </XhTableRoot>,
    )
    const detail = host!.querySelector<HTMLElement>(`[data-scope='table'][data-part='expanded-row']`)!
    const trigger = host!.querySelector<HTMLElement>(`[data-scope='table'][data-part='expand-trigger']`)!
    await userEvent.click(trigger)
    await expect.poll(() => tween(detail) !== undefined).toBe(true)
    const expanding = tween(detail)!
    expanding.pause()
    seek(expanding, 0)
    expect(detail.getBoundingClientRect().height).toBeLessThan(1)
    expanding.finish()
    await userEvent.click(trigger)
    const ghostSelector = `[data-scope='table'][data-part='expanded-row'][data-xh-ghost]`
    await expect.poll(() => host!.querySelector(ghostSelector) !== null).toBe(true)
    const ghost = host!.querySelector<HTMLElement>(ghostSelector)!
    tween(ghost)!.finish()
    await expect.poll(() => ghost.isConnected).toBe(false)
  })

  it('截断收回：补间里仍按铺开的排法摆着，盒子收到夹紧的高度才换回行数夹紧', async () => {
    const text = '这是一段足够长的说明文字，用来把两行的盒子撑满再多出几行，好让铺开与收回都有高度可补。'.repeat(3)
    await mount(<div style={{ inlineSize: '200px' }}><XhTruncate lines={2} expandable>{text}</XhTruncate></div>)
    const box = host!.querySelector<HTMLElement>(`[data-scope='truncate'][data-part='root']`)!
    const trigger = host!.querySelector<HTMLElement>(`[data-scope='truncate'][data-part='trigger']`)!
    const clamped = box.getBoundingClientRect().height
    // 夹紧态的 display 计算值：Chrome 把行数夹紧的 -webkit-box 报成 flow-root，按它自己报的认
    const clampedDisplay = getComputedStyle(box).display
    await userEvent.click(trigger)
    await expect.poll(() => tween(box) !== undefined).toBe(true)
    const opening = tween(box)!
    opening.pause()
    seek(opening, 0)
    expect(Math.abs(box.getBoundingClientRect().height - clamped)).toBeLessThan(1)
    opening.finish()
    const full = box.getBoundingClientRect().height
    await userEvent.click(trigger)
    await expect.poll(() => tween(box) !== undefined).toBe(true)
    const closing = tween(box)!
    closing.pause()
    seek(closing, 0)
    expect(Math.abs(box.getBoundingClientRect().height - full)).toBeLessThan(1)
    expect(getComputedStyle(box).display).toBe('block')
    // 补间途中仍是收着的那一档：展开钮与 data-state 不因为排法还铺着就被撤掉
    expect(box.getAttribute('data-state')).toBe('closed')
    expect(host!.querySelector<HTMLElement>(`[data-scope='truncate'][data-part='trigger']`)!.hidden).toBe(false)
    closing.finish()
    expect(getComputedStyle(box).display).toBe(clampedDisplay)
  })
})
