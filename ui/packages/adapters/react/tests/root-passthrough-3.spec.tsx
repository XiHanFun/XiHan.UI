// @vitest-environment jsdom
//
// 逐实例令牌是这个库有文档的主题通道：作者把 `--xh-*` 写在 root 元素的 style 上。
// 这一份核这一组 15 个 root 三件事：作者写的 style 与 className 落到了 root 元素上、
// connect 自己产出的属性一个没被顶掉、交给机器的那几个取值没有漏成 DOM 属性。
import type { ReactElement } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  XhInfiniteScrollRoot,
  XhJsonViewerRoot,
  XhListboxRoot,
  XhLoadingBarRoot,
  XhLogRoot,
  XhMarkdownStreamRoot,
  XhMentionRoot,
  XhMenubarRoot,
  XhMessageFeedRoot,
  XhNavigationMenuRoot,
  XhNotificationRoot,
  XhNumberFieldRoot,
  XhPaginationRoot,
  XhPasswordInputRoot,
  XhPinInputRoot,
} from '../src'

/** 只记账不产出尺寸的观察器：jsdom 没有这两个构造器，组件挂载时会直接抛。 */
class NoopObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): unknown[] {
    return []
  }
}

interface Case {
  /** 组件目录名，同时是用例名。 */
  name: string
  /** 根部件的 data-scope。 */
  scope: string
  /** 根部件当前渲染的标签名。 */
  tag: string
  /** 作者写在 root 上的逐实例令牌名。 */
  token: string
  /** 交给机器的那几个取值。 */
  machine: Record<string, unknown>
  /**
   * machine 里这几个键一旦漏成 DOM 属性就判红。
   * 全挑全小写的键：React 把不认识的小写属性原样写到元素上，漏了就一定看得见。
   */
  leaks: string[]
  render: (props: Record<string, unknown>) => ReactElement
}

const COLLECTION = [{ value: 'a', label: 'A' }]

const CASES: Case[] = [
  {
    name: 'infinite-scroll',
    scope: 'infinite-scroll',
    tag: 'div',
    token: '--xh-infinite-scroll-probe',
    machine: { distance: 120 },
    leaks: ['distance'],
    render: props => <XhInfiniteScrollRoot {...props} />,
  },
  {
    name: 'json-viewer',
    scope: 'json-viewer',
    tag: 'div',
    token: '--xh-json-viewer-probe',
    machine: { value: { a: 1 }, view: 'text', variant: 'plain' },
    leaks: ['value', 'view', 'variant'],
    render: props => <XhJsonViewerRoot {...props} />,
  },
  {
    name: 'listbox',
    scope: 'listbox',
    tag: 'div',
    token: '--xh-listbox-probe',
    machine: { collection: COLLECTION, value: 'a' },
    leaks: ['collection', 'value'],
    render: props => <XhListboxRoot {...props} />,
  },
  {
    name: 'loading-bar',
    scope: 'loading-bar',
    tag: 'div',
    token: '--xh-loading-bar-probe',
    machine: { height: 6, minimum: 0.2 },
    leaks: ['height', 'minimum'],
    render: props => <XhLoadingBarRoot {...props} />,
  },
  {
    name: 'log',
    scope: 'log',
    tag: 'div',
    token: '--xh-log-probe',
    machine: { rows: 12 },
    leaks: ['rows'],
    render: props => <XhLogRoot {...props} />,
  },
  {
    name: 'markdown-stream',
    scope: 'markdown-stream',
    tag: 'div',
    token: '--xh-markdown-stream-probe',
    machine: { blocks: [], announce: 'polite' },
    leaks: ['blocks', 'announce'],
    render: props => <XhMarkdownStreamRoot {...props} />,
  },
  {
    name: 'mention',
    scope: 'mention',
    tag: 'div',
    token: '--xh-mention-probe',
    machine: { collection: COLLECTION },
    leaks: ['collection'],
    render: props => <XhMentionRoot {...props} />,
  },
  {
    name: 'menubar',
    scope: 'menubar',
    tag: 'div',
    token: '--xh-menubar-probe',
    machine: { collection: COLLECTION },
    leaks: ['collection'],
    render: props => <XhMenubarRoot {...props} />,
  },
  {
    name: 'message-feed',
    scope: 'message-feed',
    tag: 'div',
    token: '--xh-message-feed-probe',
    machine: { count: 3, threshold: 24 },
    leaks: ['count', 'threshold'],
    render: props => <XhMessageFeedRoot {...props} />,
  },
  {
    name: 'navigation-menu',
    scope: 'navigation-menu',
    tag: 'nav',
    token: '--xh-navigation-menu-probe',
    machine: { collection: COLLECTION },
    leaks: ['collection'],
    render: props => <XhNavigationMenuRoot {...props} />,
  },
  {
    name: 'notification',
    scope: 'notification',
    tag: 'div',
    token: '--xh-notification-probe',
    machine: { gap: 12, max: 3 },
    leaks: ['gap', 'max'],
    render: props => <XhNotificationRoot {...props} />,
  },
  {
    name: 'number-field',
    scope: 'number-field',
    tag: 'div',
    token: '--xh-number-field-probe',
    machine: { min: 0, max: 10, step: 2 },
    leaks: ['min', 'max', 'step'],
    render: props => <XhNumberFieldRoot {...props} />,
  },
  {
    name: 'pagination',
    scope: 'pagination',
    tag: 'nav',
    token: '--xh-pagination-probe',
    machine: { count: 40, page: 2 },
    leaks: ['count', 'page'],
    render: props => <XhPaginationRoot {...props} />,
  },
  {
    name: 'password-input',
    scope: 'password-input',
    tag: 'div',
    token: '--xh-password-input-probe',
    machine: { strength: 2 },
    leaks: ['strength'],
    render: props => <XhPasswordInputRoot {...props} />,
  },
  {
    name: 'pin-input',
    scope: 'pin-input',
    tag: 'div',
    token: '--xh-pin-input-probe',
    machine: { length: 4, pattern: '[0-9]' },
    leaks: ['length', 'pattern'],
    render: props => <XhPinInputRoot {...props} />,
  },
]

