// 叶子行与同级分支行的层级缩进：叶子的文字要比所在分支的文字正好右移一格。
//
// 只有真实浏览器量得出来：这条靠的是 flex 行盒的实际排布，jsdom 不排版，量出来恒是 0。
//
// 分支行的首格是展开箭头，叶子行没有这一格，由行盒补出来。对号落在行尾，不替叶子顶这一格：
// 摆没摆对号、作者把对号写在行首还是行尾，叶子的文字起点都不能动，两档都要量。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
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
 * marks 决定这棵树按哪档配：
 * indicator 档叶子与分支行都摆对号（写在行首，由皮肤排到行尾）；none 档一个对号都不摆。
 */
async function mountTree(marks: 'indicator' | 'none') {
  host = document.createElement('div')
  document.body.append(host)

  const leaf = (value: string, label: string) =>
    h(XhTreeItem, { key: value, value }, () => [
      ...(marks === 'indicator' ? [h(XhTreeItemIndicator)] : []),
      h(XhTreeItemText, null, () => label),
    ])

  const branchControl = (label: string) =>
    h(XhTreeBranchControl, null, () => [
      h(XhTreeBranchTrigger),
      ...(marks === 'indicator' ? [h(XhTreeItemIndicator)] : []),
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
  it('对号档：叶子文字比所在分支文字正好右移一格', async () => {
    await mountTree('indicator')
    const step = indentStep()
    expect(step).toBeGreaterThan(0)

    expect(textLeft('l1-leaf') - textLeft('l1')).toBeCloseTo(step, 1)
    expect(textLeft('l2-leaf') - textLeft('l2')).toBeCloseTo(step, 1)
  })

  it('不摆对号：叶子文字照样比所在分支文字正好右移一格', async () => {
    await mountTree('none')
    const step = indentStep()

    expect(textLeft('l1-leaf') - textLeft('l1')).toBeCloseTo(step, 1)
    expect(textLeft('l2-leaf') - textLeft('l2')).toBeCloseTo(step, 1)
  })

  it('同一层的叶子与兄弟分支文字落在同一条竖线上：叶子补出的首格与箭头等宽', async () => {
    await mountTree('indicator')
    expect(textLeft('l1-leaf')).toBeCloseTo(textLeft('l2'), 1)
  })
})
