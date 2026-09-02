// 槽名的部件段与它作用的部件对不上时，使用者按名字找过去改的是另一处，或者干脆
// 找不到名字。这一批把走样的名字改成按部件取名，走样的那个名字直接摘掉。
// 所以每一处都要量三遍——新名真的改得动，摘掉的名字一点效果都没有，
// 两个都不写时落回原来那个缺省。
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
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
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

function teardown(): void {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  for (const name of overridden.splice(0))
    document.documentElement.style.removeProperty(name)
}

afterEach(teardown)

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

/**
 * 挂一棵树、量一个值、拆干净。
 * 摘掉的名字要证明「一点效果都没有」，判据是它与什么都不写量出来同值，
 * 所以同一条用例里得连着量两回，两回之间必须把上一棵树与上一次覆盖都清掉。
 */
async function measure(
  render: () => unknown,
  read: () => string,
  slots: Record<string, string> = {},
): Promise<string> {
  for (const [name, value] of Object.entries(slots)) setSlot(name, value)
  await mount(render)
  const value = read()
  teardown()
  return value
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

  it('--xh-number-field-input-bg 只管独立输入框那一档，一体式盒不再跟着走', async () => {
    setSlot('--xh-number-field-input-bg', LIME)
    await mount(TWO_FORMS)

    expect(styleOf(part('number-field', 'control'), 'background-color')).not.toBe(LIME)
    expect(styleOf(part('number-field', 'input', 1), 'background-color')).toBe(LIME)
  })

  it('两档各调各的，互不牵连', async () => {
    setSlot('--xh-number-field-input-bg', LIME)
    setSlot('--xh-number-field-control-bg', RED)
    await mount(TWO_FORMS)

    expect(styleOf(part('number-field', 'control'), 'background-color')).toBe(RED)
    expect(styleOf(part('number-field', 'input', 1), 'background-color')).toBe(LIME)
  })

  it('设 --xh-number-field-input-bg 时一体式盒与什么都不写同值', async () => {
    const read = (): string => styleOf(part('number-field', 'control'), 'background-color')
    const bare = await measure(TWO_FORMS, read)
    const legacy = await measure(TWO_FORMS, read, { '--xh-number-field-input-bg': LIME })

    expect(legacy).toBe(bare)
  })

  it('圆角两档各调各的：input 槽不改一体式盒，control 槽不改独立输入框', async () => {
    setSlot('--xh-number-field-input-radius', '11px')
    setSlot('--xh-number-field-control-radius', '3px')
    await mount(TWO_FORMS)

    expect(styleOf(part('number-field', 'control'), 'border-top-left-radius')).toBe('3px')
    expect(styleOf(part('number-field', 'input', 1), 'border-top-left-radius')).toBe('11px')
  })

  it('设 --xh-number-field-input-radius 时一体式盒与什么都不写同值', async () => {
    const read = (): string => styleOf(part('number-field', 'control'), 'border-top-left-radius')
    const bare = await measure(TWO_FORMS, read)
    const legacy = await measure(TWO_FORMS, read, { '--xh-number-field-input-radius': '11px' })

    expect(legacy).toBe(bare)
  })

  // 聚焦档：一体式盒的描边画在 control 上，由内层 input 拿到焦点触发 :focus-within
  async function focusedControlBorder(slots: Record<string, string> = {}): Promise<string> {
    // 描边色带过渡：聚焦后立刻读到的是插值起点，也就是常态那个色，两边永远同值
    setSlot('--xh-motion-duration-micro', '0s')
    for (const [name, value] of Object.entries(slots)) setSlot(name, value)
    await mount(TWO_FORMS)
    part('number-field', 'input', 0).focus()
    await nextTick()
    const value = styleOf(part('number-field', 'control'), 'border-top-color')
    teardown()
    return value
  }

  it('设 --xh-number-field-input-border 时一体式盒的聚焦描边与什么都不写同值', async () => {
    const bare = await focusedControlBorder()
    const legacy = await focusedControlBorder({ '--xh-number-field-input-border': LIME })

    expect(legacy).toBe(bare)
    expect(legacy).not.toBe(LIME)
  })

  it('一体式盒的聚焦描边归 --xh-number-field-control-border-focus 管', async () => {
    const focused = await focusedControlBorder({ '--xh-number-field-control-border-focus': RED })

    expect(focused).toBe(RED)
  })
})

// —— text-field：常态描边的槽只管常态，聚焦描边各档自己管 ——

/** 两枚并排：前一枚有 control（盒画在它身上），后一枚只有 input（盒画在输入框上）。 */
function TEXT_TWO_FORMS(): unknown {
  return [
    h(XhTextFieldRoot, null, () => [
      h(XhTextFieldControl, null, () => [h(XhTextFieldInput)]),
    ]),
    h(XhTextFieldRoot, null, () => [h(XhTextFieldInput)]),
  ]
}

/**
 * 让某个输入框拿到焦点，再读一个部件的描边色。
 * 描边色带过渡：聚焦后立刻读到的是插值起点，也就是常态那个色，
 * 不把时长压成 0 两边永远同值，判据恒真。
 */
async function focusedBorder(
  focusIndex: number,
  readIndex: number,
  readPart: string,
  slots: Record<string, string> = {},
): Promise<string> {
  setSlot('--xh-motion-duration-micro', '0s')
  for (const [name, value] of Object.entries(slots)) setSlot(name, value)
  await mount(TEXT_TWO_FORMS)
  part('text-field', 'input', focusIndex).focus()
  await nextTick()
  const value = styleOf(part('text-field', readPart, readIndex), 'border-top-color')
  teardown()
  return value
}

