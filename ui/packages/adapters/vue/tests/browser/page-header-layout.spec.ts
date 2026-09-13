/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 page header layout 相关行为。

import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function part(name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='page-header'][data-part='${name}']`)!
}

describe('page-header 信息层级', () => {
  it('窄屏标题与说明上下排列，操作区换到下一行', () => {
    host = document.createElement('div')
    host.innerHTML = `
      <header data-scope="page-header" data-part="root" style="inline-size:720px">
        <div data-scope="page-header" data-part="breadcrumb">首页 / 订单</div>
        <div data-scope="page-header" data-part="back-trigger">←</div>
        <div data-scope="page-header" data-part="media">◎</div>
        <h1 data-scope="page-header" data-part="title">订单 SO-20260731-004</h1>
        <p data-scope="page-header" data-part="description">创建于 2026 年 7 月 31 日</p>
        <div data-scope="page-header" data-part="extra">编辑</div>
        <div data-scope="page-header" data-part="footer">已支付</div>
      </header>
    `
    document.body.append(host)

    const title = part('title').getBoundingClientRect()
    const description = part('description').getBoundingClientRect()
    const extraElement = part('extra')
    const extra = extraElement.getBoundingClientRect()
    const footer = part('footer').getBoundingClientRect()

    expect(title.bottom).toBeLessThanOrEqual(description.top)
    expect(matchMedia('(max-width: 640px)').matches).toBe(true)
    expect(extra.top).toBeGreaterThanOrEqual(description.bottom)
    expect(getComputedStyle(extraElement).gridColumn).toBe('1 / -1')
    expect(footer.top).toBeGreaterThanOrEqual(extra.bottom)
  })

  it('省略返回位与媒体位时标题不保留空轨道间距', () => {
    host = document.createElement('div')
    host.innerHTML = `
      <header data-scope="page-header" data-part="root" style="inline-size:320px">
        <h1 data-scope="page-header" data-part="title">订单详情</h1>
      </header>
    `
    document.body.append(host)

    const root = part('root').getBoundingClientRect()
    const title = part('title').getBoundingClientRect()
    expect(title.left).toBe(root.left)
  })
})
