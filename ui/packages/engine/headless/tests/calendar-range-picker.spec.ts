// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { calendarRangePickerMachine, connectCalendarRangePicker } from '../src/calendar-range-picker'
import { calendarPeriodValue, parseCalendarDate } from '../src/shared/calendar'
import { click, createCalendarHarness, focused, hover, pointerDown, pointerUp, press, settle } from './calendar-harness'

const { mount, mountDrill } = createCalendarHarness(calendarRangePickerMachine, connectCalendarRangePicker)

afterEach(() => {
  document.body.innerHTML = ''
})

describe('周选预览', () => {
  it('周粒度悬停：预览按整周格延伸，不下沉到日格', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-08-17', granularity: 'week', locale: 'zh-CN' })
    h.api().select('2026-08-13')
    hover(h.cell('2026-08-17'))
    const lit = h.rendered().filter(v => h.cell(v).hasAttribute('data-in-range'))
    expect(lit).toEqual(['2026-08-10', '2026-08-17'])
  })

  it('不开周选时，悬停照旧是「起点 → 悬停点」那一段', () => {
    const h = mount({ defaultFocusedValue: '2026-08-17' })
    h.api().select('2026-08-11')
    hover(h.cell('2026-08-13'))
    const lit = h.rendered().filter(v => h.gridcell(v).hasAttribute('data-in-range'))
    expect(lit).toEqual(['2026-08-11', '2026-08-12', '2026-08-13'])
  })
})

describe('周粒度区间', () => {
  it('周粒度与区间模式正交：选择状态只存两端周期的首日', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-08-13', granularity: 'week', locale: 'zh-CN' })
    h.api().select('2026-08-13')
    // 起点只记在机器里，值要等终点落下才写
    expect(h.value()).toEqual([])
    expect(h.api().rangeAnchor).toBe('2026-08-10')
    h.api().select('2026-09-09')
    expect(h.value()).toEqual(['2026-08-10', '2026-09-07'])
    expect(calendarPeriodValue('week', 'range', h.value())).toEqual({
      granularity: 'week',
      start: '2026-08-10',
      end: '2026-09-13',
      keys: ['2026-W33', '2026-W37'],
    })
  })

  it('点 9 月那一页的首周（周首日在 8 月）：视窗留在 9 月，不翻回 8 月', async () => {
    const h = mountDrill({ defaultFocusedValue: '2026-09-09', granularity: 'week', locale: 'zh-CN' })
    expect(h.api().visibleMonth).toMatchObject({ year: 2026, month: 9 })
    // 9 月那一页列的第一周从 8 月 31 日起
    expect(h.rendered()[0]).toBe('2026-08-31')
    click(h.cell('2026-08-31'))
    expect(h.api().rangeAnchor).toBe('2026-08-31')
    expect(h.api().visibleMonth).toMatchObject({ year: 2026, month: 9 })
    expect(h.rendered()[0]).toBe('2026-08-31')
    // 键盘往上走到它也一样：那一周仍列在 9 月的名单上
    h.cell('2026-09-07').focus()
    press(h.cell('2026-09-07'), 'ArrowUp')
    await settle()
    expect(focused()).toBe('2026-08-31')
    expect(h.api().visibleMonth).toMatchObject({ year: 2026, month: 9 })
  })

  it('周区间反着挑也会按周期首日排序', () => {
    const h = mountDrill({ defaultFocusedValue: '2026-09-09', granularity: 'week', locale: 'zh-CN' })
    h.api().select('2026-09-09')
    h.api().select('2026-08-13')
    expect(h.value()).toEqual(['2026-08-10', '2026-09-07'])
  })
})

describe('多面板', () => {
  it('同一天在两个面板里只画一次：区间与选中都归认领它的那张面板', () => {
    // 2024-03-01 既在 2 月网格的末行，也在 3 月网格里；区间 2/20 → 3/05 覆盖它
    const api = mount({
      defaultFocusedValue: '2024-02-15',
      visibleCount: 2,

      defaultValue: ['2024-02-20', '2024-03-05'],
    }).api()
    const inFeb = api.getCellProps({ value: '2024-03-01', index: 0 }) as Record<string, unknown>
    const inMar = api.getCellProps({ value: '2024-03-01', index: 1 }) as Record<string, unknown>
    expect(inFeb['data-in-range']).toBeUndefined()
    expect(inMar['data-in-range']).toBe('')

    // 区间终点 3/05 只在三月那张面板上是端点
    const endInFeb = api.getCellProps({ value: '2024-03-05', index: 0 }) as Record<string, unknown>
    const endInMar = api.getCellProps({ value: '2024-03-05', index: 1 }) as Record<string, unknown>
    expect(endInFeb['data-range-end']).toBeUndefined()
    expect(endInFeb['data-selected']).toBeUndefined()
    expect(endInFeb['aria-selected']).toBe('false')
    expect(endInMar['data-range-end']).toBe('')
    expect(endInMar['data-selected']).toBe('')
    expect(endInMar['aria-selected']).toBe('true')
  })
})

