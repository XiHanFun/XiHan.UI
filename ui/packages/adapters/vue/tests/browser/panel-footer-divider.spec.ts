// 候选面板底栏上沿那道线是面内分隔：取所在面材质的分隔令牌，不取描边档。命令面板是 sheet，
// 级联浮层是 floating（取实体面那一支），树选择浮层是 frosted。判据是计算样式，jsdom 不算。
import type { CascaderLevel } from '@xihan-ui/headless'
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderFooter,
  XhCascaderItem,
  XhCascaderItemText,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
  XhCommandRoot,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectFooter,
  XhTreeSelectItem,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Scope = 'cascader' | 'command' | 'tree-select'

const RENDER: Record<Scope, () => VNode> = {
  'cascader': () => h(XhCascaderRoot, { collection: [{ value: 'zj', label: '浙江' }], open: true }, {
    default: ({ levels }: { levels: CascaderLevel[] }) => [
      h(XhCascaderControl, null, () => [h(XhCascaderTrigger, null, () => h(XhCascaderValueText))]),
      h(XhCascaderPositioner, null, () => [
        h(XhCascaderContent, null, () => [
          ...levels.map(level => h(XhCascaderColumn, { key: level.level, level: level.level }, () =>
            level.items.map(node => h(XhCascaderItem, { key: node.value, value: node.value }, () =>
              h(XhCascaderItemText, null, () => node.label))))),
          h(XhCascaderFooter, null, () => '底栏'),
        ]),
      ]),
    ],
  }),
  'command': () => h(XhCommandRoot, {
    defaultOpen: true,
    modal: false,
    collection: [{ value: 'open', label: '打开文档' }],
  }, { footer: () => '底栏' }),
  'tree-select': () => h(XhTreeSelectRoot, { collection: [{ value: 'zj', label: '浙江' }], open: true }, () => [
    h(XhTreeSelectControl, null, () => h(XhTreeSelectTrigger, null, () => '选择省份')),
    h(XhTreeSelectPositioner, null, () => h(XhTreeSelectContent, null, () => [
      h(XhTreeSelectTree, null, () => h(XhTreeSelectItem, { value: 'zj' }, () => '浙江')),
      h(XhTreeSelectFooter, null, () => '底栏'),
    ])),
  ]),
}

const DIVIDER: Record<Scope, string> = {
  'cascader': '--xh-material-solid-separator',
  'command': '--xh-material-elevated-separator',
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

/** 读一支令牌在某个节点上解析出来的颜色。 */
function resolved(on: HTMLElement, token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${token})`
  on.parentElement!.append(probe)
  const out = getComputedStyle(probe).color
  probe.remove()
  return out
}

describe.each(['cascader', 'command', 'tree-select'] as const)('%s 的底栏', (scope) => {
  it('上沿一道线，颜色取所在面材质的分隔令牌', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({ render: RENDER[scope] })
    app.mount(host)
    await nextTick()
    await nextTick()
    const footer = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='footer']`)!
    const style = getComputedStyle(footer)
    expect(style.borderTopWidth).toBe('1px')
    expect(style.borderTopColor).toBe(resolved(footer, DIVIDER[scope]))
  })
})
