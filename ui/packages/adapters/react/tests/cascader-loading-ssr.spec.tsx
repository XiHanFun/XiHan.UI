// @vitest-environment node
// 作者 Loading 即使隔着业务组件，服务端直出也只能有一枚状态节点。
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { XhCascaderContent, XhCascaderLoading, XhCascaderRoot } from '../src'

function BusinessWrapper({ children }: { children: ReactNode }): ReactNode {
  return <section>{children}</section>
}

function render(authored: boolean): string {
  return renderToStaticMarkup(
    <XhCascaderRoot collection={[]} defaultOpen loading translations={{ loading: '正在读取地区' }}>
      <XhCascaderContent>
        {authored
          ? <BusinessWrapper><XhCascaderLoading>作者正在同步</XhCascaderLoading></BusinessWrapper>
          : null}
      </XhCascaderContent>
    </XhCascaderRoot>,
  )
}

describe('cascader Loading 服务端装配', () => {
  it('无作者部件时直出默认翻译，有业务包装时只直出作者部件', () => {
    const automatic = render(false)
    expect(automatic.match(/data-part="loading"/g)).toHaveLength(1)
    expect(automatic).toContain('data-xh-cascader-auto-loading')
    expect(automatic).toContain('正在读取地区')

    const authored = render(true)
    expect(authored.match(/data-part="loading"/g)).toHaveLength(1)
    expect(authored).not.toContain('data-xh-cascader-auto-loading')
    expect(authored).toContain('作者正在同步')
  })
})
