// 换装与搬运的动效：穿梭框搬运、标签增删、面包屑换路径时条目进退场；日历翻页网格淡入；
// 滑块点到轨道上的那一跳滑过去、拖动跟手；浮动面板收拢时正文由替身缩回去、还原时内容面补回原高。
// 宿主带着 [hidden]{display:none!important}（Tailwind preflight 同款）。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import {
  XhBreadcrumbRoot,
  XhCalendarPickerCell,
  XhCalendarPickerCellTrigger,
  XhCalendarPickerGrid,
  XhCalendarPickerGridBody,
  XhCalendarPickerHeader,
  XhCalendarPickerNextTrigger,
  XhCalendarPickerRoot,
  XhCalendarPickerWeekRow,
  XhFloatingPanelBody,
  XhFloatingPanelContent,
  XhFloatingPanelHeader,
  XhFloatingPanelPositioner,
  XhFloatingPanelRoot,
  XhFloatingPanelTitle,
  XhFloatingPanelWindowStateTrigger,
  XhSliderControl,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
  XhTransferRoot,
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

/** 宿主上把进退场、换位、展开与收起都拉长到 10s：按键与点击经 CDP 往返，默认时长回来时早就播完了。 */
async function mount(node: ReactNode): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
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

function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
}

function tween(el: Element): Animation | undefined {
  return el.getAnimations().find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

function part(scope: string, name: string, extra = ''): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']${extra}`)]
}

describe('react 穿梭框搬运', () => {
  it('搬过去的在目标一侧进场，原来那一侧由替身淡出', async () => {
    await mount(<XhTransferRoot collection={[{ value: 'a', label: '张三' }, { value: 'b', label: '李四' }, { value: 'c', label: '王五' }]} />)
    for (const item of part('transfer', 'item'))
      expect(running(item)).toEqual([])
    const source = part('transfer', 'item', `[data-value='b']`)[0]!
    const top = source.getBoundingClientRect().top
    await userEvent.click(source)
    await userEvent.click(part('transfer', 'to-target-trigger')[0]!)
    await expect.poll(() => part('transfer', 'item', '[data-xh-ghost]').length).toBe(1)
    const ghost = part('transfer', 'item', '[data-xh-ghost]')[0]!
    expect(Math.abs(ghost.getBoundingClientRect().top - top)).toBeLessThan(1)
    expect(running(ghost)).toEqual(['xh-fade-out'])
    const arrived = part('transfer', 'list')[1]!.querySelector<HTMLElement>(`[data-scope='transfer'][data-part='item'][data-value='b']`)!
    expect(running(arrived)).toEqual(['xh-item-in'])
  })
})

let setTabs: (next: string[]) => void = () => {}

function Tabs(): ReactNode {
  const [tabs, set] = useState(['a', 'b', 'c'])
  setTabs = set
  return (
    <XhTabsRoot defaultValue="a">
      <XhTabsList>
        {tabs.map(value => <XhTabsTrigger key={value} value={value}>{`标签 ${value}`}</XhTabsTrigger>)}
      </XhTabsList>
    </XhTabsRoot>
  )
}

let setPath: (next: Array<{ value: string, label: string, href: string }>) => void = () => {}
const PATH = [{ value: 'home', label: '首页', href: '#home' }, { value: 'sys', label: '系统', href: '#sys' }, { value: 'users', label: '用户', href: '#users' }]

function Crumbs(): ReactNode {
  const [path, set] = useState(PATH)
  setPath = set
  return <XhBreadcrumbRoot collection={path} />
}

describe('react 标签增删与面包屑换路径', () => {
  it('新加的标签原地放大淡入；关掉的由替身收小淡出', async () => {
    await mount(<Tabs />)
    for (const trigger of part('tabs', 'trigger'))
      expect(running(trigger)).toEqual([])
    await inAct(() => setTabs(['a', 'b', 'c', 'd']))
    await settle()
    expect(running(part('tabs', 'trigger', `[data-value='d']`)[0]!)).toEqual(['xh-pop-in'])
    const left = part('tabs', 'trigger', `[data-value='b']`)[0]!.getBoundingClientRect().left
    await inAct(() => setTabs(['a', 'c', 'd']))
    await expect.poll(() => part('tabs', 'trigger', '[data-xh-ghost]').length).toBe(1)
    const ghost = part('tabs', 'trigger', '[data-xh-ghost]')[0]!
    expect(Math.abs(ghost.getBoundingClientRect().left - left)).toBeLessThan(1)
    expect(running(ghost)).toEqual(['xh-pop-out'])
  })

  it('面包屑新到的层级淡入，走掉的由替身留在原处淡出', async () => {
    await mount(<Crumbs />)
    for (const item of part('breadcrumb', 'item'))
      expect(running(item)).toEqual([])
    const left = part('breadcrumb', 'item').at(-1)!.getBoundingClientRect().left
    await inAct(() => setPath([...PATH.slice(0, 2), { value: 'roles', label: '角色', href: '#roles' }]))
    await expect.poll(() => part('breadcrumb', 'item', '[data-xh-ghost]').length).toBe(1)
    const ghost = part('breadcrumb', 'item', '[data-xh-ghost]')[0]!
    expect(Math.abs(ghost.getBoundingClientRect().left - left)).toBeLessThan(1)
    expect(running(ghost)).toEqual(['xh-fade-out'])
    const arrived = part('breadcrumb', 'item', ':not([data-xh-ghost])').at(-1)!
    expect(arrived.textContent).toContain('角色')
    expect(running(arrived)).toEqual(['xh-fade-in'])
  })
})

