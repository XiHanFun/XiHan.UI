// @vitest-environment jsdom
//
// 根部件要接住作者写在它上面的其余属性：逐实例令牌（内联 style 上的 --xh-*）、className
// 与 data-*，都该落到根元素上；而 schema props（collection、placeholder 这些交给机器的入参）
// 一个都不许漏成 DOM 属性。
//
// 覆盖的是本组这十五个组件里渲染了自己元素的十四个；tooltip 的根只挂上下文与函数式 children、
// 不渲染任何元素，没有可落属性的节点，不在表内。
import type { ComponentType } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  XhTagsInputRoot,
  XhTextFieldRoot,
  XhTimeFieldRoot,
  XhTimePickerRoot,
  XhTimerRoot,
  XhToastRoot,
  XhToggleGroupRoot,
  XhToolbarRoot,
  XhToolCallRoot,
  XhTourRoot,
  XhTransferRoot,
  XhTreeRoot,
  XhTreeSelectRoot,
  XhVirtualizerRoot,
} from '../src'

interface RootCase {
  /** 组件名，用来做用例标题。 */
  name: string
  Root: ComponentType<Record<string, unknown>>
  /** 让根部件渲得出来的最小 schema 入参，同时充当漏项检测的料。 */
  schemaProps: Record<string, unknown>
  /** 这个组件的一个逐实例令牌名。 */
  token: string
  /** 上面那些 schema props 落到 DOM 上会写成的属性名，一个都不该在场。 */
  leakAttrs: string[]
}

const NODES = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]

const CASES: RootCase[] = [
  {
    name: 'tags-input',
    Root: XhTagsInputRoot as ComponentType<Record<string, unknown>>,
    schemaProps: { placeholder: 'pp', delimiter: ',' },
    token: '--xh-tags-input-border',
    leakAttrs: ['placeholder', 'delimiter'],
  },
  {
    name: 'text-field',
    Root: XhTextFieldRoot as ComponentType<Record<string, unknown>>,
    schemaProps: { placeholder: 'pp', name: 'nm' },
    token: '--xh-text-field-border',
    leakAttrs: ['placeholder', 'name'],
  },
  {
    name: 'time-field',
    Root: XhTimeFieldRoot as ComponentType<Record<string, unknown>>,
    schemaProps: { placeholder: 'pp', name: 'nm' },
    token: '--xh-time-field-border',
    leakAttrs: ['placeholder', 'name'],
  },
  {
    name: 'time-picker',
    Root: XhTimePickerRoot as ComponentType<Record<string, unknown>>,
    schemaProps: { name: 'nm', locale: 'en-US' },
    token: '--xh-time-picker-border',
    leakAttrs: ['name', 'locale'],
  },
  {
    name: 'timer',
    Root: XhTimerRoot as ComponentType<Record<string, unknown>>,
    schemaProps: { format: 'HH:mm:ss', precision: 0 },
    token: '--xh-timer-gap',
    leakAttrs: ['format', 'precision'],
  },
  {
    name: 'toast',
    Root: XhToastRoot as ComponentType<Record<string, unknown>>,
    schemaProps: { duration: 5000, type: 'info' },
    token: '--xh-toast-bg',
    leakAttrs: ['duration', 'type'],
  },
  {
    name: 'toggle-group',
    Root: XhToggleGroupRoot as ComponentType<Record<string, unknown>>,
    schemaProps: { collection: NODES, name: 'nm' },
    token: '--xh-toggle-group-gap',
    leakAttrs: ['collection', 'name'],
  },
  {
    name: 'tool-call',
    Root: XhToolCallRoot as ComponentType<Record<string, unknown>>,
    schemaProps: { phase: 'output-available' },
    token: '--xh-tool-call-border',
    leakAttrs: ['phase'],
  },
  {
    name: 'toolbar',
    Root: XhToolbarRoot as ComponentType<Record<string, unknown>>,
    schemaProps: { orientation: 'horizontal', size: 'md' },
    token: '--xh-toolbar-gap',
    leakAttrs: ['orientation', 'size'],
  },
  {
    name: 'tour',
    Root: XhTourRoot as ComponentType<Record<string, unknown>>,
    schemaProps: { offset: 4, placement: 'bottom' },
    token: '--xh-tour-bg',
    leakAttrs: ['offset', 'placement'],
  },
  {
    name: 'transfer',
    Root: XhTransferRoot as ComponentType<Record<string, unknown>>,
    schemaProps: { collection: NODES, tone: 'brand' },
    token: '--xh-transfer-gap',
    leakAttrs: ['collection', 'tone'],
  },
  {
    name: 'tree',
    Root: XhTreeRoot as ComponentType<Record<string, unknown>>,
    schemaProps: { collection: NODES, variant: 'plain' },
    token: '--xh-tree-bg',
    leakAttrs: ['collection', 'variant'],
  },
  {
    name: 'tree-select',
    Root: XhTreeSelectRoot as ComponentType<Record<string, unknown>>,
    schemaProps: { collection: NODES, placeholder: 'pp' },
    token: '--xh-tree-select-border',
    leakAttrs: ['collection', 'placeholder'],
  },
  {
    name: 'virtualizer',
    Root: XhVirtualizerRoot as ComponentType<Record<string, unknown>>,
    schemaProps: { count: 3, overscan: 2 },
    token: '--xh-virtualizer-gap',
    leakAttrs: ['count', 'overscan'],
  },
]

