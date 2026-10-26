// @vitest-environment jsdom
// xh-dialog / xh-drawer 不写部件时按标准结构生成：trigger-text、title-text、description 几个属性（或 slot 节点）
// 给出各段内容，页脚按 actions 铺取消与确定。确定发 confirm，confirmAction 返回 thenable 即挂起：
// 转圈、Escape 关不掉，兑现才收起；拒绝留在原地并发 confirm-error；取消发 cancel-press 并收起。

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface PanelHost extends HTMLElement {
  updateComplete: Promise<unknown>
  open?: boolean
  confirmAction?: () => void | PromiseLike<unknown>
  readonly pending: boolean
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: PanelHost): Promise<void> {
  for (let i = 0; i < 6; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(tag: 'xh-dialog' | 'xh-drawer', attrs: Record<string, string>, inner = ''): PanelHost {
  const el = document.createElement(tag) as PanelHost
  for (const [name, value] of Object.entries(attrs))
    el.setAttribute(name, value)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(scope: string, name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-dialog 生成结构', () => {
  it('trigger-text、title-text、description 三个属性生成确认对话框：页头、页脚的取消与确定、关闭钮', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount('xh-dialog', { 'default-open': '', 'trigger-text': '删除', 'title-text': '删除文件？', 'description': '删除后无法恢复。' })
    await settle(el)

    expect(part('dialog', 'trigger')!.textContent).toBe('删除')
    expect(partsOf(part('dialog', 'content')!)).toEqual(['header', 'footer', 'close-trigger'])
    expect(partsOf(part('dialog', 'header')!)).toEqual(['title', 'description'])
    expect(part('dialog', 'title')!.localName).toBe('h2')
    expect(part('dialog', 'title')!.textContent).toBe('删除文件？')
    expect(partsOf(part('dialog', 'footer')!)).toEqual(['cancel-trigger', 'confirm-trigger'])
    expect(part('dialog', 'cancel-trigger')!.textContent).toBe('Cancel')
    expect(part('dialog', 'confirm-trigger')!.textContent).toBe('OK')
    expect(part('dialog', 'confirm-trigger')!.getAttribute('data-xh-action-variant')).toBe('solid')
    expect(part('dialog', 'content')!.getAttribute('aria-labelledby')).toBe(part('dialog', 'title')!.id)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('actions="alert" 只生成确定，slot="body" 与 slot="footer" 的节点搬进正文与页脚', async () => {
    const alert = mount('xh-dialog', { 'default-open': '', 'title-text': '已保存', 'actions': 'alert', 'confirm-text': '知道了' })
    await settle(alert)
    expect(partsOf(part('dialog', 'footer')!)).toEqual(['confirm-trigger'])
    expect(part('dialog', 'confirm-trigger')!.textContent).toBe('知道了')
    expect(part('dialog', 'trigger')).toBeNull()
    alert.remove()

    const el = mount('xh-dialog', { 'default-open': '', 'title-text': '编辑' }, '<p slot="body">正文</p><button slot="footer" type="button">自定按钮</button>')
    await settle(el)
    expect(part('dialog', 'body')!.textContent).toBe('正文')
    expect(part('dialog', 'footer')!.textContent).toBe('自定按钮')
    expect(part('dialog', 'confirm-trigger')).toBeNull()
  })

  it('确定发 confirm 并收起；取消发 cancel-press 并收起', async () => {
    const el = mount('xh-dialog', { 'default-open': '', 'title-text': '确认' })
    const confirm = vi.fn()
    const cancel = vi.fn()
    const openChange = vi.fn()
    el.addEventListener('confirm', confirm)
    el.addEventListener('cancel-press', cancel)
    el.addEventListener('open-change', event => openChange((event as CustomEvent).detail))
    await settle(el)
    part('dialog', 'confirm-trigger')!.click()
    await settle(el)
    expect(confirm).toHaveBeenCalledTimes(1)
    expect(openChange).toHaveBeenLastCalledWith(expect.objectContaining({ open: false }))

    el.open = true
    await settle(el)
    part('dialog', 'cancel-trigger')!.click()
    await settle(el)
    expect(cancel).toHaveBeenCalledTimes(1)
  })

  it('confirmAction 返回 thenable：挂起时转圈、Escape 关不掉，兑现才收起；拒绝留在原地并发 confirm-error', async () => {
    const el = mount('xh-dialog', { 'default-open': '', 'title-text': '提交' })
    let settleAction: { resolve: () => void, reject: (cause: unknown) => void } | undefined
    el.confirmAction = () => new Promise<void>((resolve, reject) => {
      settleAction = { resolve, reject }
    })
    const errors = vi.fn()
    const openChange = vi.fn()
    el.addEventListener('confirm-error', event => errors((event as CustomEvent).detail))
    el.addEventListener('open-change', event => openChange((event as CustomEvent).detail))
    await settle(el)

    part('dialog', 'confirm-trigger')!.click()
    await settle(el)
    expect(el.pending).toBe(true)
    expect(part('dialog', 'confirm-trigger')!.hasAttribute('data-loading')).toBe(true)
    part('dialog', 'content')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await settle(el)
    expect(openChange).not.toHaveBeenCalled()

    settleAction!.reject(new Error('网络错误'))
    await settle(el)
    expect(errors).toHaveBeenCalledWith({ cause: new Error('网络错误') })
    expect(el.pending).toBe(false)
    expect(openChange).not.toHaveBeenCalled()

    part('dialog', 'confirm-trigger')!.click()
    await settle(el)
    settleAction!.resolve()
    await settle(el)
    expect(openChange).toHaveBeenLastCalledWith(expect.objectContaining({ open: false }))
  })
})

describe('xh-drawer 生成结构', () => {
  it('生成的部件铺在 root 里，与对话框同一份面板结构；resizable 时 content 末尾是改尺把手', async () => {
    const el = mount('xh-drawer', { 'default-open': '', 'trigger-text': '筛选', 'title-text': '筛选条件', 'resizable': '' }, '<form slot="body">条件</form>')
    await settle(el)
    expect(partsOf(part('drawer', 'root')!).slice(0, 1)).toEqual(['trigger'])
    expect(partsOf(part('drawer', 'content')!)).toEqual(['header', 'body', 'footer', 'close-trigger', 'resize-trigger'])
    expect(partsOf(part('drawer', 'footer')!)).toEqual(['cancel-trigger', 'confirm-trigger'])
  })
})
