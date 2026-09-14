import type { DialogServiceControllerSpec, DialogServiceRequest } from '../src/dialog'
import { describe, expect, it } from 'vitest'
import { createDialogServiceController, dialogServiceBadgeTone } from '../src/dialog'

interface Spec extends DialogServiceControllerSpec {
  title: string
}

function deferred<T = void>(): { promise: Promise<T>, resolve: (value: T) => void, reject: (cause: unknown) => void } {
  let resolve!: (value: T) => void
  let reject!: (cause: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

describe('dialog service controller', () => {
  it('三端告知框徽记共用同一语气映射', () => {
    expect(dialogServiceBadgeTone('info')).toBe('info')
    expect(dialogServiceBadgeTone('success')).toBe('success')
    expect(dialogServiceBadgeTone('warning')).toBe('warning')
    expect(dialogServiceBadgeTone('error')).toBe('danger')
  })

  it('请求严格排队，Promise 先结算，显式完成长退场后才推进', async () => {
    const controller = createDialogServiceController<Spec>()
    const first = controller.request({ title: '第一问' })
    const firstIdentity = controller.state.current
    const second = controller.request({ title: '第二问' })

    expect(controller.state.current?.spec.title).toBe('第一问')
    controller.close(true)
    await expect(first).resolves.toBe(true)
    expect(controller.state.current?.spec.title).toBe('第一问')
    expect(controller.state.open).toBe(false)

    // 这里代表任意 600ms CSS 退场；核心不计时，只等宿主明确完成。
    expect(controller.finishExit(firstIdentity)).toBe(true)
    expect(controller.state.current?.spec.title).toBe('第二问')
    expect(controller.state.open).toBe(true)

    controller.close(false)
    await expect(second).resolves.toBe(false)
  })

  it('重复与迟到的退出完成不能清掉后继请求', () => {
    const controller = createDialogServiceController<Spec>()
    void controller.request({ title: '第一问' })
    const first = controller.state.current
    void controller.request({ title: '第二问' })
    controller.close(false)
    expect(controller.finishExit(first)).toBe(true)
    expect(controller.finishExit(first)).toBe(false)

    const second = controller.state.current
    controller.close(false)
    expect(controller.finishExit(first)).toBe(false)
    expect(controller.state.current).toBe(second)
    expect(controller.finishExit(second)).toBe(true)
  })

  it('旧 attempt 的通知失败不会污染或拒绝已经成功的重试', async () => {
    const notification = deferred()
    let attempts = 0
    const controller = createDialogServiceController<Spec>()
    const result = controller.request({
      title: '提交',
      onOk: () => {
        attempts += 1
        if (attempts === 1)
          throw new Error('第一次失败')
        return true
      },
      onActionError: () => notification.promise,
    })

    const firstAttempt = controller.confirmCurrent()
    await Promise.resolve()
    expect(controller.state.actionError?.cause).toBeInstanceOf(Error)
    const retry = controller.confirmCurrent()
    await retry
    await expect(result).resolves.toBe(true)

    notification.reject(new Error('迟到的通知失败'))
    await firstAttempt
    expect(controller.state.open).toBe(false)
    expect(controller.state.actionError).toBeNull()
  })

  it('当前 attempt 的通知失败拒绝请求并进入带身份的退场', async () => {
    const notificationCause = new Error('通知通道失败')
    const controller = createDialogServiceController<Spec>()
    const result = controller.request({
      title: '提交',
      onOk: () => Promise.reject(new Error('动作失败')),
      onActionError: () => Promise.reject(notificationCause),
    })
    const identity = controller.state.current

    await controller.confirmCurrent()
    await expect(result).rejects.toBe(notificationCause)
    expect(controller.state.exiting).toBe(identity)
    expect(controller.state.open).toBe(false)
  })

  it('dispose 将当前与队列全部按取消结算，并拒绝后续请求', async () => {
    const controller = createDialogServiceController<Spec>()
    const first = controller.request({ title: '一' })
    const second = controller.request({ title: '二' })
    controller.dispose()

    await expect(first).resolves.toBe(false)
    await expect(second).resolves.toBe(false)
    await expect(controller.request({ title: '三' })).rejects.toThrow('dialog 服务已卸载')
    expect(controller.state.current).toBeNull()
  })

  it('宿主失败拒绝当前和队列，后续请求复用原始原因', async () => {
    const cause = new Error('宿主渲染失败')
    const controller = createDialogServiceController<Spec>()
    const first = controller.request({ title: '一' })
    const second = controller.request({ title: '二' })
    controller.fail(cause)

    await expect(first).rejects.toBe(cause)
    await expect(second).rejects.toBe(cause)
    await expect(controller.request({ title: '三' })).rejects.toBe(cause)
    expect(controller.state.failure?.cause).toBe(cause)
  })

  it('finishExit 要求精确的请求身份', () => {
    const controller = createDialogServiceController<Spec>()
    void controller.request({ title: '一' })
    controller.close(false)
    const fake = { spec: { title: '一' } } as DialogServiceRequest<Spec>
    expect(controller.finishExit(fake)).toBe(false)
    expect(controller.state.current).not.toBeNull()
  })
})