const AUTHOR_CLASS = 'author-skin'
const TOKEN_VALUE = 'rgb(1, 2, 3)'

/** 取值是别的节点的 id，两次挂载对不上，只比在场。 */
const ID_REF_ATTRS = new Set([
  'id',
  'for',
  'aria-labelledby',
  'aria-describedby',
  'aria-controls',
  'aria-activedescendant',
  'aria-owns',
])

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
})

/** 挂一次并交出根部件渲出来的那个元素。 */
function mountRoot(Root: ComponentType<Record<string, unknown>>, props: Record<string, unknown>): HTMLElement {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  const El = Root
  act(() => root!.render(<El {...props} />))
  const el = host.firstElementChild
  if (!(el instanceof HTMLElement))
    throw new TypeError('根部件没有渲染出元素')
  return el
}

/** 卸掉这一次挂载，好让同一条用例里挂第二次。 */
function unmountRoot(): void {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
}

/** 元素上的 style 逐条读成 name → value。 */
function styleEntries(el: HTMLElement): Record<string, string> {
  const out: Record<string, string> = {}
  for (let i = 0; i < el.style.length; i++) {
    const name = el.style.item(i)
    out[name] = el.style.getPropertyValue(name)
  }
  return out
}

describe('根部件接住作者传的属性（第五组）', () => {
  for (const c of CASES) {
    describe(c.name, () => {
      it('作者写在根上的 --xh-* 令牌落到根元素上', () => {
        const bare = mountRoot(c.Root, c.schemaProps)
        const partStyle = styleEntries(bare)
        expect(bare.style.getPropertyValue(c.token)).toBe('')
        unmountRoot()

        const el = mountRoot(c.Root, { ...c.schemaProps, style: { [c.token]: TOKEN_VALUE } })
        expect(el.style.getPropertyValue(c.token)).toBe(TOKEN_VALUE)
        // 这十四个根部件当下一条内联样式都不写，这个循环因此跑零圈；
        // 留着是为了将来某个根开始写内联样式时，作者的 style 不把它挤掉
        for (const [name, value] of Object.entries(partStyle))
          expect(el.style.getPropertyValue(name)).toBe(value)
      })

      it('作者写的 className 与 data-* 落到根元素上，部件自己写的那份属性照旧', () => {
        const bare = mountRoot(c.Root, c.schemaProps)
        const partClasses = [...bare.classList]
        const partAttrs = [...bare.attributes].map(a => [a.name, a.value] as const)
        unmountRoot()

        const el = mountRoot(c.Root, { ...c.schemaProps, 'className': AUTHOR_CLASS, 'data-author': 'yes' })
        expect(el.classList.contains(AUTHOR_CLASS)).toBe(true)
        expect(el.getAttribute('data-author')).toBe('yes')
        // 部件那一份不因为作者写了 className / data-* 而掉队。
        // 这十四个根部件当下都不写 class，partClasses 因此是空的；真正逐条比的是下面那份属性
        for (const cls of partClasses)
          expect(el.classList.contains(cls)).toBe(true)
        for (const [name, value] of partAttrs) {
          expect(el.hasAttribute(name)).toBe(true)
          // 指向别的节点的那几个属性写的是每次挂载都不同的生成 id，只比在场不比取值
          if (!ID_REF_ATTRS.has(name))
            expect(`${name}=${el.getAttribute(name)}`).toBe(`${name}=${value}`)
        }
      })

      it('schema props 不漏成 DOM 属性', () => {
        const el = mountRoot(c.Root, { ...c.schemaProps, className: AUTHOR_CLASS })
        for (const name of c.leakAttrs)
          expect(el.getAttribute(name)).toBe(null)
      })
    })
  }
})
