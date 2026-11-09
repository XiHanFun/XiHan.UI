// 换装与搬运的动效：穿梭框搬运、标签增删、面包屑换路径时条目进退场；日历翻页网格淡入；
// 滑块点到轨道上的那一跳滑过去；浮动面板收拢时正文由替身随内容面收短、还原时内容面补回原高。
// 替身里克隆出来的元素不接线，播完前不被重建。
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

type XhElement = HTMLElement & { updateComplete: Promise<unknown>, [key: string]: unknown }

let host: HTMLElement | null = null

beforeEach(() => {
  setDiagnosticsLevel('silent')
})

afterEach(() => {
  host?.remove()
  host = null
  document.getElementById('xh-portal-root')?.remove()
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

/** 宿主上把进退场、换位、展开与收起都拉长到 10s：按键与点击经 CDP 往返，默认时长回来时早就播完了。 */
async function mount(tag: string, setup: (el: XhElement) => void, markup = ''): Promise<XhElement> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
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

function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
}

function tween(el: Element): Animation | undefined {
  return el.getAnimations().find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

function part(scope: string, name: string, extra = ''): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']${extra}`)]
}

describe('xh-transfer 搬运', () => {
  it('搬过去的在目标一侧进场，原来那一侧由替身淡出', async () => {
    await mount('xh-transfer', (el) => {
      el.collection = [{ value: 'a', label: '张三' }, { value: 'b', label: '李四' }, { value: 'c', label: '王五' }]
    })
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
    await expect.poll(() => running(arrived)).toEqual(['xh-item-in'])
  })
})

describe('xh-tabs 增删与 xh-breadcrumb 换路径', () => {
  it('新加的标签原地放大淡入；关掉的由替身收小淡出', async () => {
    const tabs = await mount('xh-tabs', (el) => {
      el.collection = ['a', 'b', 'c'].map(value => ({ value, label: `标签 ${value}` }))
      el.setAttribute('default-value', 'a')
    })
    for (const trigger of part('tabs', 'trigger'))
      expect(running(trigger)).toEqual([])
    tabs.collection = ['a', 'b', 'c', 'd'].map(value => ({ value, label: `标签 ${value}` }))
    await settle(tabs)
    await expect.poll(() => running(part('tabs', 'trigger', `[data-value='d']`)[0]!)).toEqual(['xh-pop-in'])
    const left = part('tabs', 'trigger', `[data-value='b']`)[0]!.getBoundingClientRect().left
    tabs.collection = ['a', 'c', 'd'].map(value => ({ value, label: `标签 ${value}` }))
    await expect.poll(() => part('tabs', 'trigger', '[data-xh-ghost]').length).toBe(1)
    const ghost = part('tabs', 'trigger', '[data-xh-ghost]')[0]!
    expect(Math.abs(ghost.getBoundingClientRect().left - left)).toBeLessThan(1)
    expect(running(ghost)).toEqual(['xh-pop-out'])
  })

  it('面包屑新到的层级淡入，走掉的由替身留在原处淡出', async () => {
    const path = [{ value: 'home', label: '首页', href: '#home' }, { value: 'sys', label: '系统', href: '#sys' }, { value: 'users', label: '用户', href: '#users' }]
    const crumbs = await mount('xh-breadcrumb', (el) => {
      el.collection = path
    })
    for (const item of part('breadcrumb', 'item'))
      expect(running(item)).toEqual([])
    const left = part('breadcrumb', 'item').at(-1)!.getBoundingClientRect().left
    crumbs.collection = [...path.slice(0, 2), { value: 'roles', label: '角色', href: '#roles' }]
    await expect.poll(() => part('breadcrumb', 'item', '[data-xh-ghost]').length).toBe(1)
    const ghost = part('breadcrumb', 'item', '[data-xh-ghost]')[0]!
    expect(Math.abs(ghost.getBoundingClientRect().left - left)).toBeLessThan(1)
    expect(running(ghost)).toEqual(['xh-fade-out'])
    const arrived = part('breadcrumb', 'item', ':not([data-xh-ghost])').at(-1)!
    expect(arrived.textContent).toContain('角色')
    await expect.poll(() => running(arrived)).toEqual(['xh-fade-in'])
  })
})

describe('xh-calendar-picker 翻页与 xh-slider 跳位', () => {
  it('翻到下一页时网格原地淡入', async () => {
    await mount('xh-calendar-picker', (el) => {
      el.setAttribute('locale', 'zh-CN')
      el.setAttribute('time-zone', 'UTC')
      el.setAttribute('default-value', '2026-07-15')
    }, `<div data-xh-part="root">
      <div data-xh-part="header"><button data-xh-part="next-trigger" aria-label="下个月"></button></div>
      <div data-xh-part="grid"><div data-xh-part="grid-body"></div></div>
    </div>`)
    const grid = part('calendar-picker', 'grid')[0]!
    expect(tween(grid)).toBeUndefined()
    await userEvent.click(part('calendar-picker', 'next-trigger')[0]!)
    await expect.poll(() => tween(grid) !== undefined).toBe(true)
    const fade = tween(grid)!
    fade.pause()
    fade.currentTime = 0
    expect(Number(getComputedStyle(grid).opacity)).toBeLessThan(0.05)
  })

  it('滑块点到轨道上：拇指从原位置滑到落点', async () => {
    await mount('xh-slider', (el) => {
      el.setAttribute('aria-label', '音量')
      el.defaultValue = [20]
    })
    const track = part('slider', 'track')[0]!
    const thumb = part('slider', 'thumb')[0]!
    const box = track.getBoundingClientRect()
    await userEvent.click(track, { position: { x: box.width * 0.8, y: box.height / 2 } })
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    const moves = thumb.getAnimations().filter(a => a instanceof CSSTransition).map(a => (a as CSSTransition).transitionProperty)
    expect(moves.some(name => /inset|left|right/.test(name))).toBe(true)
  })
})

describe('xh-floating-panel 收拢与还原', () => {
  it('收拢时正文由替身随内容面收短；还原时内容面从标题栏的高度补回原高', async () => {
    await mount('xh-floating-panel', (el) => {
      el.setAttribute('default-open', '')
      el.setAttribute('default-position', '40,40')
      el.setAttribute('default-dimensions', '320,240')
      el.style.display = 'contents'
    }, `<div data-xh-part="root"><div data-xh-part="positioner"><div data-xh-part="content">
      <div data-xh-part="header"><h2 data-xh-part="title">调试面板</h2><button data-xh-part="window-state-trigger" window-state="minimized"></button></div>
      <div data-xh-part="body">正文</div>
    </div></div></div>`)
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
