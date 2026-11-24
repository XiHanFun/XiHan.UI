// 占位态的四个相位在各集合组件上是同一副样子，由占位态家族配方画（连接层投影 data-xh-placeholder）：
// 首次加载 = 加载环 + 一句文案；空 = 一句文案；错误 = 一枚警示字形 + 一句文案；
// 文字取所在面的次要文字（不取 --xh-fg-subtle）、块向内距 space-3、字号随档、单行行距，内容居中；
// 刷新 = 已有条目时保留上一帧、容器报 aria-busy，在途占位让位；条目此刻仍可操作，不淡化。
//
// 判据是伪元素、计算样式与过渡结果，jsdom 不给这些。
import type { CascaderLevel } from '@xihan-ui/headless'
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
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
  XhCommandContent,
  XhCommandEmpty,
  XhCommandInput,
  XhCommandItem,
  XhCommandItemText,
  XhCommandList,
  XhCommandLoading,
  XhCommandRoot,
  XhGridListEmpty,
  XhGridListLoading,
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowContent,
  XhGridListRowText,
  XhListboxContent,
  XhListboxEmpty,
  XhListboxItem,
  XhListboxItemText,
  XhListboxLoading,
  XhListboxRoot,
  XhMentionContent,
  XhMentionEmpty,
  XhMentionInput,
  XhMentionItem,
  XhMentionItemText,
  XhMentionLoading,
  XhMentionPositioner,
  XhMentionRoot,
  XhSelectContent,
  XhSelectControl,
  XhSelectEmpty,
  XhSelectError,
  XhSelectItem,
  XhSelectItemText,
  XhSelectList,
  XhSelectLoading,
  XhSelectPositioner,
  XhSelectRetryTrigger,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
  XhTableBody,
  XhTableEmpty,
  XhTableLoading,
  XhTableRoot,
  XhTableRow,
  XhTransferEmpty,
  XhTransferItem,
  XhTransferItemText,
  XhTransferList,
  XhTransferLoading,
  XhTransferRoot,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTreeEmpty,
  XhTreeItem,
  XhTreeItemText,
  XhTreeLoading,
  XhTreeRoot,
  XhTreeSelectRoot,
  XhTreeTree,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface Case {
  scope: string
  /** 渲染一份：loading 为真时在取，items 为真时已有条目，empty 给空态文案。 */
  render: (state: { loading: boolean, items: boolean }) => VNode
  /** 占位文字该取的次要文字令牌。 */
  muted: string
  /** 刷新相位里保留上一帧的那一层：它照常可操作，不该淡下去。 */
  dim: string
  /** 刷新期间不接交互的内容（Tree 与 GridList 的行）按规则淡下去，不在「不淡化」那条里比。 */
  refreshDims?: boolean
  /** 挂上之后把浮层打开（没有受控开合的组件靠真实输入唤起）。 */
  open?: () => Promise<void>
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
  {
    scope: 'mention',
    render: ({ loading, items }) => h(XhMentionRoot, { collection: items ? ITEMS : [], loading }, () => [
      h(XhMentionInput),
      h(XhMentionPositioner, null, () => [
        h(XhMentionContent, null, () => (items ? ITEMS : []).map(node =>
          h(XhMentionItem, { key: node.value, value: node.value }, () => h(XhMentionItemText, null, () => node.label)))),
        h(XhMentionEmpty, null, () => '没有匹配'),
        h(XhMentionLoading, null, () => '正在检索'),
      ]),
    ]),
    muted: '--xh-material-frosted-fg-muted',
    dim: 'item',
    open: async () => {
      await userEvent.type(document.querySelector<HTMLElement>(`[data-scope='mention'][data-part='input']`)!, '@')
      await nextTick()
      await nextTick()
    },
  },
  {
    scope: 'listbox',
    render: ({ loading, items }) => h(XhListboxRoot, { collection: items ? ITEMS : [], loading }, () => [
      h(XhListboxContent, null, () => (items ? ITEMS : []).map(node =>
        h(XhListboxItem, { key: node.value, value: node.value }, () => h(XhListboxItemText, null, () => node.label)))),
      h(XhListboxEmpty, null, () => '没有选项'),
      h(XhListboxLoading, null, () => '正在读取'),
    ]),
    muted: '--xh-fg-muted',
    dim: 'item',
  },
  {
    scope: 'command',
    render: ({ loading, items }) => h(XhCommandRoot, { collection: items ? ITEMS : [], loading, defaultOpen: true, modal: false }, () => [
      h(XhCommandContent, null, () => [
        h(XhCommandInput),
        h(XhCommandList, null, () => (items ? ITEMS : []).map(node =>
          h(XhCommandItem, { key: node.value, value: node.value }, () => h(XhCommandItemText, null, () => node.label)))),
        h(XhCommandEmpty, null, () => '没有匹配的命令'),
        h(XhCommandLoading, null, () => '正在检索'),
      ]),
    ]),
    muted: '--xh-fg-muted',
    dim: 'list',
  },
  {
    scope: 'transfer',
    render: ({ loading, items }) => {
      const panel = (Panel: typeof XhTransferSourcePanel): VNode => h(Panel, null, {
        default: ({ items: visible }: { items: { value: string, label?: string }[] }) => [
          h(XhTransferList, null, () => visible.map(node =>
            h(XhTransferItem, { key: node.value, value: node.value }, () => h(XhTransferItemText, null, () => node.label)))),
          h(XhTransferEmpty, null, () => '没有条目'),
          h(XhTransferLoading, null, () => '正在读取'),
        ],
      })
      return h(XhTransferRoot, { collection: items ? ITEMS : [], loading }, () => [panel(XhTransferSourcePanel), panel(XhTransferTargetPanel)])
    },
    muted: '--xh-fg-muted',
    dim: 'list',
  },
  {
    scope: 'tree',
    render: ({ loading, items }) => h(XhTreeRoot, { collection: items ? ITEMS : [], loading }, () => [
      h(XhTreeTree, null, () => (items ? ITEMS : []).map(node =>
        h(XhTreeItem, { key: node.value, value: node.value }, () => h(XhTreeItemText, null, () => node.label)))),
      h(XhTreeLoading, null, () => '正在读取'),
      h(XhTreeEmpty, null, () => '没有节点'),
    ]),
    muted: '--xh-fg-muted',
    dim: 'tree',
    refreshDims: true,
  },
  {
    scope: 'grid-list',
    render: ({ loading, items }) => h(XhGridListRoot, { collection: items ? ITEMS : [], loading }, () => [
      ...(items ? ITEMS : []).map(node =>
        h(XhGridListRow, { key: node.value, value: node.value }, () => h(XhGridListRowContent, null, () => h(XhGridListRowText, null, () => node.label)))),
      h(XhGridListLoading, null, () => '正在读取'),
      h(XhGridListEmpty, null, () => '没有记录'),
    ]),
    muted: '--xh-fg-muted',
    dim: 'row',
    refreshDims: true,
  },
  {
    scope: 'table',
    render: ({ loading, items }) => h(XhTableRoot, { columns: [{ id: 'label', label: '名称' }], rows: items ? ITEMS : [], loading, rowKey: 'value' }, () => [
      h(XhTableBody, null, () => (items ? ITEMS : []).map(node => h(XhTableRow, { key: node.value, value: node.value }, () => node.label))),
      h(XhTableLoading, null, () => '正在读取'),
      h(XhTableEmpty, null, () => '没有记录'),
    ]),
    muted: '--xh-fg-muted',
    dim: 'body',
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
  await c.open?.()
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
    expect(loading.dataset.xhPlaceholder).toBe('loading')
    expect(style.lineHeight).toBe(style.fontSize)
    expect(style.justifyContent).toBe('center')
  })

  it('空：文字取次要文字、块向内距 space-3', async () => {
    await mount(c, { loading: false, items: false })
    const empty = part(c.scope, 'empty')
    expect(empty.hidden).toBe(false)
    const style = getComputedStyle(empty)
    expect(style.color).toBe(resolved(empty, 'color', `var(${c.muted})`))
    expect(style.paddingTop).toBe(resolved(empty, 'padding-top', 'var(--xh-space-3)'))
    expect(style.paddingBottom).toBe(resolved(empty, 'padding-bottom', 'var(--xh-space-3)'))
    expect(empty.dataset.xhPlaceholder).toBe('empty')
    expect(style.lineHeight).toBe(style.fontSize)
    expect(style.justifyContent).toBe('center')
    expect(style.animationName).toBe('xh-fade-in')
  })

  it.skipIf(c.refreshDims)('刷新：保留上一帧，在途占位让位，容器报 aria-busy，内容不淡化', async () => {
    const state = await mount(c, { loading: false, items: true })
    const target = part(c.scope, c.dim)
    expect(getComputedStyle(target).opacity).toBe('1')
    state.loading = true
    await nextTick()
    await nextTick()
    expect(part(c.scope, 'loading').hidden).toBe(true)
    expect(target.closest('[aria-busy="true"]')).not.toBeNull()
    // 条目此刻仍可操作：淡到禁用透明度会把文字压到 4.5:1 以下（WCAG 1.4.3 只豁免失效控件）
    expect(target.getAnimations().some(a => (a as CSSTransition).transitionProperty === 'opacity')).toBe(false)
    expect(getComputedStyle(target).opacity).toBe('1')
  })
})

