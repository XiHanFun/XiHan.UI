// 槽名的部件段与它作用的部件对不上时，使用者按名字找过去改的是另一处，或者干脆
// 找不到名字。这一批把走样的名字改成按部件取名，改法是加法式：新名排在外层、
// 旧名留在它的兜底位上。所以每一处都要量两遍——新名真的改得动，旧名照旧生效。
//
// 判据全是级联算出来的取值，只有真实浏览器算得出来：
// jsdom 不解析样式表里的 var() 与继承，getComputedStyle 恒是空串。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhHighlight,
  XhLayoutContent,
  XhLayoutRoot,
  XhLayoutSider,
  XhNumberFieldControl,
  XhNumberFieldInput,
  XhNumberFieldRoot,
  XhPasswordInputCapsLockIndicator,
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputRoot,
  XhProgress,
  XhTransferItem,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSourcePanel,
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchIndicator,
  XhTreeBranchText,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeRoot,
  XhTreeTree,
} from '../../src'
// 皮肤与令牌一起加载：这里查的就是皮肤算出来的取值
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 两个一望即知不出自任何令牌的取值，用来分辨「覆盖生效」与「退回缺省」。 */
const RED = 'rgb(255, 0, 0)'
const LIME = 'rgb(0, 255, 0)'

let app: App | null = null
let host: HTMLElement | null = null
const overridden: string[] = []

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  for (const name of overridden.splice(0))
    document.documentElement.style.removeProperty(name)
})

/** 覆盖写在根元素上，与使用者真实的写法（`:root { --xh-…: … }`）同一层。 */
function setSlot(name: string, value: string): void {
  document.documentElement.style.setProperty(name, value)
  overridden.push(name)
}

async function mount(render: () => unknown): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => () => render() as never })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(scope: string, name: string, index = 0): HTMLElement {
  const all = document.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
  const el = all[index]
  if (!el)
    throw new Error(`没有第 ${index} 个 ${scope}/${name} 节点`)
  return el
}

function styleOf(el: HTMLElement, prop: string): string {
  return getComputedStyle(el).getPropertyValue(prop)
}

// —— number-field：一体式盒画在 control 上，独立输入框是另一档形态 ——

/** 两枚并排：前一枚有 control（盒画在它身上），后一枚只有 input（盒画在输入框上）。 */
function TWO_FORMS(): unknown {
  return [
    h(XhNumberFieldRoot, { defaultValue: '1' }, () => [
      h(XhNumberFieldControl, null, () => [h(XhNumberFieldInput)]),
    ]),
    h(XhNumberFieldRoot, { defaultValue: '1' }, () => [h(XhNumberFieldInput)]),
  ]
}

describe('number-field 的一体式盒有自己的名字', () => {
  it('设 control 槽：只改一体式盒，独立输入框那一档不跟着变', async () => {
    setSlot('--xh-number-field-control-bg', RED)
    await mount(TWO_FORMS)

    expect(styleOf(part('number-field', 'control'), 'background-color')).toBe(RED)
    // 第二枚的 input 不在 control 里，自己就是那个盒
    expect(styleOf(part('number-field', 'input', 1), 'background-color')).not.toBe(RED)
  })

  it('旧名 --xh-number-field-input-bg 照旧管住两档', async () => {
    setSlot('--xh-number-field-input-bg', LIME)
    await mount(TWO_FORMS)

    expect(styleOf(part('number-field', 'control'), 'background-color')).toBe(LIME)
    expect(styleOf(part('number-field', 'input', 1), 'background-color')).toBe(LIME)
  })

  it('新名压得过旧名', async () => {
    setSlot('--xh-number-field-input-bg', LIME)
    setSlot('--xh-number-field-control-bg', RED)
    await mount(TWO_FORMS)

    expect(styleOf(part('number-field', 'control'), 'background-color')).toBe(RED)
    expect(styleOf(part('number-field', 'input', 1), 'background-color')).toBe(LIME)
  })
})

// —— tree：叶子的勾与分支的箭头各有各的名字 ——

const TREE_COLLECTION = [
  { value: 'branch', label: '分支', children: [{ value: 'leaf', label: '叶子' }] },
]

function TREE(): unknown {
  return h(
    XhTreeRoot,
    { collection: TREE_COLLECTION, selectionMode: 'multiple', defaultExpandedValue: ['branch'] },
    () => [
      h(XhTreeTree, null, () => [
        h(XhTreeBranch, { value: 'branch' }, () => [
          h(XhTreeBranchControl, null, () => [
            h(XhTreeBranchIndicator),
            h(XhTreeBranchText, null, () => '分支'),
          ]),
          h(XhTreeBranchContent, null, () => [
            h(XhTreeItem, { value: 'leaf' }, () => [
              h(XhTreeItemIndicator),
              h(XhTreeItemText, null, () => '叶子'),
            ]),
          ]),
        ]),
      ]),
    ],
  )
}

