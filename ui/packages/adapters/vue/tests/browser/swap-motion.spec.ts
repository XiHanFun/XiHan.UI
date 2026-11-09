// 换装与搬运的动效：穿梭框搬运、标签增删、面包屑换路径时条目进退场；日历翻页网格淡入；
// 滑块点到轨道上的那一跳滑过去、拖动跟手；浮动面板收拢时正文由替身缩回去、还原时内容面补回原高。
// 在播的动画、过渡与补间途中的尺寸只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
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

/** 宿主上把进退场、换位、展开与收起都拉长到 10s：按键与点击经 CDP 往返，默认时长回来时早就播完了。 */
function mountHost(): HTMLElement {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  for (const name of ['enter', 'exit', 'move', 'expand', 'collapse'])
    host.style.setProperty(`--xh-motion-duration-${name}`, '10s')
  document.body.append(host)
  return host
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

describe('穿梭框搬运', () => {
  it('首帧的条目直接呈现；搬过去的在目标一侧进场，原来那一侧由替身淡出', async () => {
    mountHost()
    const collection = [{ value: 'a', label: '张三' }, { value: 'b', label: '李四' }, { value: 'c', label: '王五' }]
    app = createApp({ render: () => h(XhTransferRoot, { collection }) })
    app.mount(host!)
    await frames(3)
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
    const target = part('transfer', 'list')[1]!
    const arrived = target.querySelector<HTMLElement>(`[data-scope='transfer'][data-part='item'][data-value='b']`)!
    expect(running(arrived)).toEqual(['xh-item-in'])
  })
})

describe('标签增删', () => {
  it('新加的标签原地放大淡入；关掉的由替身收小淡出', async () => {
    mountHost()
    const tabs = ref(['a', 'b', 'c'])
    app = createApp({
      render: () => h(XhTabsRoot, { defaultValue: 'a' }, () =>
        h(XhTabsList, null, () => tabs.value.map(value => h(XhTabsTrigger, { key: value, value }, () => `标签 ${value}`)))),
    })
    app.mount(host!)
    await frames(3)
    for (const trigger of part('tabs', 'trigger'))
      expect(running(trigger)).toEqual([])
    tabs.value = [...tabs.value, 'd']
    await frames(1)
    expect(running(part('tabs', 'trigger', `[data-value='d']`)[0]!)).toEqual(['xh-pop-in'])
    const closing = part('tabs', 'trigger', `[data-value='b']`)[0]!
    const left = closing.getBoundingClientRect().left
    tabs.value = tabs.value.filter(value => value !== 'b')
    await expect.poll(() => part('tabs', 'trigger', '[data-xh-ghost]').length).toBe(1)
    const ghost = part('tabs', 'trigger', '[data-xh-ghost]')[0]!
    expect(Math.abs(ghost.getBoundingClientRect().left - left)).toBeLessThan(1)
    expect(running(ghost)).toEqual(['xh-pop-out'])
  })
})

describe('面包屑换路径', () => {
  it('新到的层级淡入，走掉的由替身留在原处淡出', async () => {
    mountHost()
    const path = ref([{ value: 'home', label: '首页', href: '#home' }, { value: 'sys', label: '系统', href: '#sys' }, { value: 'users', label: '用户', href: '#users' }])
    app = createApp({ render: () => h(XhBreadcrumbRoot, { collection: path.value }) })
    app.mount(host!)
    await frames(3)
    for (const item of part('breadcrumb', 'item'))
      expect(running(item)).toEqual([])
    const leaving = part('breadcrumb', 'item').at(-1)!
    const left = leaving.getBoundingClientRect().left
    path.value = [...path.value.slice(0, 2), { value: 'roles', label: '角色', href: '#roles' }]
    await expect.poll(() => part('breadcrumb', 'item', '[data-xh-ghost]').length).toBe(1)
    const ghost = part('breadcrumb', 'item', '[data-xh-ghost]')[0]!
    expect(Math.abs(ghost.getBoundingClientRect().left - left)).toBeLessThan(1)
    expect(running(ghost)).toEqual(['xh-fade-out'])
    const arrived = part('breadcrumb', 'item', ':not([data-xh-ghost])').at(-1)!
    expect(arrived.textContent).toContain('角色')
    expect(running(arrived)).toEqual(['xh-fade-in'])
  })
})

describe('日历翻页', () => {
  it('翻到下一页时网格原地淡入，不横移', async () => {
    mountHost()
    app = createApp({
      setup: () => () => h(XhCalendarPickerRoot, { locale: 'zh-CN', timeZone: 'UTC', defaultValue: '2026-07-15' }, {
        default: ({ weeks }: { weeks: { start: string, day: number }[][] }) => [
          h(XhCalendarPickerHeader, null, () => h(XhCalendarPickerNextTrigger, { 'aria-label': '下个月' })),
          h(XhCalendarPickerGrid, null, () => h(XhCalendarPickerGridBody, null, () => weeks.map(week =>
            h(XhCalendarPickerWeekRow, { key: week[0]!.start }, () => week.map(day =>
              h(XhCalendarPickerCell, { key: day.start, value: day.start }, () => h(XhCalendarPickerCellTrigger, null, () => String(day.day)))))))),
        ],
      }),
    })
    app.mount(host!)
    await frames(3)
    const grid = part('calendar-picker', 'grid')[0]!
    expect(tween(grid)).toBeUndefined()
    await userEvent.click(part('calendar-picker', 'next-trigger')[0]!)
    await expect.poll(() => tween(grid) !== undefined).toBe(true)
    const fade = tween(grid)!
    fade.pause()
    fade.currentTime = 0
    expect(Number(getComputedStyle(grid).opacity)).toBeLessThan(0.05)
    expect(getComputedStyle(grid).translate).toBe('none')
  })
})

describe('滑块跳位与跟手', () => {
  async function mountSlider(): Promise<HTMLElement> {
    mountHost()
    app = createApp({
      render: () => h(XhSliderRoot, { 'aria-label': '音量', 'defaultValue': [20] }, () =>
        h(XhSliderControl, null, () => [h(XhSliderTrack, null, () => h(XhSliderRange)), h(XhSliderThumb, { index: 0 })])),
    })
    app.mount(host!)
    await frames(3)
    return part('slider', 'track')[0]!
  }

  /** 指针坐标换算：CDP 收的是 CSS 像素乘页面缩放。 */
  async function mouseScale(): Promise<number> {
    const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
    return seen
  }

  it('点到轨道上：拇指从原位置滑到落点（位置走过渡）', async () => {
    const track = await mountSlider()
    const thumb = part('slider', 'thumb')[0]!
    const box = track.getBoundingClientRect()
    await userEvent.click(track, { position: { x: box.width * 0.8, y: box.height / 2 } })
    await frames(1)
    const moves = thumb.getAnimations().filter(a => a instanceof CSSTransition).map(a => (a as CSSTransition).transitionProperty)
    expect(moves.some(name => /inset|left|right/.test(name))).toBe(true)
  })

  it('按住拖动：一挪动就跟手，拇指与区间不再带位置过渡', async () => {
    const track = await mountSlider()
    const scale = await mouseScale()
    const thumb = part('slider', 'thumb')[0]!
    const box = thumb.getBoundingClientRect()
    const at = (x: number, y: number) => ({ x: x / scale, y: y / scale })
    const start = { x: box.left + box.width / 2, y: box.top + box.height / 2 }
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(start.x, start.y) })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(start.x, start.y) })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(start.x + 60, start.y) })
    await frames(1)
    expect(thumb.hasAttribute('data-following')).toBe(true)
    expect(getComputedStyle(thumb).transitionProperty).not.toMatch(/inset/)
    expect(getComputedStyle(part('slider', 'range')[0]!).transitionProperty).not.toMatch(/inset|inline-size/)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(start.x + 60, start.y) })
    await frames(1)
    expect(thumb.hasAttribute('data-following')).toBe(false)
    expect(track.isConnected).toBe(true)
  })
})

