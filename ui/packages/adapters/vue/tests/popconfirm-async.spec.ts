// @vitest-environment jsdom
// popconfirm 异步确认门：onConfirm 返回 thenable 即挂起——浮层等兑现才收、
// 确认按钮 data-loading 且再点无效；拒绝留在原地；取消把在途结果作废。
import type { PopconfirmConfirmErrorDetails, PopconfirmNotifiers } from '@xihan-ui/headless'
import type { Ref } from 'vue'
import type { PopconfirmRootSlotProps } from '../src'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhPopconfirmCancelTrigger,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmDescription,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTitle,
  XhPopconfirmTrigger,
} from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

function mountPop(
  onConfirm: NonNullable<PopconfirmNotifiers['onConfirm']>,
  onConfirmError?: (details: PopconfirmConfirmErrorDetails) => void,
  controlledOpen?: Ref<boolean>,
  onOpenChange?: PopconfirmNotifiers['onOpenChange'],
): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhPopconfirmRoot, {
        open: controlledOpen?.value,
        onOpenChange,
        onConfirm,
        onConfirmError,
      }, { default: ({ actionError, setOpen }: PopconfirmRootSlotProps) => [
        h('button', { 'data-programmatic-close': '', 'type': 'button', 'onClick': () => setOpen(false) }, '程序收起'),
        h('output', { 'data-action-error': actionError ? 'true' : 'false' }),
        h(XhPopconfirmTrigger, () => '删除'),
        h(XhPopconfirmPositioner, null, () => [
          h(XhPopconfirmContent, null, () => [
            h(XhPopconfirmTitle, () => '确定吗'),
            h(XhPopconfirmDescription, () => '删了就没了'),
            h(XhPopconfirmCancelTrigger, () => '再想想'),
            h(XhPopconfirmConfirmTrigger, () => '确定'),
          ]),
        ]),
      ] }),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

const CONTENT = '[data-scope="popconfirm"][data-part="content"]'
const CONFIRM = '[data-scope="popconfirm"][data-part="confirm-trigger"]'

describe('popconfirm 异步确认门', () => {
  it('挂起期间浮层不收、按钮转圈、再点无效；兑现即收起', async () => {
    let release!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((r) => {
      release = r
    }))
    mountPop(onConfirm)
    await tick()
    el('[data-part="trigger"]').click()
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)

    el(CONFIRM).click()
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)
    expect(el(CONFIRM).hasAttribute('data-loading')).toBe(true)
    expect(el(CONFIRM).getAttribute('aria-busy')).toBe('true')
    expect(el(CONFIRM).getAttribute('aria-disabled')).toBe('true')

    el(CONFIRM).click()
    el(CONFIRM).click()
    el('[data-programmatic-close]').click()
    el('[data-part="trigger"]').click()
    el(CONTENT).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    document.body.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', button: 0, bubbles: true, cancelable: true }))
    await tick()
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)

    release()
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(true)
    expect(el(CONFIRM).hasAttribute('data-loading')).toBe(false)
  })

  it('落空（reject）留在原地，挂起解除并把原始 cause 同步给状态与 confirm-error', async () => {
    let fail!: (e: unknown) => void
    const errors: PopconfirmConfirmErrorDetails[] = []
    mountPop(() => new Promise<void>((_r, rej) => {
      fail = rej
    }), details => errors.push(details))
    await tick()
    el('[data-part="trigger"]').click()
    await tick()
    el(CONFIRM).click()
    await tick()
    const cause = new Error('后端说不行')
    fail(cause)
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)
    expect(el(CONFIRM).hasAttribute('data-loading')).toBe(false)
    expect(el('[data-action-error]').getAttribute('data-action-error')).toBe('true')
    expect(errors).toHaveLength(1)
    expect(errors[0]?.cause).toBe(cause)
  })

  it('同步抛错也留在原地并暴露原始 cause', async () => {
    const cause = new Error('同步失败')
    const errors: PopconfirmConfirmErrorDetails[] = []
    mountPop(() => {
      throw cause
    }, details => errors.push(details))
    await tick()
    el('[data-part="trigger"]').click()
    await tick()
    el(CONFIRM).click()
    await tick()

    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)
    expect(el('[data-action-error]').getAttribute('data-action-error')).toBe('true')
    expect(errors[0]?.cause).toBe(cause)
  })

  it('挂起中点取消：立即收起，在途兑现不再翻案', async () => {
    let release!: () => void
    mountPop(() => new Promise<void>((r) => {
      release = r
    }))
    await tick()
    el('[data-part="trigger"]').click()
    await tick()
    el(CONFIRM).click()
    await tick()
    el('[data-part="cancel-trigger"]').click()
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(true)
    expect(el(CONFIRM).hasAttribute('data-loading')).toBe(false)

    release()
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(true)
  })

  it('同步 onConfirm 照旧立即收起', async () => {
    const onConfirm = vi.fn()
    mountPop(onConfirm)
    await tick()
    el('[data-part="trigger"]').click()
    await tick()
    el(CONFIRM).click()
    await tick()
    expect(onConfirm).toHaveBeenCalled()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(true)
  })

  it('受控宿主关闭再重开会解除 pending，旧兑现不再发关闭意图', async () => {
    let release!: () => void
    const open = ref(true)
    const openChanges = vi.fn()
    mountPop(() => new Promise<void>((resolve) => {
      release = resolve
    }), undefined, open, openChanges)
    await tick()
    el(CONFIRM).click()
    await tick()
    expect(el(CONFIRM).hasAttribute('data-loading')).toBe(true)

    open.value = false
    await tick()
    open.value = true
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)
    expect(el(CONFIRM).hasAttribute('data-loading')).toBe(false)

    release()
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)
    expect(openChanges).not.toHaveBeenCalled()
  })
})
