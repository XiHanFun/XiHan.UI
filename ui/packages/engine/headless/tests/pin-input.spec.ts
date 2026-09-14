// @vitest-environment jsdom
import type { PinInputSchema } from '../src/pin-input'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  connectPinInput,
  firstEmptyPinIndex,
  isPinComplete,
  padPinValue,
  pinFocusTarget,
  pinInputMachine,
  pinLength,
  samePinValue,
  sanitizePin,
} from '../src/pin-input'

type Props = PinInputSchema['props']

// 迷你 spreader：与 WC 侧同语义（事件 addEventListener、value 走 property、
// undefined/null/false 视为撤掉属性）。connect 的产出只有真打到节点上才验得到行为。
function applyProps(node: HTMLElement, props: Record<string, unknown>, bound: Map<string, EventListener>): void {
  for (const [key, value] of Object.entries(props)) {
    const isEvent = key.length > 2 && key.startsWith('on') && key[2]! >= 'A' && key[2]! <= 'Z'
    if (isEvent) {
      const name = key.slice(2).toLowerCase()
      const prev = bound.get(name)
      if (prev)
        node.removeEventListener(name, prev)
      if (typeof value === 'function') {
        node.addEventListener(name, value as EventListener)
        bound.set(name, value as EventListener)
      }
      continue
    }
    if (key === 'value') {
      (node as HTMLInputElement).value = String(value ?? '')
      continue
    }
    if (value === undefined || value === null || value === false) {
      node.removeAttribute(key)
      continue
    }
    node.setAttribute(key, String(value))
  }
}

interface Mounted {
  root: HTMLElement
  boxes: HTMLInputElement[]
  hidden: HTMLInputElement
  api: () => ReturnType<typeof connectPinInput>
  destroy: () => void
}

function mount(props: Props = {}): Mounted {
  const runtime = createVanillaRuntime()
  const service = createService(pinInputMachine, { props: () => props, runtime })
  runtime.start()

  const root = document.createElement('div')
  document.body.appendChild(root)
  const count = pinLength(props.length)
  const boxes: HTMLInputElement[] = []
  for (let i = 0; i < count; i++) {
    const el = document.createElement('input')
    root.appendChild(el)
    boxes.push(el)
  }
  const hidden = document.createElement('input')
  root.appendChild(hidden)

  const listeners = new Map<HTMLElement, Map<string, EventListener>>()
  const bound = (el: HTMLElement): Map<string, EventListener> => {
    let m = listeners.get(el)
    if (!m) {
      m = new Map()
      listeners.set(el, m)
    }
    return m
  }

  const render = (): void => {
    const api = connectPinInput(service, normalizeProps)
    applyProps(root, api.getRootProps() as Record<string, unknown>, bound(root))
    boxes.forEach((el, index) => applyProps(el, api.getInputProps({ index }) as Record<string, unknown>, bound(el)))
    applyProps(hidden, api.getHiddenInputProps() as Record<string, unknown>, bound(hidden))
  }
  // 任一 cell 变化就整体重打，与 WC 宿主的 wire() 同语义
  runtime.subscribe(render)
  render()

  return {
    root,
    boxes,
    hidden,
    api: () => connectPinInput(service, normalizeProps),
    destroy: () => {
      runtime.stop()
      root.remove()
    },
  }
}

/** 真实输入：先改框里的内容，再派 input 事件。只派事件落不到 value 上。 */
function typeInto(box: HTMLInputElement, text: string): void {
  box.focus()
  box.value = text
  box.dispatchEvent(new Event('input', { bubbles: true }))
}

function pressKey(box: HTMLInputElement, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  box.dispatchEvent(event)
  return event
}

function paste(box: HTMLInputElement, text: string): void {
  box.focus()
  // jsdom 没有 ClipboardEvent 构造器，自己补一份 clipboardData
  const event = new Event('paste', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } })
  box.dispatchEvent(event)
}

function boxValues(m: Mounted): string[] {
  return m.boxes.map(b => b.value)
}

function focusedIndex(m: Mounted): number {
  return m.boxes.findIndex(b => b === document.activeElement)
}

const mounted: Mounted[] = []
function open(props: Props = {}): Mounted {
  const m = mount(props)
  mounted.push(m)
  return m
}

afterEach(() => {
  while (mounted.length) mounted.pop()!.destroy()
  document.body.innerHTML = ''
})

