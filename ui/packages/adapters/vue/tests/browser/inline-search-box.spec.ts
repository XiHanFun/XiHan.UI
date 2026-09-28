// 面板里内嵌的搜索框（Command、Cascader、Transfer）是同一种写法：通栏一行、控件高与字号随尺寸档、
// 只画一道面内分隔的下划线，占位文字走字段家族（投影 data-xh-field-input）。
//
// 判据是计算样式：块尺寸、字号、::placeholder 前景与下划线颜色，jsdom 不算这些。
import type { CascaderLevel } from '@xihan-ui/headless'
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderInput,
  XhCascaderItem,
  XhCascaderItemText,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
  XhCommandRoot,
  XhTransferList,
  XhTransferRoot,
  XhTransferSearch,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Scope = 'cascader' | 'command' | 'transfer'
type Size = 'sm' | 'md' | 'lg'

const PLACEHOLDER = '搜索'

const RENDER: Record<Scope, (size: Size) => VNode> = {
  cascader: size => h(XhCascaderRoot, {
    collection: [{ value: 'zj', label: '浙江' }],
    open: true,
    searchable: true,
    size,
  }, {
    default: ({ levels }: { levels: CascaderLevel[] }) => [
      h(XhCascaderControl, null, () => [h(XhCascaderTrigger, null, () => h(XhCascaderValueText))]),
      h(XhCascaderPositioner, null, () => [
        h(XhCascaderContent, null, () => [
          h(XhCascaderInput, { placeholder: PLACEHOLDER }),
          ...levels.map(level => h(XhCascaderColumn, { key: level.level, level: level.level }, () =>
            level.items.map(node => h(XhCascaderItem, { key: node.value, value: node.value }, () =>
              h(XhCascaderItemText, null, () => node.label))))),
        ]),
      ]),
    ],
  }),
  command: size => h(XhCommandRoot, {
    defaultOpen: true,
    modal: false,
    size,
    placeholder: PLACEHOLDER,
    collection: [{ value: 'open', label: '打开文档' }],
  }),
  transfer: size => h(XhTransferRoot, {
    collection: [{ value: 'a', label: '甲' }],
    searchable: true,
    size,
  }, () => [
    h(XhTransferSourcePanel, null, () => [h(XhTransferSearch, { placeholder: PLACEHOLDER }), h(XhTransferList)]),
    h(XhTransferTargetPanel, null, () => [h(XhTransferSearch, { placeholder: PLACEHOLDER }), h(XhTransferList)]),
  ]),
}

/** 各自的搜索框部件名。 */
const PART: Record<Scope, string> = { cascader: 'input', command: 'input', transfer: 'search' }

/** 下划线是面内分隔：取所在面材质的分隔令牌。 */
const DIVIDER: Record<Scope, string> = {
  cascader: '--xh-material-solid-separator',
  command: '--xh-material-elevated-separator',
  transfer: '--xh-material-solid-separator',
}

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

async function mount(scope: Scope, size: Size): Promise<HTMLInputElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => RENDER[scope](size) })
  app.mount(host)
  await nextTick()
  await nextTick()
  const input = document.querySelector<HTMLInputElement>(`[data-scope='${scope}'][data-part='${PART[scope]}']`)
  if (!input)
    throw new Error(`找不到 ${scope} 的搜索框`)
  return input
}

/** 读一支令牌在某个节点上解析出来的计算值。 */
function resolved(on: HTMLElement, property: string, token: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  on.parentElement!.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

describe.each(['cascader', 'command', 'transfer'] as const)('%s 的内嵌搜索框', (scope) => {
  it.each(['sm', 'md', 'lg'] as const)('%s 档：控件高与字号随档', async (size) => {
    const input = await mount(scope, size)
    const style = getComputedStyle(input)
    expect(style.blockSize).toBe(resolved(input, 'block-size', `--xh-control-h-${size}`))
    expect(style.fontSize).toBe(resolved(input, 'font-size', `--xh-control-font-${size}`))
  })

  it('占位文字走字段家族的前景', async () => {
    const input = await mount(scope, 'md')
    expect(input.hasAttribute('data-xh-field-input')).toBe(true)
    expect(getComputedStyle(input, '::placeholder').color).toBe(resolved(input, 'color', '--xh-fg-subtle'))
  })

  it('只画一道下划线，颜色取所在面的分隔令牌', async () => {
    const input = await mount(scope, 'md')
    const style = getComputedStyle(input)
    expect(style.borderTopWidth).toBe('0px')
    expect(style.borderBottomWidth).toBe('1px')
    expect(style.borderBottomColor).toBe(resolved(input, 'border-bottom-color', DIVIDER[scope]))
  })
})
