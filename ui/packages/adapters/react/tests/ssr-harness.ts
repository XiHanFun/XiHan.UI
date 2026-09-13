/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 ssr harness 相关行为。

import type { Fixture } from '@xihan-ui/testing'
import type { SsrHarness } from '@xihan-ui/testing/ssr'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { renderFixtureChildren, resolveRoot } from './fixture-element'

/**
 * React 的服务端直出宿主。
 * 不挂 DOM、不接对外事件监听器：服务端只渲一帧，没有交互也没有回调。
 */
export function createReactSsrHarness(): SsrHarness {
  return {
    adapterName: 'react',
    async renderToString(fixture: Fixture) {
      const Root = resolveRoot(fixture.component)
      return renderToStaticMarkup(createElement(
        Root,
        { ...fixture.tree.attrs, ...fixture.props },
        renderFixtureChildren(fixture.tree.children, fixture.component),
      ))
    },
  }
}