describe('pin-input 纯函数', () => {
  it('sanitizePin 按 type 丢弃不接受的字符，保留原顺序', () => {
    expect(sanitizePin('1a2b3', 'numeric')).toBe('123')
    expect(sanitizePin('1a2b3', 'alphabetic')).toBe('ab')
    expect(sanitizePin('1a2b3', 'alphanumeric')).toBe('1a2b3')
    expect(sanitizePin('a-b_c', 'alphabetic')).toBe('abc')
    // 全是非法字符时得到空串，调用方据此判定"这一次什么都没输进来"
    expect(sanitizePin('！@#', 'numeric')).toBe('')
  })

  it('sanitizePin 的 pattern 盖过 type，作者不必自己写锚点', () => {
    // 十六进制：type 仍是 numeric（键盘照旧弹数字），准入由 pattern 放宽
    expect(sanitizePin('12ag3F', 'numeric', '[0-9A-Fa-f]')).toBe('12a3F')
    // 只收这几个字，别的一概丢掉
    expect(sanitizePin('上中下左右', 'alphanumeric', '[上下]')).toBe('上下')
    // 自动加的是整格锚，写 `\\d` 不会匹配到多字符
    expect(sanitizePin('1a2', 'alphabetic', '\\d')).toBe('12')
  })

  it('sanitizePin 的 pattern 写坏了退回 type 的准入表，不抛', () => {
    // 括号不闭合，编不成正则
    expect(() => sanitizePin('1a2', 'numeric', '[0-9')).not.toThrow()
    expect(sanitizePin('1a2', 'numeric', '[0-9')).toBe('12')
    expect(sanitizePin('1a2', 'alphabetic', '[0-9')).toBe('a')
    // 空串当作没给
    expect(sanitizePin('1a2', 'alphabetic', '')).toBe('a')
  })

  it('sanitizePin 按码点切分，pattern 匹得上代理对', () => {
    expect(sanitizePin('a🙂b', 'alphabetic', '[a-z🙂]')).toBe('a🙂b')
  })

  it('padPinValue 归一到 length，且每格只留一个字符', () => {
    expect(padPinValue(['1', '2'], 4)).toEqual(['1', '2', '', ''])
    expect(padPinValue(['1', '2', '3'], 2)).toEqual(['1', '2'])
    expect(padPinValue(['12', '34'], 2)).toEqual(['1', '3'])
    expect(padPinValue(undefined, 3)).toEqual(['', '', ''])
  })

  it('pinLength 把非法格数退回默认 6', () => {
    expect(pinLength(undefined)).toBe(6)
    expect(pinLength(0)).toBe(6)
    expect(pinLength(-3)).toBe(6)
    expect(pinLength(Number.NaN)).toBe(6)
    expect(pinLength(4)).toBe(4)
    expect(pinLength(4.7)).toBe(4)
  })

  it('firstEmptyPinIndex 报第一个空格，填满了报 -1', () => {
    expect(firstEmptyPinIndex(['', '', ''])).toBe(0)
    expect(firstEmptyPinIndex(['1', '', ''])).toBe(1)
    // 中间被清空：报的是那个洞，不是末尾
    expect(firstEmptyPinIndex(['1', '', '3'])).toBe(1)
    expect(firstEmptyPinIndex(['1', '2', '3'])).toBe(-1)
  })

  it('pinFocusTarget 不许越过第一个空格，填满后原样放行', () => {
    // 一格都没填：点哪儿都落在首格
    expect(pinFocusTarget(['', '', ''], 2)).toBe(0)
    // 已填两格：第三格是待填的那一格，点它就落它
    expect(pinFocusTarget(['1', '2', '', ''], 2)).toBe(2)
    // 再往后就越界了，退回第一个空格
    expect(pinFocusTarget(['1', '2', '', ''], 3)).toBe(2)
    // 往回改上一格不受限
    expect(pinFocusTarget(['1', '2', '', ''], 0)).toBe(0)
    // 填满之后哪一格都能落
    expect(pinFocusTarget(['1', '2', '3'], 2)).toBe(2)
    expect(pinFocusTarget(['1', '2', '3'], 0)).toBe(0)
  })

  it('pinFocusTarget 把出界的下标夹回格子范围', () => {
    expect(pinFocusTarget(['1', '2', '3'], 9)).toBe(2)
    expect(pinFocusTarget(['1', '2', '3'], -4)).toBe(0)
    expect(pinFocusTarget(['1', '2', '3'], Number.NaN)).toBe(0)
    expect(pinFocusTarget([], 3)).toBe(0)
  })

  it('pinFocusTarget 的结果再裁一次仍是它自己：按裁定搬焦点不会来回弹', () => {
    const cases: string[][] = [['', '', ''], ['1', '', ''], ['1', '2', ''], ['1', '2', '3'], ['1', '', '3']]
    for (const value of cases) {
      for (let i = -2; i < value.length + 2; i++) {
        const once = pinFocusTarget(value, i)
        expect(pinFocusTarget(value, once)).toBe(once)
      }
    }
  })

  it('isPinComplete / samePinValue', () => {
    expect(isPinComplete(['1', '2'])).toBe(true)
    expect(isPinComplete(['1', ''])).toBe(false)
    expect(isPinComplete([])).toBe(false)
    expect(samePinValue(['1', '2'], ['1', '2'])).toBe(true)
    expect(samePinValue(['1', '2'], ['1', '3'])).toBe(false)
    expect(samePinValue(['1'], undefined)).toBe(false)
  })
})

