// 标签带放不下时的位移：不折行、只裁主轴，两端翻页钮贴边、滚到头的那一侧收起，
// 翻页 / 滚轮 / 键盘走到被裁掉的标签都能把它露出来，指示条跟着标签一起挪。
// 这些都是真实排版才量得到的几何，jsdom 里标签带永远"放得下"。
import type { App, VNode } from 'vue'
import { setMotionOverride } from '@xihan-ui/motion'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h } from 'vue'
import { XhTabsContent, XhTabsIndicator, XhTabsList, XhTabsNextTrigger, XhTabsPrevTrigger, XhTabsRoot, XhTabsTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

/** 十二枚标签，每枚都比一个词长，320px 的外层只放得下三四枚。 */
const VALUES = Array.from({ length: 12 }, (_, i) => `tab-${i + 1}`)

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  setMotionOverride(null)
})

function mount(render: () => VNode[], width = 320): void {
  host = document.createElement('div')
  host.style.inlineSize = `${width}px`
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
}

interface Parts {
  root: HTMLElement
  list: HTMLElement
  prev: HTMLElement
  next: HTMLElement
  indicator: HTMLElement
  trigger: (value: string) => HTMLElement
}

function mountTabs(props: Record<string, unknown> = {}, width = 320): Parts {
  // 位移补间在机器里逐帧跑；这里断言的是落定后的几何，按减弱动效一步到位
  setMotionOverride('reduce')
  mount(() => [
    h(XhTabsRoot, { defaultValue: 'tab-1', ...props }, () => [
      h(XhTabsList, null, () => [
        h(XhTabsPrevTrigger),
        ...VALUES.map(value => h(XhTabsTrigger, { value }, () => `第 ${value.slice(4)} 个标签`)),
        h(XhTabsIndicator),
        h(XhTabsNextTrigger),
      ]),
      ...VALUES.map(value => h(XhTabsContent, { value }, () => `面板 ${value}`)),
    ]),
  ], width)
  const q = (part: string): HTMLElement => host!.querySelector<HTMLElement>(`[data-scope="tabs"][data-part="${part}"]`)!
  return {
    root: q('root'),
    list: q('list'),
    prev: q('prev-trigger'),
    next: q('next-trigger'),
    indicator: q('indicator'),
    trigger: value => host!.querySelector<HTMLElement>(`[data-scope="tabs"][data-part="trigger"][data-value="${value}"]`)!,
  }
}

