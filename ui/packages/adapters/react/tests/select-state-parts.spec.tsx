// @vitest-environment jsdom
// 不写 children 时浮层里铺空态、在途、取数失败的提示与重试钮；空态文字取 empty，非文字内容整块接管。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhSelectRoot } from '../src'

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

async function mount(empty?: ReactNode, flags: { loading?: boolean, error?: boolean } = {}): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(<XhSelectRoot collection={[]} empty={empty} {...flags} />)
  })
  return host
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="select"][data-part="${name}"]`)!
}

describe('select 浮层里的状态部件', () => {
  it('铺在列表之后，文字取 translations，按状态收放', async () => {
    await mount()
    const content = part('content')
    expect(Array.from(content.children, el => el.getAttribute('data-part'))).toEqual(['list', 'empty', 'loading', 'error', 'retry-trigger'])
    expect(['empty', 'loading', 'error', 'retry-trigger'].map(name => part(name).textContent)).toEqual(['No data', 'Loading', 'Couldn’t load options', 'Retry'])
    expect(['empty', 'loading', 'error', 'retry-trigger'].filter(name => !part(name).hidden)).toEqual(['empty'])
  })

  it('取数失败时露出提示与重试钮', async () => {
    await mount(undefined, { error: true })
    expect(['empty', 'loading', 'error', 'retry-trigger'].filter(name => !part(name).hidden)).toEqual(['error', 'retry-trigger'])
  })

  it('empty 是文字时写进 empty，是节点时整块接管', async () => {
    await mount('没有水果')
    expect(part('empty').textContent).toBe('没有水果')
    act(() => root?.unmount())
    document.body.innerHTML = ''
    await mount(<strong>空空如也</strong>)
    expect(part('empty').querySelector('strong')!.textContent).toBe('空空如也')
  })
})