describe('区间模式', () => {
  it('先点起点再点终点；起点只记在机器里，值要等终点落下才写', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    const onValueChange = vi.fn()
    h.setProps({ onValueChange })
    click(h.cell('2024-02-20'))
    // 中间态：值一动不动，宿主也不会被通知
    expect(h.value()).toEqual([])
    expect(h.api().rangeAnchor).toBe('2024-02-20')
    expect(onValueChange).not.toHaveBeenCalled()
    click(h.cell('2024-02-10'))
    // 倒着点也收成有序的两端
    expect(h.value()).toEqual(['2024-02-10', '2024-02-20'])
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(h.api().rangeAnchor).toBeNull()
    // 区间已完成，再点一下是重新起一段：旧区间先留着
    click(h.cell('2024-02-25'))
    expect(h.value()).toEqual(['2024-02-10', '2024-02-20'])
    expect(h.api().rangeAnchor).toBe('2024-02-25')
  })

  it('中间态按悬停预览区间，三种标记齐备且首尾都算 in-range', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    click(h.cell('2024-02-10'))
    hover(h.cell('2024-02-13'))
    expect(h.cell('2024-02-10').getAttribute('data-range-start')).toBe('')
    expect(h.cell('2024-02-13').getAttribute('data-range-end')).toBe('')
    for (const day of ['2024-02-10', '2024-02-11', '2024-02-12', '2024-02-13']) {
      expect(h.cell(day).getAttribute('data-in-range')).toBe('')
      expect(h.cell(day).getAttribute('data-range-preview')).toBe('')
      // 区间里的每一格都算选中，与 aria-selected 同一口径
      expect(h.gridcell(day).getAttribute('aria-selected')).toBe('true')
      expect(h.cell(day).getAttribute('data-selected')).toBe('')
    }
    expect(h.cell('2024-02-14').hasAttribute('data-in-range')).toBe(false)
    expect(h.cell('2024-02-09').hasAttribute('data-in-range')).toBe(false)
    // 反向悬停：起点仍钉在 10 号，只是 range-start 落到更早的那一端
    hover(h.cell('2024-02-07'))
    expect(h.cell('2024-02-07').getAttribute('data-range-start')).toBe('')
    expect(h.cell('2024-02-10').getAttribute('data-range-end')).toBe('')
  })

  it('挑到一半时旧区间不亮：亮的是起点到悬停那一段', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', defaultValue: ['2024-02-03', '2024-02-05'] })
    expect(h.cell('2024-02-04').getAttribute('data-in-range')).toBe('')
    click(h.cell('2024-02-20'))
    hover(h.cell('2024-02-22'))
    expect(h.cell('2024-02-04').hasAttribute('data-in-range')).toBe(false)
    expect(h.cell('2024-02-03').hasAttribute('data-selected')).toBe(false)
    expect(h.cell('2024-02-21').getAttribute('data-in-range')).toBe('')
  })

  it('键盘挑区间：确认键落起点后焦点自动前进一格，预览跟着聚焦日走', async () => {
    const h = mount({ defaultFocusedValue: '2024-02-10' })
    h.cell('2024-02-10').focus()
    press(h.cell('2024-02-10'), 'Enter')
    await settle()
    // 落了起点，焦点挪到 11 号：看得出这是在挑一段
    expect(h.api().rangeAnchor).toBe('2024-02-10')
    expect(focused()).toBe('2024-02-11')
    expect(h.cell('2024-02-11').getAttribute('data-range-end')).toBe('')
    press(h.cell('2024-02-11'), 'ArrowRight')
    await settle()
    expect(h.cell('2024-02-12').getAttribute('data-range-end')).toBe('')
    expect(h.cell('2024-02-11').getAttribute('data-in-range')).toBe('')
    press(h.cell('2024-02-12'), 'Enter')
    expect(h.value()).toEqual(['2024-02-10', '2024-02-12'])
  })

  it('落起点后后一格挑不了就退到前一格', async () => {
    const h = mount({ defaultFocusedValue: '2024-02-10', max: '2024-02-10' })
    h.cell('2024-02-10').focus()
    press(h.cell('2024-02-10'), 'Enter')
    await settle()
    expect(focused()).toBe('2024-02-09')
  })

  it('escape 撤掉起点，原来的区间原样还在；不拦默认行为', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', defaultValue: ['2024-02-03', '2024-02-05'] })
    click(h.cell('2024-02-20'))
    expect(h.api().rangeAnchor).toBe('2024-02-20')
    const event = press(h.grid, 'Escape')
    expect(event.defaultPrevented).toBe(false)
    expect(h.api().rangeAnchor).toBeNull()
    expect(h.value()).toEqual(['2024-02-03', '2024-02-05'])
    expect(h.cell('2024-02-04').getAttribute('data-in-range')).toBe('')
  })

  it('tab 要离开网格：挑到一半的区间就地收在起点到聚焦日', async () => {
    const h = mount({ defaultFocusedValue: '2024-02-10' })
    h.cell('2024-02-10').focus()
    press(h.cell('2024-02-10'), 'Enter')
    await settle()
    press(h.cell('2024-02-11'), 'ArrowRight')
    await settle()
    const event = press(h.grid, 'Tab')
    expect(event.defaultPrevented).toBe(false)
    expect(h.value()).toEqual(['2024-02-10', '2024-02-12'])
    expect(h.api().rangeAnchor).toBeNull()
  })

  it('起点落下后指针离开网格预览留住；还没落起点时离开即撤', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    hover(h.cell('2024-02-13'))
    h.grid.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }))
    click(h.cell('2024-02-10'))
    hover(h.cell('2024-02-13'))
    expect(h.cell('2024-02-12').getAttribute('data-in-range')).toBe('')
    h.grid.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }))
    // 轨道停在指针最后扫过的那一格
    expect(h.cell('2024-02-12').getAttribute('data-in-range')).toBe('')
    expect(h.cell('2024-02-13').getAttribute('data-range-end')).toBe('')
  })

  it('指针在日历之外松开：区间收在起点到最后悬停的那一格', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    click(h.cell('2024-02-10'))
    hover(h.cell('2024-02-13'))
    document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    expect(h.value()).toEqual(['2024-02-10', '2024-02-13'])
    expect(h.api().rangeAnchor).toBeNull()
  })

  it('指针在日历的翻页钮上松开：起点留着，不收口', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    click(h.cell('2024-02-10'))
    h.next.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    expect(h.value()).toEqual([])
    expect(h.api().rangeAnchor).toBe('2024-02-10')
  })

  it('鼠标按下即落起点，拖到另一格松开即收尾', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    pointerDown(h.cell('2024-02-10'))
    expect(h.api().rangeAnchor).toBe('2024-02-10')
    expect(h.api().dragging).toBe(true)
    expect(h.grid.getAttribute('data-dragging')).toBe('')
    hover(h.cell('2024-02-12'))
    pointerUp(h.cell('2024-02-12'))
    expect(h.value()).toEqual(['2024-02-10', '2024-02-12'])
    expect(h.api().dragging).toBe(false)
    expect(h.grid.hasAttribute('data-dragging')).toBe(false)
  })

  it('原格松开不收尾，第二下按下再松开才收尾；随后的 click 不再重复处理', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    pointerDown(h.cell('2024-02-10'))
    pointerUp(h.cell('2024-02-10'))
    click(h.cell('2024-02-10'))
    expect(h.value()).toEqual([])
    expect(h.api().rangeAnchor).toBe('2024-02-10')
    expect(h.api().dragging).toBe(false)
    pointerDown(h.cell('2024-02-14'))
    pointerUp(h.cell('2024-02-14'))
    click(h.cell('2024-02-14'))
    expect(h.value()).toEqual(['2024-02-10', '2024-02-14'])
    expect(h.api().rangeAnchor).toBeNull()
  })

  it('按在邻月的日子上：起点等同一格松手再落，按下那一刻不翻页也不起拖', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    // 3 月 2 日铺在二月网格的末行；按下即翻页的话，指针原地不动就会压到另一格上
    const pressed = h.cell('2024-03-02')
    pointerDown(pressed)
    // 按下那一下浏览器会把焦点落到格子上：落焦同样不许翻页
    pressed.focus()
    expect(h.api().rangeAnchor).toBeNull()
    expect(h.api().dragging).toBe(false)
    expect(h.api().headingLabel).toContain('February')
    expect(h.focusedValue()).toBe('2024-03-02')
    expect(h.cell('2024-03-02')).toBe(pressed)
    pointerUp(pressed)
    click(pressed)
    expect(h.api().rangeAnchor).toBe('2024-03-02')
    expect(h.api().headingLabel).toContain('March')
    expect(h.value()).toEqual([])
    // 松在别的格子上不算：起点没落、也不收尾
    pointerDown(h.cell('2024-03-20'))
    expect(h.api().rangeAnchor).toBe('2024-03-02')
  })

  it('终点落在邻月的日子上：按下落焦不翻页，松开才收尾并翻到那个月', async () => {
    const visibleMonths: number[] = []
    let h: ReturnType<typeof mount>
    h = mount({
      defaultFocusedValue: '2024-02-15',
      onFocusedValueChange: () => visibleMonths.push(h.api().visibleMonth.month),
    })
    pointerDown(h.cell('2024-02-10'))
    pointerUp(h.cell('2024-02-10'))
    click(h.cell('2024-02-10'))
    expect(h.api().rangeAnchor).toBe('2024-02-10')
    visibleMonths.length = 0
    const end = h.cell('2024-03-02')
    hover(end)
    pointerDown(end)
    end.focus()
    // 页没翻：被按的那个节点还在原处，松开压着的仍是它
    expect(h.api().headingLabel).toContain('February')
    expect(h.cell('2024-03-02')).toBe(end)
    expect(h.value()).toEqual([])
    expect(visibleMonths).toEqual([])
    pointerUp(end)
    click(end)
    expect(h.value()).toEqual(['2024-02-10', '2024-03-02'])
    expect(h.api().rangeAnchor).toBeNull()
    expect(h.api().headingLabel).toContain('March')
    expect(visibleMonths).toEqual([3])
    // 翻月重画后旧节点被换掉，焦点由机器搬回被点的那一天
    await settle()
    expect(focused()).toBe('2024-03-02')
  })

  it('反着挑：终点落在上个月的邻月格上，两端照样排好并翻到那个月', () => {
    const visibleMonths: number[] = []
    let h: ReturnType<typeof mount>
    h = mount({
      defaultFocusedValue: '2024-02-15',
      onFocusedValueChange: () => visibleMonths.push(h.api().visibleMonth.month),
    })
    click(h.cell('2024-02-10'))
    expect(h.api().rangeAnchor).toBe('2024-02-10')
    visibleMonths.length = 0
    // 1 月 30 日铺在二月网格的首行
    const end = h.cell('2024-01-30')
    hover(end)
    pointerDown(end)
    end.focus()
    expect(h.api().headingLabel).toContain('February')
    expect(h.cell('2024-01-30')).toBe(end)
    expect(visibleMonths).toEqual([])
    pointerUp(end)
    click(end)
    expect(h.value()).toEqual(['2024-01-30', '2024-02-10'])
    expect(h.api().headingLabel).toContain('January')
    expect(visibleMonths).toEqual([1])
  })

  it('按在落于邻月的区间端点上拖：按下落焦不翻页，拖到哪格就改到哪格', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', defaultValue: ['2024-02-10', '2024-03-02'] })
    const end = h.cell('2024-03-02')
    pointerDown(end)
    end.focus()
    expect(h.api().rangeAnchor).toBe('2024-02-10')
    expect(h.api().dragging).toBe(true)
    expect(h.api().headingLabel).toContain('February')
    expect(h.cell('2024-03-02')).toBe(end)
    hover(h.cell('2024-02-28'))
    pointerUp(h.cell('2024-02-28'))
    expect(h.value()).toEqual(['2024-02-10', '2024-02-28'])
    expect(h.api().dragging).toBe(false)
  })

  it('拖到的那一格必须是指针真扫进去过的：没扫过就松手不收尾', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    pointerDown(h.cell('2024-02-10'))
    pointerUp(h.cell('2024-02-14'))
    expect(h.value()).toEqual([])
    expect(h.api().rangeAnchor).toBe('2024-02-10')
    expect(h.api().dragging).toBe(false)
    hover(h.cell('2024-02-14'))
    pointerDown(h.cell('2024-02-14'))
    pointerUp(h.cell('2024-02-14'))
    expect(h.value()).toEqual(['2024-02-10', '2024-02-14'])
  })

  it('按在已选区间的一端上拖：改写那一端；原地松开则从那一端重新开始', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', defaultValue: ['2024-02-10', '2024-02-14'] })
    // 拖终点到 16 号
    pointerDown(h.cell('2024-02-14'))
    expect(h.api().rangeAnchor).toBe('2024-02-10')
    hover(h.cell('2024-02-16'))
    pointerUp(h.cell('2024-02-16'))
    expect(h.value()).toEqual(['2024-02-10', '2024-02-16'])
    // 按在起点上原地松开：从 10 号重新起一段
    pointerDown(h.cell('2024-02-10'))
    pointerUp(h.cell('2024-02-10'))
    click(h.cell('2024-02-10'))
    expect(h.api().rangeAnchor).toBe('2024-02-10')
    expect(h.value()).toEqual(['2024-02-10', '2024-02-16'])
    click(h.cell('2024-02-12'))
    expect(h.value()).toEqual(['2024-02-10', '2024-02-12'])
  })

  it('触屏按住够久才开始拖，轻点按普通点选处理', () => {
    vi.useFakeTimers()
    try {
      const h = mount({ defaultFocusedValue: '2024-02-15' })
      pointerDown(h.cell('2024-02-10'), 'touch')
      expect(h.api().rangeAnchor).toBeNull()
      pointerUp(h.cell('2024-02-10'))
      // 轻点：抬手抢在延时前，当场落起点
      expect(h.api().rangeAnchor).toBe('2024-02-10')
      expect(h.api().dragging).toBe(false)
      click(h.cell('2024-02-10'))
      expect(h.api().rangeAnchor).toBe('2024-02-10')
      click(h.cell('2024-02-12'))
      expect(h.value()).toEqual(['2024-02-10', '2024-02-12'])

      // 按住：延时到了才落起点并进入拖动，手指扫过的格子成为预览终点
      pointerDown(h.cell('2024-02-20'), 'touch')
      vi.advanceTimersByTime(250)
      expect(h.api().rangeAnchor).toBe('2024-02-20')
      expect(h.api().dragging).toBe(true)
      hover(h.cell('2024-02-22'), 'touch')
      expect(h.cell('2024-02-21').getAttribute('data-in-range')).toBe('')
      pointerUp(h.cell('2024-02-22'))
      expect(h.value()).toEqual(['2024-02-20', '2024-02-22'])
    }
    finally {
      vi.useRealTimers()
    }
  })

  it('触屏没在拖时扫过格子不铺预览', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    click(h.cell('2024-02-10'))
    hover(h.cell('2024-02-13'), 'touch')
    expect(h.cell('2024-02-12').hasAttribute('data-in-range')).toBe(false)
  })

  it('读屏合成的点击不走按下 / 松开那一路，照样先起点后终点', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    h.cell('2024-02-10').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, width: 0, height: 0 }))
    h.cell('2024-02-10').dispatchEvent(new PointerEvent('pointerup', { bubbles: true, width: 0, height: 0 }))
    expect(h.api().rangeAnchor).toBeNull()
    click(h.cell('2024-02-10'))
    expect(h.api().rangeAnchor).toBe('2024-02-10')
    click(h.cell('2024-02-12'))
    expect(h.value()).toEqual(['2024-02-10', '2024-02-12'])
  })

  it('值被宿主整份改写：起点作废', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    click(h.cell('2024-02-10'))
    h.api().setValue(['2024-02-01', '2024-02-03'])
    expect(h.api().rangeAnchor).toBeNull()
    expect(h.value()).toEqual(['2024-02-01', '2024-02-03'])
  })

  it('受控值被宿主回写：起点同样作废', () => {
    // props 挂在 signal 上的那套挂载：受控回写要靠 watch 里的 track 复查
    const h = mountDrill({ defaultFocusedValue: '2024-02-15', value: [] })
    click(h.cell('2024-02-10'))
    expect(h.api().rangeAnchor).toBe('2024-02-10')
    h.setProps({ value: ['2024-02-05', '2024-02-06'] })
    expect(h.api().rangeAnchor).toBeNull()
    expect(h.cell('2024-02-05').getAttribute('data-range-start')).toBe('')
  })

  it('isDateUnavailable 拿得到区间起点：落了起点之后只许挑 3 天内', () => {
    const seen: (string | null)[] = []
    const h = mount({
      defaultFocusedValue: '2024-02-15',

      isDateUnavailable: (value, anchor) => {
        seen.push(anchor)
        if (anchor == null)
          return false
        const diff = Math.abs(parseCalendarDate(value)!.compare(parseCalendarDate(anchor)!))
        return diff > 3
      },
    })
    expect(seen).toContain(null)
    click(h.cell('2024-02-10'))
    expect(h.cell('2024-02-13').getAttribute('aria-disabled')).toBe('false')
    expect(h.cell('2024-02-14').getAttribute('aria-disabled')).toBe('true')
    expect(h.cell('2024-02-06').getAttribute('aria-disabled')).toBe('true')
    click(h.cell('2024-02-14'))
    expect(h.value()).toEqual([])
    click(h.cell('2024-02-13'))
    expect(h.value()).toEqual(['2024-02-10', '2024-02-13'])
  })

  it('默认不许跨过不可用日：落了起点后可挑范围被夹在两侧最近的不可用日之间', () => {
    const blocked = new Set(['2024-02-07', '2024-02-13'])
    const h = mount({
      defaultFocusedValue: '2024-02-15',

      isDateUnavailable: value => blocked.has(value),
    })
    expect(h.cell('2024-02-20').getAttribute('aria-disabled')).toBe('false')
    click(h.cell('2024-02-10'))
    for (const day of ['2024-02-08', '2024-02-09', '2024-02-11', '2024-02-12'])
      expect(h.cell(day).getAttribute('aria-disabled')).toBe('false')
    for (const day of ['2024-02-06', '2024-02-07', '2024-02-13', '2024-02-14', '2024-02-20'])
      expect(h.cell(day).getAttribute('aria-disabled')).toBe('true')
    // 夹在外面的日子点不动、预览也铺不过去
    hover(h.cell('2024-02-20'))
    expect(h.cell('2024-02-14').hasAttribute('data-in-range')).toBe(false)
    click(h.cell('2024-02-20'))
    expect(h.value()).toEqual([])
    click(h.cell('2024-02-12'))
    expect(h.value()).toEqual(['2024-02-10', '2024-02-12'])
    expect(h.cell('2024-02-20').getAttribute('aria-disabled')).toBe('false')
  })

  it('allowsNonContiguousRanges：可以跨过不可用日，只是那些日子不铺轨道', () => {
    const h = mount({
      defaultFocusedValue: '2024-02-15',

      allowsNonContiguousRanges: true,
      isDateUnavailable: value => value === '2024-02-12',
    })
    click(h.cell('2024-02-10'))
    expect(h.cell('2024-02-14').getAttribute('aria-disabled')).toBe('false')
    click(h.cell('2024-02-14'))
    expect(h.value()).toEqual(['2024-02-10', '2024-02-14'])
    expect(h.cell('2024-02-11').getAttribute('data-in-range')).toBe('')
    expect(h.cell('2024-02-12').hasAttribute('data-in-range')).toBe(false)
    expect(h.gridcell('2024-02-12').getAttribute('aria-selected')).toBe('false')
    expect(h.cell('2024-02-13').getAttribute('data-in-range')).toBe('')
    expect(h.api().invalid).toBe(false)
  })

  it('已选区间的某一端不可用或越界即不合法：根带 data-invalid，区间里的格子报 aria-invalid', () => {
    const h = mount({
      defaultFocusedValue: '2024-02-15',

      defaultValue: ['2024-02-10', '2024-02-12'],
      min: '2024-02-11',
    })
    expect(h.api().invalid).toBe(true)
    expect(h.root.getAttribute('data-invalid')).toBe('')
    expect(h.cell('2024-02-11').getAttribute('aria-invalid')).toBe('true')
    expect(h.cell('2024-02-11').getAttribute('data-invalid')).toBe('')
    expect(h.cell('2024-02-14').hasAttribute('aria-invalid')).toBe(false)
    // 重新挑到一半时先不提旧区间的不合法
    click(h.cell('2024-02-20'))
    expect(h.cell('2024-02-11').hasAttribute('aria-invalid')).toBe(false)
    expect(h.api().invalid).toBe(false)
  })

  it('作者标了 invalid 也走同一条：根与区间里的格子都报', () => {
    const h = mount({ defaultValue: ['2024-02-10', '2024-02-12'], invalid: true })
    expect(h.root.getAttribute('data-invalid')).toBe('')
    expect(h.cell('2024-02-10').getAttribute('aria-invalid')).toBe('true')
  })

  it('聚焦格上提示这一下是开始还是收尾；区间两端的可及名字带上整段起止', () => {
    const h = mount({ defaultFocusedValue: '2024-02-10', locale: 'en-US' })
    expect(h.cell('2024-02-10').getAttribute('aria-description')).toBe('Click to start selecting date range')
    expect(h.cell('2024-02-11').hasAttribute('aria-description')).toBe(false)
    click(h.cell('2024-02-10'))
    expect(h.cell('2024-02-10').getAttribute('aria-description')).toBe('Click to finish selecting date range')
    click(h.cell('2024-02-12'))
    expect(h.cell('2024-02-10').getAttribute('aria-label')).toBe(
      'Selected Range: Saturday, February 10, 2024 to Monday, February 12, 2024, Saturday, February 10, 2024',
    )
    expect(h.cell('2024-02-11').getAttribute('aria-label')).toBe('Sunday, February 11, 2024')
    // 文案可换
    h.setProps({ translations: { selectedRange: (a, b) => `${a} 到 ${b}`, startRangeSelectionPrompt: '点一下开始' } })
    expect(h.cell('2024-02-10').getAttribute('aria-label')).toContain('Saturday, February 10, 2024 到 Monday, February 12, 2024')
    expect(h.cell('2024-02-12').getAttribute('aria-description')).toBe('点一下开始')
  })

  it('setRangeAnchor 是命令式的同一条路', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    h.api().setRangeAnchor('2024-02-10')
    expect(h.api().rangeAnchor).toBe('2024-02-10')
    h.api().setRangeAnchor(null)
    expect(h.api().rangeAnchor).toBeNull()
  })

  it('只读：起点落不下，预览也不铺', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', readOnly: true })
    pointerDown(h.cell('2024-02-10'))
    pointerUp(h.cell('2024-02-10'))
    click(h.cell('2024-02-10'))
    expect(h.api().rangeAnchor).toBeNull()
    expect(h.value()).toEqual([])
  })
})