function tokenColor(name: string, scope: HTMLElement): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${name})`
  scope.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

/** 标签带上写着的位移量（px，横排 LTR 为负）。 */
function shift(list: HTMLElement): number {
  return Number.parseFloat(list.style.getPropertyValue('--xh-_tabs-scroll'))
}

describe('标签页 · 放不下时位移而不折行', () => {
  it('标签带不折行、只裁主轴：高仍是一枚标签，末尾的标签被裁在外面而不是掉到下一行', async () => {
    const { list, trigger, next } = mountTabs()
    const first = trigger('tab-1').getBoundingClientRect()
    const last = trigger('tab-12').getBoundingClientRect()
    expect(list.getBoundingClientRect().height).toBe(first.height)
    expect(last.top).toBe(first.top)
    expect(last.right).toBeGreaterThan(list.getBoundingClientRect().right)
    expect(getComputedStyle(list).overflowX).toBe('clip')
    expect(getComputedStyle(list).overflowY).toBe('visible')
    // 放不下：往后的翻页钮露面、贴在标签带结束端
    await expect.poll(() => next.hidden).toBe(false)
    expect(Math.round(next.getBoundingClientRect().right)).toBe(Math.round(list.getBoundingClientRect().right))
  })

  it('起头时往前的钮收起（到头即不见），往后的钮可见；翻一页后两只都在，翻到底往后的钮收起', async () => {
    const { list, prev, next, trigger } = mountTabs()
    await expect.poll(() => next.hidden).toBe(false)
    expect(prev.hidden).toBe(false)
    expect(prev.hasAttribute('data-disabled')).toBe(true)
    expect(getComputedStyle(prev).opacity).toBe('0')
    expect(getComputedStyle(next).opacity).toBe('1')

    const before = trigger('tab-1').getBoundingClientRect().left
    await userEvent.click(next)
    // 翻一页挪可见长度的八成
    await expect.poll(() => shift(list)).toBeLessThan(0)
    const viewport = list.clientWidth - Number.parseFloat(getComputedStyle(list).paddingLeft) - Number.parseFloat(getComputedStyle(list).paddingRight)
    expect(Math.abs(shift(list))).toBeCloseTo(viewport * 0.8, 0)
    expect(trigger('tab-1').getBoundingClientRect().left).toBeCloseTo(before + shift(list), 0)
    await expect.poll(() => getComputedStyle(prev).opacity).toBe('1')

    // 一路翻到底：到头那一下钮就禁用了，真实指针点不到禁用的钮，翻之前先看它还在不在
    for (let i = 0; i < 12 && !next.hasAttribute('data-disabled'); i++) {
      await userEvent.click(next)
      await expect.poll(() => shift(list)).not.toBe(0)
    }
    await expect.poll(() => next.hasAttribute('data-disabled')).toBe(true)
    // 收起走家族的 opacity 过渡，等它落定
    await expect.poll(() => getComputedStyle(next).opacity).toBe('0')
    // 翻到底：末尾的标签整个露在标签带里
    const listRect = list.getBoundingClientRect()
    const last = trigger('tab-12').getBoundingClientRect()
    expect(last.right).toBeLessThanOrEqual(listRect.right + 0.5)
    expect(last.left).toBeGreaterThanOrEqual(listRect.left)
  })

  it('键盘走到被裁掉的标签上：标签带挪过去露出它，指示条跟着标签一起挪', async () => {
    const { list, trigger, indicator, prev } = mountTabs()
    await expect.poll(() => prev.hidden).toBe(false)
    trigger('tab-1').focus()
    await userEvent.keyboard('{End}')
    await expect.poll(() => trigger('tab-12').getAttribute('aria-selected')).toBe('true')
    await expect.poll(() => shift(list)).toBeLessThan(0)
    const listRect = list.getBoundingClientRect()
    const last = trigger('tab-12').getBoundingClientRect()
    expect(last.left).toBeGreaterThanOrEqual(listRect.left)
    expect(last.right).toBeLessThanOrEqual(listRect.right + 0.5)
    // 指示条量的是排布几何、与标签同走一个位移：落在选中标签的正下方
    await expect.poll(() => Math.round(indicator.getBoundingClientRect().left)).toBe(Math.round(last.left))
    expect(Math.round(indicator.getBoundingClientRect().width)).toBe(Math.round(last.width))

    await userEvent.keyboard('{Home}')
    await expect.poll(() => shift(list)).toBe(0)
    // 焦点先到、选中后到：指示条随选中值重量，比位移晚一拍
    await expect.poll(() => Math.round(indicator.getBoundingClientRect().left)).toBe(Math.round(trigger('tab-1').getBoundingClientRect().left))
  })

  it('横向滚轮挪标签带并拦住页面滚动；竖滚轮放行', async () => {
    const { list, next } = mountTabs()
    await expect.poll(() => next.hidden).toBe(false)
    const horizontal = new WheelEvent('wheel', { deltaX: 48, bubbles: true, cancelable: true })
    list.dispatchEvent(horizontal)
    expect(horizontal.defaultPrevented).toBe(true)
    await expect.poll(() => shift(list)).toBe(-48)

    const vertical = new WheelEvent('wheel', { deltaY: 48, bubbles: true, cancelable: true })
    list.dispatchEvent(vertical)
    expect(vertical.defaultPrevented).toBe(false)
    expect(shift(list)).toBe(-48)
  })

  it('外层变宽到放得下：两只钮收起，位移归零', async () => {
    const { list, prev, next } = mountTabs()
    await expect.poll(() => next.hidden).toBe(false)
    await userEvent.click(next)
    await expect.poll(() => shift(list)).toBeLessThan(0)
    host!.style.inlineSize = '2000px'
    await expect.poll(() => next.hidden).toBe(true)
    expect(prev.hidden).toBe(true)
    expect(shift(list)).toBe(0)
  })

  it('放得下时两只钮从头就是收起的，不占位', () => {
    const { list, prev, next, trigger } = mountTabs({}, 2000)
    expect(prev.hidden).toBe(true)
    expect(next.hidden).toBe(true)
    expect(getComputedStyle(prev).display).toBe('none')
    expect(Math.round(trigger('tab-1').getBoundingClientRect().left)).toBe(Math.round(list.getBoundingClientRect().left))
  })

  it('翻页钮是与标签同高的正方形，盖底取所在面：line 档 surface、segment 档轨道的淡底', async () => {
    const line = mountTabs()
    await expect.poll(() => line.next.hidden).toBe(false)
    const tab = line.trigger('tab-1').getBoundingClientRect()
    const btn = line.next.getBoundingClientRect()
    expect(Math.round(btn.height)).toBe(Math.round(tab.height))
    expect(Math.round(btn.width)).toBe(Math.round(tab.height))
    expect(getComputedStyle(line.next).backgroundColor).toBe(tokenColor('--xh-bg-surface', line.root))
    expect(line.next.getAttribute('aria-hidden')).toBe('true')
    expect(line.next.tabIndex).toBe(-1)

    app!.unmount()
    host!.remove()
    const segment = mountTabs({ variant: 'segment' })
    await expect.poll(() => segment.next.hidden).toBe(false)
    expect(getComputedStyle(segment.next).backgroundColor).toBe(tokenColor('--xh-bg-subtle-opaque', segment.root))
    // 坐在轨道的内衬里，不压到轨道边上（轨道带一圈透明占位边，内衬盒从边里侧算起）
    const listStyle = getComputedStyle(segment.list)
    const inset = Number.parseFloat(listStyle.paddingRight) + Number.parseFloat(listStyle.borderRightWidth)
    expect(Math.round(segment.next.getBoundingClientRect().right)).toBe(Math.round(segment.list.getBoundingClientRect().right - inset))
  })
})

describe('标签页 · 触屏手势平移', () => {
  /** 合成一根触屏指针：按在标签上，之后的移动与抬起都派在文档上（会话挂在文档上跟手）。 */
  function touch(type: 'pointerdown' | 'pointermove' | 'pointerup', target: EventTarget, clientX: number, clientY: number): void {
    target.dispatchEvent(new PointerEvent(type, { pointerId: 9, pointerType: 'touch', isPrimary: true, button: 0, clientX, clientY, bubbles: true, cancelable: true }))
  }

  it('放不下时标签带只让出交叉轴的手势；手指按在标签上横向拖，标签整体跟手位移，抬手后不选中指下那枚', async () => {
    const { list, trigger, next } = mountTabs()
    await expect.poll(() => next.hidden).toBe(false)
    expect(getComputedStyle(list).touchAction).toBe('pan-y pinch-zoom')

    const tab = trigger('tab-2')
    const rect = tab.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const before = trigger('tab-1').getBoundingClientRect().left
    touch('pointerdown', tab, x, y)
    touch('pointermove', document, x - 60, y)
    await expect.poll(() => shift(list)).toBe(-60)
    expect(trigger('tab-1').getBoundingClientRect().left).toBeCloseTo(before - 60, 0)
    touch('pointerup', document, x - 60, y)
    // 抬手时浏览器补派的 click 落在指下那枚标签上：那是拖标签带，不是点选
    tab.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(trigger('tab-1').getAttribute('aria-selected')).toBe('true')
    expect(tab.getAttribute('aria-selected')).toBe('false')
    // 位移留在手指松开的地方
    expect(shift(list)).toBe(-60)
  })

  it('放得下时手势全归浏览器：不写 touch-action，拖也不动', () => {
    const { list, trigger } = mountTabs({}, 2000)
    expect(getComputedStyle(list).touchAction).toBe('auto')
    const tab = trigger('tab-2')
    const rect = tab.getBoundingClientRect()
    touch('pointerdown', tab, rect.left + 10, rect.top + 10)
    touch('pointermove', document, rect.left - 60, rect.top + 10)
    touch('pointerup', document, rect.left - 60, rect.top + 10)
    expect(shift(list)).toBe(0)
  })
})
