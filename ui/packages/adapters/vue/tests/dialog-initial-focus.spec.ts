// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhDialogContent, XhDialogRoot, XhDialogTitle } from '../src'

/**
 * alertdialog 此前把初始焦点写死在 content 容器上，作者无法指定落到哪个按钮。
 * 审批类对话框要求焦点默认落在拒绝一侧，缺这个入口就只能靠作者自己抢焦点。
 */

interface Mounted {
  root: HTMLElement
  unmount: () => void
}

const mounted: Array<() => void> = []

afterEach(() => {
  while (mounted.length) mounted.pop()?.()
  document.body.innerHTML = ''
})

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

function mountApproval(initialFocus?: string): Mounted {
  const host = document.createElement('div')
  document.body.appendChild(host)

  const app = createApp({
    setup: () => () =>
      h(
        XhDialogRoot,
        { defaultOpen: true, role: 'alertdialog', initialFocus },
        {
          default: () => [
            h(XhDialogContent, null, () => [
              h(XhDialogTitle, null, () => '删除数据库记录？'),
              h('button', { 'data-testid': 'approve' }, '允许'),
              h('button', { 'data-testid': 'deny' }, '拒绝'),
            ]),
          ],
        },
      ),
  })
  app.mount(host)
  const unmount = (): void => {
    app.unmount()
    host.remove()
  }
  mounted.push(unmount)
  return { root: host, unmount }
}

describe('dialog 的 initialFocus', () => {
  it('给了选择器就把焦点落在匹配的元素上，而不是 content 容器', async () => {
    mountApproval('[data-testid="deny"]')
    await tick()

    const deny = document.querySelector<HTMLElement>('[data-testid="deny"]')
    expect(deny).not.toBeNull()
    expect(document.activeElement).toBe(deny)
  })

  it('不给选择器时 alertdialog 维持原行为：焦点落在 content 容器', async () => {
    mountApproval()
    await tick()

    const content = document.querySelector<HTMLElement>('[data-part="content"]')
    expect(content).not.toBeNull()
    expect(document.activeElement).toBe(content)
  })

  it('选择器匹配不到时不抢焦点，回落到默认顺序而非停在 content 容器', async () => {
    mountApproval('[data-testid="nothing-here"]')
    await tick()

    const approve = document.querySelector<HTMLElement>('[data-testid="approve"]')
    expect(document.activeElement).toBe(approve)
  })

  it('选择器非法时只告警不抛，焦点回落默认顺序', async () => {
    mountApproval('[[[不是选择器')
    await tick()

    const approve = document.querySelector<HTMLElement>('[data-testid="approve"]')
    expect(document.activeElement).toBe(approve)
  })
})
