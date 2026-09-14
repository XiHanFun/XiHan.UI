import type { Service } from '@xihan-ui/core'
import type { PopconfirmApi, PopconfirmConfirmErrorDetails, PopconfirmIntents, PopoverSchema } from '../src'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectPopconfirm, popoverMachine } from '../src'

interface Harness {
  service: Service<PopoverSchema>
  api: () => PopconfirmApi
  errors: PopconfirmConfirmErrorDetails[]
  pending: () => boolean
  actionError: () => PopconfirmConfirmErrorDetails | null
  setMachineProps: (next: PopoverSchema['props']) => void
  stop: () => void
}

const live: Harness[] = []

function makeHarness(
  onConfirm?: PopconfirmIntents['onConfirm'],
  initialMachineProps: PopoverSchema['props'] = { defaultOpen: true },
): Harness {
  const runtime = createVanillaRuntime()
  const machineProps = runtime.signal(initialMachineProps)
  const service = createService(popoverMachine, {
    props: () => machineProps.get(),
    runtime,
  })
  let pending = false
  let actionError: PopconfirmConfirmErrorDetails | null = null
  const errors: PopconfirmConfirmErrorDetails[] = []
  const intents: PopconfirmIntents = {
    onConfirm,
    onConfirmError: details => errors.push(details),
    get pending() {
      return pending
    },
    onPendingChange: (next) => {
      pending = next
    },
    get actionError() {
      return actionError
    },
    onActionErrorChange: (next) => {
      actionError = next
    },
  }
  runtime.start()
  let stopped = false
  const harness: Harness = {
    service,
    api: () => connectPopconfirm(service, intents, normalizeProps),
    errors,
    pending: () => pending,
    actionError: () => actionError,
    setMachineProps: next => machineProps.set(next),
    stop: () => {
      if (stopped)
        return
      stopped = true
      runtime.stop()
    },
  }
  live.push(harness)
  return harness
}

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await Promise.resolve()
}

afterEach(() => {
  for (const harness of live.splice(0))
    harness.stop()
})

