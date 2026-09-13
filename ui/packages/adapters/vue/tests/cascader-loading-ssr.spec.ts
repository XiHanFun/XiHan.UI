/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 cascader loading ssr 相关行为。

// @vitest-environment node
// 作者 Loading 即使隔着业务组件，服务端直出也只能有一枚状态节点。
import type { VNode } from 'vue'
import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { XhCascaderContent, XhCascaderLoading, XhCascaderRoot } from '../src'

const BusinessWrapper = defineComponent({
  name: 'BusinessWrapper',
  setup(_, { slots }) {
    return () => h('section', slots.default?.())
  },
})

async function render(authored: boolean): Promise<string> {
  const app = createSSRApp({
    render: (): VNode => h(XhCascaderRoot, {
      collection: [],
      defaultOpen: true,
      loading: true,
      translations: { loading: '正在读取地区' },
    }, () => h(XhCascaderContent, null, () => authored
      ? h(BusinessWrapper, null, () => h(XhCascaderLoading, null, () => '作者正在同步'))
      : null)),
  })
  return renderToString(app)
}

describe('cascader Loading 服务端装配', () => {
  it('无作者部件时直出默认翻译，有业务包装时只直出作者部件', async () => {
    const automatic = await render(false)
    expect(automatic.match(/data-part="loading"/g)).toHaveLength(1)
    expect(automatic).toContain('data-xh-cascader-auto-loading')
    expect(automatic).toContain('正在读取地区')

    const authored = await render(true)
    expect(authored.match(/data-part="loading"/g)).toHaveLength(1)
    expect(authored).not.toContain('data-xh-cascader-auto-loading')
    expect(authored).toContain('作者正在同步')
  })
})
