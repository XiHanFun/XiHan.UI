// 悬停展开的菜单（React）：真实指针按正常速度分段从触发钮移向列表，路上不收；移出整个区域在收起延时内收起；
// 点击与键盘照样打开；子菜单从入口移进子层不收、改走同层别的条目照旧收起。判据全集与 Vue 的同名用例一致。
// 离开触发钮时浏览器先派 pointerleave，紧接着派一次同坐标的 pointermove：这一点正是安全三角的顶点。
// 指针经 CDP 派发（与 field-array-drag 同法），每段之间隔一帧左右，不直接跳到目标。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { HOVER_INTENT_CLOSE_DELAY } from '@xihan-ui/core'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import {
  XhButton,
  XhMenuContent,
  XhMenuItem,
  XhMenuItemIcon,
  XhMenuItemIndicator,
  XhMenuItemText,
  XhMenuPositioner,
  XhMenuRadioGroup,
  XhMenuRadioItem,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuSub,
  XhMenuSubTrigger,
  XhMenuTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface Point {
  x: number
  y: number
}

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
const TENANTS = ['总部', '华东分公司', '华南分公司']

let root: Root | null = null
let host: HTMLElement | null = null
let scale = 0
let last: Point = { x: 0, y: 0 }

async function inAct(work: () => void): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(work)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

afterEach(async () => {
  await inAct(() => root?.unmount())
  root = null
  host?.remove()
  host = null
})

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function center(el: Element): Point {
  const rect = el.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

async function dispatchMove(point: Point): Promise<void> {
  if (!scale) {
    const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
    scale = await seen
  }
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x / scale, y: point.y / scale })
}

/** 从上一个落点分段移到 target，每段之间等一帧左右；返回每段之后 probe 的结果。 */
async function moveTo<T>(target: Point, steps: number, probe: () => T): Promise<T[]> {
  const from = last
  const seen: T[] = []
  for (let i = 1; i <= steps; i++) {
    await dispatchMove({ x: from.x + ((target.x - from.x) * i) / steps, y: from.y + ((target.y - from.y) * i) / steps })
    await sleep(16)
    seen.push(probe())
  }
  last = target
  return seen
}

async function park(point: Point): Promise<void> {
  await dispatchMove(point)
  last = point
  await sleep(16)
}

function expanded(trigger: Element): boolean {
  return trigger.getAttribute('aria-expanded') === 'true'
}

async function mount(node: ReactNode): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.cssText = 'display: flex; justify-content: flex-end; padding: 240px 96px'
  document.body.append(host)
  await inAct(() => {
    root = createRoot(host!)
    root.render(node)
  })
  return host.querySelector<HTMLElement>('[aria-haspopup="menu"]')!
}

/** 照 BasicApp 页头：触发钮 asChild 包按钮（图标 + 文字），列表里是单选组与带图标的条目。 */
function HoverMenu({ placement }: { placement: 'bottom' | 'bottom-end' | 'top' }): ReactNode {
  const [radio, setRadio] = useState<Record<string, string>>({ tenant: TENANTS[0]! })
  return (
    <XhMenuRoot openOnHover placement={placement} radioValue={radio} onRadioValueChange={({ value }) => setRadio(value)}>
      <XhMenuTrigger asChild>
        <XhButton variant="ghost">
          <span aria-hidden="true" style={{ display: 'inline-block', inlineSize: 16, blockSize: 16, background: 'currentColor' }} />
          切换租户
        </XhButton>
      </XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent>
          <XhMenuRadioGroup value="tenant">
            {TENANTS.map(name => (
              <XhMenuRadioItem key={name} value={name}>
                <XhMenuItemText>{name}</XhMenuItemText>
                <XhMenuItemIndicator />
              </XhMenuRadioItem>
            ))}
          </XhMenuRadioGroup>
          <XhMenuSeparator />
          <XhMenuItem value="manage">
            <XhMenuItemIcon>⚙</XhMenuItemIcon>
            <XhMenuItemText>管理租户</XhMenuItemText>
          </XhMenuItem>
        </XhMenuContent>
      </XhMenuPositioner>
    </XhMenuRoot>
  )
}

function menuItems(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="menu"][data-part="item"]')]
}

/** 从触发钮左上方分段移进触发钮，停住等它悬停展开、落位。 */
async function hoverOpen(trigger: HTMLElement): Promise<void> {
  const rect = trigger.getBoundingClientRect()
  await park({ x: rect.left - 40, y: rect.top - 30 })
  await moveTo(center(trigger), 4, () => null)
  await expect.poll(() => expanded(trigger)).toBe(true)
  await sleep(150)
}

