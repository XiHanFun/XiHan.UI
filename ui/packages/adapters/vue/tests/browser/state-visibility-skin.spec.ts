// 「此刻按不按得动」必须看得见。
// 手势指示要与它对得上：改不动的（只读）与按下去什么都不变的（没被裁的短文本）都不该摆手型；
// 按不动的实心按钮也得换掉底色，只压暗字会让它变成一块看不出内容的色斑。
// 判据全是级联算出来的取值——状态属性连接层一直都在发，缺的是皮肤这一头，
// 皮肤不接就只有读屏能听出来，看得见的人从头到尾以为点得动。
import type { App } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhCalendarCell,
  XhCalendarCellTrigger,
  XhCalendarGrid,
  XhCalendarGridBody,
  XhCalendarRoot,
  XhCalendarWeekRow,
  XhCheckbox,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
  XhRadioGroupItem,
  XhRadioGroupItemText,
  XhRadioGroupRoot,
  XhTruncate,
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

function mount(render: () => unknown): void {
  // 同一条用例里换一份挂载内容时先拆掉上一份：留着的话 part() 查到的还是旧那棵树
  app?.unmount()
  host?.remove()
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => () => render() as never })
  app.mount(host)
}

function part(scope: string, name: string, index = 0): HTMLElement {
  const all = document.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
  const el = all[index]
  if (!el)
    throw new Error(`没有第 ${index} 个 ${scope}/${name} 节点`)
  return el
}

const cursorOf = (el: HTMLElement): string => getComputedStyle(el).cursor

describe('checkbox 的只读手势', () => {
  it('只读：方框与整行文字都不再摆手型', () => {
    mount(() => h(XhCheckbox, { readOnly: true }, () => ['记住我']))
    expect(cursorOf(part('checkbox', 'root'))).toBe('default')
    expect(cursorOf(part('checkbox', 'label'))).toBe('default')
  })

  it('常态仍是手型', () => {
    mount(() => h(XhCheckbox, null, () => ['记住我']))
    expect(cursorOf(part('checkbox', 'root'))).toBe('pointer')
    expect(cursorOf(part('checkbox', 'label'))).toBe('pointer')
  })

  it('只读与禁用同时在时，禁用的手势指示不被盖掉', () => {
    mount(() => h(XhCheckbox, { readOnly: true, disabled: true }, () => ['记住我']))
    expect(cursorOf(part('checkbox', 'root'))).toBe('not-allowed')
    expect(cursorOf(part('checkbox', 'label'))).toBe('not-allowed')
  })
})

describe('radio-group 的只读手势', () => {
  const items = (readOnly: boolean) => h(
    XhRadioGroupRoot,
    { readOnly, defaultValue: 'a' },
    () => [
      h(XhRadioGroupItem, { value: 'a' }, () => [h(XhRadioGroupItemText, null, () => ['甲'])]),
      h(XhRadioGroupItem, { value: 'b', disabled: true }, () => [h(XhRadioGroupItemText, null, () => ['乙'])]),
    ],
  )

  it('只读：条目不再摆手型，禁用项照旧是禁止号', () => {
    mount(() => items(true))
    expect(cursorOf(part('radio-group', 'item', 0))).toBe('default')
    expect(cursorOf(part('radio-group', 'item', 1))).toBe('not-allowed')
  })

  it('常态仍是手型', () => {
    mount(() => items(false))
    expect(cursorOf(part('radio-group', 'item', 0))).toBe('pointer')
  })
})

describe('calendar 的只读手势', () => {
  function calendar(readOnly: boolean) {
    return h(
      XhCalendarRoot,
      { readOnly, locale: 'zh-CN', timeZone: 'UTC', defaultValue: '2026-07-15' },
      {
        default: ({ weeks }: { weeks: Array<Array<{ value: string }>> }) => [
          h(XhCalendarGrid, null, () => [
            h(XhCalendarGridBody, null, () => weeks.map(week =>
              h(XhCalendarWeekRow, null, () => week.map(day =>
                h(XhCalendarCell, { value: day.value, key: day.value }, () => [h(XhCalendarCellTrigger)]),
              )),
            )),
          ]),
        ],
      },
    )
  }

  it('只读：日格不再摆手型', () => {
    mount(() => calendar(true))
    expect(cursorOf(part('calendar', 'cell-trigger'))).toBe('default')
  })

  it('常态仍是手型', () => {
    mount(() => calendar(false))
    expect(cursorOf(part('calendar', 'cell-trigger'))).toBe('pointer')
  })
})