describe('pinInputMachine', () => {
  function service(props: Props = {}) {
    const runtime = createVanillaRuntime()
    const s = createService(pinInputMachine, { props: () => props, runtime })
    runtime.start()
    return s
  }

  it('vALUE.FILL 从落点起铺开，超出末格的部分截断', () => {
    const onValueChange = vi.fn()
    const s = service({ length: 4, onValueChange })
    s.send({ type: 'VALUE.FILL', index: 1, value: '2345' })
    expect(padPinValue(s.context.get('value'), 4)).toEqual(['', '2', '3', '4'])
    // 读侧的归一会把超长部分藏起来，所以这里盯回调：多出来的那一位不能挂在数组尾巴上溜给宿主
    expect(onValueChange).toHaveBeenCalledWith({ value: ['', '2', '3', '4'], valueAsString: '234' })
  })

  it('vALUE.FILL 丢掉不接受的字符，只把合法的铺进去', () => {
    const s = service({ length: 4, type: 'numeric' })
    s.send({ type: 'VALUE.FILL', index: 0, value: 'a1b2' })
    expect(padPinValue(s.context.get('value'), 4)).toEqual(['1', '2', '', ''])
  })

  it('onValueComplete 只在真的从"没满"变成"满了"时触发一次', () => {
    const onValueComplete = vi.fn()
    const s = service({ length: 2, onValueComplete })
    s.send({ type: 'VALUE.FILL', index: 0, value: '1' })
    expect(onValueComplete).not.toHaveBeenCalled()
    s.send({ type: 'VALUE.FILL', index: 1, value: '2' })
    expect(onValueComplete).toHaveBeenCalledTimes(1)
    expect(onValueComplete).toHaveBeenCalledWith({ value: ['1', '2'], valueAsString: '12' })
    // 又写了一遍同样的值：值没变，不该再报一次"填满了"
    s.send({ type: 'VALUE.FILL', index: 1, value: '2' })
    expect(onValueComplete).toHaveBeenCalledTimes(1)
    // 换掉末格的字符：值真的变了，且仍是满的，这是一次新的完成
    s.send({ type: 'VALUE.FILL', index: 1, value: '9' })
    expect(onValueComplete).toHaveBeenCalledTimes(2)
  })

  it('onValueChange 只在值真的变了时通知', () => {
    const onValueChange = vi.fn()
    const s = service({ length: 2, onValueChange })
    s.send({ type: 'VALUE.FILL', index: 0, value: '1' })
    expect(onValueChange).toHaveBeenCalledTimes(1)
    s.send({ type: 'VALUE.FILL', index: 0, value: '1' })
    expect(onValueChange).toHaveBeenCalledTimes(1)
  })

  it('disabled 时铺值与清格都被守卫挡下', () => {
    const s = service({ length: 2, defaultValue: ['1', '2'], disabled: true })
    s.send({ type: 'VALUE.FILL', index: 0, value: '9' })
    s.send({ type: 'VALUE.CLEAR_AT', index: 1 })
    expect(padPinValue(s.context.get('value'), 2)).toEqual(['1', '2'])
  })

  it('受控 value：内部不自改，仍照发 onValueChange', () => {
    const onValueChange = vi.fn()
    const s = service({ length: 2, value: ['1', ''], onValueChange })
    s.send({ type: 'VALUE.FILL', index: 1, value: '2' })
    expect(padPinValue(s.context.get('value'), 2)).toEqual(['1', ''])
    expect(onValueChange).toHaveBeenCalledWith({ value: ['1', '2'], valueAsString: '12' })
  })

  it('iNPUT.FOCUS 记的是裁定后的落点：越不过第一个空格', () => {
    const s = service({ length: 4 })
    // 一格没填，点第三格也只落到首格
    s.send({ type: 'INPUT.FOCUS', index: 2 })
    expect(s.context.get('focusedIndex')).toBe(0)
    s.send({ type: 'VALUE.FILL', index: 0, value: '1' })
    // 首格填上了，第二格成了待填的那一格
    s.send({ type: 'INPUT.FOCUS', index: 3 })
    expect(s.context.get('focusedIndex')).toBe(1)
    // 往回改上一格不受限
    s.send({ type: 'INPUT.FOCUS', index: 0 })
    expect(s.context.get('focusedIndex')).toBe(0)
  })

  it('填满之后 INPUT.FOCUS 落在点的那一格，改哪一位都行', () => {
    const s = service({ length: 3, defaultValue: ['1', '2', '3'] })
    s.send({ type: 'INPUT.FOCUS', index: 2 })
    expect(s.context.get('focusedIndex')).toBe(2)
    s.send({ type: 'INPUT.FOCUS', index: 0 })
    expect(s.context.get('focusedIndex')).toBe(0)
  })

  it('中间那格被清空后，第一个空格就是它：焦点不再往后走', () => {
    const s = service({ length: 3, defaultValue: ['1', '2', '3'] })
    s.send({ type: 'VALUE.CLEAR_AT', index: 1 })
    // 停在被清掉的那一格上，接着填就是它
    s.send({ type: 'INPUT.FOCUS', index: 1 })
    expect(s.context.get('focusedIndex')).toBe(1)
    // 末格还有字，但轮不到它
    s.send({ type: 'INPUT.FOCUS', index: 2 })
    expect(s.context.get('focusedIndex')).toBe(1)
  })

  it('只读与禁用不按顺序录入：点哪一格就记哪一格', () => {
    const readOnly = service({ length: 4, value: ['1', '', '3', ''], readOnly: true })
    readOnly.send({ type: 'INPUT.FOCUS', index: 2 })
    expect(readOnly.context.get('focusedIndex')).toBe(2)
    const disabled = service({ length: 4, value: ['1', '', '3', ''], disabled: true })
    disabled.send({ type: 'INPUT.FOCUS', index: 3 })
    expect(disabled.context.get('focusedIndex')).toBe(3)
  })

  it('vALUE.SET 整份替换并按 type 过滤，VALUE.CLEAR 清空', () => {
    const s = service({ length: 3, type: 'numeric' })
    s.send({ type: 'VALUE.SET', value: ['1', 'a', '3'] })
    expect(padPinValue(s.context.get('value'), 3)).toEqual(['1', '', '3'])
    s.send({ type: 'VALUE.CLEAR' })
    expect(padPinValue(s.context.get('value'), 3)).toEqual(['', '', ''])
  })
})