describe('tree 的两种指示符各有各的名字', () => {
  it('设叶子勾的槽：分支箭头不跟着变', async () => {
    setSlot('--xh-tree-item-indicator-fg', RED)
    await mount(TREE)

    expect(styleOf(part('tree', 'item-indicator'), 'color')).toBe(RED)
    expect(styleOf(part('tree', 'branch-indicator'), 'color')).not.toBe(RED)
  })

  it('旧名 --xh-tree-indicator-fg 仍然改得动叶子的勾', async () => {
    setSlot('--xh-tree-indicator-fg', LIME)
    await mount(TREE)

    expect(styleOf(part('tree', 'item-indicator'), 'color')).toBe(LIME)
  })
})

// —— transfer：面板里三个角色的槽补上 panel- 段 ——

const TRANSFER_ITEMS = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]

function TRANSFER(): unknown {
  return h(
    XhTransferRoot,
    { collection: TRANSFER_ITEMS, defaultValue: ['a'] },
    () => [
      h(XhTransferSourcePanel, null, () => [
        h(XhTransferPanelHeader, null, () => [
          h(XhTransferPanelTitle, null, () => '待选'),
          h(XhTransferPanelCount),
        ]),
        h(XhTransferList, null, () => TRANSFER_ITEMS.map(item =>
          h(XhTransferItem, { key: item.value, value: item.value }, () => [
            h(XhTransferItemText, null, () => item.label),
          ]),
        )),
      ]),
    ],
  )
}

describe('transfer 面板标题的槽带 panel- 段', () => {
  it('新名改得动', async () => {
    setSlot('--xh-transfer-panel-title-fg', RED)
    await mount(TRANSFER)
    expect(styleOf(part('transfer', 'panel-title'), 'color')).toBe(RED)
  })

  it('旧名 --xh-transfer-title-fg 照旧生效', async () => {
    setSlot('--xh-transfer-title-fg', LIME)
    await mount(TRANSFER)
    expect(styleOf(part('transfer', 'panel-title'), 'color')).toBe(LIME)
  })
})

// —— highlight：命中片段的槽带 mark 段 ——

const HIGHLIGHT = (): unknown => h(XhHighlight, { text: '一段带关键词的文本', keyword: '关键词' })

describe('highlight 命中片段的槽带 mark 段', () => {
  it('新名改得动', async () => {
    setSlot('--xh-highlight-mark-bg', RED)
    await mount(HIGHLIGHT)
    expect(styleOf(part('highlight', 'mark'), 'background-color')).toBe(RED)
  })

  it('旧名 --xh-highlight-bg 照旧生效', async () => {
    setSlot('--xh-highlight-bg', LIME)
    await mount(HIGHLIGHT)
    expect(styleOf(part('highlight', 'mark'), 'background-color')).toBe(LIME)
  })
})

// —— password-input：大写锁定提示的槽按部件取名 ——

function PASSWORD(): unknown {
  return h(XhPasswordInputRoot, null, () => [
    h(XhPasswordInputControl, null, () => [
      h(XhPasswordInputInput),
      h(XhPasswordInputCapsLockIndicator),
    ]),
  ])
}

describe('password-input 大写锁定提示的槽按部件取名', () => {
  it('新名改得动', async () => {
    setSlot('--xh-password-input-caps-lock-fg', RED)
    await mount(PASSWORD)
    expect(styleOf(part('password-input', 'caps-lock-indicator'), 'color')).toBe(RED)
  })

  it('旧名 --xh-password-input-hint-fg 照旧生效', async () => {
    setSlot('--xh-password-input-hint-fg', LIME)
    await mount(PASSWORD)
    expect(styleOf(part('password-input', 'caps-lock-indicator'), 'color')).toBe(LIME)
  })
})

// —— layout：侧栏宽度改用 -w 缩写 ——

function LAYOUT(): unknown {
  return h(XhLayoutRoot, null, () => [
    h(XhLayoutSider, null, () => '侧栏'),
    h(XhLayoutContent, null, () => '正文'),
  ])
}

describe('layout 侧栏宽度的槽用 -w 缩写', () => {
  it('新名改得动', async () => {
    setSlot('--xh-layout-sider-w', '123px')
    await mount(LAYOUT)
    expect(styleOf(part('layout', 'sider'), 'inline-size')).toBe('123px')
  })

  it('旧名 --xh-layout-sider-width 照旧生效', async () => {
    setSlot('--xh-layout-sider-width', '234px')
    await mount(LAYOUT)
    expect(styleOf(part('layout', 'sider'), 'inline-size')).toBe('234px')
  })
})

// —— progress：两个私有槽补了组件前缀，取值链不能断 ——

describe('progress 的厚度与直径照旧调得动', () => {
  it('线形的厚度跟着 --xh-progress-thickness 走', async () => {
    setSlot('--xh-progress-thickness', '11px')
    await mount(() => h(XhProgress, { value: 40 }))
    expect(styleOf(part('progress', 'track'), 'block-size')).toBe('11px')
  })

  it('环形的直径跟着 --xh-progress-size 走', async () => {
    setSlot('--xh-progress-size', '88px')
    await mount(() => h(XhProgress, { value: 40, variant: 'circle' }))
    expect(styleOf(part('progress', 'root'), 'inline-size')).toBe('88px')
  })
})
