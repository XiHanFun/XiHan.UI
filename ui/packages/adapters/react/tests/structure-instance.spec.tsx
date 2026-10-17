// @vitest-environment jsdom
// 标准结构的组合节点：渲那个组件的根组件，props 原样传、onXxx 即回调，嵌在部件里照样渲；组件表里查不到时抛错。
import type { StructureChild } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { renderStructure } from '../src/runtime/structure'

function Inner(props: { items: readonly string[], onPing?: (detail: unknown) => void }): ReactNode {
  return <button data-inner="" onClick={() => props.onPing?.(7)}>{props.items.join(',')}</button>
}

function Box(props: { children?: ReactNode }): ReactNode {
  return <div data-box="">{props.children}</div>
}

let root: Root | null = null

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

describe('renderStructure 的组合节点（React）', () => {
  it('渲组件表里的根组件，props 原样传，onXxx 接住内层的回调', () => {
    const seen: unknown[] = []
    const nodes: StructureChild[] = [{
      key: 'box',
      tag: 'div',
      part: 'box',
      children: [{ key: 'inner', instance: 'inner', props: { items: ['a', 'b'], onPing: (detail: unknown) => seen.push(detail) } }],
    }]
    const host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    act(() => root!.render(<>{renderStructure(nodes, { box: Box }, undefined, { inner: Inner })}</>))
    const inner = document.querySelector<HTMLButtonElement>('[data-box] > [data-inner]')!
    expect(inner.textContent).toBe('a,b')
    act(() => inner.click())
    expect(seen).toEqual([7])
  })

  it('组件表里查不到组合节点的组件时抛错', () => {
    expect(() => renderStructure([{ key: 'x', instance: 'missing' }], {})).toThrow('组合节点 missing')
  })
})
