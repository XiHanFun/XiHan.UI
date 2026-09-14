// @vitest-environment jsdom
// StrictMode 下作者 Loading 的登记/释放必须成对；业务包装与条件卸载都不能留下双节点或空态。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhCascaderContent, XhCascaderLoading, XhCascaderRoot } from '../src'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

let host: HTMLElement | null = null
let root: Root | null = null

function BusinessWrapper({ children }: { children: ReactNode }): ReactNode {
  return <section>{children}</section>
}

function Tree({ authored }: { authored: boolean }): ReactNode {
  return (
    <StrictMode>
      <XhCascaderRoot collection={[]} defaultOpen loading translations={{ loading: '正在读取地区' }}>
        <XhCascaderContent>
          {authored
            ? <BusinessWrapper><XhCascaderLoading>作者正在同步</XhCascaderLoading></BusinessWrapper>
            : null}
        </XhCascaderContent>
      </XhCascaderRoot>
    </StrictMode>
  )
}

async function render(authored: boolean): Promise<void> {
  if (!root) {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  }
  await act(async () => root!.render(<Tree authored={authored} />))
}

afterEach(async () => {
  if (root)
    await act(async () => root!.unmount())
  host?.remove()
  root = null
  host = null
})

describe('cascader Loading 客户端登记', () => {
  it('业务包装下只保留作者节点，条件卸载后恢复唯一自动节点', async () => {
    await render(true)
    let loadings = document.querySelectorAll<HTMLElement>('[data-scope="cascader"][data-part="loading"]')
    expect(loadings).toHaveLength(1)
    expect(loadings[0]!.textContent).toBe('作者正在同步')

    await render(false)
    loadings = document.querySelectorAll<HTMLElement>('[data-scope="cascader"][data-part="loading"]')
    expect(loadings).toHaveLength(1)
    expect(loadings[0]!.hasAttribute('data-xh-cascader-auto-loading')).toBe(true)
    expect(loadings[0]!.textContent).toBe('正在读取地区')
  })
})
