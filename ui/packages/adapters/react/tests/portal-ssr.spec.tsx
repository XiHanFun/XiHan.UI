// @vitest-environment node
//
// 服务端没有 createPortal，而首屏即展开的浮层必须直出展开态：
// 正文要能被索引、也要能被读屏念到，渲成空占位等于把这一屏丢了。
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { XhPortal } from '../src'

describe('浮层的服务端直出', () => {
  it('就地渲染，不抛异常也不留空占位', () => {
    const html = renderToStaticMarkup(
      <div id="host"><XhPortal><span data-part="content">正文</span></XhPortal></div>,
    )
    expect(html).toContain('data-xh-portal-source=""')
    expect(html).toContain('data-xh-portal-shell=""')
    expect(html).toContain('data-part="content"')
    expect(html).toContain('正文')
  })
})
