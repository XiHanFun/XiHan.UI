// 分格输入：真实键盘逐键录入，一键一格。
//
// 用户在文档站的受控示例里敲一个数字要按两下才跳下一格。jsdom 里直接改 value 再派 input
// 复现不出来：宿主把值写回是异步的，只有真实键盘 + 真实宿主重渲的先后才暴露得出
// 「写完值立刻读回还是旧值」这一层。所以整份放在浏览器态，键盘走真实 keydown / input，
// 受控与非受控、numeric / alphanumeric、otp 与非 otp、粘贴、退格与数字小键盘各走一遍。
import type { XhPinInputElement } from '../../src/elements/pin-input'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null
let pin: XhPinInputElement | null = null

afterEach(() => {
  host?.remove()
  host = null
  pin = null
  document.body.innerHTML = ''
})

const LENGTH = 4

interface Harness {
  onValueChange: ReturnType<typeof vi.fn>
  onValueComplete: ReturnType<typeof vi.fn>
  /** 宿主此刻持有的值：受控接法里就是回写的那份；非受控接法里是回调最后一次报的值。 */
  held: () => string[]
}

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await Promise.resolve()
    await pin?.updateComplete
  }
}

/**
 * 受控：value 进、value-change 里把 detail.value 写回 value 属性，与另外两端的受控示例同一条接法。
 * 非受控：只挂监听不写 value。
 */
async function mount(mode: 'controlled' | 'uncontrolled', attrs: Record<string, string> = {}): Promise<Harness> {
  let held: string[] = []
  host = document.createElement('div')
  host.innerHTML = `
    <textarea data-test="clipboard"></textarea>
    <xh-pin-input length="${LENGTH}">
      <div data-xh-part="root">
        <label data-xh-part="label">验证码</label>
        ${Array.from({ length: LENGTH }).fill('<input data-xh-part="input" />').join('')}
      </div>
    </xh-pin-input>
  `
  pin = host.querySelector('xh-pin-input') as XhPinInputElement
  for (const [name, value] of Object.entries(attrs))
    pin.setAttribute(name, value)
  if (mode === 'controlled')
    pin.value = []
  const onValueChange = vi.fn((event: Event) => {
    held = (event as CustomEvent<{ value: string[] }>).detail.value
    if (mode === 'controlled')
      pin!.value = held
  })
  const onValueComplete = vi.fn()
  pin.addEventListener('value-change', onValueChange)
  pin.addEventListener('value-complete', event => onValueComplete((event as CustomEvent).detail))
  document.body.append(host)
  await settle()
  return { onValueChange, onValueComplete, held: () => held }
}

function boxes(): HTMLInputElement[] {
  return [...document.querySelectorAll<HTMLInputElement>('[data-scope="pin-input"][data-part="input"]')]
}

function values(): string[] {
  return boxes().map(box => box.value)
}

/** 当前焦点落在第几格；不在这一组里得 -1。 */
function focusedBox(): number {
  return boxes().findIndex(box => box === document.activeElement)
}

/** 敲一个真实按键（走 keydown → input），等宿主重渲完再读。 */
async function press(text: string): Promise<void> {
  await userEvent.keyboard(text)
  await settle()
}

/** 数字小键盘：NumLock 打开时 key 是数字本身、code 是 NumpadN、location 是 3。 */
async function pressNumpad(digit: string): Promise<void> {
  const shared = {
    key: digit,
    code: `Numpad${digit}`,
    windowsVirtualKeyCode: 96 + Number(digit),
    nativeVirtualKeyCode: 96 + Number(digit),
    location: 3,
  }
  await cdp().send('Input.dispatchKeyEvent', { ...shared, type: 'keyDown', text: digit, unmodifiedText: digit })
  await cdp().send('Input.dispatchKeyEvent', { ...shared, type: 'keyUp' })
  await settle()
}

/** 把一段文本放进系统剪贴板：写进 textarea、全选、真实 Ctrl+C。 */
async function copyToClipboard(text: string): Promise<void> {
  const area = document.querySelector<HTMLTextAreaElement>('textarea[data-test="clipboard"]')!
  area.value = text
  area.focus()
  area.select()
  await userEvent.copy()
}