describe('mention 的只读手势', () => {
  // 候选浮层被搬到 portal 落点，且只读时机器会把它收起来；这里按契约铺一份等价结构，
  // 「定位层带 data-readonly」那一条由 headless 的 mention 用例守着
  function popup(readOnly: boolean): HTMLElement {
    const positioner = document.createElement('div')
    positioner.dataset.scope = 'mention'
    positioner.dataset.part = 'positioner'
    if (readOnly)
      positioner.dataset.readonly = ''
    for (const disabled of [false, true]) {
      const item = document.createElement('div')
      item.dataset.scope = 'mention'
      item.dataset.part = 'item'
      if (disabled)
        item.dataset.disabled = ''
      positioner.append(item)
    }
    document.body.append(positioner)
    return positioner
  }

  it('只读：候选不再摆手型，禁用候选照旧是禁止号', () => {
    const positioner = popup(true)
    const items = positioner.querySelectorAll<HTMLElement>('[data-part="item"]')
    expect(cursorOf(items[0]!)).toBe('default')
    expect(cursorOf(items[1]!)).toBe('not-allowed')
  })

  it('常态仍是手型', () => {
    const positioner = popup(false)
    expect(cursorOf(positioner.querySelector<HTMLElement>('[data-part="item"]')!)).toBe('pointer')
  })
})

describe('prompt-input 的禁用发送钮', () => {
  const token = (name: string): string =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()

  function submit(text: string): HTMLElement {
    mount(() => h(XhPromptInputRoot, { defaultValue: text }, {
      default: () => [h(XhPromptInputSubmitTrigger, null, () => ['发送'])],
    }))
    return part('prompt-input', 'submit-trigger')
  }

  it('空输入即禁用，底跟着字一起退到禁用那一档', () => {
    // 开箱第一眼就是这一档（输入为空即禁用）：底要是留着实心品牌色、只把字压成 fg-disabled，
    // 字与底几乎同亮度，按钮看着像一块色斑而不是一颗按钮。字底两档的实算差距由令牌层的用例守
    const el = submit('')
    expect((el as HTMLButtonElement).disabled).toBe(true)
    expect(getComputedStyle(el).backgroundColor).toBe(token('--xh-bg-muted'))
    expect(getComputedStyle(el).color).toBe(token('--xh-fg-disabled'))
  })

  it('打上字就回到实心品牌底', () => {
    const el = submit('你好')
    expect((el as HTMLButtonElement).disabled).toBe(false)
    expect(getComputedStyle(el).backgroundColor).toBe(token('--xh-bg-brand'))
  })
})

describe('truncate 的展开手型', () => {
  // 量测挂在 ResizeObserver 上，等它把 data-overflowing 落上再断言
  const settled = async (): Promise<HTMLElement> => {
    const el = part('truncate', 'root')
    await vi.waitFor(() => expect(el.hasAttribute('data-lines')).toBe(true))
    return el
  }

  function mountText(text: string, width: string): void {
    mount(() => h('div', { style: `inline-size:${width}` }, [
      h(XhTruncate, { expandable: true }, () => [text]),
    ]))
  }

  it('装得下的短文本不摆手型', async () => {
    mountText('短', '40rem')
    const el = await settled()
    await vi.waitFor(() => expect(el.hasAttribute('data-overflowing')).toBe(false))
    expect(cursorOf(el)).not.toBe('pointer')
  })

  it('真被裁了才摆手型', async () => {
    mountText('这一段话长得一行放不下，只能收成省略号', '4rem')
    const el = await settled()
    await vi.waitFor(() => expect(el.hasAttribute('data-overflowing')).toBe(true))
    expect(cursorOf(el)).toBe('pointer')
  })
})
