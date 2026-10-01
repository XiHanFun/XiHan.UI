// 多选的日期选择器：选中的日期在输入行里排成一排标签（库内 tag），段位让位；
// 删除钮摘掉它那一个、触发钮上退格摘掉最后一个，挤不下时折进 +N，表单一值一份隐藏输入，
// 没有选中时标签行承载整条占位。显隐、截断与生成内容只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhDatePickerClearTrigger,
  XhDatePickerControl,
  XhDatePickerHiddenInput,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTagList,
  XhDatePickerTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

interface Mounted { changes: string[][] }

async function mount(props: Record<string, unknown>): Promise<Mounted> {
  host = document.createElement('div')
  document.body.append(host)
  const changes: string[][] = []
  app = createApp({
    render: () => h(XhDatePickerRoot, {
      'locale': 'zh-CN',
      'name': 'days',
      'selectionMode': 'multiple',
      ...props,
      'onValue-change': (details: { value: string[] }) => changes.push(details.value),
    }, () => [
      h(XhDatePickerControl, null, () => [
        h(XhDatePickerTagList),
        h(XhDatePickerSegmentGroup, null, () => [h(XhDatePickerSegment, { segment: 'year' }), h(XhDatePickerSegment, { segment: 'month' }), h(XhDatePickerSegment, { segment: 'day' })]),
        h(XhDatePickerClearTrigger),
        h(XhDatePickerTrigger),
      ]),
      h(XhDatePickerHiddenInput),
    ]),
  })
  app.mount(host)
  await nextTick()
  return { changes }
}

function part(name: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='date-picker'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 date-picker 的 ${name}`)
  return el
}

/** 在场的标签；摘掉的那枚会在原处留一个替身播完退场，带 data-state=closed，不算。 */
function tags(): HTMLElement[] {
  return [...part('tag-list').querySelectorAll<HTMLElement>(`[data-scope='tag'][data-part='root'][data-value]:not([data-state='closed'])`)]
}

describe('date-picker 多选成标签', () => {
  it('选中的日期排成标签，段位整体收起；标签文字按 locale 排出', async () => {
    await mount({ defaultValue: ['2026-07-01', '2026-07-09'] })
    expect(getComputedStyle(part('segment-group')).display).toBe('none')
    expect(getComputedStyle(part('tag-list')).display).not.toBe('none')
    expect(tags().map(tag => tag.textContent?.trim())).toEqual(['2026/07/01', '2026/07/09'])
  })

  it('点删除钮摘掉它那一个，焦点不被抢走；触发钮上按退格摘掉最后一个', async () => {
    const { changes } = await mount({ defaultValue: ['2026-07-01', '2026-07-02', '2026-07-03'] })
    const trigger = part('trigger')
    trigger.focus()
    const remove = tags()[1]!.querySelector<HTMLElement>(`[data-scope='tag'][data-part='close-trigger']`)!
    remove.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, cancelable: true }))
    remove.click()
    await nextTick()
    expect(document.activeElement).toBe(trigger)
    expect(changes.at(-1)).toEqual(['2026-07-01', '2026-07-03'])
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }))
    await nextTick()
    expect(changes.at(-1)).toEqual(['2026-07-01'])
    expect(tags()).toHaveLength(1)
  })

  it('有值时清空钮与日历钮都在：多选的日历钮是键盘入口，不给清空钮让位', async () => {
    await mount({ defaultValue: ['2026-07-01'] })
    expect(getComputedStyle(part('clear-trigger')).display).not.toBe('none')
    expect(getComputedStyle(part('trigger')).display).not.toBe('none')
  })

  it('点删除钮不会顺手展开浮层', async () => {
    await mount({ defaultValue: ['2026-07-01', '2026-07-02'] })
    tags()[0]!.querySelector<HTMLElement>(`[data-scope='tag'][data-part='close-trigger']`)!.click()
    await nextTick()
    expect(part('trigger').getAttribute('aria-expanded')).toBe('false')
  })

  it('超过 maxTagCount 的折进 +N', async () => {
    await mount({ maxTagCount: 2, defaultValue: ['2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04'] })
    expect(tags()).toHaveLength(2)
    const overflow = part('tag-list').querySelector<HTMLElement>(`[data-scope='tag'][data-part='root'][data-count]`)!
    expect(overflow.hidden).toBe(false)
    expect(overflow.textContent?.trim()).toBe('+2')
  })

  it('标签放不下就折到下一行：文字不截短，盒随行数长高，字段宽度不变', async () => {
    await mount({ maxTagCount: 8, defaultValue: ['2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04', '2026-07-05', '2026-07-06'] })
    const root = part('root').getBoundingClientRect()
    for (const tag of tags()) {
      const label = tag.querySelector<HTMLElement>(`[data-scope='tag'][data-part='label']`)!
      expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth + 1)
    }
    const rows = new Set(tags().map(tag => Math.round(tag.getBoundingClientRect().top)))
    expect(rows.size).toBeGreaterThan(1)
    expect(part('control').getBoundingClientRect().height).toBeGreaterThan(40)
    // 两颗钮留在首行：标签行只吃剩下的宽度、在自己里面折行，不把钮挤到最后一行
    const firstRow = Math.min(...rows)
    const trigger = part('trigger').getBoundingClientRect()
    expect(trigger.top).toBeLessThan(Math.max(...rows))
    expect(trigger.bottom).toBeGreaterThan(firstRow)
    expect(part('tag-list').getBoundingClientRect().right).toBeLessThanOrEqual(root.right)
    expect(part('root').getBoundingClientRect().width).toBe(root.width)
  })

  it('表单出口：一个选中值一份同名隐藏输入', async () => {
    await mount({ defaultValue: ['2026-07-01', '2026-07-09'] })
    const inputs = [...host!.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="days"]')]
    expect(inputs.map(input => input.value)).toEqual(['2026-07-01', '2026-07-09'])
  })

  it('没有选中时标签行显示整条占位，选上一个即撤下', async () => {
    await mount({ placeholder: '请选择日期' })
    const before = getComputedStyle(part('tag-list'), '::before')
    expect(before.content).toBe('"请选择日期"')
    app!.unmount()
    host!.remove()
    await mount({ placeholder: '请选择日期', defaultValue: ['2026-07-01'] })
    expect(getComputedStyle(part('tag-list'), '::before').content).toBe('none')
  })

  it('单选不出标签行，段位照常', async () => {
    await mount({ selectionMode: 'single', defaultValue: '2026-07-01' })
    expect(getComputedStyle(part('tag-list')).display).toBe('none')
    expect(getComputedStyle(part('segment-group')).display).not.toBe('none')
  })
})
