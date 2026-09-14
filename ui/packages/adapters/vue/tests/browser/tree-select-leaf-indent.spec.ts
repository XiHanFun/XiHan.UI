// 树选择器面板里，叶子行与同级分支行的层级缩进：叶子的文字要比所在分支的文字正好右移一格。
//
// 只有真实浏览器量得出来：这条靠的是 flex 行盒的实际排布与 :has() 的匹配结果，
// jsdom 既不排版也不解析 :has()，量出来恒是 0。
//
// 分支行的首格是展开箭头，叶子行没有这一格。作者摆了 item-indicator 时由它顶着，
// 没摆（勾选档首位直接是作者自己的方框）就得由行盒补出来——补少了叶子往行首缩，
// 补多了摆了指示符的那档被重复缩进，两头都要量。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
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
  document.getElementById('xh-portal-root')?.replaceChildren()
  app = null
  host = null
})

/** 面板被搬到 portal 落点，所有几何都从那里量 */
function panel(): HTMLElement {
  return document.getElementById('xh-portal-root')!
}

/**
 * leading 决定这棵树按哪档配：
 * box 档两种行都带作者自己画的方框，叶子少的是箭头那一格；
 * indicator 档分支只有箭头、叶子只有指示符，首格本就一一对应。
 */
async function mountTree(leading: 'box' | 'indicator'): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)

  const box = (): ReturnType<typeof h> => h('span', {
    'data-box': '',
    'aria-hidden': 'true',
    'style': 'width:16px;height:16px;flex:none;display:inline-flex',
  })

  const leaf = (value: string, label: string): ReturnType<typeof h> =>
    h(XhTreeSelectItem, { key: value, value }, () => [
      leading === 'box' ? box() : h(XhTreeSelectItemIndicator),
      h(XhTreeSelectItemText, null, () => label),
    ])

  const branchControl = (label: string): ReturnType<typeof h> =>
    h(XhTreeSelectBranchControl, null, () => [
      h(XhTreeSelectBranchTrigger),
      ...(leading === 'box' ? [box()] : []),
      h(XhTreeSelectBranchText, null, () => label),
    ])

  app = createApp({
    setup: () => () =>
      h(
        XhTreeSelectRoot,
        {
          collection,
          multiple: true,
          open: true,
          defaultExpandedValue: ['l1', 'l2'],
        },
        () => [
          h(XhTreeSelectTrigger, null, () => [h(XhTreeSelectValueText)]),
          h(XhTreeSelectPositioner, null, () => [
            h(XhTreeSelectContent, null, () => [
              h(XhTreeSelectTree, null, () => [
                h(XhTreeSelectBranch, { value: 'l1' }, () => [
                  branchControl('一级'),
                  h(XhTreeSelectBranchContent, null, () => [
                    leaf('l1-leaf', '一级下的叶子'),
                    h(XhTreeSelectBranch, { value: 'l2' }, () => [
                      branchControl('二级'),
                      h(XhTreeSelectBranchContent, null, () => [leaf('l2-leaf', '二级下的叶子')]),
                    ]),
                  ]),
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
  // 面板有 pop-in 进场，播放期间整块被 scale，此时量到的每个矩形都是缩放后的值；等它跑完再量
  await Promise.all(
    panel().getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => undefined)),
  )
}

function textLeft(value: string): number {
  const row = panel().querySelector<HTMLElement>(`[data-scope="tree-select"][data-value="${value}"]`)!
  const text = row.querySelector<HTMLElement>(
    '[data-scope="tree-select"][data-part="branch-text"], [data-scope="tree-select"][data-part="item-text"]',
  )!
  return text.getBoundingClientRect().left
}

/** 一格有多宽由 branch-content 自己说了算，别在测试里写死 */
function indentStep(): number {
  const content = panel().querySelector<HTMLElement>(
    '[data-scope="tree-select"][data-part="branch-content"]',
  )!
  return Number.parseFloat(getComputedStyle(content).paddingInlineStart)
}

describe('树选择器的叶子行缩进', () => {
  it('作者自绘方框档：叶子文字比所在分支文字正好右移一格', async () => {
    await mountTree('box')
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
    await mountTree('box')
    const leafBox = panel()
      .querySelector<HTMLElement>('[data-scope="tree-select"][data-value="l1-leaf"]')!
      .querySelector<HTMLElement>('[data-box]')!
    const branchBox = panel()
      .querySelector<HTMLElement>('[data-scope="tree-select"][data-value="l2"] [data-part="branch-control"] [data-box]')!

    expect(leafBox.getBoundingClientRect().left).toBeCloseTo(
      branchBox.getBoundingClientRect().left,
      1,
    )
  })
})
