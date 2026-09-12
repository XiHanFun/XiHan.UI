// @vitest-environment node

import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { XhDatePickerContent, XhDatePickerControl, XhDatePickerPositioner, XhDatePickerRoot } from '../src'
import { XhPortal } from '../src/runtime/portal'

describe('vue Portal 的服务端输出', () => {
  it('逻辑位置保留 source，teleport 内容带同构 shell 与正文', async () => {
    const context: { teleports?: Record<string, string> } = {}
    const html = await renderToString(createSSRApp({
      render: () => h('main', null, [
        h(XhPortal, { to: 'body' }, () => h('span', { 'data-part': 'content' }, '正文')),
      ]),
    }), context)

    expect(html).toContain('data-xh-portal-source')
    expect(context.teleports?.body).toContain('data-xh-portal-shell')
    expect(context.teleports?.body).toContain('data-part="content"')
    expect(context.teleports?.body).toContain('正文')
  })

  it('date-picker 初始 open 在服务端以客户端未就绪阶段的同一结构原地输出面板', async () => {
    const context: { teleports?: Record<string, string> } = {}
    const html = await renderToString(createSSRApp({
      render: () => h(XhDatePickerRoot, { open: true }, () => [
        h(XhDatePickerControl),
        h(XhDatePickerPositioner, null, () => h(XhDatePickerContent, null, () => '日期面板')),
      ]),
    }), context)

    expect(html).toContain('data-scope="date-picker"')
    expect(html).toContain('data-part="root"')
    expect(html).toContain('data-xh-portal-shell')
    expect(html).toContain('data-part="content"')
    expect(html.match(/日期面板/g)).toHaveLength(1)
    expect(context.teleports?.body).not.toContain('data-xh-portal-shell')
    expect(context.teleports?.body).not.toContain('日期面板')
  })
})