const globals = globalThis as {
  IS_REACT_ACT_ENVIRONMENT?: boolean
  ResizeObserver?: unknown
  IntersectionObserver?: unknown
}

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null
let originalResize: unknown
let originalIntersection: unknown

beforeEach(() => {
  globals.IS_REACT_ACT_ENVIRONMENT = true
  originalResize = globals.ResizeObserver
  originalIntersection = globals.IntersectionObserver
  globals.ResizeObserver = NoopObserver
  globals.IntersectionObserver = NoopObserver
})

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
  globals.ResizeObserver = originalResize
  globals.IntersectionObserver = originalIntersection
})

/** 挂一份，返回它的 root 元素。 */
function mount(item: Case, extra: Record<string, unknown> = {}): HTMLElement {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(item.render({ ...item.machine, ...extra })))
  const el = host.querySelector<HTMLElement>(`[data-scope="${item.scope}"][data-part="root"]`)
  expect(el, `${item.name} 的 root 部件没渲染出来`).not.toBeNull()
  return el!
}

/** 一个元素上的属性名与取值；自动生成的 id 每挂一次换一个号，抹平后再比。 */
function attrsOf(el: HTMLElement): Record<string, string> {
  const out: Record<string, string> = {}
  for (const attr of el.attributes) out[attr.name] = attr.value.replace(/_r_[0-9a-z]+_/g, '_rid_')
  return out
}

describe.each(CASES)('$name 的 root 接住作者写的属性', (item) => {
  it('逐实例令牌落到 root 元素上', () => {
    const el = mount(item, { style: { [item.token]: 'rgb(1, 2, 3)' } })
    expect(el.tagName.toLowerCase()).toBe(item.tag)
    expect(el.style.getPropertyValue(item.token)).toBe('rgb(1, 2, 3)')
  })

  it('className 落到 root 元素上，connect 产出的属性一个没被顶掉', () => {
    const base = attrsOf(mount(item))
    act(() => root!.unmount())
    host!.remove()

    const el = mount(item, { className: 'probe-a probe-b', style: { [item.token]: 'red' } })
    expect([...el.classList]).toEqual(['probe-a', 'probe-b'])

    const after = attrsOf(el)
    // 作者写的两样之外，属性名与取值与不写任何属性时逐个相同
    expect(Object.keys(after).filter(k => k !== 'class' && k !== 'style').sort())
      .toEqual(Object.keys(base).filter(k => k !== 'style').sort())
    for (const [key, value] of Object.entries(base)) {
      if (key !== 'style')
        expect(after[key], `${item.name} 的 ${key} 被顶掉了`).toBe(value)
    }
  })

  it('交给机器的取值不漏成 DOM 属性', () => {
    const el = mount(item)
    for (const key of item.leaks)
      expect(el.hasAttribute(key), `${item.name} 把 ${key} 漏到 DOM 上了`).toBe(false)
  })
})

// loading-bar 的 connect 自己往 root 的 style 里写条子厚度，是这一组里唯一
// 两边都有 style 的 root：作者的令牌与它必须并存，谁也别把谁整份换掉。
describe('loading-bar：作者的 style 与 connect 的 style 并存', () => {
  const item = CASES.find(c => c.name === 'loading-bar')!

  it('两份声明都在', () => {
    const el = mount(item, { style: { '--xh-loading-bar-probe': 'red' } })
    expect(el.style.getPropertyValue('--xh-loading-bar-probe')).toBe('red')
    expect(el.style.blockSize).toBe('6px')
  })
})
