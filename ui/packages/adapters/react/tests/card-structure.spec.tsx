// @vitest-environment jsdom
// 不给 children 时照 cardStructure 铺：给了哪段内容才铺哪一段，与手写全套部件同一棵树。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhCardContent, XhCardDescription, XhCardFooter, XhCardHeader, XhCardRoot, XhCardTitle } from '../src'

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

async function render(node: React.ReactNode): Promise<HTMLElement> {
  act(() => root?.unmount())
  document.body.innerHTML = ''
  const host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(node)
  })
  return host
}

function skeleton(host: Element): string[] {
  return Array.from(host.querySelectorAll('[data-scope="card"][data-part]'), el => `${el.localName}|${el.getAttribute('data-part')}|${el.textContent}`)
}

describe('card 的标准结构', () => {
  it('title、description、content、footer 铺出页头（标题、说明）、正文与页脚，与手写全套部件一致', async () => {
    const auto = skeleton(await render(<XhCardRoot title="订单" description="最近 30 天" content="共 12 笔" footer="查看全部" />))
    const manual = skeleton(await render(
      <XhCardRoot>
        <XhCardHeader>
          <XhCardTitle>订单</XhCardTitle>
          <XhCardDescription>最近 30 天</XhCardDescription>
        </XhCardHeader>
        <XhCardContent>共 12 笔</XhCardContent>
        <XhCardFooter>查看全部</XhCardFooter>
      </XhCardRoot>,
    ))
    expect(auto).toEqual(manual)
    expect(auto.map(row => row.split('|')[1])).toEqual(['root', 'header', 'title', 'description', 'content', 'footer'])
  })

  it('只给了正文就只铺正文，不铺空页头', async () => {
    const host = await render(<XhCardRoot content="只有正文" />)
    expect(skeleton(host).map(row => row.split('|')[1])).toEqual(['root', 'content'])
  })
})
