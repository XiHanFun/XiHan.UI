// 面板里内嵌的搜索框（Command、Cascader、TreeSelect、Transfer、SideNav）是同一种写法：通栏一行、控件高与字号随尺寸档、
// 只画一道面内分隔的下划线，聚焦不画环（插入符就是焦点指示），占位文字走字段家族（投影 data-xh-field-input）。
//
// 判据是计算样式：块尺寸、字号、::placeholder 前景、下划线颜色与聚焦时的 outline，jsdom 不算这些。
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
  XhSideNavInput,
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
  XhTransferList,
  XhTransferRoot,
  XhTransferSearch,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectInput,
  XhTreeSelectItem,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Scope = 'cascader' | 'command' | 'side-nav' | 'transfer' | 'tree-select'
type Size = 'sm' | 'md' | 'lg'

const PLACEHOLDER = '搜索'

const RENDER: Record<Scope, (size: Size) => VNode> = {
  'cascader': size => h(XhCascaderRoot, {
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
  'command': size => h(XhCommandRoot, {
    defaultOpen: true,
    modal: false,
    size,
    placeholder: PLACEHOLDER,
    collection: [{ value: 'open', label: '打开文档' }],
  }),
  'side-nav': size => h(XhSideNavRoot, { collection: [{ value: 'home', label: '首页' }], size }, () => [
    h(XhSideNavInput, { placeholder: PLACEHOLDER }),
    h(XhSideNavList, null, () => h(XhSideNavItem, null, () =>
      h(XhSideNavLink, { value: 'home' }, () => h(XhSideNavLinkText, null, () => '首页')))),
  ]),
  'transfer': size => h(XhTransferRoot, {
    collection: [{ value: 'a', label: '甲' }],
    searchable: true,
    size,
  }, () => [
    h(XhTransferSourcePanel, null, () => [h(XhTransferSearch, { placeholder: PLACEHOLDER }), h(XhTransferList)]),
    h(XhTransferTargetPanel, null, () => [h(XhTransferSearch, { placeholder: PLACEHOLDER }), h(XhTransferList)]),
  ]),
  'tree-select': size => h(XhTreeSelectRoot, {
    collection: [{ value: 'zj', label: '浙江' }],
    open: true,
    searchable: true,
    size,
  }, () => [
    h(XhTreeSelectControl, null, () => h(XhTreeSelectTrigger, null, () => '选择省份')),
    h(XhTreeSelectPositioner, null, () => h(XhTreeSelectContent, null, () => [
      h(XhTreeSelectInput, { placeholder: PLACEHOLDER }),
      h(XhTreeSelectTree, null, () => h(XhTreeSelectItem, { value: 'zj' }, () => '浙江')),
    ])),
  ]),
}

/** 各自的搜索框部件名。 */
const PART: Record<Scope, string> = { 'cascader': 'input', 'command': 'input', 'side-nav': 'input', 'transfer': 'search', 'tree-select': 'input' }

/** 下划线取所在面材质的令牌：级联与命令面板的搜索框走描边档，其余走分隔档。 */
const DIVIDER: Record<Scope, string> = {
  'cascader': '--xh-material-solid-border',
  'command': '--xh-material-elevated-border',
  'side-nav': '--xh-material-solid-separator',
  'transfer': '--xh-material-solid-separator',
  'tree-select': '--xh-material-frosted-separator',
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

describe.each(['cascader', 'command', 'side-nav', 'transfer', 'tree-select'] as const)('%s 的内嵌搜索框', (scope) => {
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

  it('只画一道下划线，颜色取所在面材质的令牌', async () => {
    const input = await mount(scope, 'md')
    const style = getComputedStyle(input)
    expect(style.borderTopWidth).toBe('0px')
    expect(style.borderBottomWidth).toBe('1px')
    expect(style.borderBottomColor).toBe(resolved(input, 'border-bottom-color', DIVIDER[scope]))
  })

  it('聚焦不画环：插入符就是焦点指示，下划线也不换色', async () => {
    const input = await mount(scope, 'md')
    const divider = getComputedStyle(input).borderBottomColor
    input.focus()
    // 文本框落焦总是命中 :focus-visible，全局那条键盘焦点环正是按它画的
    expect(input.matches(':focus-visible')).toBe(true)
    const style = getComputedStyle(input)
    expect(style.outlineStyle).toBe('none')
    expect(style.boxShadow).toBe('none')
    expect(style.borderBottomColor).toBe(divider)
  })
})