describe('select 的错误相位', () => {
  it('一枚警示字形排在文案之前（危险色），文字仍取次要文字，与空、在途占位同一副排版', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhSelectRoot, { collection: [], error: true, defaultOpen: true }, () => [
        h(XhSelectControl, null, () => h(XhSelectTrigger, null, () => h(XhSelectValueText))),
        h(XhSelectPositioner, null, () => h(XhSelectContent, null, () => [
          h(XhSelectList),
          h(XhSelectError, null, () => '读取失败'),
          h(XhSelectRetryTrigger, null, () => '重试'),
        ])),
      ]),
    })
    app.mount(host)
    await nextTick()
    await nextTick()
    const error = part('select', 'error')
    expect(error.hidden).toBe(false)
    expect(error.dataset.xhPlaceholder).toBe('error')
    const style = getComputedStyle(error)
    expect(style.color).toBe(resolved(error, 'color', 'var(--xh-material-frosted-fg-muted)'))
    expect(style.paddingTop).toBe(resolved(error, 'padding-top', 'var(--xh-space-3)'))
    expect(style.lineHeight).toBe(style.fontSize)
    const glyph = getComputedStyle(error, '::before')
    expect(glyph.backgroundColor).toBe(resolved(error, 'background-color', 'var(--xh-fg-danger)'))
    expect(glyph.maskImage || glyph.getPropertyValue('-webkit-mask-image')).toContain('url(')
    expect(Number.parseFloat(glyph.inlineSize)).toBeGreaterThan(0)
  })
})