/** 逐键敲一串，每敲一键都验：值落进本格、焦点已跳到下一格、回调只报了这一次。 */
async function typeSequence(h: Harness, chars: readonly string[], keyOf: (char: string) => Promise<void>): Promise<void> {
  await userEvent.click(boxes()[0]!)
  await settle()
  expect(focusedBox()).toBe(0)
  for (let i = 0; i < chars.length; i++) {
    await keyOf(chars[i]!)
    const want = [...chars.slice(0, i + 1), ...Array.from<string>({ length: LENGTH - i - 1 }).fill('')]
    expect(values(), `敲第 ${i + 1} 键后各格的值`).toEqual(want)
    expect(h.held(), `敲第 ${i + 1} 键后宿主持有的值`).toEqual(want)
    expect(h.onValueChange, `敲第 ${i + 1} 键后 value-change 的发数`).toHaveBeenCalledTimes(i + 1)
    // 末格敲完焦点停在末格，此前每一键都跳到下一格
    expect(focusedBox(), `敲第 ${i + 1} 键后焦点所在格`).toBe(Math.min(i + 1, LENGTH - 1))
  }
  expect(h.onValueComplete).toHaveBeenCalledTimes(1)
  expect(h.onValueComplete).toHaveBeenCalledWith({ value: [...chars], valueAsString: chars.join('') })
}

describe.each([
  ['受控（value 属性 + value-change 回写）', 'controlled'],
  ['非受控', 'uncontrolled'],
] as const)('分格输入 %s：真实键盘一键一格', (_, mode) => {
  it('numeric + otp：逐键 1 2 3 4，每键都跳下一格', async () => {
    const h = await mount(mode, { otp: '' })
    await typeSequence(h, ['1', '2', '3', '4'], press)
  })

  it('alphanumeric（非 otp）：字母与数字都一键一格', async () => {
    const h = await mount(mode, { type: 'alphanumeric' })
    await typeSequence(h, ['a', '1', 'B', '2'], press)
  })

  it('数字小键盘：Numpad 键码同样一键一格', async () => {
    const h = await mount(mode)
    await typeSequence(h, ['7', '8', '9', '0'], pressNumpad)
  })

  it('粘贴整串：按格铺开，焦点停在末格，只报一次值变化', async () => {
    const h = await mount(mode)
    await copyToClipboard('2468')
    await userEvent.click(boxes()[0]!)
    await settle()
    await userEvent.paste()
    await settle()
    expect(values()).toEqual(['2', '4', '6', '8'])
    expect(h.held()).toEqual(['2', '4', '6', '8'])
    expect(h.onValueChange).toHaveBeenCalledTimes(1)
    expect(h.onValueComplete).toHaveBeenCalledTimes(1)
    expect(focusedBox()).toBe(LENGTH - 1)
  })

  it('backspace：空格上退回上一格并清掉它，有值的格上只清本格', async () => {
    const h = await mount(mode)
    await userEvent.click(boxes()[0]!)
    await settle()
    await press('1')
    await press('2')
    expect(values()).toEqual(['1', '2', '', ''])
    expect(focusedBox()).toBe(2)
    // 第三格空着：退格退回第二格并把它清掉
    await press('{Backspace}')
    expect(values()).toEqual(['1', '', '', ''])
    expect(h.held()).toEqual(['1', '', '', ''])
    expect(focusedBox()).toBe(1)
    // 再退：第二格空着，退回首格并清掉
    await press('{Backspace}')
    expect(values()).toEqual(['', '', '', ''])
    expect(h.held()).toEqual(['', '', '', ''])
    expect(focusedBox()).toBe(0)
    // 首格上再填一个再退：有值的格上只清本格，焦点不动
    await press('5')
    expect(focusedBox()).toBe(1)
    await press('{ArrowLeft}')
    expect(focusedBox()).toBe(0)
    await press('{Backspace}')
    expect(values()).toEqual(['', '', '', ''])
    expect(focusedBox()).toBe(0)
    expect(h.onValueChange).toHaveBeenCalledTimes(6)
  })
})
