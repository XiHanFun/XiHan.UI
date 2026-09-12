import type { FeedbackServiceQueue } from '../src/notification'
import { describe, expect, it, vi } from 'vitest'
import { createFeedbackServiceController, resolveFeedbackServiceTitle } from '../src/notification'
import { resolveToastServiceItem } from '../src/toast'

interface RecordOptions {
  id?: string
  title?: string
  type?: string
}

function makeQueue() {
  const records = new Map<string, RecordOptions>()
  let sequence = 0
  const queue: FeedbackServiceQueue<RecordOptions, Partial<RecordOptions>> = {
    create: (options) => {
      const id = options.id ?? `notification-${++sequence}`
      records.set(id, { ...records.get(id), ...options, id })
      return id
    },
    update: (id, patch) => {
      const current = records.get(id)
      if (current)
        records.set(id, { ...current, ...patch, id })
    },
    dismiss: id => void records.delete(id),
    dismissAll: () => records.clear(),
  }
  return { queue, records }
}

describe('feedback service controller', () => {
  it('toast 与 notification 共用合并计数标题投影', () => {
    expect(resolveFeedbackServiceTitle({ title: '同步完成' })).toBe('同步完成')
    expect(resolveFeedbackServiceTitle({ title: '同步完成', count: 1 })).toBe('同步完成')
    expect(resolveFeedbackServiceTitle({ title: '同步完成', count: 3 })).toBe('同步完成 ×3')
    expect(resolveFeedbackServiceTitle({ count: 3 })).toBeUndefined()
  })

  it('toast 服务默认项只由 Headless 决定标题、语气、时长与关闭出口', () => {
    expect(resolveToastServiceItem(
      { id: 'a', title: '处理中', count: 2, actionLabel: '撤销' },
      { duration: 3000, removeDelay: 180, pauseOnPageIdle: false },
    )).toEqual({
      id: 'a',
      title: '处理中 ×2',
      type: 'info',
      duration: 3000,
      removeDelay: 180,
      closable: false,
      pauseOnPageIdle: false,
      actionLabel: '撤销',
    })
    expect(resolveToastServiceItem({ id: 'loading', type: 'loading' }).closable).toBe(true)
    expect(resolveToastServiceItem({ id: 'fixed', duration: 0 }).closable).toBe(true)
    expect(resolveToastServiceItem({ id: 'forced', type: 'loading', closable: false }).closable).toBe(false)
  })

  it('复用注入的 notification 队列端口完成 create/update/dismiss/dismissAll', () => {
    const { queue, records } = makeQueue()
    const controller = createFeedbackServiceController<RecordOptions, Partial<RecordOptions>>({ name: 'notification' })
    controller.attach(queue)

    const first = controller.create({ title: '第一条' })
    const second = controller.create({ title: '第二条' })
    controller.update(first, { title: '已更新' })
    expect(records.get(first)?.title).toBe('已更新')
    controller.dismiss(first)
    expect(records.has(first)).toBe(false)
    controller.dismissAll()
    expect(records.has(second)).toBe(false)
  })

  it('toast 自动 id 保持前缀与实例内顺序，显式 id 不消耗序号', () => {
    const { queue } = makeQueue()
    const controller = createFeedbackServiceController<RecordOptions, Partial<RecordOptions>>({ name: 'toast', idPrefix: 'toast' })
    controller.attach(queue)

    expect(controller.create({ id: 'fixed' })).toBe('fixed')
    expect(controller.create({ title: '一' })).toBe('toast-1')
    expect(controller.create({ title: '二' })).toBe('toast-2')
  })

  it('动作按最终队列 id 保存，退场或 dismiss 后立即清掉', () => {
    const { queue } = makeQueue()
    const action = vi.fn()
    const controller = createFeedbackServiceController<RecordOptions, Partial<RecordOptions>>({ name: 'notification' })
    controller.attach(queue)
    const id = controller.create({ title: '可撤销' }, action)

    controller.invokeAction(id)
    expect(action).toHaveBeenCalledTimes(1)
    controller.unmounted(id)
    controller.invokeAction(id)
    expect(action).toHaveBeenCalledTimes(1)
  })

  it('队列按 max/priority 挤条后回收孤立动作', () => {
    const { queue } = makeQueue()
    const firstAction = vi.fn()
    const secondAction = vi.fn()
    const controller = createFeedbackServiceController<RecordOptions, Partial<RecordOptions>>({ name: 'notification' })
    controller.attach(queue)
    const first = controller.create({ title: '低优先级' }, firstAction)
    const second = controller.create({ title: '保留项' }, secondAction)

    controller.syncItems([second])
    controller.invokeAction(first)
    controller.invokeAction(second)
    expect(firstAction).not.toHaveBeenCalled()
    expect(secondAction).toHaveBeenCalledTimes(1)
  })

  it('wc notification 可只清动作表，不重复删除元素自己已移除的记录', () => {
    const { queue } = makeQueue()
    const dismiss = vi.spyOn(queue, 'dismiss')
    const controller = createFeedbackServiceController<RecordOptions, Partial<RecordOptions>>({
      name: 'notification',
      dismissOnUnmounted: false,
    })
    controller.attach(queue)
    const id = controller.create({ title: '一' }, () => {})
    controller.unmounted(id)
    expect(dismiss).not.toHaveBeenCalled()
  })

  it('暂停状态通过快照端口发布，新条目可直接读取当前状态', () => {
    const { queue } = makeQueue()
    const onStateChange = vi.fn()
    const controller = createFeedbackServiceController<RecordOptions, Partial<RecordOptions>>({ name: 'toast', onStateChange })
    controller.attach(queue)
    controller.pauseAll()
    expect(controller.state.paused).toBe(true)
    controller.resumeAll()
    expect(controller.state.paused).toBe(false)
    expect(onStateChange).toHaveBeenCalledTimes(2)
  })

  it('promise 先建 loading，同一 id 就地改写成功并原样返回结果', async () => {
    const { queue, records } = makeQueue()
    const controller = createFeedbackServiceController<RecordOptions, Partial<RecordOptions>>({ name: 'toast', idPrefix: 'toast' })
    controller.attach(queue)

    const result = controller.trackPromise(
      Promise.resolve(7),
      { type: 'loading', title: '上传中' },
      value => ({ type: 'success', title: `完成 ${value}` }),
      () => ({ type: 'error', title: '失败' }),
    )
    expect(records.get('toast-1')).toMatchObject({ type: 'loading', title: '上传中' })
    await expect(result).resolves.toBe(7)
    expect(records.get('toast-1')).toMatchObject({ type: 'success', title: '完成 7' })
  })

  it('promise 拒绝就地改写失败并保留原拒绝原因', async () => {
    const { queue, records } = makeQueue()
    const cause = new Error('后端失败')
    const controller = createFeedbackServiceController<RecordOptions, Partial<RecordOptions>>({ name: 'toast', idPrefix: 'toast' })
    controller.attach(queue)

    const result = controller.trackPromise(
      Promise.reject(cause),
      { type: 'loading', title: '提交中' },
      () => ({ type: 'success' }),
      reason => ({ type: 'error', title: (reason as Error).message }),
    )
    await expect(result).rejects.toBe(cause)
    expect(records.get('toast-1')).toMatchObject({ type: 'error', title: '后端失败' })
  })

  it('宿主不可用时静默丢消息，dispose 后则明确报已卸载', async () => {
    const controller = createFeedbackServiceController<RecordOptions, Partial<RecordOptions>>({ name: 'toast' })
    expect(controller.create({ title: '丢掉' })).toBe('')
    const running = Promise.resolve(1)
    await expect(controller.trackPromise(running, {}, () => ({}), () => ({}))).resolves.toBe(1)

    controller.dispose()
    expect(() => controller.create({})).toThrow('toast 服务已卸载')
    expect(() => controller.pauseAll()).toThrow('toast 服务已卸载')
  })

  it('dispose 后 Promise 的迟到结果不再写回队列', async () => {
    const { queue } = makeQueue()
    const update = vi.spyOn(queue, 'update')
    let resolve!: (value: number) => void
    const running = new Promise<number>((done) => {
      resolve = done
    })
    const controller = createFeedbackServiceController<RecordOptions, Partial<RecordOptions>>({ name: 'toast' })
    controller.attach(queue)
    const result = controller.trackPromise(running, {}, () => ({ type: 'success' }), () => ({ type: 'error' }))
    controller.dispose()
    resolve(3)

    await expect(result).resolves.toBe(3)
    expect(update).not.toHaveBeenCalled()
  })
})
