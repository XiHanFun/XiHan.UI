// @vitest-environment jsdom
//
// 进度条按形态分两套结构：线形是轨道套进度，环形是一张 <svg> 里两个 <circle>，
// 环心那一块只在作者给了内容时才渲。共享一致性套件咬不到这一层——它的 fixture 只有一个
// root 节点、也不给 children，环形那一整条分支一次都走不到。写错了套件照样全绿：
// 环形会渲成一条线，或者一个空盒子压在环上把指针挡住。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhProgress } from '../src'

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

function mount(node: React.ReactNode): void {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(node))
}

/** 某个部件的节点，按文档序。 */
function parts(part: string): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>(`[data-scope="progress"][data-part="${part}"]`)]
}

function tagOf(part: string, index = 0): string | undefined {
  return parts(part)[index]?.tagName.toLowerCase()
}

describe('progress 的形态分支', () => {
  it('线形：轨道与进度都是 div，不渲画布也不渲环心', () => {
    mount(<XhProgress value={50} aria-label="上传进度" />)
    expect(tagOf('track')).toBe('div')
    expect(tagOf('range')).toBe('div')
    expect(parts('canvas')).toHaveLength(0)
    expect(parts('label')).toHaveLength(0)
  })

  it('环形：画布是 svg，轨道与进度都是 circle', () => {
    mount(<XhProgress value={50} variant="circle" aria-label="上传进度" />)
    expect(tagOf('canvas')).toBe('svg')
    expect(tagOf('track')).toBe('circle')
    expect(tagOf('range')).toBe('circle')
  })

  it('环心不给内容就不渲那一层，免得空盒子压在环上挡住指针', () => {
    mount(<XhProgress value={50} variant="circle" aria-label="上传进度">{false}</XhProgress>)
    expect(parts('label')).toHaveLength(0)
  })

  it('环心给了内容才渲，内容原样落进去', () => {
    mount(<XhProgress value={50} variant="dashboard" aria-label="上传进度">50%</XhProgress>)
    expect(parts('label')).toHaveLength(1)
    expect(parts('label')[0]!.textContent).toBe('50%')
  })
})
