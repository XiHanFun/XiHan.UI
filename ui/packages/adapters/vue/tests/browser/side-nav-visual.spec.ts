/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 side nav visual 相关行为。

import type { Size } from '@xihan-ui/core'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhSideNavItem,
  XhSideNavLink,
  XhSideNavLinkText,
  XhSideNavList,
  XhSideNavRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function fontSizeOf(size: Size): Promise<number> {
  app?.unmount()
  host?.remove()
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(
      XhSideNavRoot,
      { size, collection: [{ value: 'home', label: '首页' }] },
      () => h(XhSideNavList, null, () => h(
        XhSideNavItem,
        null,
        () => h(XhSideNavLink, { value: 'home' }, () => h(XhSideNavLinkText, null, () => '首页')),
      )),
    ),
  })
  app.mount(host)
  await nextTick()
  const link = host.querySelector<HTMLElement>('[data-scope="side-nav"][data-part="link"]')!
  return Number.parseFloat(getComputedStyle(link).fontSize)
}

describe('side-nav 尺寸层级', () => {
  it('小、中、大三档的行文字逐档增大', async () => {
    const sm = await fontSizeOf('sm')
    const md = await fontSizeOf('md')
    const lg = await fontSizeOf('lg')

    expect(sm).toBeLessThan(md)
    expect(md).toBeLessThan(lg)
  })
})
