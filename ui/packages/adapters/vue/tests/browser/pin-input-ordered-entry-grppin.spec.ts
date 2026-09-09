// 分格输入按顺序录入：焦点落在第一个空格上，还轮不到的格子连 Tab 都停不上去。
//
// 判据要的是真实焦点：真鼠标点在第三格上、真 Tab 键走过整组，两样 jsdom 都演不出来
// （jsdom 没有 Tab 序列，点击也不带浏览器那套「点谁谁得焦」）。所以这一份放在浏览器态：
// 一、点还轮不到的格子，焦点落到第一个空格；填满之后点哪一格就落哪一格。
// 二、Tab 走得出这一组——还轮不到的格子退出了 Tab 序列，不会被拨回来形成死循环。
import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhPinInputInput, XhPinInputRoot } from '../../src'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

const LENGTH = 4

/** 一组格子，前后各摆一颗按钮，用来看 Tab 有没有走得出去。 */
function mount(props: Record<string, unknown>): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => [
      h('button', { 'type': 'button', 'data-test': 'before' }, '前'),
      h(XhPinInputRoot, props, () => Array.from({ length: LENGTH }, (_, i) => h(XhPinInputInput, { index: i }))),
      h('button', { 'type': 'button', 'data-test': 'after' }, '后'),
    ],
  })
  app.mount(host)
}

function boxes(): HTMLInputElement[] {
  return [...document.querySelectorAll<HTMLInputElement>('[data-scope="pin-input"][data-part="input"]')]
}

function button(which: 'before' | 'after'): HTMLButtonElement {
  const el = document.querySelector<HTMLButtonElement>(`button[data-test="${which}"]`)
  if (!el)
    throw new Error(`没有 ${which} 这颗按钮`)
  return el
}

/** 当前焦点落在第几格；不在这一组里得 -1。 */
function focusedBox(): number {
  return boxes().findIndex(box => box === document.activeElement)
}

/** 焦点落在谁身上：格号，或前后那两颗按钮。 */
function focusedName(): string {
  const index = focusedBox()
  if (index >= 0)
    return `input[${index}]`
  const active = document.activeElement as HTMLElement | null
  return active?.dataset.test ? `button[${active.dataset.test}]` : (active?.nodeName ?? 'null')
}

describe('分格输入：焦点落在第一个空格上', () => {
  it('一格没填时点第三格，焦点落到首格', async () => {
    mount({})
    await nextTick()
    await userEvent.click(boxes()[2]!)
    await nextTick()
    expect(focusedBox()).toBe(0)
    expect(boxes()[0]!.getAttribute('data-focus')).toBe('')
    expect(boxes()[2]!.getAttribute('data-focus')).toBeNull()
  })

  it('已填两格时点末格，焦点落到待填的第三格', async () => {
    mount({ defaultValue: ['1', '2', '', ''] })
    await nextTick()
    await userEvent.click(boxes()[3]!)
    await nextTick()
    expect(focusedBox()).toBe(2)
  })

  it('往回改上一格照走：点已填的首格就落在首格', async () => {
    mount({ defaultValue: ['1', '2', '', ''] })
    await nextTick()
    await userEvent.click(boxes()[0]!)
    await nextTick()
    expect(focusedBox()).toBe(0)
  })

  it('填满之后点哪一格就落哪一格', async () => {
    mount({ defaultValue: ['1', '2', '3', '4'] })
    await nextTick()
    await userEvent.click(boxes()[3]!)
    await nextTick()
    expect(focusedBox()).toBe(3)
    await userEvent.click(boxes()[1]!)
    await nextTick()
    expect(focusedBox()).toBe(1)
  })
})

describe('分格输入：Tab 走得出这一组', () => {
  it('一格没填时只有首格是 Tab 停靠点，再按一下就出组', async () => {
    mount({})
    await nextTick()
    button('before').focus()

    await userEvent.tab()
    expect(focusedName()).toBe('input[0]')
    // 后面三格还轮不到：留在 Tab 序列里就会被拨回首格，这一下永远出不去
    await userEvent.tab()
    expect(focusedName()).toBe('button[after]')
  })

  it('已填一格时首格与第二格都停得住，第三下出组', async () => {
    mount({ defaultValue: ['1', '', '', ''] })
    await nextTick()
    button('before').focus()

    await userEvent.tab()
    expect(focusedName()).toBe('input[0]')
    await userEvent.tab()
    expect(focusedName()).toBe('input[1]')
    await userEvent.tab()
    expect(focusedName()).toBe('button[after]')
  })

  it('填满之后每一格都是 Tab 停靠点', async () => {
    mount({ defaultValue: ['1', '2', '3', '4'] })
    await nextTick()
    button('before').focus()

    for (let i = 0; i < LENGTH; i++) {
      await userEvent.tab()
      expect(focusedName()).toBe(`input[${i}]`)
    }
    await userEvent.tab()
    expect(focusedName()).toBe('button[after]')
  })
})