describe('text-field 的常态描边槽不牵着聚焦描边', () => {
  it('设 --xh-text-field-input-border 时一体式盒的聚焦描边与什么都不写同值', async () => {
    const bare = await focusedBorder(0, 0, 'control')
    const withSlot = await focusedBorder(0, 0, 'control', { '--xh-text-field-input-border': LIME })

    expect(withSlot).toBe(bare)
    expect(withSlot).not.toBe(LIME)
  })

  it('设 --xh-text-field-input-border 时独立输入框的聚焦描边与什么都不写同值', async () => {
    const bare = await focusedBorder(1, 1, 'input')
    const withSlot = await focusedBorder(1, 1, 'input', { '--xh-text-field-input-border': LIME })

    expect(withSlot).toBe(bare)
    expect(withSlot).not.toBe(LIME)
  })

  it('一体式盒的聚焦描边归 --xh-text-field-control-border-focus 管', async () => {
    expect(await focusedBorder(0, 0, 'control', { '--xh-text-field-control-border-focus': RED })).toBe(RED)
  })

  it('独立输入框的聚焦描边归 --xh-text-field-input-border-focus 管', async () => {
    expect(await focusedBorder(1, 1, 'input', { '--xh-text-field-input-border-focus': RED })).toBe(RED)
  })

  it('--xh-text-field-input-border 仍管独立输入框的常态描边', async () => {
    setSlot('--xh-text-field-input-border', LIME)
    await mount(TEXT_TWO_FORMS)

    expect(styleOf(part('text-field', 'input', 1), 'border-top-color')).toBe(LIME)
  })
})

// —— tree：叶子的勾与分支的箭头各有各的名字 ——

const TREE_COLLECTION = [
  { value: 'branch', label: '分支', children: [{ value: 'leaf', label: '叶子' }] },
]

function TREE(): unknown {
  return h(
    XhTreeRoot,
    { collection: TREE_COLLECTION, multiple: true, defaultExpandedValue: ['branch'] },
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

  it('摘掉的 --xh-tree-indicator-fg 一点效果都没有', async () => {
    const read = (): string => styleOf(part('tree', 'item-indicator'), 'color')
    const bare = await measure(TREE, read)
    const legacy = await measure(TREE, read, { '--xh-tree-indicator-fg': LIME })

    expect(legacy).not.toBe(LIME)
    expect(legacy).toBe(bare)
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

  it('摘掉的 --xh-transfer-title-fg 一点效果都没有', async () => {
    const read = (): string => styleOf(part('transfer', 'panel-title'), 'color')
    const bare = await measure(TRANSFER, read)
    const legacy = await measure(TRANSFER, read, { '--xh-transfer-title-fg': LIME })

    expect(legacy).not.toBe(LIME)
    expect(legacy).toBe(bare)
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

  it('摘掉的 --xh-highlight-bg 一点效果都没有', async () => {
    const read = (): string => styleOf(part('highlight', 'mark'), 'background-color')
    const bare = await measure(HIGHLIGHT, read)
    const legacy = await measure(HIGHLIGHT, read, { '--xh-highlight-bg': LIME })

    expect(legacy).not.toBe(LIME)
    expect(legacy).toBe(bare)
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

  it('摘掉的 --xh-password-input-hint-fg 一点效果都没有', async () => {
    const read = (): string => styleOf(part('password-input', 'caps-lock-indicator'), 'color')
    const bare = await measure(PASSWORD, read)
    const legacy = await measure(PASSWORD, read, { '--xh-password-input-hint-fg': LIME })

    expect(legacy).not.toBe(LIME)
    expect(legacy).toBe(bare)
  })
})

/** 两枚并排：前一枚有 control（盒画在它身上），后一枚只有 input（盒画在输入框上）。 */
function PASSWORD_TWO_FORMS(): unknown {
  return [
    h(XhPasswordInputRoot, null, () => [
      h(XhPasswordInputControl, null, () => [h(XhPasswordInputInput)]),
    ]),
    h(XhPasswordInputRoot, null, () => [h(XhPasswordInputInput)]),
  ]
}

describe('password-input 的一体式盒有自己的圆角槽', () => {
  it('两档各调各的：input 槽不改一体式盒，control 槽不改独立输入框', async () => {
    setSlot('--xh-password-input-input-radius', '11px')
    setSlot('--xh-password-input-control-radius', '3px')
    await mount(PASSWORD_TWO_FORMS)

    expect(styleOf(part('password-input', 'control'), 'border-top-left-radius')).toBe('3px')
    expect(styleOf(part('password-input', 'input', 1), 'border-top-left-radius')).toBe('11px')
  })

  it('设 --xh-password-input-input-radius 时一体式盒与什么都不写同值', async () => {
    const read = (): string => styleOf(part('password-input', 'control'), 'border-top-left-radius')
    const bare = await measure(PASSWORD_TWO_FORMS, read)
    const withSlot = await measure(PASSWORD_TWO_FORMS, read, { '--xh-password-input-input-radius': '11px' })

    expect(withSlot).toBe(bare)
    expect(withSlot).not.toBe('11px')
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

  it('摘掉的 --xh-layout-sider-width 一点效果都没有', async () => {
    const read = (): string => styleOf(part('layout', 'sider'), 'inline-size')
    const bare = await measure(LAYOUT, read)
    const legacy = await measure(LAYOUT, read, { '--xh-layout-sider-width': '234px' })

    expect(legacy).not.toBe('234px')
    expect(legacy).toBe(bare)
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
