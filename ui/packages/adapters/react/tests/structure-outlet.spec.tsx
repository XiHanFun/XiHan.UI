// @vitest-environment jsdom
// 标准结构的出口节点：作者内容原样渲在出口处，不包部件；内容来自 outlet 回调，没给时出口处什么都没有。
import type { StructureChild } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderStructure } from '../src/runtime/structure'

function Label(props: { children?: ReactNode }): ReactNode {
  return <label data-label="">{props.children}</label>
}

function Hint(props: { children?: ReactNode }): ReactNode {
  return <p data-hint="">{props.children}</p>
}

const NODES: StructureChild[] = [
  { key: 'label', tag: 'label', part: 'label', text: '名称' },
  { key: 'control', outlet: true, slot: { name: 'control' } },
  { key: 'description', tag: 'p', part: 'description', text: '说明' },
]

let root: Root | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

async function render(control?: ReactNode): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(<div>{renderStructure(NODES, { label: Label, description: Hint }, undefined, {}, () => control)}</div>)
  })
  return host.firstElementChild as HTMLElement
}

describe('renderStructure 的出口节点（React）', () => {
  it('作者内容原样渲在出口处，夹在前后两个部件之间', async () => {
    const el = await render(<input aria-label="名称" />)
    expect(Array.from(el.children, node => node.localName)).toEqual(['label', 'input', 'p'])
  })

  it('没给内容时出口处什么都没有', async () => {
    const el = await render()
    expect(Array.from(el.children, node => node.localName)).toEqual(['label', 'p'])
  })
})
