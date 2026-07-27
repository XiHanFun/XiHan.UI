import type { ItemQuery } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { PinInputApi, PinInputSchema } from './pin-input.types'
import { focusSafely, navIntentFromKey, queryItems, stepIndex } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/core'
import { pinInputAnatomy } from './pin-input.anatomy'
import { isPinComplete, padPinValue, pinLength, sanitizePin } from './pin-input.machine'

const parts = pinInputAnatomy.build()

// 格子集合只在事件处理器里查活 DOM：那一刻两个适配器看到的是同一份文档，顺序即文档序。
const INPUT_QUERY: ItemQuery = { scope: pinInputAnatomy.name, part: 'input' }

/**
 * 剥掉框里本来就有的那个字符，剩下的才是这次真正键入的内容。
 * 光标停在已有字符旁边接着打字时，框里会同时留着旧字符与新字符，
 * 旧的那个从哪一头出现就从哪一头剥掉；直接整串当新内容会把旧字符又铺一遍。
 */
function incomingChars(raw: string, current: string): string {
  const chars = [...raw]
  if (current === '' || chars.length < 2)
    return raw
  if (chars[0] === current)
    return chars.slice(1).join('')
  if (chars[chars.length - 1] === current)
    return chars.slice(0, -1).join('')
  return raw
}

