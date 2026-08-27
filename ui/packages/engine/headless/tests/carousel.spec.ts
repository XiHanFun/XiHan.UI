// @vitest-environment jsdom
import type { CarouselSchema } from '../src/carousel'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import {
  CAROUSEL_AUTOPLAY_INTERVAL,
  CAROUSEL_DRAG_THRESHOLD,
  carouselDragDelta,
  carouselMachine,
  carouselPageCount,
  carouselPageSnapPoints,
  carouselPageStart,
  carouselSlideRange,
  carouselTranslatePercent,
  clampCarouselPage,
  connectCarousel,
  resolveAutoplayInterval,
} from '../src/carousel'

type Props = CarouselSchema['props']
type Dict = Record<string, unknown>

// ── 纯函数：分页换算 ────────────────────────────────────────────────

/** 手指落在轨道上。跟手与收尾归会话，事件派在文档上。 */
function pressViewport(c: ReturnType<typeof makeCarousel>, clientX: number): void {
  ;((c.api().getViewportProps() as Dict).onPointerDown as (e: PointerEvent) => void)(
    { button: 0, pointerId: 1, clientX, clientY: 0, currentTarget: {} } as unknown as PointerEvent,
  )
}

function movePointer(clientX: number): void {
  document.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX, clientY: 0, bubbles: true }))
}

function releasePointer(): void {
  document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }))
}

function cancelPointer(): void {
  document.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1, bubbles: true }))
}

describe('carouselPageCount', () => {
  it('一张都没有是 0 页，装得下一屏是 1 页', () => {
    // 0 页与 1 页是两回事：前者该把整条轮播连同两端按钮一起判成不可用
    expect(carouselPageCount(0, 1, undefined)).toBe(0)
    expect(carouselPageCount(undefined, 1, undefined)).toBe(0)
    expect(carouselPageCount(4, 4, undefined)).toBe(1)
    expect(carouselPageCount(3, 5, undefined)).toBe(1)
  })

  it('slidesPerMove 缺省即整屏翻页', () => {
    expect(carouselPageCount(6, 1, undefined)).toBe(6)
    expect(carouselPageCount(6, 2, undefined)).toBe(3)
    expect(carouselPageCount(6, 3, undefined)).toBe(2)
  })

  it('一次走一张的橱窗式：每多一张就多一页，最后一页仍是满屏', () => {
    // 一屏 3 张、一次走 1 张：落点是 0/1/2/3，第 3 页显示 3~5
    expect(carouselPageCount(6, 3, 1)).toBe(4)
    expect(carouselPageCount(6, 2, 1)).toBe(5)
  })

  it('末页不足一整步时也得有页可去（向上取整，不是丢弃余数）', () => {
    // 5 张、一屏 2 张、一次走 2 张：0~1 / 2~3 / 剩一张 —— 必须有第三页
    expect(carouselPageCount(5, 2, 2)).toBe(3)
    expect(carouselPageCount(7, 3, 3)).toBe(3)
  })

  it('非法的每屏 / 每步张数按 1 处理，不产出无穷页或负页', () => {
    expect(carouselPageCount(6, 0, undefined)).toBe(6)
    expect(carouselPageCount(6, -3, undefined)).toBe(6)
    expect(carouselPageCount(6, 2, 0)).toBe(5)
    expect(carouselPageCount(6, 2, Number.NaN)).toBe(3)
    expect(carouselPageCount(6.7, 1, undefined)).toBe(6)
    expect(carouselPageCount(-4, 1, undefined)).toBe(0)
  })
})

describe('carouselPageStart / carouselSlideRange', () => {
  it('整屏翻页时落点就是页码乘每屏张数', () => {
    expect(carouselPageStart(0, 6, 2, undefined)).toBe(0)
    expect(carouselPageStart(1, 6, 2, undefined)).toBe(2)
    expect(carouselPageStart(2, 6, 2, undefined)).toBe(4)
  })

  it('末页不足一屏时落点夹回最后一个满屏位置，视口不留空', () => {
    // 5 张、一屏 2 张、一次走 2：第 2 页原本要从第 4 张起，右半屏是空的 —— 夹回第 3 张
    expect(carouselPageStart(2, 5, 2, 2)).toBe(3)
    expect(carouselSlideRange(2, 5, 2, 2)).toEqual({ start: 3, end: 4 })
    // 4 张、一屏 2 张、一次走 3：第 1 页原本从第 3 张起 —— 夹回第 2 张
    expect(carouselPageStart(1, 4, 2, 3)).toBe(2)
    expect(carouselSlideRange(1, 4, 2, 3)).toEqual({ start: 2, end: 3 })
  })

  it('区间末端按实际张数收口，不指向并不存在的条目', () => {
    // 3 张、一屏 2 张、一次走 1：第 2 页只剩一张
    expect(carouselSlideRange(1, 3, 2, 1)).toEqual({ start: 1, end: 2 })
    expect(carouselSlideRange(0, 1, 3, undefined)).toEqual({ start: 0, end: 0 })
  })

  it('一张都没有时区间是空集（end < start），不是指向第 0 张', () => {
    expect(carouselSlideRange(0, 0, 1, undefined)).toEqual({ start: 0, end: -1 })
    expect(carouselPageStart(3, 0, 1, undefined)).toBe(0)
  })

  it('越界页码先夹再算', () => {
    expect(carouselPageStart(99, 6, 2, undefined)).toBe(4)
    expect(carouselPageStart(-3, 6, 2, undefined)).toBe(0)
  })
})