describe('按压通道', () => {
  type Handlers = Record<string, unknown> & {
    onKeyDown: (e: KeyboardEvent) => void
    onKeyUp: (e: KeyboardEvent) => void
    onPointerDown: (e: PointerEvent) => void
    onPointerUp: () => void
  }
  /** 键盘桩：只带跟踪器会读的三个字段。 */
  const key = (name: string, init: Partial<KeyboardEvent> = {}): KeyboardEvent =>
    ({ key: name, repeat: false, isComposing: false, keyCode: 0, ...init } as KeyboardEvent)
  const keyup = (el: HTMLElement, name: string): void => {
    el.dispatchEvent(new KeyboardEvent('keyup', { key: name, bubbles: true, cancelable: true }))
  }
  const has = (el: HTMLElement): boolean => el.hasAttribute('data-pressed')

  it('七类部件各走自己的键：只有按住的那一个投影 data-pressed，另一颗钮的 keyup 不串；区间与聚焦日不动', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    press(h.prev, 'Enter')
    expect(has(h.prev)).toBe(true)
    expect(has(h.next)).toBe(false)
    expect(has(h.cell('2024-02-15'))).toBe(false)
    keyup(h.next, 'Enter')
    expect(has(h.prev)).toBe(true)
    keyup(h.prev, 'Enter')
    expect(has(h.prev)).toBe(false)

    // 翻年钮与标题两截不在这套夹具里，直接走 getter 上的处理器；按面板下标记
    const prevYear = h.api().getPrevYearTriggerProps() as Handlers
    prevYear.onKeyDown(key(' '))
    expect((h.api().getPrevYearTriggerProps() as Handlers)['data-pressed']).toBe('')
    expect((h.api().getNextYearTriggerProps() as Handlers)['data-pressed']).toBeUndefined()
    prevYear.onKeyUp(key(' '))
    expect((h.api().getPrevYearTriggerProps() as Handlers)['data-pressed']).toBeUndefined()
    const year = h.api().getHeadingYearTriggerProps() as Handlers
    year.onPointerDown({ pointerType: 'touch' } as PointerEvent)
    expect((h.api().getHeadingYearTriggerProps() as Handlers)['data-pressed']).toBe('')
    expect((h.api().getHeadingMonthTriggerProps() as Handlers)['data-pressed']).toBeUndefined()
    year.onPointerUp()
    expect((h.api().getHeadingYearTriggerProps() as Handlers)['data-pressed']).toBeUndefined()
    expect(h.value()).toEqual([])
    expect(h.api().rangeAnchor).toBeNull()
    expect(h.focusedValue()).toBe('2024-02-15')
  })

  it('日期格按 ISO 键记：落起点那一下焦点前进一格，按压面随焦点一起走；收尾那一下焦点留在原地，按住到抬起', async () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    h.cell('2024-02-15').focus()
    press(h.cell('2024-02-15'), 'Enter')
    expect(h.api().rangeAnchor).toBe('2024-02-15')
    await settle()
    // 焦点挪到了 16 日，15 日已经 blur：不会再来 keyup，按压面跟着走
    expect(focused()).toBe('2024-02-16')
    expect(has(h.cell('2024-02-15'))).toBe(false)
    expect(has(h.cell('2024-02-16'))).toBe(false)
    press(h.cell('2024-02-16'), 'ArrowRight')
    await settle()
    press(h.cell('2024-02-17'), ' ')
    expect(h.value()).toEqual(['2024-02-15', '2024-02-17'])
    expect(has(h.cell('2024-02-17'))).toBe(true)
    press(h.cell('2024-02-17'), ' ', { repeat: true })
    expect(has(h.cell('2024-02-17'))).toBe(true)
    keyup(h.cell('2024-02-17'), ' ')
    expect(has(h.cell('2024-02-17'))).toBe(false)
  })

  it('触屏按下即投影按压面、拖选起点仍按延时落下；抬起落在另一格上时松开先前按住的那一格', () => {
    vi.useFakeTimers()
    try {
      const h = mount({ defaultFocusedValue: '2024-02-15' })
      pointerDown(h.cell('2024-02-10'), 'mouse')
      expect(has(h.cell('2024-02-10'))).toBe(false)
      pointerUp(h.cell('2024-02-10'), 'mouse')

      // 轻点：按下即投影，起点要等抬手才落；抬起撤下
      pointerDown(h.cell('2024-02-12'), 'touch')
      expect(has(h.cell('2024-02-12'))).toBe(true)
      expect(h.api().rangeAnchor).toBe('2024-02-10')
      pointerUp(h.cell('2024-02-12'), 'touch')
      expect(has(h.cell('2024-02-12'))).toBe(false)
      expect(h.value()).toEqual(['2024-02-10', '2024-02-12'])

      // 按住够久起拖：按压面一直在，手指滑到另一格抬起，那一格的 pointerup 松开的是先前按住的这一格
      pointerDown(h.cell('2024-02-20'), 'touch')
      expect(has(h.cell('2024-02-20'))).toBe(true)
      vi.advanceTimersByTime(250)
      expect(h.api().dragging).toBe(true)
      expect(has(h.cell('2024-02-20'))).toBe(true)
      hover(h.cell('2024-02-22'), 'touch')
      pointerUp(h.cell('2024-02-22'), 'touch')
      expect(has(h.cell('2024-02-20'))).toBe(false)
      expect(has(h.cell('2024-02-22'))).toBe(false)
      expect(h.value()).toEqual(['2024-02-20', '2024-02-22'])

      // 手指滑出网格再抬起：格子收不到 pointerup，拖动结束（文档级松手）即松开
      pointerDown(h.cell('2024-02-05'), 'touch')
      vi.advanceTimersByTime(250)
      expect(h.api().dragging).toBe(true)
      expect(has(h.cell('2024-02-05'))).toBe(true)
      document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch' }))
      expect(h.api().dragging).toBe(false)
      expect(has(h.cell('2024-02-05'))).toBe(false)

      // 滚动接管（pointercancel）即撤下
      pointerDown(h.cell('2024-02-08'), 'touch')
      expect(has(h.cell('2024-02-08'))).toBe(true)
      h.cell('2024-02-08').dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerType: 'touch' }))
      expect(has(h.cell('2024-02-08'))).toBe(false)
    }
    finally {
      vi.useRealTimers()
    }
  })

  it('不可选的格子（越界 / 作者判定）不进按压面；到界的翻页钮不进', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15', min: '2024-02-10', max: '2024-02-28', isDateUnavailable: v => v === '2024-02-20' })
    press(h.cell('2024-02-05'), 'Enter')
    expect(has(h.cell('2024-02-05'))).toBe(false)
    pointerDown(h.cell('2024-02-20'), 'touch')
    expect(has(h.cell('2024-02-20'))).toBe(false)
    press(h.next, 'Enter')
    expect(has(h.next)).toBe(false)
    press(h.prev, 'Enter')
    expect(has(h.prev)).toBe(false)
    press(h.cell('2024-02-15'), 'Enter')
    expect(has(h.cell('2024-02-15'))).toBe(true)
  })

  it('只读只挡日期格，翻页与钻层照常；整张禁用谁都不进', () => {
    const readOnly = mount({ defaultFocusedValue: '2024-02-15', readOnly: true })
    press(readOnly.cell('2024-02-15'), 'Enter')
    expect(has(readOnly.cell('2024-02-15'))).toBe(false)
    press(readOnly.next, 'Enter')
    expect(has(readOnly.next)).toBe(true)
    keyup(readOnly.next, 'Enter')
    const heading = readOnly.api().getHeadingYearTriggerProps() as Handlers
    heading.onKeyDown(key('Enter'))
    expect((readOnly.api().getHeadingYearTriggerProps() as Handlers)['data-pressed']).toBe('')

    const disabled = mount({ defaultFocusedValue: '2024-02-15', disabled: true })
    press(disabled.cell('2024-02-15'), 'Enter')
    pointerDown(disabled.cell('2024-02-15'), 'touch')
    expect(has(disabled.cell('2024-02-15'))).toBe(false)
    const year = disabled.api().getHeadingYearTriggerProps() as Handlers
    year.onKeyDown(key('Enter'))
    expect((disabled.api().getHeadingYearTriggerProps() as Handlers)['data-pressed']).toBeUndefined()
  })

  it('按住途中整张转入禁用即松开；转入只读只松开日期格，按着的标题钮留着', () => {
    const cell = mountDrill({ defaultFocusedValue: '2024-02-15' })
    pointerDown(cell.cell('2024-02-15'), 'touch')
    expect(has(cell.cell('2024-02-15'))).toBe(true)
    cell.setProps({ disabled: true })
    expect(has(cell.cell('2024-02-15'))).toBe(false)

    const ro = mountDrill({ defaultFocusedValue: '2024-02-15' })
    pointerDown(ro.cell('2024-02-15'), 'touch')
    expect(has(ro.cell('2024-02-15'))).toBe(true)
    ro.setProps({ readOnly: true })
    expect(has(ro.cell('2024-02-15'))).toBe(false)

    const heading = mountDrill({ defaultFocusedValue: '2024-02-15' })
    press(heading.yearTrigger, 'Enter')
    expect(has(heading.yearTrigger)).toBe(true)
    heading.setProps({ readOnly: true })
    expect(has(heading.yearTrigger)).toBe(true)
    heading.setProps({ disabled: true })
    expect(has(heading.yearTrigger)).toBe(false)
  })

  it('钻层时一并松开：Enter 在月格上按住那一下钻进日视图，整页格子换掉，不会再来 keyup；标题钮到顶同理', () => {
    const h = mountDrill({ defaultFocusedValue: '2024-02-15', defaultActiveView: 'month' })
    h.cell('2024-02-01').focus()
    press(h.cell('2024-02-01'), 'Enter')
    expect(h.api().activeView).toBe('day')
    expect(h.api().getCellTriggerProps({ value: '2024-02-01' })['data-pressed']).toBeUndefined()

    const heading = mountDrill({ defaultFocusedValue: '2024-02-15' })
    press(heading.yearTrigger, 'Enter')
    expect(has(heading.yearTrigger)).toBe(true)
    click(heading.yearTrigger)
    expect(heading.api().activeView).toBe('year')
    expect(has(heading.yearTrigger)).toBe(false)
  })

  it('视窗挪动只松开格子：按住的那一格随页换掉，不会再来 keyup；正按着的翻页钮留着', () => {
    const h = mount({ defaultFocusedValue: '2024-02-15' })
    pointerDown(h.cell('2024-02-15'), 'touch')
    expect(has(h.cell('2024-02-15'))).toBe(true)
    h.api().goToNextMonth()
    expect(h.api().visibleMonth.month).toBe(3)
    expect(h.api().getCellTriggerProps({ value: '2024-02-15' })['data-pressed']).toBeUndefined()

    press(h.next, 'Enter')
    expect(has(h.next)).toBe(true)
    click(h.next)
    expect(h.api().visibleMonth.month).toBe(4)
    expect(has(h.next)).toBe(true)
    keyup(h.next, 'Enter')
    expect(has(h.next)).toBe(false)
  })
})