describe('connectPinInput 属性输出', () => {
  it('root 是 group 并由 label 命名；label 的 for 指向首格', () => {
    const m = open({ length: 3 })
    expect(m.root.getAttribute('role')).toBe('group')
    const api = m.api()
    const label = api.getLabelProps() as Record<string, unknown>
    expect(m.root.getAttribute('aria-labelledby')).toBe(label.id)
    expect(label.for).toBe(m.boxes[0]!.id)
  })

  it('data-complete 随填满与否翻转，隐藏输入随值走', () => {
    const m = open({ length: 2, name: 'code' })
    expect(m.root.getAttribute('data-complete')).toBeNull()
    expect(m.hidden.getAttribute('type')).toBe('hidden')
    expect(m.hidden.getAttribute('name')).toBe('code')
    typeInto(m.boxes[0]!, '1')
    typeInto(m.boxes[1]!, '2')
    expect(m.root.getAttribute('data-complete')).toBe('')
    expect(m.hidden.value).toBe('12')
  })

  it('otp=true 补 one-time-code，否则明确关掉自动填充', () => {
    expect(open({ length: 2, otp: true }).boxes[0]!.getAttribute('autocomplete')).toBe('one-time-code')
    expect(open({ length: 2 }).boxes[0]!.getAttribute('autocomplete')).toBe('off')
  })

  it('inputmode 按 type 给：只收数字就只弹数字键盘', () => {
    expect(open({ length: 2, type: 'numeric', otp: true }).boxes[0]!.getAttribute('inputmode')).toBe('numeric')
    expect(open({ length: 2, type: 'alphabetic' }).boxes[0]!.getAttribute('inputmode')).toBe('text')
    expect(open({ length: 2, type: 'alphanumeric' }).boxes[0]!.getAttribute('inputmode')).toBe('text')
  })

  it('mask=true 转 password；默认是 text', () => {
    expect(open({ length: 2, mask: true }).boxes[0]!.getAttribute('type')).toBe('password')
    expect(open({ length: 2 }).boxes[0]!.getAttribute('type')).toBe('text')
  })

  it('每格带 data-index，placeholder 与 aria-invalid 照写', () => {
    const m = open({ length: 3, placeholder: '·', invalid: true })
    expect(m.boxes.map(b => b.getAttribute('data-index'))).toEqual(['0', '1', '2'])
    expect(m.boxes[0]!.getAttribute('placeholder')).toBe('·')
    expect(m.boxes[0]!.getAttribute('aria-invalid')).toBe('true')
    expect(m.root.getAttribute('data-invalid')).toBe('')
  })

  it('每格带内置的可访问名，念得出序号与总数', () => {
    const m = open({ length: 3 })
    expect(m.boxes.map(b => b.getAttribute('aria-label'))).toEqual([
      'Character 1 of 3',
      'Character 2 of 3',
      'Character 3 of 3',
    ])
  })

  it('translations.input 覆盖内置文案', () => {
    const m = open({
      length: 2,
      translations: { input: (index, count) => `第 ${index} 格，共 ${count} 格` },
    })
    expect(m.boxes.map(b => b.getAttribute('aria-label'))).toEqual(['第 1 格，共 2 格', '第 2 格，共 2 格'])
  })

  it('disabled 落成原生 disabled，隐藏输入一并不参与提交', () => {
    const m = open({ length: 2, disabled: true })
    expect(m.boxes[0]!.hasAttribute('disabled')).toBe(true)
    expect(m.hidden.hasAttribute('disabled')).toBe(true)
    expect(m.root.getAttribute('data-disabled')).toBe('')
  })

  it('data-focus 跟着焦点走，焦点离开整组即撤掉', () => {
    // 填满之后哪一格都能落焦，这里只验标记跟着焦点走；没填满时的落点另有判据
    const m = open({ length: 2, defaultValue: ['1', '2'] })
    m.boxes[1]!.focus()
    expect(m.boxes[1]!.getAttribute('data-focus')).toBe('')
    expect(m.boxes[0]!.getAttribute('data-focus')).toBeNull()
    m.boxes[0]!.focus()
    expect(m.boxes[0]!.getAttribute('data-focus')).toBe('')
    expect(m.boxes[1]!.getAttribute('data-focus')).toBeNull()
    m.boxes[0]!.blur()
    expect(m.boxes[0]!.getAttribute('data-focus')).toBeNull()
  })

  it('别的格子迟到的失焦不会把当前锚点抹掉', () => {
    const m = open({ length: 2 })
    m.boxes[0]!.focus()
    // 焦点已经落在首格，末格再补派一次 blur：浏览器换焦点时两条事件的先后并不总如愿，
    // 无条件认账就会把刚记下的锚点清成 -1
    m.boxes[1]!.dispatchEvent(new FocusEvent('blur'))
    expect(m.boxes[0]!.getAttribute('data-focus')).toBe('')
    expect(m.api().focusedIndex).toBe(0)
  })
})