describe('carouselPageSnapPoints', () => {
  it('长度即总页数，逐页给出首张下标', () => {
    expect(carouselPageSnapPoints(6, 2, undefined)).toEqual([0, 2, 4])
    expect(carouselPageSnapPoints(6, 3, 1)).toEqual([0, 1, 2, 3])
    // 末页夹回满屏位置后，落点序列可能出现重叠（3 与 2 只差一张），但绝不递减
    expect(carouselPageSnapPoints(5, 2, 2)).toEqual([0, 2, 3])
    expect(carouselPageSnapPoints(0, 1, undefined)).toEqual([])
  })

  it('落点严格不递减，且首末两端一定落在合法区间内', () => {
    for (const count of [1, 2, 5, 7, 13]) {
      for (const perPage of [1, 2, 3]) {
        for (const perMove of [1, 2, 3]) {
          const points = carouselPageSnapPoints(count, perPage, perMove)
          const maxStart = Math.max(0, count - perPage)
          expect({ count, perPage, perMove, first: points[0] }).toEqual({ count, perPage, perMove, first: 0 })
          expect({ count, perPage, perMove, last: points[points.length - 1] })
            .toEqual({ count, perPage, perMove, last: maxStart })
          const sorted = [...points].sort((a, b) => a - b)
          expect({ count, perPage, perMove, points }).toEqual({ count, perPage, perMove, points: sorted })
        }
      }
    }
  })
})

describe('clampCarouselPage', () => {
  it('不回绕时两端夹住', () => {
    expect(clampCarouselPage(5, 3)).toBe(2)
    expect(clampCarouselPage(-1, 3)).toBe(0)
    expect(clampCarouselPage(1, 3)).toBe(1)
  })

  it('回绕时取模，负页码也绕得回来', () => {
    expect(clampCarouselPage(3, 3, true)).toBe(0)
    expect(clampCarouselPage(4, 3, true)).toBe(1)
    // JS 的 % 对负数给负余数，直接用会算出 -1 这样的页码
    expect(clampCarouselPage(-1, 3, true)).toBe(2)
    expect(clampCarouselPage(-4, 3, true)).toBe(2)
  })

  it('无页 / 非法入参一律给 0', () => {
    expect(clampCarouselPage(5, 0)).toBe(0)
    expect(clampCarouselPage(5, 0, true)).toBe(0)
    expect(clampCarouselPage(undefined, 3)).toBe(0)
    expect(clampCarouselPage(Number.NaN, 3)).toBe(0)
    expect(clampCarouselPage(1.9, 3)).toBe(1)
  })
})

describe('carouselTranslatePercent', () => {
  it('一张占一个视口时，走到第 n 张即位移 n 个视口', () => {
    expect(carouselTranslatePercent(0, 1)).toBe(0)
    expect(carouselTranslatePercent(2, 1)).toBe(-200)
  })

  it('一屏多张时按份数摊，除不尽的收到四位小数', () => {
    expect(carouselTranslatePercent(2, 2)).toBe(-100)
    expect(carouselTranslatePercent(1, 3)).toBe(-33.3333)
    expect(carouselTranslatePercent(2, 3)).toBe(-66.6667)
  })

  it('rtl 翻符号；0 恒取正号（-0 会毒到等值比较）', () => {
    expect(carouselTranslatePercent(2, 2, true)).toBe(100)
    expect(Object.is(carouselTranslatePercent(0, 1), 0)).toBe(true)
    expect(Object.is(carouselTranslatePercent(0, 1, true), 0)).toBe(true)
  })
})

describe('carouselDragDelta', () => {
  it('过阈值才翻页，没过就弹回原页', () => {
    expect(carouselDragDelta(-50, 40)).toBe(1)
    expect(carouselDragDelta(50, 40)).toBe(-1)
    // 差一个像素就翻页的轮播用起来像是自己在乱动
    expect(carouselDragDelta(-39, 40)).toBe(0)
    expect(carouselDragDelta(39, 40)).toBe(0)
    expect(carouselDragDelta(0, 40)).toBe(0)
    // 正好压线算过
    expect(carouselDragDelta(-40, 40)).toBe(1)
  })

  it('rtl 下左右含义互换', () => {
    expect(carouselDragDelta(-50, 40, true)).toBe(-1)
    expect(carouselDragDelta(50, 40, true)).toBe(1)
  })

  it('非法入参不翻页', () => {
    expect(carouselDragDelta(Number.NaN, 40)).toBe(0)
    expect(carouselDragDelta(-50, Number.NaN)).toBe(1)
  })
})

