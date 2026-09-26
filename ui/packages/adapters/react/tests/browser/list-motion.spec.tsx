// React 的标签输入：删掉的标签由替身在原处播完退场。替身是 React 不认识的节点，
// 替身还在的时候继续增删、换序，React 的协调只动它自己的节点，标签的先后与替身都各就各位。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhTagsInputControl, XhTagsInputInput, XhTagsInputItem, XhTagsInputItemDeleteTrigger, XhTagsInputItemPreview, XhTagsInputItemText, XhTagsInputRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
let host: HTMLElement | undefined
let root: Root | undefined

async function inAct(action: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(action)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

afterEach(async () => {
  await inAct(() => root?.unmount())
  host?.remove()
  root = undefined
  host = undefined
})

function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
}

const ITEM = `[data-scope='tags-input'][data-part='item']`

function control(): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='tags-input'][data-part='control']`)!
}

function live(): string[] {
  return [...control().querySelectorAll<HTMLElement>(`${ITEM}:not([data-state='closed'])`)].map(el => el.getAttribute('data-value') ?? '')
}

async function render(values: string[]): Promise<void> {
  await inAct(async () => {
    root!.render(
      <div style={{ inlineSize: 360 }}>
        <XhTagsInputRoot value={values}>
          <XhTagsInputControl>
            {values.map(value => (
              <XhTagsInputItem key={value} value={value}>
                <XhTagsInputItemPreview>
                  <XhTagsInputItemText>{value}</XhTagsInputItemText>
                  <XhTagsInputItemDeleteTrigger />
                </XhTagsInputItemPreview>
              </XhTagsInputItem>
            ))}
            <XhTagsInputInput />
          </XhTagsInputControl>
        </XhTagsInputRoot>
      </div>,
    )
  })
  await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
}

describe('react 标签输入的列表动效', () => {
  it('首帧的标签直接呈现；删掉一枚留替身淡出，替身还在时继续增删换序，先后照旧', async () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    await render(['甲', '乙', '丙'])
    for (const el of control().querySelectorAll(ITEM))
      expect(running(el)).toEqual([])

    await render(['甲', '丙'])
    const ghost = control().querySelector<HTMLElement>(`${ITEM}[data-state='closed']`)
    expect(ghost).not.toBeNull()
    expect(running(ghost!)).toEqual(['xh-fade-out'])

    // 替身还在：再加两枚、把末尾那枚挪到最前
    await render(['丙', '甲', '丁', '戊'])
    expect(live()).toEqual(['丙', '甲', '丁', '戊'])
    const added = control().querySelector<HTMLElement>(`${ITEM}[data-value='丁']`)!
    expect(running(added)).toEqual(['xh-item-in'])
    // 挪到最前的那枚是换位，不重播进场
    expect(running(control().querySelector(`${ITEM}[data-value='丙']`)!)).toEqual([])
    // 输入框仍在最后
    expect(control().lastElementChild?.getAttribute('data-part')).toBe('input')

    await expect.poll(() => ghost!.isConnected, { timeout: 2000 }).toBe(false)
    expect(live()).toEqual(['丙', '甲', '丁', '戊'])
  })
})