describe('connectPinInput 输入行为', () => {
  it('敲一个字符后自动跳下一格', () => {
    const m = open({ length: 3 })
    typeInto(m.boxes[0]!, '1')
    expect(boxValues(m)).toEqual(['1', '', ''])
    expect(focusedIndex(m)).toBe(1)
    typeInto(m.boxes[1]!, '2')
    expect(boxValues(m)).toEqual(['1', '2', ''])
    expect(focusedIndex(m)).toBe(2)
  })

  it('末格敲完派发 onValueComplete，焦点停在末格', () => {
    const onValueComplete = vi.fn()
    const m = open({ length: 2, onValueComplete })
    typeInto(m.boxes[0]!, '1')
    typeInto(m.boxes[1]!, '2')
    expect(onValueComplete).toHaveBeenCalledTimes(1)
    expect(onValueComplete).toHaveBeenCalledWith({ value: ['1', '2'], valueAsString: '12' })
    expect(focusedIndex(m)).toBe(1)
  })

  it('blurOnComplete：填满即把焦点撤走', () => {
    const m = open({ length: 2, blurOnComplete: true })
    typeInto(m.boxes[0]!, '1')
    expect(focusedIndex(m)).toBe(1)
    typeInto(m.boxes[1]!, '2')
    expect(focusedIndex(m)).toBe(-1)
    expect(document.activeElement).not.toBe(m.boxes[1])
  })

  it('非法字符整个丢弃：不进值，也不许留在框里', () => {
    const onValueChange = vi.fn()
    const m = open({ length: 3, type: 'numeric', onValueChange })
    typeInto(m.boxes[0]!, 'a')
    // 值没变 → 宿主不会重渲 → 框里那个 'a' 只能由 connect 自己拨回去
    expect(m.boxes[0]!.value).toBe('')
    expect(m.api().valueAsString).toBe('')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(focusedIndex(m)).toBe(0)
  })

  it('alphabetic 只收字母，数字被丢弃', () => {
    const m = open({ length: 3, type: 'alphabetic' })
    typeInto(m.boxes[0]!, '7')
    expect(m.boxes[0]!.value).toBe('')
    typeInto(m.boxes[0]!, 'x')
    expect(m.boxes[0]!.value).toBe('x')
  })

  it('光标停在已有字符旁边接着打：留下新字符，旧字符不会被再铺一遍', () => {
    const m = open({ length: 3 })
    typeInto(m.boxes[0]!, '1')
    // 焦点已跳到第二格，手动点回第一格并在末尾补打一个字符
    typeInto(m.boxes[0]!, '19')
    expect(boxValues(m)).toEqual(['9', '', ''])
    // 反过来：新字符落在旧字符前面
    typeInto(m.boxes[0]!, '89')
    expect(boxValues(m)).toEqual(['8', '', ''])
  })

  it('一次塞进多个字符要拆开分发，而不是塞进一格', () => {
    // 首格先填上，第二格才落得了焦；顺序录入下"前面空着还能站到后面"本就走不到
    const m = open({ length: 4, defaultValue: ['1', '', '', ''] })
    typeInto(m.boxes[1]!, '234')
    expect(boxValues(m)).toEqual(['1', '2', '3', '4'])
    expect(m.boxes[1]!.value).toBe('2')
    expect(focusedIndex(m)).toBe(3)
  })

  it('框被清空（剪切这类不走 Backspace 的删除）时清掉该格', () => {
    const m = open({ length: 2, defaultValue: ['1', '2'] })
    typeInto(m.boxes[0]!, '')
    expect(boxValues(m)).toEqual(['', '2'])
  })

  it('disabled 下直接派事件也推不动值', () => {
    // 禁用输入框上 focus/输入都被浏览器短路，只有直接派发才碰得到守卫
    const m = open({ length: 2, defaultValue: ['1', '2'], disabled: true })
    m.boxes[0]!.value = '9'
    m.boxes[0]!.dispatchEvent(new Event('input', { bubbles: true }))
    pressKey(m.boxes[0]!, 'Backspace')
    pressKey(m.boxes[0]!, 'Delete')
    expect(m.api().valueAsString).toBe('12')
  })

  it('受控 value：宿主不写回则框里纹丝不动，回调照发', () => {
    const onValueChange = vi.fn()
    const m = open({ length: 2, value: ['1', ''], onValueChange })
    typeInto(m.boxes[1]!, '2')
    expect(boxValues(m)).toEqual(['1', ''])
    expect(onValueChange).toHaveBeenCalledWith({ value: ['1', '2'], valueAsString: '12' })
  })
})

