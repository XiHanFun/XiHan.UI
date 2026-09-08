// @vitest-environment jsdom
//
// Root 上的透传：作者写在根部件上的 style / className 落到 root 元素，schema props 一个都不进 DOM。
// 逐实例令牌覆盖是这个库的主题通道，Root 收不住作者的属性就等于这一级通道在 React 侧不存在。
import type { CSSProperties, ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  XhAccordionRoot,
  XhAffixRoot,
  XhAlertRoot,
  XhAnchorRoot,
  XhApprovalRoot,
  XhBackTopRoot,
  XhCalendarRoot,
  XhCarouselRoot,
  XhCascaderRoot,
  XhCheckboxGroupRoot,
  XhClipboardRoot,
  XhCodeViewRoot,
  XhCollapsibleRoot,
  XhColorPickerRoot,
  XhComboboxRoot,
  XhCommandRoot,
} from '../src'

/** 作者写在根上的那一份：一个 --xh-* 令牌与一个自己的类名。 */
const PROBE_TOKEN = '--xh-root-passthrough-probe'
const PROBE_CLASS = 'author-owns-this'
const authorProps = {
  'className': PROBE_CLASS,
  'style': { [PROBE_TOKEN]: 'transparent' } as CSSProperties,
  'id': 'author-root-id',
  'data-author': 'yes',
}

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null
let errors: unknown[][] = []

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  errors = []
  // React 对未知事件属性与非法属性值只发 console.error：函数值的 schema props 漏进 DOM 时
  // 节点上看不出痕迹，只能从这里咬住
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    errors.push(args)
  })
})

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
  vi.restoreAllMocks()
})

function mount(node: ReactNode): HTMLElement {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(node))
  return host
}

/** Root 渲染的那个元素：它是宿主里唯一的直接子节点。 */
function rootEl(): HTMLElement {
  const el = host!.firstElementChild
  if (!(el instanceof HTMLElement))
    throw new Error('root 没有渲染出元素')
  return el
}

interface Case {
  name: string
  /** 把 extra 原样交给 Root，其余是这一版渲染用的 schema props。 */
  render: (extra: Record<string, unknown>) => ReactNode
  /**
   * 这一版渲染交给 Root 的 schema props 名字。
   * 它们一个都不该出现在 root 元素的属性表里（HTML 属性名不分大小写，逐个按小写比）。
   */
  schemaKeys: string[]
}

const nodes = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]
function noop(): void {}

const cases: Case[] = [
  {
    name: 'accordion',
    render: extra => (
      <XhAccordionRoot
        collection={nodes}
        orientation="vertical"
        tone="info"
        size="md"
        onValueChange={noop}
        {...extra}
      />
    ),
    schemaKeys: ['collection', 'orientation', 'tone', 'size', 'onValueChange'],
  },
  {
    name: 'affix',
    render: extra => <XhAffixRoot offsetTop={24} onAffixChange={noop} {...extra} />,
    schemaKeys: ['offsetTop', 'onAffixChange'],
  },
  {
    name: 'alert',
    render: extra => (
      <XhAlertRoot tone="success" translations={{ close: '关' }} onOpenChange={noop} {...extra}>
        提示
      </XhAlertRoot>
    ),
    schemaKeys: ['tone', 'translations', 'onOpenChange'],
  },
  {
    name: 'anchor',
    render: extra => (
      <XhAnchorRoot collection={['a', 'b']} offset={8} bounds={4} onValueChange={noop} {...extra} />
    ),
    schemaKeys: ['collection', 'offset', 'bounds', 'onValueChange'],
  },
  {
    name: 'approval',
    render: extra => (
      <XhApprovalRoot
        scopes={[{ value: 'read', label: '读' }]}
        variant="outline"
        size="md"
        onDecision={noop}
        {...extra}
      />
    ),
    schemaKeys: ['scopes', 'variant', 'size', 'onDecision'],
  },
  {
    name: 'back-top',
    render: extra => (
      <XhBackTopRoot visibilityHeight={100} behavior="smooth" size="md" onVisibilityChange={noop} {...extra} />
    ),
    schemaKeys: ['visibilityHeight', 'behavior', 'size', 'onVisibilityChange'],
  },
  {
    name: 'calendar',
    render: extra => (
      <XhCalendarRoot locale="zh-CN" visibleCount={1} timeZone="UTC" onValueChange={noop} {...extra} />
    ),
    schemaKeys: ['locale', 'visibleCount', 'timeZone', 'onValueChange'],
  },
  {
    name: 'carousel',
    render: extra => <XhCarouselRoot slideCount={3} spacing="8px" onPageChange={noop} {...extra} />,
    schemaKeys: ['slideCount', 'spacing', 'onPageChange'],
  },
  {
    name: 'cascader',
    render: extra => (
      <XhCascaderRoot collection={nodes} separator=" / " placeholder="选" onValueChange={noop} {...extra} />
    ),
    schemaKeys: ['collection', 'separator', 'placeholder', 'onValueChange'],
  },
  {
    name: 'checkbox-group',
    render: extra => (
      <XhCheckboxGroupRoot collection={nodes} itemValues={['a', 'b']} onValueChange={noop} {...extra} />
    ),
    schemaKeys: ['collection', 'itemValues', 'onValueChange'],
  },
  {
    name: 'clipboard',
    render: extra => <XhClipboardRoot value="要复制的" timeout={1000} onStatusChange={noop} {...extra} />,
    schemaKeys: ['value', 'timeout', 'onStatusChange'],
  },
  {
    name: 'code-view',
    render: extra => (
      <XhCodeViewRoot code="const a = 1" lang="ts" startLine={3} onClampToggle={noop} {...extra} />
    ),
    schemaKeys: ['code', 'lang', 'startLine', 'onClampToggle'],
  },
  {
    name: 'collapsible',
    render: extra => (
      <XhCollapsibleRoot defaultOpen tone="info" size="md" onOpenChange={noop} {...extra}>
        正文
      </XhCollapsibleRoot>
    ),
    schemaKeys: ['tone', 'size', 'onOpenChange'],
  },
  {
    // 这一个本来就把作者的属性落到 root 上，一并核进来确认口径没走样
    name: 'color-picker',
    render: extra => (
      <XhColorPickerRoot defaultValue="#336699" format="hex" swatches={['#f00']} onValueChange={noop} {...extra} />
    ),
    schemaKeys: ['format', 'swatches', 'onValueChange'],
  },
  {
    name: 'combobox',
    render: extra => (
      <XhComboboxRoot collection={nodes} placeholder="选" inputBehavior="autohighlight" onValueChange={noop} {...extra} />
    ),
    schemaKeys: ['collection', 'placeholder', 'inputBehavior', 'onValueChange'],
  },
]

