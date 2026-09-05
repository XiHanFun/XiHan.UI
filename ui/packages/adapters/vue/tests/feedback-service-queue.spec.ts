// @vitest-environment jsdom
// 轻提示与通知合用同一台队列机器之后新出的那几样：行内动作、合并计数、
// 优先级挤条、整摞暂停与 promise 三态。
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createNotificationService, createToastService } from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

function partOf(scope: string, name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('轻提示的行内动作', () => {
  it('给了文案才出那颗钮，按下去查服务侧那张回调表', async () => {
    const toast = createToastService()
    let pressed = 0
    toast.info('已删除', { duration: 0, actionLabel: '撤销', onAction: () => void (pressed += 1) })
    await tick()
    const action = partOf('toast', 'action-trigger')
    expect(action?.textContent).toBe('撤销')
    action!.click()
    await tick()
    expect(pressed).toBe(1)
    toast.dispose()
  })

  it('不给文案就不渲染那个部件', async () => {
    const toast = createToastService()
    toast.info('普通一条', { duration: 0 })
    await tick()
    expect(partOf('toast', 'action-trigger')).toBeNull()
    toast.dispose()
  })
})

describe('轻提示的队列口径', () => {
  it('dedupe=content：同一句话并成一条，标题后追加计数', async () => {
    const toast = createToastService({ dedupe: 'content' })
    toast.error('同步失败', { duration: 0 })
    toast.error('同步失败', { duration: 0 })
    toast.error('同步失败', { duration: 0 })
    await tick()
    const roots = document.querySelectorAll('[data-scope="toast"][data-part="root"]')
    expect(roots.length).toBe(1)
    expect(partOf('toast', 'title')?.textContent).toBe('同步失败 ×3')
    toast.dispose()
  })

  it('一条报错不会被随后的提示挤掉', async () => {
    const toast = createToastService({ max: 2 })
    toast.error('同步失败', { duration: 0 })
    toast.info('第一条', { duration: 0 })
    toast.info('第二条', { duration: 0 })
    await tick()
    expect(document.body.textContent).toContain('同步失败')
    expect(document.body.textContent).toContain('第二条')
    expect(document.body.textContent ?? '').not.toContain('第一条')
    toast.dispose()
  })
})

describe('整摞一起按住计时', () => {
  it('pauseAll 让条子落到暂停态，resumeAll 放开', async () => {
    const toast = createToastService()
    toast.info('一条')
    await tick()
    expect(partOf('toast', 'root')?.hasAttribute('data-paused')).toBe(false)

    toast.pauseAll()
    await tick()
    expect(partOf('toast', 'root')?.hasAttribute('data-paused')).toBe(true)

    toast.resumeAll()
    await tick()
    expect(partOf('toast', 'root')?.hasAttribute('data-paused')).toBe(false)
    toast.dispose()
  })

  it('按住之后新来的那条同样起手就停', async () => {
    const toast = createToastService()
    toast.pauseAll()
    toast.info('后到的')
    await tick()
    expect(partOf('toast', 'root')?.hasAttribute('data-paused')).toBe(true)
    toast.dispose()
  })

  it('通知那边同样按得住', async () => {
    const notify = createNotificationService()
    notify.info('一条')
    await tick()
    notify.pauseAll()
    await tick()
    expect(partOf('notification', 'item')?.hasAttribute('data-paused')).toBe(true)
    notify.dispose()
  })
})

describe('promise 三态', () => {
  it('落定后就地改写成 success，结果原样交回', async () => {
    const toast = createToastService()
    let release: (value: number) => void = () => {}
    const gate = new Promise<number>((resolve) => {
      release = resolve
    })
    const answer = toast.promise(gate, {
      loading: '上传中',
      success: value => `上传完成 ${value}`,
      error: '上传失败',
    })
    await tick()
    expect(partOf('toast', 'title')?.textContent).toBe('上传中')
    release(7)
    await expect(answer).resolves.toBe(7)
    await tick()
    expect(partOf('toast', 'title')?.textContent).toBe('上传完成 7')
    toast.dispose()
  })

  it('拒绝时改写成 error，拒绝照旧往外抛', async () => {
    const toast = createToastService()
    const answer = toast.promise(() => Promise.reject(new Error('后端 500')), {
      loading: '提交中',
      success: '提交完成',
      error: reason => `提交失败：${(reason as Error).message}`,
    })
    await expect(answer).rejects.toThrow('后端 500')
    await tick()
    expect(partOf('toast', 'title')?.textContent).toBe('提交失败：后端 500')
    expect(partOf('toast', 'root')?.getAttribute('data-severity')).toBe('error')
    toast.dispose()
  })
})

describe('通知的行内动作', () => {
  it('给了文案才出那颗钮', async () => {
    const notify = createNotificationService()
    let pressed = 0
    notify.info('有新的审批', { duration: 0, actionLabel: '去处理', onAction: () => void (pressed += 1) })
    await tick()
    const action = partOf('notification', 'item-action-trigger')
    expect(action?.textContent).toBe('去处理')
    action!.click()
    await tick()
    expect(pressed).toBe(1)
    notify.dispose()
  })
})