describe('connectPinInput 粘贴', () => {
  it('从当前格起按格铺开，超长截断', () => {
    // 落点是第二格：首格已填，顺序录入允许站在这里
    const m = open({ length: 4, defaultValue: ['1', '', '', ''] })
    paste(m.boxes[1]!, '2345')
    expect(boxValues(m)).toEqual(['1', '2', '3', '4'])
    expect(focusedIndex(m)).toBe(3)
  })

  it('粘贴时过滤非法字符，只把合法的铺进去', () => {
    const m = open({ length: 4, type: 'numeric' })
    paste(m.boxes[0]!, '1-2 3')
    expect(boxValues(m)).toEqual(['1', '2', '3', ''])
  })

  it('拦下浏览器的默认粘贴，整串不会被塞进一格', () => {
    const m = open({ length: 4 })
    const event = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => '1234' } })
    m.boxes[0]!.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(m.boxes[0]!.value).toBe('1')
  })

  it('整串合法字符为空时什么都不做', () => {
    const m = open({ length: 4, type: 'numeric' })
    paste(m.boxes[0]!, 'abc')
    expect(boxValues(m)).toEqual(['', '', '', ''])
  })

  it('pattern 放宽准入后，敲与粘贴两条路都按它收', () => {
    const m = open({ length: 4, type: 'numeric', pattern: '[0-9A-Fa-f]' })
    // 逐个敲：小写 f 收得下，g 收不下
    typeInto(m.boxes[0]!, 'f')
    typeInto(m.boxes[1]!, 'g')
    expect(boxValues(m)).toEqual(['f', '', '', ''])
    // 粘贴走同一份准入表
    paste(m.boxes[1]!, '1g2A')
    expect(boxValues(m)).toEqual(['f', '1', '2', 'A'])
  })

  it('pattern 只管收哪些字符，弹哪种键盘仍由 type 说了算', () => {
    const m = open({ length: 2, type: 'numeric', pattern: '[0-9A-Fa-f]' })
    expect(m.boxes[0]!.getAttribute('inputmode')).toBe('numeric')
    const alpha = open({ length: 2, type: 'alphanumeric', pattern: '[0-9A-Fa-f]' })
    expect(alpha.boxes[0]!.getAttribute('inputmode')).toBe('text')
  })

  it('外部 setValue 也过 pattern：不接受的字符留下空格子', () => {
    const m = open({ length: 4, type: 'numeric', pattern: '[0-9A-Fa-f]' })
    m.api().setValue(['a', 'z', '3', 'F'])
    expect(boxValues(m)).toEqual(['a', '', '3', 'F'])
  })
})