/**
 * React 对同一个未知属性名只警告一次，之后同名的漏法就没有声响了。
 * 所以每一条都把 console.error 一并核上：谁第一个漏，谁当场判红。
 */
function expectNoReactWarning(): void {
  expect(errors).toEqual([])
}

describe('root 透传：作者的 style 落到 root 元素', () => {
  it.each(cases)('$name', ({ render }) => {
    mount(render(authorProps))
    expect(rootEl().style.getPropertyValue(PROBE_TOKEN)).toBe('transparent')
    expectNoReactWarning()
  })
})

describe('root 透传：作者的 className 与部件自己的接线并存', () => {
  it.each(cases)('$name', ({ render }) => {
    mount(render(authorProps))
    const el = rootEl()
    // 作者的类名在
    expect([...el.classList]).toContain(PROBE_CLASS)
    // 部件自己那份接线没被作者的属性顶掉：解剖标记与作者写的 id / data-* 同时在场
    expect(el.getAttribute('data-part')).toBe('root')
    expect(el.getAttribute('data-scope')).toBeTruthy()
    expect(el.getAttribute('id')).toBe('author-root-id')
    expect(el.getAttribute('data-author')).toBe('yes')
    expectNoReactWarning()
  })
})

describe('root 透传：schema props 不漏进 DOM', () => {
  it.each(cases)('$name', ({ render, schemaKeys }) => {
    mount(render(authorProps))
    const attrs = new Set(rootEl().getAttributeNames().map(n => n.toLowerCase()))
    const leaked = schemaKeys.filter(key => attrs.has(key.toLowerCase()))
    expect(leaked).toEqual([])
    // 函数值的 schema props 在节点上留不下痕迹，只会换来 React 的告警
    expectNoReactWarning()
  })
})

describe('root 透传：不写属性时 root 元素一个字都不多', () => {
  it.each(cases)('$name', ({ render }) => {
    mount(render({}))
    const el = rootEl()
    expect(el.classList.length).toBe(0)
    expect(el.style.getPropertyValue(PROBE_TOKEN)).toBe('')
    expectNoReactWarning()
  })
})

describe('root 不渲染自己元素的那一个', () => {
  // command 的解剖里没有 root 部件：Root 只建 context 再把子树交出去，没有元素可落属性。
  it('command 的 Root 没有 root 元素', () => {
    const el = mount(
      <XhCommandRoot collection={[{ value: 'a', label: '甲' }]}>
        {() => <i data-testid="command-child" />}
      </XhCommandRoot>,
    )
    expect(el.querySelector('[data-testid="command-child"]')).not.toBeNull()
    expect(el.querySelector('[data-scope="command"][data-part="root"]')).toBeNull()
  })
})