describe('resolveAutoplayInterval', () => {
  it('true 用默认间隔，数值即毫秒；缺省 / false / 非正数一律不自动播放', () => {
    expect(resolveAutoplayInterval(true)).toBe(CAROUSEL_AUTOPLAY_INTERVAL)
    expect(resolveAutoplayInterval(1500)).toBe(1500)
    expect(resolveAutoplayInterval(undefined)).toBe(0)
    expect(resolveAutoplayInterval(false)).toBe(0)
    expect(resolveAutoplayInterval(0)).toBe(0)
    expect(resolveAutoplayInterval(-100)).toBe(0)
    expect(resolveAutoplayInterval(Number.NaN)).toBe(0)
  })
})

// ── 机器与 connect ──────────────────────────────────────────────────

function makeCarousel(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(carouselMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    state: () => service.state.get(),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    api: () => connectCarousel(service, normalizeProps),
    stop: () => runtime.stop(),
  }
}

/** 六张、一屏一张的基线：总页数 6，页码与张号一一对应。 */
const SIX: Props = { slideCount: 6 }

describe('carouselMachine 翻页', () => {
  it('默认停在第 0 页，defaultPage 决定初值', () => {
    expect(makeCarousel(SIX).api().page).toBe(0)
    expect(makeCarousel({ ...SIX, defaultPage: 3 }).api().page).toBe(3)
  })

  it('不回绕时走到端点就停住', () => {
    const c = makeCarousel({ slideCount: 3 })
    c.service.send({ type: 'PAGE.PREV' })
    expect(c.api().page).toBe(0)
    c.service.send({ type: 'PAGE.NEXT' })
    c.service.send({ type: 'PAGE.NEXT' })
    c.service.send({ type: 'PAGE.NEXT' })
    expect(c.api().page).toBe(2)
  })

  it('loop=true 时首末回绕', () => {
    const c = makeCarousel({ slideCount: 3, loop: true })
    c.service.send({ type: 'PAGE.PREV' })
    expect(c.api().page).toBe(2)
    c.service.send({ type: 'PAGE.NEXT' })
    expect(c.api().page).toBe(0)
    // 直接跳一个越界页码同样回绕
    c.service.send({ type: 'PAGE.SET', page: 7 })
    expect(c.api().page).toBe(1)
  })

  it('pAGE.SET 越界的页码在写入口就收口', () => {
    const c = makeCarousel({ slideCount: 3 })
    c.service.send({ type: 'PAGE.SET', page: 99 })
    expect(c.api().page).toBe(2)
    c.service.send({ type: 'PAGE.SET', page: -5 })
    expect(c.api().page).toBe(0)
  })

  it('onPageChange 带上页码，且值没变时不叫', () => {
    const onPageChange = vi.fn()
    const c = makeCarousel({ ...SIX, onPageChange })
    c.service.send({ type: 'PAGE.NEXT' })
    expect(onPageChange).toHaveBeenCalledWith({ page: 1 })

    onPageChange.mockClear()
    c.service.send({ type: 'PAGE.SET', page: 1 })
    // 同一页再点一次不该惊动宿主：作者常在回调里发埋点或换图
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('受控 page：内部不自改，只发回调；宿主写回后跟着走', () => {
    const onPageChange = vi.fn()
    const c = makeCarousel({ ...SIX, page: 2, onPageChange })
    c.service.send({ type: 'PAGE.NEXT' })
    expect(onPageChange).toHaveBeenCalledWith({ page: 3 })
    // 宿主没写回：界面不该自作主张
    expect(c.api().page).toBe(2)

    c.setProps({ page: 3 })
    expect(c.api().page).toBe(3)
  })

  it('slideCount 变小后，上一张从看得见的那一页起算', () => {
    const c = makeCarousel({ slideCount: 6, defaultPage: 5 })
    expect(c.api().page).toBe(5)
    c.setProps({ slideCount: 3 })
    // 内部值还停在 5，但界面显示的是夹过的第 2 页
    expect(c.api().page).toBe(2)
    c.service.send({ type: 'PAGE.PREV' })
    // 从 5 往回走会得到 4（再夹成 2），用户点一下看不到任何变化
    expect(c.api().page).toBe(1)
  })

  it('一屏多张时页码走的是页不是张', () => {
    const c = makeCarousel({ slideCount: 6, slidesPerPage: 2 })
    expect(c.api().totalPages).toBe(3)
    c.service.send({ type: 'PAGE.NEXT' })
    expect(c.api().page).toBe(1)
    expect(c.api().slideRange).toEqual({ start: 2, end: 3 })
  })
})

describe('carouselMachine 自动播放', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('没开自动播放：停在 idle，时间过去多久画面都不动', () => {
    const c = makeCarousel(SIX)
    expect(c.state()).toBe('idle')
    vi.advanceTimersByTime(60_000)
    expect(c.api().page).toBe(0)
  })

  it('autoplay=true 用默认间隔，到点翻一页并接着计时', () => {
    const c = makeCarousel({ ...SIX, autoplay: true })
    expect(c.state()).toBe('playing.running')

    vi.advanceTimersByTime(CAROUSEL_AUTOPLAY_INTERVAL - 1)
    expect(c.api().page).toBe(0)
    vi.advanceTimersByTime(1)
    expect(c.api().page).toBe(1)
    vi.advanceTimersByTime(CAROUSEL_AUTOPLAY_INTERVAL)
    expect(c.api().page).toBe(2)
  })

  it('autoplay=0 / false 当作没开', () => {
    expect(makeCarousel({ ...SIX, autoplay: 0 }).state()).toBe('idle')
    expect(makeCarousel({ ...SIX, autoplay: false }).state()).toBe('idle')
  })

  it('不回绕时末页也拿满一个间隔，随后收摊：不留一个把画面钉在原地的计时器', () => {
    const c = makeCarousel({ slideCount: 2, autoplay: 100 })
    vi.advanceTimersByTime(100)
    expect(c.api().page).toBe(1)
    // 末页刚露面，它自己那一个间隔还没走完
    expect(c.state()).toBe('playing.running')

    vi.advanceTimersByTime(100)
    // 这一拍已经无处可去，于是停机而不是再挂一个永远翻不动的计时器
    expect(c.state()).toBe('idle')
    expect(c.api().page).toBe(1)
    vi.advanceTimersByTime(10_000)
    expect(c.api().page).toBe(1)
  })

  it('loop=true 时到末页绕回开头，接着播', () => {
    const c = makeCarousel({ slideCount: 2, autoplay: 100, loop: true })
    vi.advanceTimersByTime(100)
    expect(c.api().page).toBe(1)
    vi.advanceTimersByTime(100)
    expect(c.api().page).toBe(0)
    expect(c.state()).toBe('playing.running')
  })

  it('只有一页时不自动播放（回绕也绕不出第二页）', () => {
    const c = makeCarousel({ slideCount: 1, autoplay: 100, loop: true })
    vi.advanceTimersByTime(100)
    expect(c.state()).toBe('idle')
    expect(c.api().page).toBe(0)
  })

  it('按住期间不消耗时间，松开后从头计满一整个间隔', () => {
    const c = makeCarousel({ ...SIX, autoplay: 100 })
    vi.advanceTimersByTime(60)
    c.service.send({ type: 'AUTOPLAY.PAUSE', src: 'pointer' })
    expect(c.state()).toBe('playing.paused')

    // 按住期间过掉的时间比整个间隔还长，画面纹丝不动
    vi.advanceTimersByTime(1000)
    expect(c.api().page).toBe(0)

    c.service.send({ type: 'AUTOPLAY.RESUME', src: 'pointer' })
    expect(c.state()).toBe('playing.running')
    // 刻意不接着走剩下的 40ms：扫过一下就立刻翻页，观感像画面在躲人
    vi.advanceTimersByTime(99)
    expect(c.api().page).toBe(0)
    vi.advanceTimersByTime(1)
    expect(c.api().page).toBe(1)
  })

  it('多个来源叠加：最后一个松开才继续走', () => {
    const c = makeCarousel({ ...SIX, autoplay: 100 })
    c.service.send({ type: 'AUTOPLAY.PAUSE', src: 'pointer' })
    c.service.send({ type: 'AUTOPLAY.PAUSE', src: 'focus' })
    expect(c.service.context.get('pausedBy')).toEqual(['pointer', 'focus'])

    c.service.send({ type: 'AUTOPLAY.RESUME', src: 'pointer' })
    // 键盘用户还停在这条轮播里，鼠标移开不该把计时放开
    expect(c.state()).toBe('playing.paused')
    vi.advanceTimersByTime(1000)
    expect(c.api().page).toBe(0)

    c.service.send({ type: 'AUTOPLAY.RESUME', src: 'focus' })
    expect(c.state()).toBe('playing.running')
    vi.advanceTimersByTime(100)
    expect(c.api().page).toBe(1)
  })

  it('同一来源重复按住只记一次，一次松开即放开', () => {
    const c = makeCarousel({ ...SIX, autoplay: 100 })
    c.service.send({ type: 'AUTOPLAY.PAUSE', src: 'focus' })
    c.service.send({ type: 'AUTOPLAY.PAUSE', src: 'focus' })
    expect(c.service.context.get('pausedBy')).toEqual(['focus'])
    c.service.send({ type: 'AUTOPLAY.RESUME', src: 'focus' })
    expect(c.state()).toBe('playing.running')
  })

  it('手动翻页重起计时：刚点完不会立刻又被自动翻走', () => {
    const c = makeCarousel({ ...SIX, autoplay: 100 })
    vi.advanceTimersByTime(80)
    c.service.send({ type: 'PAGE.NEXT' })
    expect(c.api().page).toBe(1)
    // 不重起计时的实现会在这里（80+20）就跳到第 2 页
    vi.advanceTimersByTime(99)
    expect(c.api().page).toBe(1)
    vi.advanceTimersByTime(1)
    expect(c.api().page).toBe(2)
  })

  it('autoplay prop 被改写：关掉即停，换间隔当场生效', () => {
    const c = makeCarousel({ ...SIX, autoplay: 100 })
    c.setProps({ autoplay: false })
    expect(c.state()).toBe('idle')
    vi.advanceTimersByTime(10_000)
    expect(c.api().page).toBe(0)

    c.setProps({ autoplay: 200 })
    expect(c.state()).toBe('playing.running')
    vi.advanceTimersByTime(199)
    expect(c.api().page).toBe(0)
    vi.advanceTimersByTime(1)
    expect(c.api().page).toBe(1)
  })

  it('停掉时清空按住来源：下次开播是全新一轮，不背着上一轮的悬停', () => {
    const c = makeCarousel({ ...SIX, autoplay: 100 })
    c.service.send({ type: 'AUTOPLAY.PAUSE', src: 'pointer' })
    c.setProps({ autoplay: false })
    expect(c.service.context.get('pausedBy')).toEqual([])
    c.setProps({ autoplay: 100 })
    expect(c.state()).toBe('playing.running')
  })

  it('api.play 在没给间隔时无事发生：间隔的事实源只有 prop 一处', () => {
    const c = makeCarousel(SIX)
    c.api().play()
    expect(c.state()).toBe('idle')
    vi.advanceTimersByTime(60_000)
    expect(c.api().page).toBe(0)
  })

  it('api.pause / resume 与悬停走同一套计数', () => {
    const c = makeCarousel({ ...SIX, autoplay: 100 })
    c.api().pause()
    expect(c.api().paused).toBe(true)
    expect(c.api().autoplaying).toBe(false)
    vi.advanceTimersByTime(1000)
    expect(c.api().page).toBe(0)
    c.api().resume()
    expect(c.api().autoplaying).toBe(true)
  })
})

// ── connect：属性与交互 ─────────────────────────────────────────────

describe('connectCarousel 属性', () => {
  it('root 是带名字的 carousel 地标；dir 未给时不写，免得切断继承', () => {
    const root = makeCarousel(SIX).api().getRootProps() as Dict
    expect(root['data-scope']).toBe('carousel')
    expect(root['data-part']).toBe('root')
    expect(root.role).toBe('region')
    expect(root['aria-roledescription']).toBe('carousel')
    expect(root['aria-label']).toBe('Carousel')
    expect(root['data-orientation']).toBe('horizontal')
    expect(root.dir).toBeUndefined()

    const rtl = makeCarousel({ ...SIX, dir: 'rtl' }).api().getRootProps() as Dict
    expect(rtl.dir).toBe('rtl')
  })

  it('translations 覆盖各处读屏文案', () => {
    const a = makeCarousel({
      ...SIX,
      translations: {
        root: '图片轮播',
        prevTrigger: '上一张',
        nextTrigger: '下一张',
        indicatorGroup: '选择要看的一张',
        indicator: p => `第 ${p} 张`,
        item: (i, n) => `第 ${i} 张，共 ${n} 张`,
      },
    }).api()
    expect((a.getRootProps() as Dict)['aria-label']).toBe('图片轮播')
    expect((a.getPrevTriggerProps() as Dict)['aria-label']).toBe('上一张')
    expect((a.getNextTriggerProps() as Dict)['aria-label']).toBe('下一张')
    expect((a.getIndicatorGroupProps() as Dict)['aria-label']).toBe('选择要看的一张')
    expect((a.getIndicatorProps({ index: 2 }) as Dict)['aria-label']).toBe('第 3 张')
    expect((a.getItemProps({ index: 0 }) as Dict)['aria-label']).toBe('第 1 张，共 6 张')
  })

  it('条目自报"第几张 / 共几张"，只有当前页的那几张带 data-inview', () => {
    const a = makeCarousel({ slideCount: 6, slidesPerPage: 2, defaultPage: 1 }).api()
    const item = (i: number) => a.getItemProps({ index: i }) as Dict
    expect(item(0).role).toBe('group')
    expect(item(0)['aria-roledescription']).toBe('slide')
    expect(item(0)['aria-label']).toBe('1 of 6')
    expect(item(5)['aria-label']).toBe('6 of 6')
    expect(item(0)['data-inview']).toBeUndefined()
    expect(item(2)['data-inview']).toBe('')
    expect(item(3)['data-inview']).toBe('')
    expect(item(4)['data-inview']).toBeUndefined()
    expect(item(2)['data-index']).toBe('2')
  })

  it('轨道位移写进 item-group 的内联 style；一屏多张时按份数摊', () => {
    const one = makeCarousel({ ...SIX, defaultPage: 2 }).api().getItemGroupProps() as Dict
    expect(one.style).toEqual({ transform: 'translateX(-200%)' })

    const two = makeCarousel({ slideCount: 6, slidesPerPage: 2, defaultPage: 2 }).api()
    expect((two.getItemGroupProps() as Dict).style).toEqual({ transform: 'translateX(-200%)' })
    // 第 2 页从第 4 张起，一张占半屏 → 位移两个视口
    expect(two.slideRange).toEqual({ start: 4, end: 5 })
  })

  it('纵轨走 translateY；rtl 只翻水平轴的符号', () => {
    const vertical = makeCarousel({ ...SIX, orientation: 'vertical', defaultPage: 1 }).api()
    expect((vertical.getItemGroupProps() as Dict).style).toEqual({ transform: 'translateY(-100%)' })

    const rtl = makeCarousel({ ...SIX, dir: 'rtl', defaultPage: 1 }).api()
    expect((rtl.getItemGroupProps() as Dict).style).toEqual({ transform: 'translateX(100%)' })

    // 纵轨与文字方向无关：rtl 不该把上下翻过来
    const verticalRtl = makeCarousel({ ...SIX, orientation: 'vertical', dir: 'rtl', defaultPage: 1 }).api()
    expect((verticalRtl.getItemGroupProps() as Dict).style).toEqual({ transform: 'translateY(-100%)' })
  })

  it('条目宽度与间距由连接层给：间距落成条目内边距，不动轨道的 gap', () => {
    const horizontal = makeCarousel({ slideCount: 6, slidesPerPage: 3, spacing: '12px' }).api()
    expect((horizontal.getItemProps({ index: 0 }) as Dict).style)
      .toEqual({ flexBasis: 'calc(100% / 3)', paddingInline: 'calc(12px / 2)' })

    const vertical = makeCarousel({ slideCount: 6, orientation: 'vertical', spacing: '8px' }).api()
    expect((vertical.getItemProps({ index: 0 }) as Dict).style)
      .toEqual({ flexBasis: 'calc(100% / 1)', paddingBlock: 'calc(8px / 2)' })
  })

  it('没给 spacing 就把那条内边距摘掉，作者写在样式表里的 padding 照常生效', () => {
    const a = makeCarousel(SIX).api()
    // 恒写 calc(0px / 2) 会用内联声明把作者的 padding 无声盖掉
    expect((a.getItemProps({ index: 0 }) as Dict).style)
      .toEqual({ flexBasis: 'calc(100% / 1)', paddingInline: '' })
  })

  it('首页时上一张原生 disabled，末页时轮到下一张；loop 下两端都可用', () => {
    const first = makeCarousel({ slideCount: 3 }).api()
    expect((first.getPrevTriggerProps() as Dict).disabled).toBe(true)
    expect((first.getPrevTriggerProps() as Dict)['data-disabled']).toBe('')
    expect((first.getNextTriggerProps() as Dict).disabled).toBeUndefined()

    const last = makeCarousel({ slideCount: 3, defaultPage: 2 }).api()
    expect((last.getNextTriggerProps() as Dict).disabled).toBe(true)
    expect((last.getPrevTriggerProps() as Dict).disabled).toBeUndefined()

    const looped = makeCarousel({ slideCount: 3, loop: true }).api()
    expect((looped.getPrevTriggerProps() as Dict).disabled).toBeUndefined()
    expect((looped.getNextTriggerProps() as Dict).disabled).toBeUndefined()
  })

  it('只有一页时两端都推不动，回绕也救不了', () => {
    const a = makeCarousel({ slideCount: 3, slidesPerPage: 3, loop: true }).api()
    expect(a.totalPages).toBe(1)
    expect((a.getPrevTriggerProps() as Dict).disabled).toBe(true)
    expect((a.getNextTriggerProps() as Dict).disabled).toBe(true)
  })

  it('一张都没有：两端禁用，且没有指示点自称当前项', () => {
    const a = makeCarousel({ slideCount: 0 }).api()
    expect(a.totalPages).toBe(0)
    expect(a.pageSnapPoints).toEqual([])
    expect((a.getPrevTriggerProps() as Dict).disabled).toBe(true)
    expect((a.getNextTriggerProps() as Dict).disabled).toBe(true)
    expect((a.getIndicatorProps({ index: 0 }) as Dict)['aria-current']).toBe('false')
  })

  it('两端按钮 aria-controls 指向 viewport', () => {
    const a = makeCarousel(SIX).api()
    const viewportId = (a.getViewportProps() as Dict).id
    expect(viewportId).toBeTruthy()
    expect((a.getPrevTriggerProps() as Dict)['aria-controls']).toBe(viewportId)
    expect((a.getNextTriggerProps() as Dict)['aria-controls']).toBe(viewportId)
  })

  it('指示点：当前页 aria-current=true，其余显式 false', () => {
    const c = makeCarousel({ ...SIX, defaultPage: 2 })
    const current = c.api().getIndicatorProps({ index: 2 }) as Dict
    const other = c.api().getIndicatorProps({ index: 3 }) as Dict
    expect(current['aria-current']).toBe('true')
    expect(current['data-current']).toBe('')
    expect(current.type).toBe('button')
    // 指示点不做 roving tabindex：每一颗都该是一个 Tab 停靠点
    expect(current.tabindex).toBeUndefined()
    // 省略等于"没说"，读屏就分不出"不是当前页"与"作者忘了标"
    expect(other['aria-current']).toBe('false')
    expect(other['data-current']).toBeUndefined()
  })

  it('点指示点即跳页，越界的下标同样收口', () => {
    const c = makeCarousel(SIX)
    ;((c.api().getIndicatorProps({ index: 3 }) as Dict).onClick as () => void)()
    expect(c.api().page).toBe(3)
    ;((c.api().getIndicatorProps({ index: 99 }) as Dict).onClick as () => void)()
    expect(c.api().page).toBe(5)
  })

  it('端点上的点击既不回绕也不惊动宿主：合成事件绕得过原生 disabled', () => {
    // 原生 disabled 只挡真实点击；作者把 props 摊在 <a> 上、或代码里直接派发合成 click 时
    // 这条路是真会走到的——边界由机器的收口守住，值没变 cell 也不会发回调
    const onPageChange = vi.fn()
    const c = makeCarousel({ slideCount: 3, onPageChange })
    ;((c.api().getPrevTriggerProps() as Dict).onClick as () => void)()
    expect(c.api().page).toBe(0)
    expect(onPageChange).not.toHaveBeenCalled()

    c.service.send({ type: 'PAGE.SET', page: 2 })
    onPageChange.mockClear()
    ;((c.api().getNextTriggerProps() as Dict).onClick as () => void)()
    expect(c.api().page).toBe(2)
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('viewport 活区：自动播放跑着时闭麦，停下来才转 polite', () => {
    vi.useFakeTimers()
    try {
      const playing = makeCarousel({ ...SIX, autoplay: 1000 })
      expect((playing.api().getViewportProps() as Dict)['aria-live']).toBe('off')
      playing.service.send({ type: 'AUTOPLAY.PAUSE', src: 'pointer' })
      expect((playing.api().getViewportProps() as Dict)['aria-live']).toBe('polite')

      const manual = makeCarousel(SIX)
      expect((manual.api().getViewportProps() as Dict)['aria-live']).toBe('polite')
    }
    finally {
      vi.useRealTimers()
    }
  })

  it('viewport 的 touch-action 只在允许拖拽时让出本轴，另一轴留给页面滚动', () => {
    expect((makeCarousel(SIX).api().getViewportProps() as Dict).style).toEqual({ touchAction: '' })
    expect((makeCarousel({ ...SIX, allowPointerDrag: true }).api().getViewportProps() as Dict).style)
      .toEqual({ touchAction: 'pan-y' })
    expect((makeCarousel({ ...SIX, allowPointerDrag: true, orientation: 'vertical' }).api().getViewportProps() as Dict).style)
      .toEqual({ touchAction: 'pan-x' })
  })
})

// ── connect：键盘 ───────────────────────────────────────────────────

/** 把根节点的键盘处理器挂到真节点上，从内部的子节点派事件——event.target 与冒泡都得是真的。 */
function keyboardHarness(props: Props) {
  const c = makeCarousel(props)
  const root = document.createElement('div')
  const button = document.createElement('button')
  const input = document.createElement('input')
  root.append(button, input)
  document.body.append(root)

  let handler: EventListener | null = null
  const bind = (): void => {
    if (handler)
      root.removeEventListener('keydown', handler)
    handler = (c.api().getRootProps() as Dict).onKeyDown as EventListener
    root.addEventListener('keydown', handler)
  }
  bind()

  const press = (key: string, from: HTMLElement = button): KeyboardEvent => {
    // 每次重新取处理器：翻页后 api 是新的一份，绑着旧闭包会读到过期的总页数
    bind()
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    from.dispatchEvent(event)
    return event
  }

  return { ...c, root, button, input, press, cleanup: () => root.remove() }
}

describe('connectCarousel 键盘', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('横轨：左右键翻页并吞掉默认行为，上下键放行给页面滚动', () => {
    const h = keyboardHarness(SIX)
    const right = h.press('ArrowRight')
    expect(h.api().page).toBe(1)
    expect(right.defaultPrevented).toBe(true)

    const left = h.press('ArrowLeft')
    expect(h.api().page).toBe(0)
    expect(left.defaultPrevented).toBe(true)

    const down = h.press('ArrowDown')
    expect(h.api().page).toBe(0)
    // 不归导航管就绝不 preventDefault，否则横排轮播会把整页的滚动吞掉
    expect(down.defaultPrevented).toBe(false)
    h.cleanup()
  })

  it('home / End 跳到首末页', () => {
    const h = keyboardHarness({ ...SIX, defaultPage: 2 })
    h.press('End')
    expect(h.api().page).toBe(5)
    h.press('Home')
    expect(h.api().page).toBe(0)
    h.cleanup()
  })

  it('纵轨：上下键翻页，左右键放行', () => {
    const h = keyboardHarness({ ...SIX, orientation: 'vertical' })
    const down = h.press('ArrowDown')
    expect(h.api().page).toBe(1)
    expect(down.defaultPrevented).toBe(true)

    const right = h.press('ArrowRight')
    expect(h.api().page).toBe(1)
    expect(right.defaultPrevented).toBe(false)
    h.cleanup()
  })

  it('横轨 + rtl：右键走上一页、左键走下一页', () => {
    const h = keyboardHarness({ ...SIX, dir: 'rtl', defaultPage: 2 })
    h.press('ArrowRight')
    expect(h.api().page).toBe(1)
    h.press('ArrowLeft')
    expect(h.api().page).toBe(2)
    h.cleanup()
  })

  it('带修饰键的组合不归轮播管（Ctrl+Home 是"跳到文档顶部"）', () => {
    const h = keyboardHarness({ ...SIX, defaultPage: 2 })
    const event = new KeyboardEvent('keydown', { key: 'Home', ctrlKey: true, bubbles: true, cancelable: true })
    h.button.dispatchEvent(event)
    expect(h.api().page).toBe(2)
    expect(event.defaultPrevented).toBe(false)
    h.cleanup()
  })

  it('焦点在幻灯片内的输入框上时方向键交还给它', () => {
    const h = keyboardHarness(SIX)
    const event = h.press('ArrowRight', h.input)
    // 吞了的话用户既移不动光标，画面还会莫名其妙翻走
    expect(h.api().page).toBe(0)
    expect(event.defaultPrevented).toBe(false)
    h.cleanup()
  })
})

// ── connect：暂停与拖拽 ─────────────────────────────────────────────

describe('connectCarousel 指针', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('指针进出与焦点进出各按住一次；焦点在内部换节点不算离场', () => {
    const c = makeCarousel({ ...SIX, autoplay: 100 })
    const root = c.api().getRootProps() as Dict & {
      onPointerEnter: () => void
      onPointerLeave: () => void
      onFocusIn: () => void
      onFocusOut: (event: FocusEvent) => void
    }
    root.onPointerEnter()
    expect(c.state()).toBe('playing.paused')
    root.onFocusIn()
    expect(c.service.context.get('pausedBy')).toEqual(['pointer', 'focus'])

    root.onPointerLeave()
    // 键盘用户还停在里面，鼠标移开不该把计时放开
    expect(c.state()).toBe('playing.paused')

    // 焦点从上一张按到下一张：relatedTarget 仍在轮播之内，不该放开计时
    const inner = {} as Node
    root.onFocusOut({
      relatedTarget: inner,
      currentTarget: { contains: (node: Node) => node === inner },
    } as unknown as FocusEvent)
    expect(c.state()).toBe('playing.paused')

    root.onFocusOut({ relatedTarget: null, currentTarget: null } as unknown as FocusEvent)
    expect(c.state()).toBe('playing.running')
  })

  it('拖拽过阈值翻一页，途中的位移实时叠进轨道', () => {
    const c = makeCarousel({ ...SIX, allowPointerDrag: true })

    pressViewport(c, 300)
    movePointer(240)
    expect(c.api().dragging).toBe(true)
    expect((c.api().getItemGroupProps() as Dict).style)
      .toEqual({ transform: 'translateX(calc(0% - 60px))' })

    releasePointer()
    expect(c.api().dragging).toBe(false)
    expect(c.api().page).toBe(1)
    // 松手后轨道回到整页位移，不再挂着那段像素
    expect((c.api().getItemGroupProps() as Dict).style).toEqual({ transform: 'translateX(-100%)' })
  })

  it('没过阈值就弹回原页；反向拖时位移用减号拼进 calc', () => {
    const c = makeCarousel({ ...SIX, defaultPage: 2, allowPointerDrag: true })
    pressViewport(c, 300)
    movePointer(300 + (CAROUSEL_DRAG_THRESHOLD - 1))
    // calc 里写 `+ -39px` 各家解析并不一致，正负号得自己归一
    expect((c.api().getItemGroupProps() as Dict).style)
      .toEqual({ transform: `translateX(calc(-200% + ${CAROUSEL_DRAG_THRESHOLD - 1}px))` })

    releasePointer()
    expect(c.api().page).toBe(2)
    expect(c.api().dragging).toBe(false)
  })

  it('allowPointerDrag 关着时按下不进入拖拽；系统收走指针也要收尾', () => {
    const off = makeCarousel(SIX)
    pressViewport(off, 300)
    expect(off.api().dragging).toBe(false)

    const on = makeCarousel({ ...SIX, allowPointerDrag: true })
    pressViewport(on, 300)
    movePointer(200)
    cancelPointer()
    // 取消同样清干净拖拽态，否则轨道会永久挂着那段像素
    expect(on.api().dragging).toBe(false)
    expect(on.api().page).toBe(1)
  })

  it('自动播放跑着时拖拽照样翻页，并把计时重起', () => {
    const c = makeCarousel({ ...SIX, autoplay: 100, allowPointerDrag: true })
    vi.advanceTimersByTime(80)
    pressViewport(c, 300)
    movePointer(200)
    // 收尾动作里嵌套发的 PAGE.NEXT 要真的走到（事件排队后接着排空）
    releasePointer()
    expect(c.api().page).toBe(1)
    expect(c.state()).toBe('playing.running')
    // 拖完这一下重起了计时：不重起的话再过 20ms 就又被自动翻走一屏
    vi.advanceTimersByTime(99)
    expect(c.api().page).toBe(1)
    vi.advanceTimersByTime(1)
    expect(c.api().page).toBe(2)
  })

  it('右键按下不开拖；单页时也不开', () => {
    const c = makeCarousel({ ...SIX, allowPointerDrag: true })
    const down = (init: Partial<PointerEvent>): void =>
      ((c.api().getViewportProps() as Dict).onPointerDown as (e: PointerEvent) => void)(
        { button: 2, pointerId: 1, clientX: 0, clientY: 0, currentTarget: {}, ...init } as unknown as PointerEvent,
      )
    down({})
    expect(c.api().dragging).toBe(false)

    const single = makeCarousel({ slideCount: 1, allowPointerDrag: true })
    ;((single.api().getViewportProps() as Dict).onPointerDown as (e: PointerEvent) => void)(
      { button: 0, pointerId: 1, clientX: 0, clientY: 0, currentTarget: {} } as unknown as PointerEvent,
    )
    expect(single.api().dragging).toBe(false)
  })
})
