// @vitest-environment jsdom
//
// 带浮层的真组件走一遍「服务端直出 → 水合」：服务端没有 document，落点就地渲染；客户端首帧就把内容搬进 body。
// portal-hydrate.spec.tsx 拿裸 XhPortal 验过不重影、不报错，这里换成真组件：
// 水合不报错、浮层内容不出现两份，水合之后照常开得出来。
import type { ReactElement } from 'react'
import { act } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { XhPopoverContent, XhPopoverPositioner, XhPopoverRoot, XhPopoverTrigger, XhSelectRoot, XhTreeSelectRoot } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof hydrateRoot> | null = null

afterEach(() => {
  if (root)
    act(() => root!.unmount())
  root = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

/** 服务端那一半：把 document 藏起来再渲染，组件里的 DOM 分支走服务端那条路。 */
function serverRender(tree: ReactElement): string {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document')!
  Object.defineProperty(globalThis, 'document', { configurable: true, value: undefined })
  try {
    return renderToString(tree)
  }
  finally {
    Object.defineProperty(globalThis, 'document', descriptor)
  }
}

function hydrate(tree: ReactElement): { errors: unknown[] } {
  const html = serverRender(tree)
  // 服务端那一半真走了就地渲染：浮层的实例壳留在原位，没被搬走
  expect(html).toContain('data-xh-portal-shell')
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  const errors: unknown[] = []
  const original = console.error
  console.error = (...args: unknown[]) => void errors.push(args)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  try {
    act(() => {
      root = hydrateRoot(host!, tree, { onRecoverableError: error => void errors.push(error) })
    })
  }
  finally {
    console.error = original
  }
  return { errors }
}

function count(scope: string, part: string): number {
  return document.querySelectorAll(`[data-scope="${scope}"][data-part="${part}"]`).length
}

const fruits = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
]

const files = [
  { value: 'docs', label: 'docs', children: [{ value: 'guide', label: 'guide.md' }] },
  { value: 'src', label: 'src' },
]

describe('带浮层的组件水合', () => {
  it('下拉选择：水合零报错，内容只有一份，水合后点开照常展开', () => {
    const { errors } = hydrate(<XhSelectRoot collection={fruits} label="水果" placeholder="请选择" />)
    expect(errors).toEqual([])
    expect(count('select', 'content')).toBe(1)
    const trigger = document.querySelector<HTMLElement>('[data-scope="select"][data-part="trigger"]')!
    act(() => trigger.click())
    expect(document.querySelector('[data-scope="select"][data-part="content"]')!.getAttribute('data-state')).toBe('open')
  })

  it('树选择：水合零报错，内容只有一份，水合后点开照常展开', () => {
    const { errors } = hydrate(<XhTreeSelectRoot collection={files} label="文件" placeholder="请选择" />)
    expect(errors).toEqual([])
    expect(count('tree-select', 'content')).toBe(1)
    const trigger = document.querySelector<HTMLElement>('[data-scope="tree-select"][data-part="trigger"]')!
    act(() => trigger.click())
    expect(document.querySelector('[data-scope="tree-select"][data-part="content"]')!.getAttribute('data-state')).toBe('open')
  })

  it('挂载时就开着的气泡卡片：水合零报错，正文只有一份', () => {
    const { errors } = hydrate(
      <XhPopoverRoot defaultOpen>
        <XhPopoverTrigger>打开</XhPopoverTrigger>
        <XhPopoverPositioner>
          <XhPopoverContent>正文</XhPopoverContent>
        </XhPopoverPositioner>
      </XhPopoverRoot>,
    )
    expect(errors).toEqual([])
    expect(count('popover', 'content')).toBe(1)
  })
})