describe('react 悬停展开的菜单：真实指针分段移动', () => {
  it.for(['bottom', 'bottom-end', 'top'] as const)('placement=%s：从触发钮按正常速度移进列表，路上不收，停在列表里也不收', async (placement) => {
    const trigger = await mount(<HoverMenu placement={placement} />)
    await hoverOpen(trigger)
    const items = menuItems()
    // 走向离触发钮最近的那一条
    const nearest = placement.startsWith('top') ? items.at(-1)! : items[0]!
    const states = await moveTo(center(nearest), 10, () => expanded(trigger))
    expect(states).toEqual(states.map(() => true))
    await sleep(HOVER_INTENT_CLOSE_DELAY + 120)
    expect(expanded(trigger)).toBe(true)
  })

  it('移出整个区域：收起延时之内收起；从触发钮走开、从列表走开都一样', async () => {
    const trigger = await mount(<HoverMenu placement="bottom-end" />)
    await hoverOpen(trigger)
    const item = menuItems()[0]!
    await moveTo(center(item), 10, () => null)
    const content = item.closest<HTMLElement>('[data-part="content"]')!.getBoundingClientRect()
    await moveTo({ x: content.left - 160, y: center(item).y }, 8, () => null)
    await sleep(HOVER_INTENT_CLOSE_DELAY + 120)
    expect(expanded(trigger)).toBe(false)

    await hoverOpen(trigger)
    const rect = trigger.getBoundingClientRect()
    await moveTo({ x: center(trigger).x, y: rect.top - 120 }, 8, () => null)
    await sleep(HOVER_INTENT_CLOSE_DELAY + 120)
    expect(expanded(trigger)).toBe(false)
  })

  it('点击与键盘照样打开', async () => {
    const trigger = await mount(<HoverMenu placement="bottom-end" />)
    await userEvent.click(trigger)
    await expect.poll(() => expanded(trigger)).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => expanded(trigger)).toBe(false)

    trigger.focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => expanded(trigger)).toBe(true)
    await expect.poll(() => document.activeElement?.closest('[data-scope="menu"][data-part="content"]') != null).toBe(true)
  })

  it('子菜单：从入口移进子层不收，改走同层别的条目子层收起、外层不收', async () => {
    const rootTrigger = await mount(
      <XhMenuRoot>
        <XhMenuTrigger asChild><XhButton variant="subtle">文件操作</XhButton></XhMenuTrigger>
        <XhMenuPositioner>
          <XhMenuContent>
            <XhMenuItem value="open">打开</XhMenuItem>
            <XhMenuSub value="share">
              <XhMenuSubTrigger>发送到</XhMenuSubTrigger>
              <XhMenuPositioner>
                <XhMenuContent>
                  <XhMenuItem value="email">邮件</XhMenuItem>
                  <XhMenuItem value="message">消息</XhMenuItem>
                </XhMenuContent>
              </XhMenuPositioner>
            </XhMenuSub>
            <XhMenuItem value="delete">移到回收站</XhMenuItem>
          </XhMenuContent>
        </XhMenuPositioner>
      </XhMenuRoot>,
    )
    await userEvent.click(rootTrigger)
    await expect.poll(() => expanded(rootTrigger)).toBe(true)
    const byValue = (value: string): HTMLElement => document.querySelector<HTMLElement>(`[data-scope="menu"][data-part="item"][data-value="${value}"]`)!
    const subTrigger = document.querySelector<HTMLElement>('[data-scope="menu"][data-part="content"] [aria-haspopup="menu"]')!
    await park(center(byValue('open')))
    await moveTo(center(subTrigger), 4, () => null)
    await expect.poll(() => expanded(subTrigger)).toBe(true)
    await sleep(150)

    const states = await moveTo(center(byValue('email')), 10, () => expanded(subTrigger))
    expect(states).toEqual(states.map(() => true))
    await sleep(HOVER_INTENT_CLOSE_DELAY + 120)
    expect(expanded(subTrigger)).toBe(true)

    await moveTo(center(subTrigger), 6, () => null)
    await moveTo(center(byValue('delete')), 6, () => null)
    await sleep(HOVER_INTENT_CLOSE_DELAY + 120)
    expect(expanded(subTrigger)).toBe(false)
    expect(expanded(rootTrigger)).toBe(true)
  })
})
