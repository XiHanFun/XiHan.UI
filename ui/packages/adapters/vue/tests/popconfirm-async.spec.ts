// @vitest-environment jsdom
// popconfirm 异步确认门：onConfirm 返回 Promise 即挂起——浮层等兑现才收、
// 确认按钮 data-loading 且再点无效；落空留在原地；取消把在途结果作废。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
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

function mountPop(onConfirm: () => void | Promise<unknown>): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhPopconfirmRoot, { onConfirm }, () => [
        h(XhPopconfirmTrigger, () => '删除'),
        h(XhPopconfirmPositioner, null, () => [
          h(XhPopconfirmContent, null, () => [
            h(XhPopconfirmTitle, () => '确定吗'),
            h(XhPopconfirmDescription, () => '删了就没了'),
            h(XhPopconfirmCancelTrigger, () => '再想想'),
            h(XhPopconfirmConfirmTrigger, () => '确定'),
          ]),
        ]),
      ]),
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

    el(CONFIRM).click()
    await tick()
    expect(onConfirm).toHaveBeenCalledTimes(1)

    release()
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(true)
    expect(el(CONFIRM).hasAttribute('data-loading')).toBe(false)
  })

  it('落空（reject）留在原地，挂起解除', async () => {
    let fail!: (e: unknown) => void
    mountPop(() => new Promise<void>((_r, rej) => {
      fail = rej
    }))
    await tick()
    el('[data-part="trigger"]').click()
    await tick()
    el(CONFIRM).click()
    await tick()
    fail(new Error('后端说不行'))
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)
    expect(el(CONFIRM).hasAttribute('data-loading')).toBe(false)
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
})
