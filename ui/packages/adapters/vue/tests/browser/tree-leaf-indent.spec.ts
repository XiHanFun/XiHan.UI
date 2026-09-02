// 叶子行与同级分支行的层级缩进：叶子的文字要比所在分支的文字正好右移一格。
//
// 只有真实浏览器量得出来：这条靠的是 flex 行盒的实际排布与 :has() 的匹配结果，
// jsdom 既不排版也不解析 :has()，量出来恒是 0。
//
// 分支行的首格是展开箭头，叶子行没有这一格。作者摆了 item-indicator 时由它顶着，
// 没摆（勾选档首位直接是 item-checkbox）就得由行盒补出来——补少了叶子往行首缩，
// 补多了摆了指示符的那档被重复缩进，两头都要量。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTreeBranch,
  XhTreeBranchCheckbox,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemCheckbox,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeRoot,
  XhTreeTree,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const collection = [
  {
    value: 'l1',
    label: '一级',
    children: [
      { value: 'l1-leaf', label: '一级下的叶子' },
      {
        value: 'l2',
        label: '二级',
        children: [{ value: 'l2-leaf', label: '二级下的叶子' }],
      },
    ],
  },
]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

/**
 * leading 决定这棵树按哪档配：
 * checkbox 档两种行都带勾选框，叶子少的是箭头那一格；
 * indicator 档分支只有箭头、叶子只有指示符，首格本就一一对应。
 */
async function mountTree(leading: 'checkbox' | 'indicator') {
  host = document.createElement('div')
  document.body.append(host)

  const leaf = (value: string, label: string) =>
    h(XhTreeItem, { key: value, value }, () => [
      leading === 'checkbox' ? h(XhTreeItemCheckbox) : h(XhTreeItemIndicator),
      h(XhTreeItemText, null, () => label),
    ])

  const branchControl = (label: string) =>
    h(XhTreeBranchControl, null, () => [
      h(XhTreeBranchTrigger),
      ...(leading === 'checkbox' ? [h(XhTreeBranchCheckbox)] : []),
      h(XhTreeBranchText, null, () => label),
    ])

  app = createApp({
    setup: () => () =>
      h(
        XhTreeRoot,
        {
          collection,
          multiple: true,
          defaultExpandedValue: ['l1', 'l2'],
        },
        () => [
          h(XhTreeTree, null, () => [
            h(XhTreeBranch, { value: 'l1' }, () => [
              branchControl('一级'),
              h(XhTreeBranchContent, null, () => [
                leaf('l1-leaf', '一级下的叶子'),
                h(XhTreeBranch, { value: 'l2' }, () => [
                  branchControl('二级'),
                  h(XhTreeBranchContent, null, () => [leaf('l2-leaf', '二级下的叶子')]),
                ]),
              ]),
            ]),
          ]),
        ],
      ),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function textLeft(value: string): number {
  const row = host!.querySelector<HTMLElement>(`[data-scope="tree"][data-value="${value}"]`)!
  const text = row.querySelector<HTMLElement>(
    '[data-scope="tree"][data-part="branch-text"], [data-scope="tree"][data-part="item-text"]',
  )!
  return text.getBoundingClientRect().left
}

/** 一格有多宽由 branch-content 自己说了算，别在测试里写死 */
function indentStep(): number {
  const content = host!.querySelector<HTMLElement>(
    '[data-scope="tree"][data-part="branch-content"]',
  )!
  return Number.parseFloat(getComputedStyle(content).paddingInlineStart)
}

describe('树的叶子行缩进', () => {
  it('勾选档：叶子文字比所在分支文字正好右移一格', async () => {
    await mountTree('checkbox')
    const step = indentStep()
    expect(step).toBeGreaterThan(0)

    expect(textLeft('l1-leaf') - textLeft('l1')).toBeCloseTo(step, 1)
    expect(textLeft('l2-leaf') - textLeft('l2')).toBeCloseTo(step, 1)
  })

  it('指示符档：摆了 item-indicator 的叶子不被重复缩进', async () => {
    await mountTree('indicator')
    const step = indentStep()

    expect(textLeft('l1-leaf') - textLeft('l1')).toBeCloseTo(step, 1)
    expect(textLeft('l2-leaf') - textLeft('l2')).toBeCloseTo(step, 1)
  })

  it('同一层的两种行首格对齐：叶子与它的兄弟分支落在同一条竖线上', async () => {
    await mountTree('checkbox')
    const leafBox = host!
      .querySelector<HTMLElement>('[data-scope="tree"][data-value="l1-leaf"]')!
      .querySelector<HTMLElement>('[data-part="item-checkbox"]')!
    const branchBox = host!
      .querySelector<HTMLElement>('[data-scope="tree"][data-value="l2"]')!
      .querySelector<HTMLElement>('[data-part="branch-checkbox"]')!

    expect(leafBox.getBoundingClientRect().left).toBeCloseTo(
      branchBox.getBoundingClientRect().left,
      1,
    )
  })
})
