// @vitest-environment jsdom
// 头部摆在列表之外：作者把它写成 root 的前一个兄弟，元素照样给它身份。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

afterEach(() => {
  document.body.innerHTML = ''
})

describe('xh-descriptions 头部', () => {
  it('header / title / extra 写在 root 之外也接得上，头部带尺寸档', async () => {
    document.body.innerHTML = `
      <xh-descriptions size="lg">
        <div data-xh-part="header">
          <h3 data-xh-part="title">订单信息</h3>
          <div data-xh-part="extra"><button type="button">编辑</button></div>
        </div>
        <dl data-xh-part="root">
          <div data-xh-part="item"><dt data-xh-part="label">订单号</dt><dd data-xh-part="value">XH-0042</dd></div>
        </dl>
      </xh-descriptions>`
    const host = document.querySelector('xh-descriptions') as HTMLElement & { updateComplete: Promise<unknown> }
    await host.updateComplete
    const header = host.querySelector<HTMLElement>('[data-xh-part="header"]')!
    expect(header.dataset.scope).toBe('descriptions')
    expect(header.dataset.part).toBe('header')
    expect(header.dataset.size).toBe('lg')
    expect(host.querySelector<HTMLElement>('[data-xh-part="title"]')!.dataset.part).toBe('title')
    expect(host.querySelector<HTMLElement>('[data-xh-part="extra"]')!.dataset.part).toBe('extra')
  })
})