describe('popconfirm 确认事务', () => {
  it('调用业务回调前同步占用事务：回调内重入 confirm 不会重复执行业务', () => {
    let harness!: Harness
    const onConfirm = vi.fn(() => harness.api().confirm())
    harness = makeHarness(onConfirm)

    harness.api().confirm()

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(harness.service.state.get()).toBe('closed')
  })

  it('自定义 thenable 进入 pending，同拍重复确认、setOpen 与 trigger 都不能侧向关闭', async () => {
    let resolve!: (value: unknown) => void
    const onConfirm = vi.fn(() => ({
      // oxlint-disable-next-line unicorn/no-thenable -- 本用例专门验证非原生 Promise 的 thenable。
      then(onFulfilled: (value: unknown) => void) {
        resolve = onFulfilled
      },
    }) as unknown as PromiseLike<unknown>)
    const harness = makeHarness(onConfirm)
    const api = harness.api()

    api.confirm()
    api.confirm()
    api.setOpen(false)
    ;(api.getTriggerProps() as { onClick: () => void }).onClick()

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(harness.pending()).toBe(true)
    expect(harness.service.state.get()).toBe('open')
    expect((harness.api().getConfirmTriggerProps() as Record<string, unknown>)['aria-disabled']).toBe('true')

    resolve(undefined)
    await settle()
    expect(harness.pending()).toBe(false)
    expect(harness.service.state.get()).toBe('closed')
  })

  it('同步抛错留在原地，并把同一份原始 cause 写入 actionError 与 confirm-error', () => {
    const cause = new Error('同步失败')
    const harness = makeHarness(() => {
      throw cause
    })

    expect(() => harness.api().confirm()).not.toThrow()

    expect(harness.service.state.get()).toBe('open')
    expect(harness.pending()).toBe(false)
    expect(harness.actionError()?.cause).toBe(cause)
    expect(harness.errors).toHaveLength(1)
    expect(harness.errors[0]).toBe(harness.actionError())
  })

  it('读取 then getter 抛错也走确认错误，不把它误作同步成功', () => {
    const cause = new Error('then getter 失败')
    // oxlint-disable-next-line unicorn/no-thenable -- 本用例专门验证 then getter 的异常路径。
    const outcome = Object.defineProperty({}, 'then', {
      get() {
        throw cause
      },
    }) as PromiseLike<unknown>
    const harness = makeHarness(() => outcome)

    harness.api().confirm()

    expect(harness.service.state.get()).toBe('open')
    expect(harness.actionError()?.cause).toBe(cause)
    expect(harness.errors[0]?.cause).toBe(cause)
  })

  it('调用 then 方法时同步抛错按拒绝处理，并解除 pending', async () => {
    const cause = new Error('then 调用失败')
    const harness = makeHarness(() => ({
      // oxlint-disable-next-line unicorn/no-thenable -- 本用例专门验证 then 方法抛错。
      then() {
        throw cause
      },
    }) as unknown as PromiseLike<unknown>)

    harness.api().confirm()
    expect(harness.pending()).toBe(true)
    await settle()

    expect(harness.pending()).toBe(false)
    expect(harness.service.state.get()).toBe('open')
    expect(harness.actionError()?.cause).toBe(cause)
    expect(harness.errors[0]?.cause).toBe(cause)
  })

  it('thenable 拒绝保留 undefined 原因；新一轮确认先清掉旧错误', async () => {
    let reject!: (cause: unknown) => void
    let round = 0
    const harness = makeHarness(() => {
      round += 1
      if (round === 1) {
        return {
          // oxlint-disable-next-line unicorn/no-thenable -- 本用例专门验证拒绝值为 undefined 的 thenable。
          then(_resolve: (value: unknown) => void, onRejected: (cause: unknown) => void) {
            reject = onRejected
          },
        } as unknown as PromiseLike<unknown>
      }
    })

    harness.api().confirm()
    reject(undefined)
    await settle()
    expect(harness.actionError()).toEqual({ cause: undefined })
    expect(harness.errors[0]).toBe(harness.actionError())
    expect(harness.service.state.get()).toBe('open')

    harness.api().confirm()
    expect(harness.actionError()).toBeNull()
    expect(harness.service.state.get()).toBe('closed')
  })

  it('取消立即终止等待并关闭；旧 thenable 迟到拒绝不能污染重新打开的新会话', async () => {
    let reject!: (cause: unknown) => void
    const harness = makeHarness(() => ({
      // oxlint-disable-next-line unicorn/no-thenable -- 本用例专门验证取消后的迟到 thenable。
      then(_resolve: (value: unknown) => void, onRejected: (cause: unknown) => void) {
        reject = onRejected
      },
    }) as unknown as PromiseLike<unknown>)

    harness.api().confirm()
    harness.api().cancel()
    expect(harness.pending()).toBe(false)
    expect(harness.service.state.get()).toBe('closed')

    harness.api().setOpen(true)
    expect(harness.service.state.get()).toBe('open')
    reject(new Error('迟到失败'))
    await settle()

    expect(harness.service.state.get()).toBe('open')
    expect(harness.actionError()).toBeNull()
    expect(harness.errors).toEqual([])
  })

  it('停止服务后，旧 thenable 结算不再写状态或派错误', async () => {
    let reject!: (cause: unknown) => void
    const harness = makeHarness(() => ({
      // oxlint-disable-next-line unicorn/no-thenable -- 本用例专门验证停机后的迟到 thenable。
      then(_resolve: (value: unknown) => void, onRejected: (cause: unknown) => void) {
        reject = onRejected
      },
    }) as unknown as PromiseLike<unknown>)
    harness.api().confirm()
    harness.stop()

    reject(new Error('卸载后失败'))
    await settle()

    expect(harness.errors).toEqual([])
    expect(harness.actionError()).toBeNull()
  })

  it.each(['取消', '停机'] as const)('onConfirm 同步%s后返回已拒绝 Promise，拒绝仍被接管且不写回', async (interrupt) => {
    const cause = new Error('已取消事务的拒绝')
    let interruptAction: () => void = () => {}
    const harness = makeHarness(() => {
      interruptAction()
      return Promise.reject(cause)
    })
    interruptAction = interrupt === '取消' ? harness.api().cancel : harness.stop

    harness.api().confirm()
    await settle()

    expect(harness.errors).toEqual([])
    expect(harness.actionError()).toBeNull()
  })

  it('受控宿主真实关闭再重开会解除 pending，并使旧事务的兑现与拒绝都失效', async () => {
    for (const outcome of ['resolve', 'reject'] as const) {
      let resolve!: (value: unknown) => void
      let reject!: (cause: unknown) => void
      const openChanges: unknown[] = []
      const harness = makeHarness(() => new Promise((onFulfilled, onRejected) => {
        resolve = onFulfilled
        reject = onRejected
      }), { open: true, onOpenChange: details => openChanges.push(details) })

      harness.api().confirm()
      expect(harness.pending()).toBe(true)
      harness.setMachineProps({ open: false })
      expect(harness.service.state.get()).toBe('closed')
      harness.setMachineProps({ open: true })
      expect(harness.service.state.get()).toBe('open')
      expect(harness.api().pending).toBe(false)
      expect(harness.pending()).toBe(false)

      if (outcome === 'resolve')
        resolve(undefined)
      else
        reject(new Error('旧事务拒绝'))
      await settle()

      expect(harness.service.state.get()).toBe('open')
      expect(harness.actionError()).toBeNull()
      expect(harness.errors).toEqual([])
      expect(openChanges).toEqual([])
    }
  })
})

describe('popconfirm 非模态语义', () => {
  it('content 使用 dialog，而不是要求模态中断语义的 alertdialog', () => {
    const content = makeHarness().api().getContentProps() as Record<string, unknown>
    expect(content.role).toBe('dialog')
  })

  it('逻辑关闭当拍让退场 content 退出交互树与可访问树', () => {
    const content = makeHarness(undefined, { defaultOpen: false }).api().getContentProps() as Record<string, unknown>
    expect(content.inert).toBe(true)
    expect(content['aria-hidden']).toBe(true)
  })
})
