// @vitest-environment jsdom
//
// Root 部件接住作者写在它上面的其余属性。
//
// 覆盖这一组的 16 个组件：context-menu date-field date-picker dialog diff-view drawer
// editable field-array fieldset float-button floating-panel form heatmap hover-card
// image-cropper image-viewer。
// 其中 dialog 与 image-viewer 的 Root 不渲染自己的元素，单独核它们确实没有元素可落。
import type { CSSProperties, ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  XhContextMenuRoot,
  XhDateFieldRoot,
  XhDatePickerRoot,
  XhDialogRoot,
  XhDiffViewRoot,
  XhDrawerRoot,
  XhEditableRoot,
  XhFieldArrayRoot,
  XhFieldsetRoot,
  XhFloatButtonRoot,
  XhFloatingPanelRoot,
  XhFormRoot,
  XhHeatmapRoot,
  XhHoverCardRoot,
  XhImageCropperRoot,
  XhImageViewerRoot,
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

function mount(node: ReactNode): void {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(node))
}

/** 作者写在 Root 上的逐实例令牌覆盖。 */
const PROBE = { '--xh-probe': '3px' } as CSSProperties

interface Case {
  /** 组件名。 */
  name: string
  /** 作者写了 style、className 与几个 schema props 的一份 Root。 */
  render: () => ReactNode
  /**
   * 这几个 schema props 的名字不该出现在 root 元素的属性表里。
   * 全小写：DOM 属性名不分大小写，getAttributeNames 给的是小写形式。
   */
  leaks: readonly string[]
}

const CASES: readonly Case[] = [
  {
    name: 'context-menu',
    render: () => (
      <XhContextMenuRoot
        className="mine"
        style={PROBE}
        collection={[{ value: 'a', label: 'A' }]}
        longPressDelay={500}
      />
    ),
    leaks: ['collection', 'longpressdelay'],
  },
  {
    name: 'date-field',
    render: () => (
      <XhDateFieldRoot className="mine" style={PROBE} defaultValue="2024-01-01" granularity="day" />
    ),
    leaks: ['defaultvalue', 'granularity'],
  },
  {
    name: 'date-picker',
    render: () => (
      <XhDatePickerRoot className="mine" style={PROBE} defaultValue="2024-01-01" selectionMode="single" />
    ),
    leaks: ['defaultvalue', 'selectionmode'],
  },
  {
    name: 'diff-view',
    render: () => (
      <XhDiffViewRoot className="mine" style={PROBE} contextLines={3} defaultExpandedValue={[]} />
    ),
    leaks: ['contextlines', 'defaultexpandedvalue'],
  },
  {
    name: 'drawer',
    render: () => (
      <XhDrawerRoot className="mine" style={PROBE} side="right" restoreFocus={false} />
    ),
    leaks: ['side', 'restorefocus'],
  },
  {
    name: 'editable',
    render: () => (
      <XhEditableRoot className="mine" style={PROBE} defaultValue="x" submitMode="blur" />
    ),
    leaks: ['defaultvalue', 'submitmode'],
  },
  {
    name: 'field-array',
    render: () => (
      <XhFieldArrayRoot className="mine" style={PROBE} defaultValue={[1, 2]} min={1} />
    ),
    leaks: ['defaultvalue', 'min'],
  },
  {
    name: 'fieldset',
    render: () => (
      <XhFieldsetRoot className="mine" style={PROBE} invalid translations={{}} />
    ),
    leaks: ['invalid', 'translations'],
  },
  {
    name: 'float-button',
    render: () => (
      <XhFloatButtonRoot className="mine" style={PROBE} offset={24} expandTrigger="hover" />
    ),
    leaks: ['offset', 'expandtrigger'],
  },
  {
    name: 'floating-panel',
    render: () => (
      <XhFloatingPanelRoot className="mine" style={PROBE} defaultPosition={{ x: 1, y: 2 }} resizable={false} />
    ),
    leaks: ['defaultposition', 'resizable'],
  },
  {
    name: 'form',
    render: () => (
      <XhFormRoot className="mine" style={PROBE} defaultValues={{ a: 1 }} validateOn="blur" />
    ),
    leaks: ['defaultvalues', 'validateon'],
  },
  {
    name: 'heatmap',
    render: () => (
      <XhHeatmapRoot className="mine" style={PROBE} thresholds={[1, 2]} firstDayOfWeek={1} />
    ),
    leaks: ['thresholds', 'firstdayofweek'],
  },
  {
    name: 'hover-card',
    render: () => (
      <XhHoverCardRoot className="mine" style={PROBE} openDelay={100} closeDelay={200} />
    ),
    leaks: ['opendelay', 'closedelay'],
  },
  {
    name: 'image-cropper',
    render: () => (
      <XhImageCropperRoot
        className="mine"
        style={PROBE}
        defaultValue={{ x: 0, y: 0, width: 50, height: 50 }}
        aspectRatio={1}
      />
    ),
    leaks: ['defaultvalue', 'aspectratio'],
  },
]