export function connectPinInput<T extends PropTypes>(
  service: Service<PinInputSchema>,
  normalize: NormalizeProps<T>,
): PinInputApi<T> {
  const { context, prop, send, scope } = service
  const length = pinLength(prop('length'))
  const type = prop('type') ?? 'numeric'
  const disabled = !!prop('disabled')
  const invalid = !!prop('invalid')
  const mask = !!prop('mask')
  const otp = !!prop('otp')
  const blurOnComplete = !!prop('blurOnComplete')
  const value = padPinValue(context.get('value'), length)
  const valueAsString = value.join('')
  const complete = isPinComplete(value)
  const focusedIndex = context.get('focusedIndex') ?? -1
  const ids = scope.ids('pin-input', 'label')
  const inputId = (index: number): string => scope.partId('pin-input', `input-${index}`)

  // 处理器里一律读活值而不是闭包里那份：闭包是上一次渲染的快照，
  // 连着两次输入之间宿主还没来得及重渲时，按快照算会把刚写进去的字符又算成空的
  const liveValue = (): string[] => padPinValue(context.get('value'), length)

  /** 事件那一刻现查同组格子：文档序即下标序，不缓存节点数组。 */
  const boxesOf = (el: HTMLElement): HTMLElement[] =>
    queryItems(el.closest<HTMLElement>(parts.root.selector), INPUT_QUERY)

  /** 聚焦某一格并全选：格子里已有字符时直接打字应当替换，而不是追加成两个字符。 */
  const focusBox = (from: HTMLElement, index: number): void => {
    const boxes = boxesOf(from)
    if (!boxes.length)
      return
    focusSafely(boxes[Math.min(Math.max(index, 0), boxes.length - 1)], { select: true })
  }

  /**
   * 把框里的内容拨回权威值。
   * 非法字符被丢弃时值根本没变，宿主不会重渲，那个字符就会一直留在框里
   * ——界面显示的和值里存的从此对不上。多字符铺开时同理：这一格只该留首字符。
   */
  const resync = (el: HTMLInputElement, index: number): void => {
    const next = liveValue()[index] ?? ''
    if (el.value !== next)
      el.value = next
  }

  /** 写完之后焦点往哪儿去：填满且要求收工就撤走焦点，否则挪到下一个待填的格子。 */
  const advance = (from: HTMLInputElement, index: number): void => {
    if (blurOnComplete && isPinComplete(liveValue())) {
      from.blur()
      return
    }
    focusBox(from, index)
  }

  const fillFrom = (el: HTMLInputElement, index: number, chars: string): void => {
    send({ type: 'VALUE.FILL', index, value: chars })
    resync(el, index)
    advance(el, index + [...chars].length)
  }

  return {
    value,
    valueAsString,
    complete,
    length,
    focusedIndex,
    disabled,
    invalid,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    clear: () => send({ type: 'VALUE.CLEAR' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 一组格子在读屏那里是一个整体，靠 group 把它们兜住，标题由 label 提供
      'role': 'group',
      'aria-labelledby': ids.label,
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
      'data-complete': dataAttr(complete),
    }),

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      'id': ids.label,
      // for 指向首格：点标题落到第一个待填的格子，指向别的格子都说不通
      'for': inputId(0),
      'data-disabled': dataAttr(disabled),
    }),

    getInputProps: ({ index }) => normalize.input({
      ...parts.input.attrs,
      'id': inputId(index),
      'data-index': String(index),
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
      'data-focus': dataAttr(focusedIndex === index),
      // 遮蔽走原生 password：自己拿圆点替换字符会让读屏与密码管理器都读不懂这是什么
      'type': mask ? 'password' : 'text',
      // 移动端弹哪种键盘由 type 决定，与 otp 无关：只收数字却弹出全键盘是实打实的缺陷
      'inputmode': type === 'numeric' ? 'numeric' : 'text',
      // one-time-code 是系统把短信验证码填进来的唯一钩子；不是一次性验证码就明确关掉，
      // 否则浏览器会拿历史输入去补一个个单字符的框
      'autocomplete': otp ? 'one-time-code' : 'off',
      'placeholder': prop('placeholder'),
      'value': value[index] ?? '',
      // 单体表单控件用原生 disabled（与集合条目的 aria-disabled 相反）：禁用的格子不该能聚焦
      'disabled': disabled || undefined,
      'aria-invalid': invalid ? 'true' : 'false',
      'onInput': (event: Event) => {
        const el = event.currentTarget as HTMLInputElement
        const raw = el.value
        if (raw === '') {
          // 框被清空（剪切、输入法回删这类不走 Backspace 的删除）
          send({ type: 'VALUE.CLEAR_AT', index })
          resync(el, index)
          return
        }
        const chars = sanitizePin(incomingChars(raw, liveValue()[index] ?? ''), type)
        if (chars === '') {
          // 敲进来的全是不接受的字符：值不动，框里也不能留下它们
          resync(el, index)
          return
        }
        // 单字符与整串（系统自动填充一次性验证码时会把整串塞进当前这一格）走同一条铺开路径
        fillFrom(el, index, chars)
      },
      'onPaste': (event: ClipboardEvent) => {
        // 交给浏览器会把整串塞进一格，这里自己按格分发
        event.preventDefault()
        const el = event.currentTarget as HTMLInputElement
        const chars = sanitizePin(event.clipboardData?.getData('text') ?? '', type)
        if (chars === '')
          return
        fillFrom(el, index, chars)
      },
      'onFocus': () => send({ type: 'INPUT.FOCUS', index }),
      'onBlur': () => {
        // 判据是"本格当下正持有焦点锚点"，不是"有 blur 就清"：
        // 焦点在格子之间移动时浏览器先派旧格的 blur、再派新格的 focus，
        // 若两条都无条件生效，顺序稍有出入就会把刚记下的锚点抹掉
        if (context.get('focusedIndex') === index)
          send({ type: 'INPUT.BLUR' })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        if (disabled || event.ctrlKey || event.metaKey || event.altKey)
          return
        const el = event.currentTarget as HTMLInputElement
        if (event.key === 'Backspace') {
          // 整条自己接管：交给浏览器删完还会再来一次 input 事件，同一次按键被处理两遍
          event.preventDefault()
          if (liveValue()[index]) {
            send({ type: 'VALUE.CLEAR_AT', index })
            resync(el, index)
            return
          }
          // 空格子上的退格：退回上一格并把它清掉，这是逐格纠错唯一顺手的走法
          if (index > 0) {
            send({ type: 'VALUE.CLEAR_AT', index: index - 1 })
            focusBox(el, index - 1)
          }
          return
        }
        if (event.key === 'Delete') {
          event.preventDefault()
          send({ type: 'VALUE.CLEAR_AT', index })
          resync(el, index)
          return
        }
        // 只认水平轴：上下键在输入框里没有格可去，吞掉它等于把页面滚动一并吃了
        const intent = navIntentFromKey(event, { axis: 'horizontal' })
        if (!intent)
          return
        // 左右键在输入框里默认是移动光标，这里改成移格，必须拦下
        event.preventDefault()
        const boxes = boxesOf(el)
        // 不回绕：末格再按右键该停住，绕回首格会让人以为值被重置了
        const target = stepIndex(boxes.length, index, intent, { loop: false })
        if (target < 0)
          return
        focusSafely(boxes[target], { select: true })
      },
    }),

    getHiddenInputProps: () => normalize.input({
      ...parts['hidden-input'].attrs,
      // type 先于 value 写入：改 type 会重置输入的值
      type: 'hidden',
      // name 缺省即不产出该属性，此时这份输入不参与提交
      name: prop('name'),
      value: valueAsString,
      // 禁用的控件不该提交出值
      disabled: disabled || undefined,
    }),
  }
}
