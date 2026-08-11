// @vitest-environment node
//
// 这份用例必须跑在真正没有 document 的宿主里。jsdom 下 `typeof document !== 'undefined'`
// 成立，浮层的 DOM 分支照常执行，服务端这一半根本测不出来。

import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import {
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhDrawerContent,
  XhDrawerRoot,
  XhDrawerTitle,
  XhPopoverContent,
  XhPopoverRoot,
  XhPopoverTrigger,
} from '../src'

/**
 * 首屏即展开的浮层，服务端要把展开态直出。
 * dialog 与 drawer 曾把 rendered 的初值圈在「有 document」的分支里，服务端算不出它，
 * 只发一个 23 字节的空占位：首屏没有对话框、没有可被索引与读屏读到的正文，
 * 客户端水合时再整棵补出来。
 */

const CASES = [
  {
    name: 'dialog defaultOpen',
    render: () => h(XhDialogRoot, { defaultOpen: true }, {
      default: () => [h(XhDialogContent, null, () => [h(XhDialogTitle, null, () => '标题')])],
    }),
  },
  {
    name: 'drawer defaultOpen',
    render: () => h(XhDrawerRoot, { defaultOpen: true }, {
      default: () => [h(XhDrawerContent, null, () => [h(XhDrawerTitle, null, () => '标题')])],
    }),
  },
  {
    name: 'popover defaultOpen',
    render: () => h(XhPopoverRoot, { defaultOpen: true }, {
      default: () => [
        h(XhPopoverTrigger, null, () => '打开'),
        h(XhPopoverContent, null, () => '标题'),
      ],
    }),
  },
]

describe.each(CASES)('$name 的服务端直出', ({ render }) => {
  it('产出展开态的完整标记，而不是空占位', async () => {
    const ctx: { teleports?: Record<string, string> } = {}
    const html = await renderToString(createSSRApp({ setup: () => () => render() }), ctx)
    // 浮层族有的就地渲染、有的 Teleport 到 body，两处合起来才是这一屏的全部标记
    const markup = html + (ctx.teleports?.body ?? '')

    expect(markup).toMatch(/data-part="content"[^>]*data-state="open"/)
    expect(markup).toContain('标题')
  })
})

describe('关着的浮层', () => {
  it('服务端不直出内容', async () => {
    const ctx: { teleports?: Record<string, string> } = {}
    const html = await renderToString(
      createSSRApp({
        setup: () => () => h(XhDialogRoot, null, {
          default: () => [h(XhDialogContent, null, () => [h(XhDialogTitle, null, () => '标题')])],
        }),
      }),
      ctx,
    )
    expect(html + (ctx.teleports?.body ?? '')).not.toContain('data-part="content"')
  })
})
