// 四颗翻页钮在皮肤下都得画得出来，判据是级联算出的 display 与盒宽——
// 「大步翻」那两颗曾因选择器列表里少了限定而被一条 display:none 无条件收掉。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhCalendarHeader,
  XhCalendarHeading,
  XhCalendarNextTrigger,
  XhCalendarNextYearTrigger,
  XhCalendarPrevTrigger,
  XhCalendarPrevYearTrigger,
  XhCalendarRoot,
} from '../../src'
// 皮肤要一起加载：这里查的就是皮肤算出来的取值
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

const NAV = ['prev-year-trigger', 'prev-trigger', 'next-trigger', 'next-year-trigger'] as const

function mountCalendar(): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhCalendarRoot, { locale: 'zh-CN', timeZone: 'UTC', defaultValue: '2026-07-15' }, () => [
      h(XhCalendarHeader, null, () => [
        h(XhCalendarPrevYearTrigger, null, () => '«'),
        h(XhCalendarPrevTrigger),
        h(XhCalendarHeading),
        h(XhCalendarNextTrigger),
        h(XhCalendarNextYearTrigger, null, () => '»'),
      ]),
    ]),
  })
  app.mount(host)
}

function nav(part: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope="calendar"][data-part="${part}"]`)
  if (!el)
    throw new Error(`没有 ${part} 这个节点`)
  return el
}

describe('日历翻页钮的皮肤', () => {
  it('四颗都画得出来，且同一副尺寸', () => {
    mountCalendar()
    const boxes = NAV.map(part => ({
      part,
      display: getComputedStyle(nav(part)).display,
      width: nav(part).getBoundingClientRect().width,
    }))
    for (const box of boxes) {
      expect(box.display, `${box.part} 被收掉了`).not.toBe('none')
      expect(box.width, `${box.part} 没有宽度`).toBeGreaterThan(0)
    }
    expect(new Set(boxes.map(b => b.width)).size).toBe(1)
  })

  it('打上 hidden 才收起，四颗一致', () => {
    mountCalendar()
    for (const part of NAV) {
      const el = nav(part)
      el.setAttribute('hidden', '')
      expect(getComputedStyle(el).display, `${part} 的 hidden 没兜住`).toBe('none')
      el.removeAttribute('hidden')
    }
  })

  it('禁用态四颗同一副长相', () => {
    mountCalendar()
    const looks = NAV.map((part) => {
      const el = nav(part) as HTMLButtonElement
      el.disabled = true
      const seen = { color: getComputedStyle(el).color, cursor: getComputedStyle(el).cursor }
      el.disabled = false
      return seen
    })
    expect(new Set(looks.map(l => `${l.color}|${l.cursor}`)).size).toBe(1)
    expect(looks[0]!.cursor).toBe('not-allowed')
  })
})
