// @vitest-environment jsdom
//
// 根部件接住作者写在它上面的其余属性：逐实例令牌覆盖靠的就是这一层。
// 共享一致性套件只喂机器 props，作者自己写的 style / className 一次都走不到。
import type { CSSProperties, ReactElement } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  XhPopconfirmRoot,
  XhPopoverRoot,
  XhPromptInputRoot,
  XhQuestionFlowRoot,
  XhRadioGroupRoot,
  XhRatingRoot,
  XhReasoningRoot,
  XhSegmentedRoot,
  XhSelectRoot,
  XhSideNavRoot,
  XhSignaturePadRoot,
  XhSliderRoot,
  XhStepsRoot,
  XhTableRoot,
  XhTabsRoot,
  XhTagGroupRoot,
} from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
})

function mount(node: ReactElement): void {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(node))
}

const PROBE_CLASS = 'probe-class'
const PROBE_VALUE = 'rgb(1, 2, 3)'

/** 作者写在 root 上的逐实例令牌覆盖。 */
function tokenStyle(scope: string): CSSProperties {
  return { [`--xh-${scope}-bg`]: PROBE_VALUE } as unknown as CSSProperties
}

/** 取整棵树里这个组件的 root 元素。 */
function rootOf(scope: string): HTMLElement {
  const el = host!.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="root"]`)
  if (!el)
    throw new Error(`${scope} 没渲出 root 元素`)
  return el
}

/** root 上的属性名，一律小写——React 写未知属性时保留驼峰，HTML 落盘时压成小写。 */
function attrNames(el: HTMLElement): string[] {
  return [...el.attributes].map(a => a.name.toLowerCase())
}

interface RootCase {
  /** data-scope，同时用来拼令牌名。 */
  scope: string
  /** 只带机器 props 的那一棵，用来取部件自己的接线做基线。 */
  bare: ReactElement
  /** 机器 props 之外再写上 className 与内联令牌的那一棵。 */
  probed: ReactElement
  /** 这几个机器 props 的取值都是字符串 / 数字 / 数组，漏进 DOM 就一定看得见。 */
  schemaKeys: string[]
}

const radioNodes = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]
const segmentedNodes = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]
const selectNodes = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]
const sideNavNodes = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]
const stepNodes = [{ title: '甲' }, { title: '乙' }]
const tabsNodes = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]
const tagNodes = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]
const tableColumns = [{ id: 'c1', label: '甲' }]
const tableRows = [{ id: 'r1' }]

const cases: RootCase[] = [
  {
    scope: 'popconfirm',
    schemaKeys: ['placement', 'offset'],
    bare: <XhPopconfirmRoot placement="top" offset={8} />,
    probed: <XhPopconfirmRoot placement="top" offset={8} className={PROBE_CLASS} style={tokenStyle('popconfirm')} />,
  },
  {
    scope: 'prompt-input',
    schemaKeys: ['submitkey', 'defaultvalue'],
    bare: <XhPromptInputRoot submitKey="none" defaultValue="草稿" />,
    probed: <XhPromptInputRoot submitKey="none" defaultValue="草稿" className={PROBE_CLASS} style={tokenStyle('prompt-input')} />,
  },
  {
    scope: 'question-flow',
    schemaKeys: ['defaultindex', 'autoadvancedelay'],
    bare: <XhQuestionFlowRoot defaultIndex={0} autoAdvanceDelay={30} />,
    probed: <XhQuestionFlowRoot defaultIndex={0} autoAdvanceDelay={30} className={PROBE_CLASS} style={tokenStyle('question-flow')} />,
  },
  {
    scope: 'radio-group',
    schemaKeys: ['collection', 'defaultvalue'],
    bare: <XhRadioGroupRoot collection={radioNodes} defaultValue="a" />,
    probed: <XhRadioGroupRoot collection={radioNodes} defaultValue="a" className={PROBE_CLASS} style={tokenStyle('radio-group')} />,
  },
  {
    scope: 'rating',
    schemaKeys: ['count', 'defaultvalue'],
    bare: <XhRatingRoot count={3} defaultValue={2} />,
    probed: <XhRatingRoot count={3} defaultValue={2} className={PROBE_CLASS} style={tokenStyle('rating')} />,
  },
  {
    scope: 'reasoning',
    schemaKeys: ['starttime', 'endtime'],
    bare: <XhReasoningRoot startTime={1000} endTime={2000} />,
    probed: <XhReasoningRoot startTime={1000} endTime={2000} className={PROBE_CLASS} style={tokenStyle('reasoning')} />,
  },
  {
    scope: 'segmented',
    schemaKeys: ['collection', 'defaultvalue'],
    bare: <XhSegmentedRoot collection={segmentedNodes} defaultValue="a" />,
    probed: <XhSegmentedRoot collection={segmentedNodes} defaultValue="a" className={PROBE_CLASS} style={tokenStyle('segmented')} />,
  },
  {
    scope: 'select',
    schemaKeys: ['collection', 'placeholder'],
    bare: <XhSelectRoot collection={selectNodes} placeholder="选一个" />,
    probed: <XhSelectRoot collection={selectNodes} placeholder="选一个" className={PROBE_CLASS} style={tokenStyle('select')} />,
  },
  {
    scope: 'side-nav',
    schemaKeys: ['collection', 'defaultvalue'],
    bare: <XhSideNavRoot collection={sideNavNodes} defaultValue="a" />,
    probed: <XhSideNavRoot collection={sideNavNodes} defaultValue="a" className={PROBE_CLASS} style={tokenStyle('side-nav')} />,
  },
  {
    scope: 'signature-pad',
    schemaKeys: ['name'],
    bare: <XhSignaturePadRoot name="sign" />,
    probed: <XhSignaturePadRoot name="sign" className={PROBE_CLASS} style={tokenStyle('signature-pad')} />,
  },
  {
    scope: 'slider',
    schemaKeys: ['defaultvalue', 'max'],
    bare: <XhSliderRoot defaultValue={[3]} max={10} />,
    probed: <XhSliderRoot defaultValue={[3]} max={10} className={PROBE_CLASS} style={tokenStyle('slider')} />,
  },
  {
    scope: 'steps',
    schemaKeys: ['collection', 'count'],
    bare: <XhStepsRoot collection={stepNodes} count={2} />,
    probed: <XhStepsRoot collection={stepNodes} count={2} className={PROBE_CLASS} style={tokenStyle('steps')} />,
  },
  {
    scope: 'table',
    schemaKeys: ['columns', 'rows'],
    bare: <XhTableRoot columns={tableColumns} rows={tableRows} />,
    probed: <XhTableRoot columns={tableColumns} rows={tableRows} className={PROBE_CLASS} style={tokenStyle('table')} />,
  },
  {
    scope: 'tabs',
    schemaKeys: ['collection', 'defaultvalue'],
    bare: <XhTabsRoot collection={tabsNodes} defaultValue="a" />,
    probed: <XhTabsRoot collection={tabsNodes} defaultValue="a" className={PROBE_CLASS} style={tokenStyle('tabs')} />,
  },
  {
    scope: 'tag-group',
    schemaKeys: ['collection', 'defaultvalue'],
    bare: <XhTagGroupRoot collection={tagNodes} defaultValue="a" />,
    probed: <XhTagGroupRoot collection={tagNodes} defaultValue="a" className={PROBE_CLASS} style={tokenStyle('tag-group')} />,
  },
]

describe.each(cases)('$scope 的 root 收作者写在上面的属性', (item) => {
  it('内联令牌落到 root 元素上', () => {
    mount(item.probed)
    expect(rootOf(item.scope).style.getPropertyValue(`--xh-${item.scope}-bg`)).toBe(PROBE_VALUE)
  })

  it('className 落到 root 上，且部件自己的接线一条不少', () => {
    mount(item.bare)
    const before = attrNames(rootOf(item.scope))
    expect(before).not.toContain('class')
    act(() => root!.render(item.probed))
    const el = rootOf(item.scope)
    expect([...el.classList]).toContain(PROBE_CLASS)
    // 作者的 class / style 是净增的：部件原本写上的属性一个都没被顶掉
    expect(attrNames(el)).toEqual(expect.arrayContaining(before))
    expect(attrNames(el).filter(n => !before.includes(n)).sort()).toEqual(['class', 'style'])
  })

  it('机器 props 不漏成 DOM 属性', () => {
    mount(item.probed)
    const names = attrNames(rootOf(item.scope))
    for (const key of item.schemaKeys)
      expect(names).not.toContain(key)
  })
})

describe('popover 的 root 不渲染自己的元素', () => {
  it('解剖里没有 root 部件，属性没有落点', () => {
    mount(<XhPopoverRoot />)
    expect(host!.querySelector('[data-scope="popover"][data-part="root"]')).toBeNull()
  })
})
