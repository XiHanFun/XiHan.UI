import { describe, expect, it, vi } from 'vitest'
import { createLoadingBarServiceController } from '../src/loading-bar'

describe('loading bar service controller', () => {
  it('初始为空闲的正常语气与不确定进度', () => {
    const controller = createLoadingBarServiceController()
    expect(controller.state).toEqual({ pending: 0, tone: 'brand', value: undefined })
  })

  it('并发任务逐笔归还，最后一笔结束才清空确定进度', () => {
    const controller = createLoadingBarServiceController()
    controller.start()
    controller.start()
    controller.set(42)

    controller.finish()
    expect(controller.state).toEqual({ pending: 1, tone: 'brand', value: 42 })

    controller.finish()
    expect(controller.state).toEqual({ pending: 0, tone: 'brand', value: undefined })
  })

  it('finish 在零处夹住，多调不会变成负数', () => {
    const controller = createLoadingBarServiceController()
    controller.finish()
    controller.finish()
    expect(controller.state.pending).toBe(0)
  })

  it('start 恢复正常语气并回到不确定进度', () => {
    const controller = createLoadingBarServiceController({ tone: 'info', errorTone: 'warning' })
    controller.error()
    controller.set(70)
    controller.start()
    expect(controller.state).toEqual({ pending: 1, tone: 'info', value: undefined })
  })

  it('error 与 finishAll 都强制清空计数和值，但使用各自语气', () => {
    const controller = createLoadingBarServiceController({ tone: 'success', errorTone: 'danger' })
    controller.start()
    controller.start()
    controller.set(60)
    controller.error()
    expect(controller.state).toEqual({ pending: 0, tone: 'danger', value: undefined })

    controller.start()
    controller.finishAll()
    expect(controller.state).toEqual({ pending: 0, tone: 'success', value: undefined })
  })

  it('每次有效操作向宿主发布完整快照', () => {
    const onStateChange = vi.fn()
    const controller = createLoadingBarServiceController({ onStateChange })
    controller.start()
    controller.set(25)
    controller.finish()

    expect(onStateChange.mock.calls.map(([state]) => state)).toEqual([
      { pending: 1, tone: 'brand', value: undefined },
      { pending: 1, tone: 'brand', value: 25 },
      { pending: 0, tone: 'brand', value: undefined },
    ])
  })

  it('dispose 清空状态，之后的迟到调用不再改值或通知宿主', () => {
    const onStateChange = vi.fn()
    const controller = createLoadingBarServiceController({ onStateChange })
    controller.start()
    controller.set(25)
    controller.dispose()
    onStateChange.mockClear()

    controller.start()
    controller.finish()
    controller.error()
    controller.finishAll()
    controller.set(80)

    expect(controller.state).toEqual({ pending: 0, tone: 'brand', value: undefined })
    expect(onStateChange).not.toHaveBeenCalled()
  })
})
