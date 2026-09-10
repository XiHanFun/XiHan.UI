// @vitest-environment jsdom
//
// 三个反馈类命令式服务：从组件树之外调起，自带宿主树。
// 这一层没有共享套件可用（套件描述的是组件的 DOM 契约，服务是另一层），只能自己钉。
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createLoadingBarService, createNotificationService, createToastService } from '../src'

let dispose: Array<() => void> = []

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  for (const fn of dispose) fn()
  dispose = []
  document.body.innerHTML = ''
  vi.useRealTimers()
})

/** 服务的宿主树在 React 之外，推一拍让它把这次状态渲出来。 */
async function settle(): Promise<void> {
  await act(async () => {
    await Promise.resolve()
  })
}

const toasts = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[data-scope="toast"][data-part="root"]')]
const cards = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[data-scope="notification"][data-part="item"]')]
function titleTexts(nodes: HTMLElement[]): string[] {
  return nodes.map(n => n.querySelector('[data-part="title"]')?.textContent?.trim() ?? '')
}

describe('轻提示服务', () => {
  it('入队即渲染，类型糖带上语气', async () => {
    const toast = createToastService()
    dispose.push(() => toast.dispose())
    toast.success('保存好了')
    await settle()
    expect(toasts()).toHaveLength(1)
    expect(titleTexts(toasts())).toEqual(['保存好了'])
    expect(toasts()[0]!.getAttribute('data-severity')).toBe('success')
  })

  it('dismiss 把那一条删掉', async () => {
    const toast = createToastService()
    dispose.push(() => toast.dispose())
    const id = toast.info('一')
    toast.info('二')
    await settle()
    expect(toasts()).toHaveLength(2)
    toast.dismiss(id)
    await settle()
    expect(titleTexts(toasts())).toEqual(['二'])
  })

  it('超过 max 的挤掉最旧的', async () => {
    const toast = createToastService({ max: 2 })
    dispose.push(() => toast.dispose())
    toast.info('一')
    toast.info('二')
    toast.info('三')
    await settle()
    expect(toasts()).toHaveLength(2)
  })

  it('不写 max 缺省留 5 条：连发 20 条只剩最新的五条', async () => {
    const toast = createToastService()
    dispose.push(() => toast.dispose())
    for (let i = 1; i <= 20; i++)
      toast.info(`第 ${i} 条`, { duration: 0 })
    await settle()
    expect(titleTexts(toasts())).toEqual(['第 16 条', '第 17 条', '第 18 条', '第 19 条', '第 20 条'])
    expect(document.querySelector('[data-scope="toast"][data-part="group"]')?.getAttribute('data-count')).toBe('5')
  })

  it('promise 兑现后就地改写成成功，且原样透传结果', async () => {
    const toast = createToastService()
    dispose.push(() => toast.dispose())
    const value = await toast.promise(Promise.resolve(42), {
      loading: '提交中',
      success: v => `成了 ${v}`,
      error: '败了',
    })
    expect(value).toBe(42)
    await settle()
    expect(titleTexts(toasts())).toEqual(['成了 42'])
  })

  it('promise 拒绝时改写成失败，并把 reason 继续抛出去', async () => {
    const toast = createToastService()
    dispose.push(() => toast.dispose())
    const boom = new Error('后端拒了')
    await expect(toast.promise(Promise.reject(boom), {
      loading: '提交中',
      success: '成了',
      error: r => `败了：${(r as Error).message}`,
    })).rejects.toBe(boom)
    await settle()
    expect(titleTexts(toasts())).toEqual(['败了：后端拒了'])
  })

  it('行内动作的回调按 id 存表，点它才调', async () => {
    const toast = createToastService()
    dispose.push(() => toast.dispose())
    const onAction = vi.fn()
    toast.create({ title: '删掉了', actionLabel: '撤销', onAction })
    await settle()
    const action = document.querySelector<HTMLElement>('[data-scope="toast"][data-part="action-trigger"]')!
    await act(async () => action.click())
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('卸载之后再调命令直接抛，不静默吞掉', async () => {
    const toast = createToastService()
    toast.dispose()
    expect(() => toast.info('还在吗')).toThrow(/已卸载/)
  })
})

describe('通知服务', () => {
  it('入队即渲染，标题与说明各就各位', async () => {
    const notification = createNotificationService()
    dispose.push(() => notification.dispose())
    notification.info('有新消息', { description: '来自甲' })
    await settle()
    expect(cards()).toHaveLength(1)
    expect(cards()[0]!.querySelector('[data-part="item-description"]')?.textContent).toBe('来自甲')
  })

  it('dismissAll 清空', async () => {
    const notification = createNotificationService()
    dispose.push(() => notification.dispose())
    notification.info('一')
    notification.info('二')
    await settle()
    expect(cards()).toHaveLength(2)
    notification.dismissAll()
    await settle()
    expect(cards()).toHaveLength(0)
  })

  it('卸载之后再调命令直接抛', async () => {
    const notification = createNotificationService()
    notification.dispose()
    expect(() => notification.info('还在吗')).toThrow(/已卸载/)
  })
})

describe('顶部进度条服务', () => {
  const phase = (): string | null =>
    document.querySelector('[data-scope="loading-bar"][data-part="root"]')?.getAttribute('data-state') ?? null

  it('在途计数而不是布尔开关：两笔并发只回来一笔时不收', async () => {
    const loading = createLoadingBarService()
    dispose.push(() => loading.dispose())
    await settle()
    expect(phase()).toBe('idle')

    loading.start()
    await settle()
    expect(phase()).toBe('loading')

    loading.start()
    loading.finish()
    await settle()
    expect(phase()).toBe('loading')

    loading.finish()
    await settle()
    expect(phase()).not.toBe('loading')
  })

  it('finishAll 不管还剩几笔在途一律收掉', async () => {
    const loading = createLoadingBarService()
    dispose.push(() => loading.dispose())
    loading.start()
    loading.start()
    loading.start()
    await settle()
    expect(phase()).toBe('loading')

    loading.finishAll()
    await settle()
    expect(phase()).not.toBe('loading')
  })

  it('error 以另一种语气收尾，与正常收尾区分得开', async () => {
    const loading = createLoadingBarService()
    dispose.push(() => loading.dispose())
    const tone = (): string | null =>
      document.querySelector('[data-scope="loading-bar"][data-part="root"]')?.getAttribute('data-tone') ?? null
    loading.start()
    await settle()
    expect(tone()).toBe('brand')

    loading.error()
    await settle()
    expect(phase()).not.toBe('loading')
    expect(tone()).toBe('danger')
  })
})
