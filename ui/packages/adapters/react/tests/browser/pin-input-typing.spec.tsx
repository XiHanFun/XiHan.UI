// 分格输入：真实键盘逐键录入，一键一格。
//
// 用户在文档站的受控示例里敲一个数字要按两下才跳下一格。jsdom 里直接改 value 再派 input
// 复现不出来：宿主把值写回是异步的，只有真实键盘 + 真实宿主重渲的先后才暴露得出
// 「写完值立刻读回还是旧值」这一层。所以整份放在浏览器态，键盘走真实 keydown / input，
// 受控与非受控、numeric / alphanumeric、otp 与非 otp、粘贴、退格与数字小键盘各走一遍。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { XhPinInputInput, XhPinInputRoot } from '../../src'

let root: Root | null = null
let host: HTMLElement | null = null

beforeEach(() => vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true))
afterEach(() => {
  act(() => root?.unmount())
  root = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

const LENGTH = 4

interface Harness {
  onValueChange: ReturnType<typeof vi.fn>
  onValueComplete: ReturnType<typeof vi.fn>
  /** 宿主此刻持有的值：受控接法里就是回写的那份；非受控接法里是回调最后一次报的值。 */
  held: () => string[]
}

interface DemoProps {
  mode: 'controlled' | 'uncontrolled'
  props: Record<string, unknown>
  onValueChange: (details: { value: string[] }) => void
  onValueComplete: () => void
}

/**
 * 受控：value 进、onValueChange 回写 useState，与文档站「一次性验证码」示例同一条接法。
 * 非受控：只挂回调不传 value。
 */
function Demo({ mode, props, onValueChange, onValueComplete }: DemoProps): ReactNode {
  const [code, setCode] = useState<string[]>([])
  return (
    <>
      <textarea data-test="clipboard" />
      <XhPinInputRoot
        {...props}
        {...(mode === 'controlled' ? { value: code } : {})}
        length={LENGTH}
        onValueChange={(details) => {
          setCode(details.value)
          onValueChange(details)
        }}
        onValueComplete={onValueComplete}
      >
        {Array.from({ length: LENGTH }, (_, i) => <XhPinInputInput key={i} index={i} />)}
      </XhPinInputRoot>
    </>
  )
}

async function mount(mode: 'controlled' | 'uncontrolled', props: Record<string, unknown> = {}): Promise<Harness> {
  let held: string[] = []
  const onValueChange = vi.fn((details: { value: string[] }) => {
    held = details.value
  })
  const onValueComplete = vi.fn()
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(<Demo mode={mode} props={props} onValueChange={onValueChange} onValueComplete={onValueComplete} />)
  })
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
  await act(async () => {
    await userEvent.keyboard(text)
  })
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
  await act(async () => {
    await cdp().send('Input.dispatchKeyEvent', { ...shared, type: 'keyDown', text: digit, unmodifiedText: digit })
    await cdp().send('Input.dispatchKeyEvent', { ...shared, type: 'keyUp' })
  })
}

async function click(el: HTMLElement): Promise<void> {
  await act(async () => {
    await userEvent.click(el)
  })
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
  await click(boxes()[0]!)
  expect(focusedBox()).toBe(0)
  for (let i = 0; i < chars.length; i++) {
    await keyOf(chars[i]!)
    const want = [...chars.slice(0, i + 1), ...Array.from<string>({ length: LENGTH - i - 1 }).fill('')]
    expect(values(), `敲第 ${i + 1} 键后各格的值`).toEqual(want)
    expect(h.held(), `敲第 ${i + 1} 键后宿主持有的值`).toEqual(want)
    expect(h.onValueChange, `敲第 ${i + 1} 键后 onValueChange 的发数`).toHaveBeenCalledTimes(i + 1)
    // 末格敲完焦点停在末格，此前每一键都跳到下一格
    expect(focusedBox(), `敲第 ${i + 1} 键后焦点所在格`).toBe(Math.min(i + 1, LENGTH - 1))
  }
  expect(h.onValueComplete).toHaveBeenCalledTimes(1)
  expect(h.onValueComplete).toHaveBeenCalledWith({ value: [...chars], valueAsString: chars.join('') })
}

describe.each([
  ['受控（value + onValueChange 回写）', 'controlled'],
  ['非受控', 'uncontrolled'],
] as const)('分格输入 %s：真实键盘一键一格', (_, mode) => {
  it('numeric + otp：逐键 1 2 3 4，每键都跳下一格', async () => {
    const h = await mount(mode, { otp: true })
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
    await click(boxes()[0]!)
    await act(async () => {
      await userEvent.paste()
    })
    expect(values()).toEqual(['2', '4', '6', '8'])
    expect(h.held()).toEqual(['2', '4', '6', '8'])
    expect(h.onValueChange).toHaveBeenCalledTimes(1)
    expect(h.onValueComplete).toHaveBeenCalledTimes(1)
    expect(focusedBox()).toBe(LENGTH - 1)
  })

  it('backspace：空格上退回上一格并清掉它，有值的格上只清本格', async () => {
    const h = await mount(mode)
    await click(boxes()[0]!)
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
