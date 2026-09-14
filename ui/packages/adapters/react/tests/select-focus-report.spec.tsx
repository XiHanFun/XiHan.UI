// @vitest-environment jsdom
//
// 高亮所在的条目被移出 DOM 时，浏览器不派 focusout——焦点无声地掉到 body 上，
// 机器那一侧仍记着一个已经不存在的高亮值：方向键从一个不在场的锚点起步，
// 回车提交的也是它。适配器要在卸载时如实上报，让机器重挑一个。
//
// 一致性套件核不到这一路：它的 fixture 是一棵固定的列表，不会在中途摘掉持有焦点的那个条目。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhSelectContent,
  XhSelectItem,
  XhSelectItemText,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
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

async function render(tree: ReactNode): Promise<void> {
  if (root == null) {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  }
  await act(async () => {
    root!.render(tree)
  })
  await settle()
}

function items(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="select"][data-part="item"]')]
}

function tree(values: readonly string[]): ReactNode {
  return (
    <XhSelectRoot defaultOpen>
      <XhSelectTrigger>选一个</XhSelectTrigger>
      <XhSelectPositioner>
        <XhSelectContent>
          <XhSelectList>
            {values.map(value => (
              <XhSelectItem key={value} value={value}><XhSelectItemText>{value}</XhSelectItemText></XhSelectItem>
            ))}
          </XhSelectList>
        </XhSelectContent>
      </XhSelectPositioner>
    </XhSelectRoot>
  )
}

describe('select 的高亮落点如实上报', () => {
  it('高亮所在的条目被摘掉：锚点当场改记还在场的那一条', async () => {
    await render(tree(['a', 'b', 'c']))
    const [, second] = items()
    await act(async () => {
      second!.focus()
    })
    await settle()
    expect(second!.getAttribute('data-highlighted')).toBe('')

    await render(tree(['a', 'c']))

    const rest = items()
    expect(rest).toHaveLength(2)
    // 重挑一个还在场的：一个都不高亮，等于方向键与回车都没有起步点
    expect(rest.some(el => el.getAttribute('data-highlighted') === '')).toBe(true)
    expect(rest.some(el => el.getAttribute('tabindex') === '0')).toBe(true)
  })
})
