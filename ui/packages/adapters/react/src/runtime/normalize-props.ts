import type { Dict } from '@xihan-ui/core'
import { createNormalizer } from '@xihan-ui/core'

// connect 产出的键是 DOM 属性口径，React 认的是另一套口径：属性名要换成 React 的写法，
// 事件名要归到 React 的规范驼峰，内联样式要是对象。这里逐键做这三件事，其余原样透传。

// DOM 属性名 → React 属性名。括号里是该键在 headless 各 connect 里出现的处数。
const ATTR_ALIAS: Record<string, string> = {
  tabindex: 'tabIndex', // 137
  readonly: 'readOnly', // 13
  for: 'htmlFor', // 11
  autocomplete: 'autoComplete', // 11
  autocapitalize: 'autoCapitalize', // 6
  inputmode: 'inputMode', // 4
  spellcheck: 'spellCheck', // 3
  maxlength: 'maxLength', // 2
  datetime: 'dateTime', // 1
  novalidate: 'noValidate', // 1
  autocorrect: 'autoCorrect', // 1
}

// React 合成事件名，按全小写形式索引。headless 里同一个事件有两种写法并存
// （onKeyDown 与 onKeydown、onPointerEnter 与 onPointerenter、onFocusOut 与 onFocusout），
// 查表前先把键转小写，两种写法都落到 React 认的那一个。
// onFocusIn / onFocusOut 归到 onFocus / onBlur：React 的这两个合成事件挂的就是冒泡的 focusin / focusout。
const EVENT_ALIAS: Record<string, string> = {
  onclick: 'onClick',
  onkeydown: 'onKeyDown',
  onkeyup: 'onKeyUp',
  onfocus: 'onFocus',
  onblur: 'onBlur',
  onfocusin: 'onFocus',
  onfocusout: 'onBlur',
  oninput: 'onInput',
  onchange: 'onChange',
  onpointerdown: 'onPointerDown',
  onpointerup: 'onPointerUp',
  onpointermove: 'onPointerMove',
  onpointerenter: 'onPointerEnter',
  onpointerleave: 'onPointerLeave',
  onpointercancel: 'onPointerCancel',
  onwheel: 'onWheel',
  onpaste: 'onPaste',
  oncontextmenu: 'onContextMenu',
  ondblclick: 'onDoubleClick',
  ondragover: 'onDragOver',
  ondragleave: 'onDragLeave',
  ondrop: 'onDrop',
  oncompositionstart: 'onCompositionStart',
  oncompositionend: 'onCompositionEnd',
  onsubmit: 'onSubmit',
  onreset: 'onReset',
  onload: 'onLoad',
  onerror: 'onError',
}

// React 只按真假决定这些属性写不写，空串是假值会被丢掉；
// 而 DOM 口径里空串表示属性在场（form 的 novalidate 就是这么写的），所以空串要转成 true。
const BOOLEAN_PROPS = new Set([
  'readOnly',
  'noValidate',
  'disabled',
  'required',
  'checked',
  'multiple',
  'selected',
  'open',
  'inert',
])

/** 把内联样式串解析成 React 的 style 对象：自定义属性名原样保留，其余转驼峰。 */
function parseStyleString(text: string): Dict {
  const style: Dict = {}
  for (const decl of text.split(';')) {
    // 值里可能还有冒号（url("data:…")），只在第一个冒号处切
    const at = decl.indexOf(':')
    if (at < 0)
      continue
    const name = decl.slice(0, at).trim()
    const value = decl.slice(at + 1).trim()
    if (name === '')
      continue
    style[name.startsWith('--') ? name : name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = value
  }
  return style
}

/** 取该键在 React 里的名字；data-* 与 aria-* 不在两张表里，原样返回（React 直接认这两类连字符属性）。 */
function toReactKey(key: string): string {
  if (key.startsWith('on'))
    return EVENT_ALIAS[key.toLowerCase()] ?? key
  return ATTR_ALIAS[key] ?? key
}

export const reactNormalize = createNormalizer((props) => {
  const out: Dict = {}
  for (const key of Object.keys(props)) {
    const value = props[key]
    const name = toReactKey(key)
    // style 绝大多数已经是对象，原样透传；marquee 与 watermark 的根节点各有一处写成串，解析成对象
    if (name === 'style' && typeof value === 'string') {
      out.style = parseStyleString(value)
      continue
    }
    // inert 在 React 19 里是真布尔属性，布尔值直接传
    out[name] = value === '' && BOOLEAN_PROPS.has(name) ? true : value
  }
  return out
})
