// @vitest-environment jsdom
//
// 集合与检索这一族的 connect 派了三个不冒泡的事件：focus、pointerenter、pointerleave。
// React 的合成事件全部委派在根容器上、只在冒泡阶段派发：onFocus 挂的是 focusin，
// onPointerEnter / onPointerLeave 是从 pointerover / pointerout 合出来的，直接送到节点上的
// 那一种一个都到不了。共用的一致性套件走的是真实 el.focus()（focusin 会冒泡），核不到这一路。
// 这里按 DOM 的送达路径直接派发，核的是「处理器装在它自己点名的那个事件上」。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
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
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemText,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhCommandRoot,
  XhListboxContent,
  XhListboxItem,
  XhListboxItemText,
  XhListboxRoot,
  XhTreeSelectRoot,
} from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => {
    root?.unmount()
  })
  host?.remove()
  root = null
  host = null
})

/** 机器的效应排在提交之后，多催几拍让 DOM 落定。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await Promise.resolve()
    })
  }
}

async function mount(tree: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    root!.render(tree)
  })
  await settle()
}

function parts(scope: string, part: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)]
}

/** 按 DOM 的送达路径派：这三样都不冒泡。 */
async function fire(el: HTMLElement, event: Event): Promise<void> {
  await act(async () => {
    el.dispatchEvent(event)
  })
  await settle()
}

describe('listbox 的不冒泡事件按 DOM 语义送达', () => {
  const TREE = (
    <XhListboxRoot>
      <XhListboxContent>
        <XhListboxItem value="a"><XhListboxItemText>Apple</XhListboxItemText></XhListboxItem>
        <XhListboxItem value="b"><XhListboxItemText>Berry</XhListboxItemText></XhListboxItem>
      </XhListboxContent>
    </XhListboxRoot>
  )

  it('列表自己得焦：焦点转交给锚点条目，容器让出 Tab 位', async () => {
    await mount(TREE)
    const content = parts('listbox', 'content')[0]!
    expect(content.getAttribute('tabindex')).toBe('0')

    await fire(content, new Event('focus'))

    expect(content.getAttribute('tabindex')).toBe('-1')
    expect(parts('listbox', 'item')[0]!.getAttribute('tabindex')).toBe('0')
  })

  it('条目自己得焦：锚点改记它，roving tabindex 跟着换人', async () => {
    await mount(TREE)
    const [first, second] = parts('listbox', 'item')

    await fire(second!, new Event('focus'))

    expect(second!.getAttribute('tabindex')).toBe('0')
    expect(first!.getAttribute('tabindex')).toBe('-1')
  })
})

describe('combobox 的不冒泡事件按 DOM 语义送达', () => {
  const TREE = (
    <XhComboboxRoot defaultOpen collection={[{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Berry' }]}>
      <XhComboboxControl><XhComboboxInput /></XhComboboxControl>
      <XhComboboxPositioner>
        <XhComboboxContent>
          <XhComboboxItem value="a"><XhComboboxItemText>Apple</XhComboboxItemText></XhComboboxItem>
          <XhComboboxItem value="b"><XhComboboxItemText>Berry</XhComboboxItemText></XhComboboxItem>
        </XhComboboxContent>
      </XhComboboxPositioner>
    </XhComboboxRoot>
  )

  it('指针离开候选：高亮收掉，hover 不留漆', async () => {
    await mount(TREE)
    const second = parts('combobox', 'item')[1]!

    // 先让指针把这一条焐热——离开那一步只认之前进来过的节点
    await fire(second, new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse' }))
    expect(second.getAttribute('data-highlighted')).toBe('')

    await fire(second, new PointerEvent('pointerleave', { pointerType: 'mouse', relatedTarget: document.body }))

    expect(second.getAttribute('data-highlighted')).toBeNull()
  })
})

describe('command 的不冒泡事件按 DOM 语义送达', () => {
  const TREE = (
    <XhCommandRoot defaultOpen collection={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]} />
  )

  it('指针离开命令：锚点收掉，hover 不留漆', async () => {
    await mount(TREE)
    const second = parts('command', 'item')[1]!

    await fire(second, new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse' }))
    expect(second.getAttribute('data-highlighted')).toBe('')

    await fire(second, new PointerEvent('pointerleave', { pointerType: 'mouse', relatedTarget: document.body }))

    expect(second.getAttribute('data-highlighted')).toBeNull()
  })
})

describe('cascader 的不冒泡事件按 DOM 语义送达', () => {
  const COLLECTION = [
    { value: 'zj', label: 'Zhejiang', children: [{ value: 'hz', label: 'Hangzhou' }] },
    { value: 'js', label: 'Jiangsu' },
  ]

  const TREE = (
    <XhCascaderRoot defaultOpen expandTrigger="hover" collection={COLLECTION}>
      <XhCascaderControl>
        <XhCascaderTrigger><XhCascaderValueText /></XhCascaderTrigger>
      </XhCascaderControl>
      <XhCascaderPositioner>
        <XhCascaderContent>
          <XhCascaderColumn level={0}>
            <XhCascaderItem value="zj"><XhCascaderItemText>Zhejiang</XhCascaderItemText></XhCascaderItem>
            <XhCascaderItem value="js"><XhCascaderItemText>Jiangsu</XhCascaderItemText></XhCascaderItem>
          </XhCascaderColumn>
          <XhCascaderColumn level={1}>
            <XhCascaderItem value="hz"><XhCascaderItemText>Hangzhou</XhCascaderItemText></XhCascaderItem>
          </XhCascaderColumn>
        </XhCascaderContent>
      </XhCascaderPositioner>
    </XhCascaderRoot>
  )

  it('条目自己得焦：锚点改记它', async () => {
    await mount(TREE)
    const second = parts('cascader', 'item')[1]!

    await fire(second, new Event('focus'))

    expect(second.getAttribute('data-highlighted')).toBe('')
    expect(second.getAttribute('tabindex')).toBe('0')
  })

  it('指针划进分支：展开路径落到它身上，子列跟着露面', async () => {
    await mount(TREE)
    const first = parts('cascader', 'item')[0]!
    expect(parts('cascader', 'column')[1]!.hasAttribute('hidden')).toBe(true)

    await fire(first, new PointerEvent('pointerenter', { pointerType: 'mouse' }))

    expect(first.getAttribute('data-in-path')).toBe('')
    expect(parts('cascader', 'column')[1]!.hasAttribute('hidden')).toBe(false)
  })
})

describe('tree-select 的不冒泡事件按 DOM 语义送达', () => {
  const TREE = (
    <XhTreeSelectRoot
      defaultOpen
      collection={[
        { value: 'src', label: 'Source', children: [{ value: 'index', label: 'Index' }] },
        { value: 'license', label: 'License' },
      ]}
    />
  )

  it('分支自己得焦：锚点改记它', async () => {
    await mount(TREE)
    const branch = parts('tree-select', 'branch')[0]!

    await fire(branch, new Event('focus'))

    expect(branch.getAttribute('data-highlighted')).toBe('')
  })

  it('叶子自己得焦：锚点从分支挪到它身上', async () => {
    await mount(TREE)
    const branch = parts('tree-select', 'branch')[0]!
    const leaf = parts('tree-select', 'item').at(-1)!

    await fire(branch, new Event('focus'))
    await fire(leaf, new Event('focus'))

    expect(leaf.getAttribute('data-highlighted')).toBe('')
    expect(branch.getAttribute('data-highlighted')).toBeNull()
  })
})
