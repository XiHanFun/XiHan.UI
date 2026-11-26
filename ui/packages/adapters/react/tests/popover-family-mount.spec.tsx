// @vitest-environment jsdom

import type { ComponentType, ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
  XhPopconfirmCancelTrigger,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTrigger,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '../src'

/**
 * 浮层一族 content 里内容的挂卸：缺省常驻；lazyMount 第一次打开才挂、之后常驻；unmountOnExit 退场播完就卸。
 * Popover 与 Popconfirm 退场完成后发 onExitComplete。jsdom 没有动画，presence 在收起当拍就判定退场播完；
 * 动画真在播的那一段由浏览器用例验。
 */

interface RootProps {
  open?: boolean
  lazyMount?: boolean
  unmountOnExit?: boolean
  onExitComplete?: () => void
  children?: ReactNode
}

interface Case {
  name: string
  scope: string
  Root: ComponentType<RootProps>
  Trigger: ComponentType<{ children?: ReactNode }>
  Positioner: ComponentType<{ children?: ReactNode }>
  Content: ComponentType<{ children?: ReactNode }>
  extra?: ReactNode
  exits: boolean
}

const CASES: Case[] = [
  { name: 'Popover', scope: 'popover', Root: XhPopoverRoot as ComponentType<RootProps>, Trigger: XhPopoverTrigger, Positioner: XhPopoverPositioner, Content: XhPopoverContent, exits: true },
  {
    name: 'Popconfirm',
    scope: 'popconfirm',
    Root: XhPopconfirmRoot as ComponentType<RootProps>,
    Trigger: XhPopconfirmTrigger,
    Positioner: XhPopconfirmPositioner,
    Content: XhPopconfirmContent,
    extra: (
      <>
        <XhPopconfirmCancelTrigger>取消</XhPopconfirmCancelTrigger>
        <XhPopconfirmConfirmTrigger>删除</XhPopconfirmConfirmTrigger>
      </>
    ),
    exits: true,
  },
  { name: 'HoverCard', scope: 'hover-card', Root: XhHoverCardRoot as ComponentType<RootProps>, Trigger: XhHoverCardTrigger, Positioner: XhHoverCardPositioner, Content: XhHoverCardContent, exits: false },
  { name: 'Tooltip', scope: 'tooltip', Root: XhTooltipRoot as ComponentType<RootProps>, Trigger: XhTooltipTrigger, Positioner: XhTooltipPositioner, Content: XhTooltipContent, exits: false },
]

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

const body = (): Element | null => document.querySelector('[data-testid="body"]')

describe.each(CASES)('$name content 里内容的挂卸', (c) => {
  function mount(props: Omit<RootProps, 'open' | 'children'>) {
    const host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
    let exits = 0
    const render = (open: boolean): void => {
      act(() => root!.render(
        <c.Root {...props} open={open} {...(c.exits ? { onExitComplete: () => { exits += 1 } } : {})}>
          <c.Trigger>打开</c.Trigger>
          <c.Positioner>
            <c.Content>
              <p data-testid="body">内容</p>
              {c.extra}
            </c.Content>
          </c.Positioner>
        </c.Root>,
      ))
    }
    return { render, exits: () => exits }
  }

  it('缺省收起态也挂着（不改变现有行为）', () => {
    mount({}).render(false)
    expect(document.querySelector(`[data-scope="${c.scope}"][data-part="content"]`)).not.toBeNull()
    expect(body()).not.toBeNull()
  })

  it('lazyMount：第一次打开前不挂，打开过之后收起也留着', () => {
    const t = mount({ lazyMount: true })
    t.render(false)
    expect(document.querySelector(`[data-scope="${c.scope}"][data-part="content"]`)).not.toBeNull()
    expect(body()).toBeNull()
    t.render(true)
    expect(body()).not.toBeNull()
    t.render(false)
    expect(body()).not.toBeNull()
  })

  it('unmountOnExit：退场落定即卸，再打开重新挂上', () => {
    const t = mount({ unmountOnExit: true })
    t.render(true)
    const first = body()
    expect(first).not.toBeNull()
    t.render(false)
    expect(body()).toBeNull()
    if (c.exits)
      expect(t.exits()).toBe(1)
    t.render(true)
    expect(body()).not.toBeNull()
    expect(body()).not.toBe(first)
  })
})