/** 每个 Root 都渲染成宿主的第一个元素。 */
function rootEl(): HTMLElement {
  const el = host!.firstElementChild
  if (!(el instanceof HTMLElement))
    throw new Error('root 没有渲染出元素')
  return el
}

describe('作者写在 Root 上的 style 落到 root 元素', () => {
  it.each(CASES)('$name', (item) => {
    mount(item.render())
    expect(rootEl().style.getPropertyValue('--xh-probe')).toBe('3px')
  })
})

describe('作者写在 Root 上的 className 与部件自身的接线并存', () => {
  // 这个库的 connect 不产出 class（部件身份走 data-scope / data-part），
  // 所以「互不顶掉」在 root 上核的是：作者的 class 在场，且部件自己那套属性一个不少。
  it.each(CASES)('$name', (item) => {
    mount(item.render())
    const el = rootEl()
    expect(el.classList.contains('mine')).toBe(true)
    expect(el.getAttribute('data-part')).toBe('root')
    expect(el.getAttribute('data-scope')).toBe(item.name)
  })
})

describe('schema props 不漏成 DOM 属性', () => {
  it.each(CASES)('$name', (item) => {
    mount(item.render())
    const names = rootEl().getAttributeNames()
    for (const leak of item.leaks)
      expect(names).not.toContain(leak)
  })
})

// float-button 的 root 是这一组里唯一由 connect 写出 style 的部件，
// 拿它核一次两侧 style 真正合到一起、谁也没被顶掉。
describe('部件自带的 style 与作者的 style 合到一起', () => {
  it('float-button：偏移量令牌与作者的令牌同时在', () => {
    mount(<XhFloatButtonRoot style={PROBE} offset={24} />)
    const el = rootEl()
    expect(el.style.getPropertyValue('--xh-probe')).toBe('3px')
    expect(el.style.getPropertyValue('--xh-_float-button-offset')).toBe('24px')
  })
})

// 这两个 Root 的解剖里没有 root 部件：只建上下文、把状态经 children 交出去，
// 没有自己的元素可以承接作者的属性，因此不接 fallthrough。
describe('不渲染自己元素的 Root', () => {
  it('dialog：Root 之下直接就是作者的节点', () => {
    mount(<XhDialogRoot><span data-probe="1" /></XhDialogRoot>)
    expect(host!.firstElementChild?.getAttribute('data-probe')).toBe('1')
    expect(host!.childElementCount).toBe(1)
  })

  it('image-viewer：Root 之下直接就是作者的节点', () => {
    mount(<XhImageViewerRoot><span data-probe="1" /></XhImageViewerRoot>)
    expect(host!.firstElementChild?.getAttribute('data-probe')).toBe('1')
    expect(host!.childElementCount).toBe(1)
  })
})