describe('react 日历翻页与滑块跳位', () => {
  it('翻到下一页时网格原地淡入，不横移', async () => {
    await mount(
      <XhCalendarPickerRoot locale="zh-CN" timeZone="UTC" defaultValue="2026-07-15">
        {({ weeks }: { weeks: { start: string, day: number }[][] }) => (
          <>
            <XhCalendarPickerHeader><XhCalendarPickerNextTrigger aria-label="下个月" /></XhCalendarPickerHeader>
            <XhCalendarPickerGrid>
              <XhCalendarPickerGridBody>
                {weeks.map(week => (
                  <XhCalendarPickerWeekRow key={week[0]!.start}>
                    {week.map(day => (
                      <XhCalendarPickerCell key={day.start} value={day.start}>
                        <XhCalendarPickerCellTrigger>{String(day.day)}</XhCalendarPickerCellTrigger>
                      </XhCalendarPickerCell>
                    ))}
                  </XhCalendarPickerWeekRow>
                ))}
              </XhCalendarPickerGridBody>
            </XhCalendarPickerGrid>
          </>
        )}
      </XhCalendarPickerRoot>,
    )
    const grid = part('calendar-picker', 'grid')[0]!
    expect(tween(grid)).toBeUndefined()
    await userEvent.click(part('calendar-picker', 'next-trigger')[0]!)
    await expect.poll(() => tween(grid) !== undefined).toBe(true)
    const fade = tween(grid)!
    fade.pause()
    fade.currentTime = 0
    expect(Number(getComputedStyle(grid).opacity)).toBeLessThan(0.05)
  })

  it('滑块点到轨道上拇指滑过去；按住一挪动就跟手', async () => {
    await mount(
      <XhSliderRoot aria-label="音量" defaultValue={[20]}>
        <XhSliderControl>
          <XhSliderTrack><XhSliderRange /></XhSliderTrack>
          <XhSliderThumb index={0} />
        </XhSliderControl>
      </XhSliderRoot>,
    )
    const track = part('slider', 'track')[0]!
    const thumb = part('slider', 'thumb')[0]!
    const box = track.getBoundingClientRect()
    await userEvent.click(track, { position: { x: box.width * 0.8, y: box.height / 2 } })
    await settle()
    const moves = thumb.getAnimations().filter(a => a instanceof CSSTransition).map(a => (a as CSSTransition).transitionProperty)
    expect(moves.some(name => /inset|left|right/.test(name))).toBe(true)

    const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
    const scale = await seen
    const at = (x: number, y: number) => ({ x: x / scale, y: y / scale })
    const start = thumb.getBoundingClientRect()
    const sx = start.left + start.width / 2
    const sy = start.top + start.height / 2
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(sx, sy) })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(sx, sy) })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(sx - 60, sy) })
    await settle()
    expect(thumb.hasAttribute('data-following')).toBe(true)
    expect(getComputedStyle(thumb).transitionProperty).not.toMatch(/inset/)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(sx - 60, sy) })
    await settle()
    expect(thumb.hasAttribute('data-following')).toBe(false)
  })
})

describe('react 浮动面板收拢与还原', () => {
  it('收拢时正文由替身随内容面收短；还原时内容面从标题栏的高度补回原高', async () => {
    await mount(
      <XhFloatingPanelRoot defaultOpen defaultPosition={{ x: 40, y: 40 }} defaultDimensions={{ width: 320, height: 240 }}>
        <XhFloatingPanelPositioner>
          <XhFloatingPanelContent>
            <XhFloatingPanelHeader>
              <XhFloatingPanelTitle>调试面板</XhFloatingPanelTitle>
              <XhFloatingPanelWindowStateTrigger windowState="minimized" />
            </XhFloatingPanelHeader>
            <XhFloatingPanelBody>正文</XhFloatingPanelBody>
          </XhFloatingPanelContent>
        </XhFloatingPanelPositioner>
      </XhFloatingPanelRoot>,
    )
    const content = part('floating-panel', 'content')[0]!
    const full = content.getBoundingClientRect().height
    for (const name of ['expand', 'collapse'])
      content.style.setProperty(`--xh-motion-duration-${name}`, '10s')
    await userEvent.click(part('floating-panel', 'window-state-trigger')[0]!)
    await expect.poll(() => part('floating-panel', 'body', '[data-xh-ghost]').length).toBe(1)
    const ghost = part('floating-panel', 'body', '[data-xh-ghost]')[0]!
    const shrinking = tween(content)!
    shrinking.pause()
    shrinking.currentTime = 0
    expect(Math.abs(content.getBoundingClientRect().height - full)).toBeLessThan(1.5)
    shrinking.finish()
    tween(ghost)?.finish()
    await expect.poll(() => ghost.isConnected).toBe(false)
    const header = content.getBoundingClientRect().height
    expect(header).toBeLessThan(full - 1)
    await userEvent.click(part('floating-panel', 'window-state-trigger')[0]!)
    await expect.poll(() => tween(content) !== undefined).toBe(true)
    const restoring = tween(content)!
    restoring.pause()
    restoring.currentTime = 0
    expect(Math.abs(content.getBoundingClientRect().height - header)).toBeLessThan(1)
    restoring.finish()
    expect(Math.abs(content.getBoundingClientRect().height - full)).toBeLessThan(1)
  })
})
