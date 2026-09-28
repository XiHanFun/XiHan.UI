// 占位态的四个相位在各集合组件上是同一副样子：
// 首次加载 = 加载环 + 一句文案；空 = 一句文案；两者文字取次要文字、块向内距 space-3、字号随档；
// 刷新 = 已有条目时保留上一帧、内容按 micro 淡下，在途占位让位。
//
// 判据是伪元素、计算样式与过渡结果，jsdom 不给这些。
import type { CascaderLevel } from '@xihan-ui/headless'
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, reactive } from 'vue'
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderItem,
  XhCascaderItemText,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemText,
  XhComboboxLoading,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhSelectContent,
  XhSelectControl,
  XhSelectEmpty,
  XhSelectItem,
  XhSelectItemText,
  XhSelectList,
  XhSelectLoading,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
  XhTreeSelectRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface Case {
  scope: string
  /** 渲染一份：loading 为真时在取，items 为真时已有条目，empty 给空态文案。 */
  render: (state: { loading: boolean, items: boolean }) => VNode
  /** 占位文字该取的次要文字令牌。 */
  muted: string
  /** 刷新相位里淡下去的那一层。 */
  dim: string
}

const ITEMS = [
  { value: 'a', label: '甲' },
  { value: 'b', label: '乙' },
]

const CASES: Case[] = [
  {
    scope: 'select',
    render: ({ loading, items }) => h(XhSelectRoot, { collection: items ? ITEMS : [], loading, defaultOpen: true }, () => [
      h(XhSelectControl, null, () => h(XhSelectTrigger, null, () => h(XhSelectValueText))),
      h(XhSelectPositioner, null, () => h(XhSelectContent, null, () => [
        h(XhSelectList, null, () => (items ? ITEMS : []).map(node =>
          h(XhSelectItem, { key: node.value, value: node.value }, () => h(XhSelectItemText, null, () => node.label)))),
        h(XhSelectEmpty, null, () => '没有选项'),
        h(XhSelectLoading, null, () => '正在读取'),
      ])),
    ]),
    muted: '--xh-material-frosted-fg-muted',
    dim: 'list',
  },
  {
    scope: 'combobox',
    render: ({ loading, items }) => h(XhComboboxRoot, { collection: items ? ITEMS : [], loading, defaultOpen: true }, () => [
      h(XhComboboxControl, null, () => h(XhComboboxInput)),
      h(XhComboboxPositioner, null, () => [
        h(XhComboboxContent, null, () => (items ? ITEMS : []).map(node =>
          h(XhComboboxItem, { key: node.value, value: node.value }, () => h(XhComboboxItemText, null, () => node.label)))),
        h(XhComboboxEmpty, null, () => '没有匹配'),
        h(XhComboboxLoading, null, () => '正在检索'),
      ]),
    ]),
    muted: '--xh-material-frosted-fg-muted',
    dim: 'item',
  },
  {
    scope: 'cascader',
    render: ({ loading, items }) => h(XhCascaderRoot, {
      collection: items ? ITEMS : [],
      loading,
      open: true,
      translations: { empty: '没有选项', loading: '正在读取' },
    }, {
      default: ({ levels }: { levels: CascaderLevel[] }) => [
        h(XhCascaderControl, null, () => h(XhCascaderTrigger, null, () => h(XhCascaderValueText))),
        h(XhCascaderPositioner, null, () => h(XhCascaderContent, null, () => [
          ...levels.map(level => h(XhCascaderColumn, { key: level.level, level: level.level }, () =>
            level.items.map(node => h(XhCascaderItem, { key: node.value, value: node.value }, () =>
              h(XhCascaderItemText, null, () => node.label))))),
        ])),
      ],
    }),
    muted: '--xh-fg-muted',
    dim: 'column',
  },
  {
    scope: 'tree-select',
    render: ({ loading, items }) => h(XhTreeSelectRoot, {
      collection: items ? ITEMS : [],
      loading,
      open: true,
      translations: { empty: '没有节点', loading: '正在读取' },
    }),
    muted: '--xh-material-frosted-fg-muted',
    dim: 'tree',
  },
]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

async function mount(c: Case, initial: { loading: boolean, items: boolean }): Promise<{ loading: boolean, items: boolean }> {
  const state = reactive({ ...initial })
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => c.render(state) })
  app.mount(host)
  await nextTick()
  await nextTick()
  return state
}

function part(scope: string, name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 ${scope}/${name}`)
  return el
}

function resolved(on: HTMLElement, property: string, value: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  on.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

describe.each(CASES)('$scope 的占位态', (c) => {
  it('首次加载：一枚加载环排在文案之前，文字取次要文字、块向内距 space-3', async () => {
    await mount(c, { loading: true, items: false })
    const loading = part(c.scope, 'loading')
    expect(loading.hidden).toBe(false)
    expect(loading.hasAttribute('data-xh-loading-ring')).toBe(true)
    expect(loading.hasAttribute('data-loading')).toBe(true)
    const ring = getComputedStyle(loading, '::before')
    expect(ring.animationName).toBe('xh-spin')
    expect(ring.animationPlayState).toBe('running')
    expect(ring.borderRadius).toBe('50%')
    expect(Number.parseFloat(ring.inlineSize)).toBeGreaterThan(0)
    const style = getComputedStyle(loading)
    expect(style.color).toBe(resolved(loading, 'color', `var(${c.muted})`))
    expect(style.paddingTop).toBe(resolved(loading, 'padding-top', 'var(--xh-space-3)'))
    expect(style.fontSize).toBe(resolved(loading, 'font-size', 'var(--xh-control-font-md)'))
  })

  it('空：文字取次要文字、块向内距 space-3', async () => {
    await mount(c, { loading: false, items: false })
    const empty = part(c.scope, 'empty')
    expect(empty.hidden).toBe(false)
    const style = getComputedStyle(empty)
    expect(style.color).toBe(resolved(empty, 'color', `var(${c.muted})`))
    expect(style.paddingTop).toBe(resolved(empty, 'padding-top', 'var(--xh-space-3)'))
    expect(style.paddingBottom).toBe(resolved(empty, 'padding-bottom', 'var(--xh-space-3)'))
  })

  it('刷新：保留上一帧，在途占位让位，内容按 micro 淡下', async () => {
    const state = await mount(c, { loading: false, items: true })
    const target = part(c.scope, c.dim)
    expect(getComputedStyle(target).opacity).toBe('1')
    state.loading = true
    await nextTick()
    await nextTick()
    expect(part(c.scope, 'loading').hidden).toBe(true)
    const fade = target.getAnimations().find(a => (a as CSSTransition).transitionProperty === 'opacity')
    expect(fade?.effect?.getComputedTiming().duration).toBe(120)
    const disabled = resolved(target, 'opacity', 'var(--xh-state-disabled-opacity)')
    await expect.poll(() => getComputedStyle(target).opacity).toBe(disabled)
  })
})