describe('connectPinInput 键盘', () => {
  it('backspace 在有值的格上清本格，焦点不动', () => {
    const m = open({ length: 3, defaultValue: ['1', '2', '3'] })
    m.boxes[1]!.focus()
    const event = pressKey(m.boxes[1]!, 'Backspace')
    expect(event.defaultPrevented).toBe(true)
    expect(boxValues(m)).toEqual(['1', '', '3'])
    expect(focusedIndex(m)).toBe(1)
  })

  it('backspace 在空格上跳回上一格并清掉它', () => {
    const m = open({ length: 3, defaultValue: ['1', '2', ''] })
    m.boxes[2]!.focus()
    pressKey(m.boxes[2]!, 'Backspace')
    expect(boxValues(m)).toEqual(['1', '', ''])
    expect(focusedIndex(m)).toBe(1)
  })

  it('首格为空时 Backspace 无处可退，值不动', () => {
    const m = open({ length: 3, defaultValue: ['', '2', '3'] })
    m.boxes[0]!.focus()
    pressKey(m.boxes[0]!, 'Backspace')
    expect(boxValues(m)).toEqual(['', '2', '3'])
    expect(focusedIndex(m)).toBe(0)
  })

  it('delete 清掉本格，焦点不动', () => {
    const m = open({ length: 3, defaultValue: ['1', '2', '3'] })
    m.boxes[0]!.focus()
    pressKey(m.boxes[0]!, 'Delete')
    expect(boxValues(m)).toEqual(['', '2', '3'])
    expect(focusedIndex(m)).toBe(0)
  })

  it('arrowLeft / ArrowRight 移格，两端停住不回绕', () => {
    const m = open({ length: 3, defaultValue: ['1', '2', '3'] })
    m.boxes[0]!.focus()
    pressKey(m.boxes[0]!, 'ArrowLeft')
    expect(focusedIndex(m)).toBe(0)
    const right = pressKey(m.boxes[0]!, 'ArrowRight')
    expect(right.defaultPrevented).toBe(true)
    expect(focusedIndex(m)).toBe(1)
    pressKey(m.boxes[1]!, 'ArrowRight')
    expect(focusedIndex(m)).toBe(2)
    pressKey(m.boxes[2]!, 'ArrowRight')
    expect(focusedIndex(m)).toBe(2)
    pressKey(m.boxes[2]!, 'ArrowLeft')
    expect(focusedIndex(m)).toBe(1)
  })

  it('home / End 到首末格', () => {
    const m = open({ length: 4, defaultValue: ['1', '2', '3', '4'] })
    m.boxes[1]!.focus()
    pressKey(m.boxes[1]!, 'End')
    expect(focusedIndex(m)).toBe(3)
    pressKey(m.boxes[3]!, 'Home')
    expect(focusedIndex(m)).toBe(0)
  })

  it('上下键不归移格管：不拦、不改值', () => {
    const m = open({ length: 3, defaultValue: ['1', '2', '3'] })
    m.boxes[1]!.focus()
    const up = pressKey(m.boxes[1]!, 'ArrowUp')
    expect(up.defaultPrevented).toBe(false)
    expect(focusedIndex(m)).toBe(1)
    expect(boxValues(m)).toEqual(['1', '2', '3'])
  })

  it('带 Ctrl/Meta 的组合不被吞掉（Ctrl+A 全选之类要放行）', () => {
    const m = open({ length: 3, defaultValue: ['1', '2', '3'] })
    m.boxes[1]!.focus()
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true, bubbles: true, cancelable: true })
    m.boxes[1]!.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(focusedIndex(m)).toBe(1)
  })
})

