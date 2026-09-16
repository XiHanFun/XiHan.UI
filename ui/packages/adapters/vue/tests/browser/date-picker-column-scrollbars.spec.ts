// DatePicker 的快捷选项列与每一时间列各接一路贴层的自绘条：与 content 那两条同一形态（浮层 4px 档）。
//
// 条子按列在 content 里的偏移盒定位，选项列与日历之间的空当要绕过夹在中间的条子节点：只有真实布局量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhDatePickerCalendar,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerPositioner,
  XhDatePickerPresetGroup,
  XhDatePickerRoot,
  XhDatePickerTimePanel,
  XhDatePickerTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 几何断言容差 1px：连接层按 offsetLeft / offsetTop / offsetWidth / offsetHeight 写内联几何，它们是取整的整数，
// 层的真实盒子可以落在半像素上

const PRESETS = Array.from({ length: 24 }, (_, index) => ({ value: `2026-09-${String(index + 1).padStart(2, '0')}`, label: `九月 ${index + 1} 日` }))

let app: App | null = null
let host: HTMLElement | null = null

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

async function mountDatePicker(dir: 'ltr' | 'rtl' = 'ltr'): Promise<void> {
  host = document.createElement('div')
  host.dir = dir
  document.body.append(host)
  app = createApp({
    render: () => h(XhDatePickerRoot, {
      dir,
      open: true,
      showTime: true,
      value: ['2026-09-11T09:30'],
      presets: PRESETS,
    }, () => [
      h(XhDatePickerControl, null, () => h(XhDatePickerTrigger)),
      h(XhDatePickerPositioner, null, () => [
        h(XhDatePickerContent, null, () => [
          h(XhDatePickerPresetGroup),
          // 日历只要挂载点、标题与网格骨架在场：这里量的是列与条子的几何，格子内容不影响兄弟关系
          h(XhDatePickerCalendar, null, () => [
            h(XhDatePickerHeader, null, () => h(XhDatePickerHeading)),
            h(XhDatePickerGrid),
          ]),
          h(XhDatePickerTimePanel),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await settle()
}

function parts(name: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='date-picker'][data-part='${name}']`)]
}

/** 紧跟在某个层后面的条子，按轴取。 */
function barsAfter(el: HTMLElement): HTMLElement[] {
  const out: HTMLElement[] = []
  let next = el.nextElementSibling
  while (next instanceof HTMLElement && next.dataset.scope === 'scrollbar' && next.dataset.part === 'root') {
    out.push(next)
    next = next.nextElementSibling
  }
  return out
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

describe('日期选择器快捷列与时间列的自绘条', () => {
  it('快捷列后面紧跟竖横两条贴层的条子，贴在它自己的盒子上；它与日历之间的空当仍在', async () => {
    await mountDatePicker()
    const group = parts('preset-group')[0]!
    const bars = barsAfter(group)
    expect(bars.map(bar => bar.dataset.orientation)).toEqual(['vertical', 'horizontal'])
    expect(group.hasAttribute('data-xh-scrollbar')).toBe(true)
    const box = group.getBoundingClientRect()
    for (const bar of bars) {
      expect(bar.getAttribute('data-anchor')).toBe('layer')
      expect(bar.getAttribute('data-size')).toBe('sm')
      const rect = bar.getBoundingClientRect()
      if (bar.dataset.orientation === 'vertical') {
        expect(Math.abs(rect.right - box.right)).toBeLessThanOrEqual(1)
        expect(Math.abs(rect.top - box.top)).toBeLessThanOrEqual(1)
      }
      else {
        expect(Math.abs(rect.bottom - box.bottom)).toBeLessThanOrEqual(1)
        expect(Math.abs(rect.left - box.left)).toBeLessThanOrEqual(1)
      }
      expect(getComputedStyle(bar.querySelector<HTMLElement>('[data-part="track"]')!).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    }
    // 选项列与日历之间的空当由 preset-group ~ calendar 给（平板起落在行内轴、手机档落在块轴），
    // 条子节点夹在两者之间也接得上
    const calendar = parts('calendar')[0]!
    expect(calendar.previousElementSibling).not.toBe(group)
    const wide = window.matchMedia('(min-width: 768px)').matches
    expect(Number.parseFloat(getComputedStyle(calendar)[wide ? 'paddingInlineStart' : 'paddingBlockStart'])).toBeGreaterThan(0)
  })

  it('每一时间列后面紧跟一条贴层的竖条，贴该列的行内末端、与列同高；日历与首列的分隔线仍在', async () => {
    await mountDatePicker()
    const columns = parts('time-column')
    expect(columns.length).toBeGreaterThanOrEqual(2)
    for (const column of columns) {
      const [bar, ...rest] = barsAfter(column)
      expect(rest).toEqual([])
      expect(bar!.getAttribute('data-anchor')).toBe('layer')
      expect(bar!.getAttribute('data-orientation')).toBe('vertical')
      const box = column.getBoundingClientRect()
      const rect = bar!.getBoundingClientRect()
      expect(Math.abs(rect.right - box.right)).toBeLessThanOrEqual(1)
      expect(Math.abs(rect.top - box.top)).toBeLessThanOrEqual(1)
      expect(Math.abs(rect.height - box.height)).toBeLessThanOrEqual(1)
      expect(column.scrollHeight).toBeGreaterThan(column.clientHeight)
    }
    const calendar = parts('calendar')[0]!
    expect(calendar.nextElementSibling).toBe(columns[0])
    expect(Number.parseFloat(getComputedStyle(calendar, '::after').width)).toBeGreaterThan(0)
    // content 自己那两条仍挂在浮层壳上
    const positioner = parts('positioner')[0]!
    expect(positioner.querySelectorAll(':scope > [data-scope="scrollbar"][data-part="root"]').length).toBe(2)
  })

  it('从右到左排版时时间列的竖条贴列的左缘', async () => {
    await mountDatePicker('rtl')
    const column = parts('time-column')[0]!
    const [bar] = barsAfter(column)
    expect(Math.abs(bar!.getBoundingClientRect().left - column.getBoundingClientRect().left)).toBeLessThanOrEqual(1)
  })
})
