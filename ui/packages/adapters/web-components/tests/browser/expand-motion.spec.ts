// 表格与截断的展开动效：树形表格展开子行时新行进场、收起时替身在原处淡出，下面的行从旧位置滑过去；
// 详情行与截断的铺开、收回按实测高度补间。替身里克隆出来的元素不接线，播完前不被重建。
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

type XhElement = HTMLElement & { updateComplete: Promise<unknown>, columns?: unknown, rows?: unknown, defaultExpandedValue?: string[] }

let host: HTMLElement | null = null

beforeEach(() => {
  setDiagnosticsLevel('silent')
})

afterEach(() => {
  host?.remove()
  host = null
  setDiagnosticsLevel('warn')
})

async function settle(el: XhElement): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    await el.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

/** 宿主上把进场、退场、换位、展开与收起都拉长到 10s：按键与点击经 CDP 往返，默认时长回来时早就播完了。 */
async function mount(tag: string, setup: (el: XhElement) => void, markup = ''): Promise<XhElement> {
  host = document.createElement('div')
  host.style.inlineSize = '360px'
  for (const name of ['enter', 'exit', 'move', 'expand', 'collapse'])
    host.style.setProperty(`--xh-motion-duration-${name}`, '10s')
  document.body.append(host)
  const el = document.createElement(tag) as XhElement
  el.innerHTML = markup
  setup(el)
  host.append(el)
  await settle(el)
  return el
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

describe('xh-table 树形子行', () => {
  it('右键展开新到的子行进场；左键收起由替身在原处淡出', async () => {
    const table = await mount('xh-table', (el) => {
      el.columns = [{ id: 'name', label: '名称' }]
      el.rows = [{ id: 'a' }, { id: 'a1', parentId: 'a' }, { id: 'a2', parentId: 'a' }, { id: 'b' }]
    })
    row('a')!.focus()
    await userEvent.keyboard('{ArrowRight}')
    await table.updateComplete
    await expect.poll(() => row('a1') !== null).toBe(true)
    await settle(table)
    expect(running(row('a1')!)).toEqual(['xh-item-in'])
    for (const animation of host!.getAnimations({ subtree: true }))
      animation.finish()

    const childTop = row('a1')!.getBoundingClientRect().top
    row('a')!.focus()
    await userEvent.keyboard('{ArrowLeft}')
    await table.updateComplete
    const ghostSelector = `[data-scope='table'][data-part='row'][data-xh-ghost]`
    await expect.poll(() => host!.querySelectorAll(ghostSelector).length).toBe(2)
    // 两条子行各放一个替身：DOM 里的先后不代表屏上的先后，按位置认
    const ghost = [...host!.querySelectorAll<HTMLElement>(ghostSelector)].find(el => Math.abs(el.getBoundingClientRect().top - childTop) < 1)!
    expect(ghost).toBeDefined()
    expect(running(ghost)).toEqual(['xh-fade-out'])
  })
})

describe('xh-table 详情行与 xh-truncate', () => {
  it('详情行展开从 0 补到实测高度；收起由替身缩回去', async () => {
    await mount('xh-table', (el) => {
      el.columns = [{ id: 'expand', width: '2.5rem' }, { id: 'order', label: '订单号' }]
      el.rows = [{ id: 'o1', expandable: true }]
    }, `<div data-xh-part="root"><div data-xh-part="body">
      <div data-xh-part="row" value="o1">
        <div data-xh-part="cell" value="expand"><button data-xh-part="expand-trigger"></button></div>
        <div data-xh-part="cell" value="order">o1</div>
      </div>
      <div data-xh-part="expanded-row" value="o1"><div data-xh-part="cell" value="expand" colspan="2">键盘 ×1、鼠标 ×2</div></div>
    </div></div>`)
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
    await mount('xh-truncate', (el) => {
      el.setAttribute('lines', '2')
      el.setAttribute('expandable', '')
      el.style.display = 'block'
      el.style.inlineSize = '200px'
    }, `<div data-xh-part="root">${text}</div><button data-xh-part="trigger"></button>`)
    const box = host!.querySelector<HTMLElement>(`[data-scope='truncate'][data-part='root']`)!
    const trigger = host!.querySelector<HTMLElement>(`[data-scope='truncate'][data-part='trigger']`)!
    // 夹紧态的 display 计算值：Chrome 把行数夹紧的 -webkit-box 报成 flow-root，按它自己报的认
    const clampedDisplay = getComputedStyle(box).display
    await userEvent.click(trigger)
    await expect.poll(() => tween(box) !== undefined).toBe(true)
    tween(box)!.finish()
    const full = box.getBoundingClientRect().height
    await userEvent.click(trigger)
    await expect.poll(() => tween(box) !== undefined).toBe(true)
    const closing = tween(box)!
    closing.pause()
    seek(closing, 0)
    expect(Math.abs(box.getBoundingClientRect().height - full)).toBeLessThan(1)
    expect(getComputedStyle(box).display).toBe('block')
    closing.finish()
    expect(getComputedStyle(box).display).toBe(clampedDisplay)
  })
})