describe('connectPinInput 按顺序录入', () => {
  it('点还轮不到的格子：焦点落到第一个空格上', () => {
    const m = open({ length: 4 })
    m.boxes[2]!.focus()
    expect(focusedIndex(m)).toBe(0)
    expect(m.api().focusedIndex).toBe(0)
    expect(m.boxes[0]!.getAttribute('data-focus')).toBe('')
    expect(m.boxes[2]!.getAttribute('data-focus')).toBeNull()
  })

  it('已填几格就能站到待填的那一格，再往后仍被拨回来', () => {
    const m = open({ length: 4, defaultValue: ['1', '2', '', ''] })
    m.boxes[2]!.focus()
    expect(focusedIndex(m)).toBe(2)
    m.boxes[3]!.focus()
    expect(focusedIndex(m)).toBe(2)
    // 往回改上一格照走
    m.boxes[0]!.focus()
    expect(focusedIndex(m)).toBe(0)
  })

  it('填满之后点任意一格都落在那一格', () => {
    const m = open({ length: 4, defaultValue: ['1', '2', '3', '4'] })
    m.boxes[3]!.focus()
    expect(focusedIndex(m)).toBe(3)
    m.boxes[1]!.focus()
    expect(focusedIndex(m)).toBe(1)
  })

  it('焦点被拨走时只搬一次，不来回弹', () => {
    const m = open({ length: 4 })
    const moves: number[] = []
    m.boxes.forEach((box, i) => box.addEventListener('focus', () => moves.push(i)))
    m.boxes[3]!.focus()
    // 一共两发：落在第四格那一发，与被拨到首格那一发，此外不再有
    // （两发的先后不作数：连接层的处理器先于用例挂上，首格那一发嵌在第四格那一发里面）
    expect(moves).toHaveLength(2)
    expect(new Set(moves)).toEqual(new Set([0, 3]))
    expect(focusedIndex(m)).toBe(0)
  })

  it('还轮不到的格子退出 Tab 序列，键盘走得出这一组', () => {
    const m = open({ length: 4, defaultValue: ['1', '', '', ''] })
    // 首格已填、第二格待填，两格都还留在 Tab 序列里
    expect(m.boxes.map(b => b.getAttribute('tabindex'))).toEqual([null, null, '-1', '-1'])
    typeInto(m.boxes[1]!, '2')
    expect(m.boxes.map(b => b.getAttribute('tabindex'))).toEqual([null, null, null, '-1'])
  })

  it('填满后每一格都回到 Tab 序列里', () => {
    const m = open({ length: 3, defaultValue: ['1', '2', '3'] })
    expect(m.boxes.map(b => b.getAttribute('tabindex'))).toEqual([null, null, null])
  })

  it('只读不设限：点哪一格就落哪一格，也不摘 Tab 停靠点', () => {
    const m = open({ length: 4, value: ['1', '', '3', ''], readOnly: true })
    m.boxes[2]!.focus()
    expect(focusedIndex(m)).toBe(2)
    expect(m.boxes.map(b => b.getAttribute('tabindex'))).toEqual([null, null, null, null])
  })

  it('右键越不过第一个空格，左键在已填区间里照走', () => {
    const m = open({ length: 4, defaultValue: ['1', '2', '', ''] })
    m.boxes[2]!.focus()
    pressKey(m.boxes[2]!, 'ArrowRight')
    expect(focusedIndex(m)).toBe(2)
    pressKey(m.boxes[2]!, 'ArrowLeft')
    expect(focusedIndex(m)).toBe(1)
    pressKey(m.boxes[1]!, 'ArrowLeft')
    expect(focusedIndex(m)).toBe(0)
    pressKey(m.boxes[0]!, 'ArrowRight')
    expect(focusedIndex(m)).toBe(1)
  })

  it('end 停在第一个空格上，Home 照旧回首格', () => {
    const m = open({ length: 4, defaultValue: ['1', '2', '', ''] })
    m.boxes[0]!.focus()
    pressKey(m.boxes[0]!, 'End')
    expect(focusedIndex(m)).toBe(2)
    pressKey(m.boxes[2]!, 'Home')
    expect(focusedIndex(m)).toBe(0)
  })

  it('delete 清掉中间那格后焦点留在原地，右键也不再越过它', () => {
    const m = open({ length: 4, defaultValue: ['1', '2', '3', '4'] })
    m.boxes[1]!.focus()
    pressKey(m.boxes[1]!, 'Delete')
    expect(boxValues(m)).toEqual(['1', '', '3', '4'])
    expect(focusedIndex(m)).toBe(1)
    pressKey(m.boxes[1]!, 'ArrowRight')
    expect(focusedIndex(m)).toBe(1)
    // 补上这一格，后面的格子就重新轮得到
    typeInto(m.boxes[1]!, '9')
    expect(boxValues(m)).toEqual(['1', '9', '3', '4'])
    expect(focusedIndex(m)).toBe(2)
  })

  it('退格清掉本格后焦点不动，接着退格才回上一格', () => {
    const m = open({ length: 4, defaultValue: ['1', '2', '3', ''] })
    m.boxes[2]!.focus()
    pressKey(m.boxes[2]!, 'Backspace')
    expect(boxValues(m)).toEqual(['1', '2', '', ''])
    expect(focusedIndex(m)).toBe(2)
    pressKey(m.boxes[2]!, 'Backspace')
    expect(boxValues(m)).toEqual(['1', '', '', ''])
    expect(focusedIndex(m)).toBe(1)
  })

  it('粘贴仍从落点那一格起铺开，只是落点越不过第一个空格', () => {
    const m = open({ length: 4, defaultValue: ['1', '', '', ''] })
    // 作者想从第三格起粘：焦点先被拨到第二格，铺开也就从那里起
    m.boxes[2]!.focus()
    expect(focusedIndex(m)).toBe(1)
    paste(m.boxes[focusedIndex(m)]!, '23')
    expect(boxValues(m)).toEqual(['1', '2', '3', ''])
    expect(focusedIndex(m)).toBe(3)
  })
})

describe('connectPinInput 命令式出口', () => {
  it('setValue / clear 走同一条写入口', () => {
    const m = open({ length: 3 })
    m.api().setValue(['1', '2', '3'])
    expect(boxValues(m)).toEqual(['1', '2', '3'])
    expect(m.api().complete).toBe(true)
    m.api().clear()
    expect(boxValues(m)).toEqual(['', '', ''])
    expect(m.api().complete).toBe(false)
  })
})