describe('浮动面板收拢与还原', () => {
  it('收拢时正文由替身缩回去；还原时内容面从标题栏的高度补回原高', async () => {
    mountHost()
    app = createApp({
      render: () => h(XhFloatingPanelRoot, { defaultOpen: true, defaultPosition: { x: 40, y: 40 }, defaultDimensions: { width: 320, height: 240 } }, () =>
        h(XhFloatingPanelPositioner, null, () => h(XhFloatingPanelContent, null, () => [
          h(XhFloatingPanelHeader, null, () => [
            h(XhFloatingPanelTitle, null, () => '调试面板'),
            h(XhFloatingPanelWindowStateTrigger, { windowState: 'minimized' }),
          ]),
          h(XhFloatingPanelBody, null, () => '正文'),
        ]))),
    })
    app.mount(host!)
    await frames(3)
    const content = part('floating-panel', 'content')[0]!
    const full = content.getBoundingClientRect().height
    // 浮层挂在 body 下：时长槽写到它自己身上
    for (const name of ['expand', 'collapse'])
      content.style.setProperty(`--xh-motion-duration-${name}`, '10s')
    await userEvent.click(part('floating-panel', 'window-state-trigger')[0]!)
    await expect.poll(() => part('floating-panel', 'body', '[data-xh-ghost]').length).toBe(1)
    const ghost = part('floating-panel', 'body', '[data-xh-ghost]')[0]!
    const collapsing = tween(ghost)!
    collapsing.pause()
    collapsing.currentTime = 0
    expect(Math.abs(content.getBoundingClientRect().height - full)).toBeLessThan(1.5)
    // 内容面的高度补间与替身同一段时长，一起播完
    tween(content)?.finish()
    collapsing.finish()
    await expect.poll(() => ghost.isConnected).toBe(false)
    const header = content.getBoundingClientRect().height
    expect(header).toBeLessThan(full - 1)

    // 同一颗钮在收拢态下是还原
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
