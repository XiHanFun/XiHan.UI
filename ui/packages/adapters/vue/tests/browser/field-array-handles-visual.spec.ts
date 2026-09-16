// FieldArray 四颗把手走 Action Control：行内三颗是 icon ghost xs 正方盒，新增钮是 text outline 虚线钮。
// 盒尺寸、各态底色与按压缩放依赖真实布局和伪类，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhFieldArrayAddTrigger,
  XhFieldArrayItem,
  XhFieldArrayItemAction,
  XhFieldArrayItemContent,
  XhFieldArrayItemDeleteTrigger,
  XhFieldArrayMoveDownTrigger,
  XhFieldArrayMoveUpTrigger,
  XhFieldArrayRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mountArray(): void {
  host = document.createElement('div')
  host.style.inlineSize = '360px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhFieldArrayRoot, { defaultValue: ['甲', '乙', '丙'], movable: true }, () => [
      ...[0, 1, 2].map(index => h(XhFieldArrayItem, { index }, () => [
        h(XhFieldArrayItemContent, null, () => [h('input')]),
        h(XhFieldArrayItemAction, null, () => [
          h(XhFieldArrayMoveUpTrigger),
          h(XhFieldArrayMoveDownTrigger),
          h(XhFieldArrayItemDeleteTrigger),
        ]),
      ])),
      h(XhFieldArrayAddTrigger, null, () => '新增一行'),
    ]),
  })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => setTimeout(resolve, 180))
}

function part(name: string, index = 1): HTMLElement {
  const element = document.querySelectorAll<HTMLElement>(`[data-scope='field-array'][data-part='${name}']`)[index]
  if (!element)
    throw new Error(`找不到 field-array/${name}[${index}]`)
  return element
}

/** 把令牌解析成这台浏览器上的最终颜色，用来与各态底色对账。 */
function tokenColor(token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${token})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('字段数组的把手', () => {
  it('行内三颗把手是 24px 正方盒、控件圆角、静息透明无边', async () => {
    mountArray()
    await settle()
    for (const name of ['move-up-trigger', 'move-down-trigger', 'item-delete-trigger']) {
      const rect = part(name).getBoundingClientRect()
      const style = getComputedStyle(part(name))
      expect(rect.width, name).toBe(24)
      expect(rect.height, name).toBe(24)
      expect(style.borderRadius, name).toBe('4px')
      expect(style.backgroundColor, name).toBe('rgba(0, 0, 0, 0)')
      expect(style.borderTopWidth, name).toBe('0px')
      expect(style.boxShadow, name).toBe('none')
    }
  })

  it('把手悬停落白底阶梯的 100，删除把手的字色转危险色', async () => {
    mountArray()
    await settle()
    await userEvent.hover(part('move-up-trigger'))
    await settle()
    expect(getComputedStyle(part('move-up-trigger')).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(getComputedStyle(part('move-up-trigger')).color).toBe(tokenColor('--xh-fg-default'))

    await userEvent.hover(part('item-delete-trigger'))
    await settle()
    expect(getComputedStyle(part('item-delete-trigger')).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(getComputedStyle(part('item-delete-trigger')).color).toBe(tokenColor('--xh-fg-danger-hover'))
  })

  it('按住把手落 200 并缩到 0.97，松手回 1', async () => {
    mountArray()
    await settle()
    const trigger = part('move-down-trigger')
    await userEvent.hover(trigger)
    // 按住不放：底进 pressed 面、盒缩到按压比例
    await press(trigger)
    await settle()
    expect(getComputedStyle(trigger).backgroundColor).toBe(tokenColor('--xh-bg-subtle-hover'))
    expect(getComputedStyle(trigger).scale).toBe('0.97')
    await release(trigger)
    // 回程 200ms 缓动，采样时可能还差最后一点
    await settle()
    await settle()
    expect(Number(getComputedStyle(trigger).scale === 'none' ? 1 : getComputedStyle(trigger).scale)).toBeCloseTo(1, 2)
  })

  it('新增钮高一个控件、中性虚线描边、品牌字色，悬停落 100 且描边加深', async () => {
    mountArray()
    await settle()
    const add = part('add-trigger', 0)
    expect(add.getBoundingClientRect().height).toBe(36)
    const style = getComputedStyle(add)
    expect(style.borderTopStyle).toBe('dashed')
    expect(style.borderTopColor).toBe(tokenColor('--xh-border-control'))
    expect(style.color).toBe(tokenColor('--xh-fg-brand'))
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')

    await userEvent.hover(add)
    await settle()
    expect(getComputedStyle(add).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(getComputedStyle(add).borderTopColor).toBe(tokenColor('--xh-border-control-hover'))
    expect(getComputedStyle(add).borderTopStyle).toBe('dashed')
  })

  it('按不动的把手不给悬停反馈：首行的上移把手仍透明、字色转禁用', async () => {
    mountArray()
    await settle()
    const first = part('move-up-trigger', 0)
    expect(first.getAttribute('aria-disabled')).toBe('true')
    await userEvent.hover(first)
    await settle()
    expect(getComputedStyle(first).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(first).color).toBe(tokenColor('--xh-fg-disabled'))
  })
})

/**
 * 元素中心在顶层页面上的坐标：测试跑在被缩放过的 iframe 里，CDP 的指针事件按顶层页面的坐标派，
 * 直接拿 getBoundingClientRect 会落到别的地方（把手只有 24px，偏一点就按空）。
 */
function pagePoint(element: HTMLElement): { x: number, y: number } {
  const rect = element.getBoundingClientRect()
  const frame = window.frameElement?.getBoundingClientRect()
  const scale = frame ? frame.width / window.innerWidth : 1
  const left = frame?.left ?? 0
  const top = frame?.top ?? 0
  return { x: left + (rect.left + rect.width / 2) * scale, y: top + (rect.top + rect.height / 2) * scale }
}

/** 按下与松手拆开派：按住的中间帧只有真实的指针事件才看得见。 */
async function press(element: HTMLElement): Promise<void> {
  const { x, y } = pagePoint(element)
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 })
}

async function release(element: HTMLElement): Promise<void> {
  const { x, y } = pagePoint(element)
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 })
}
