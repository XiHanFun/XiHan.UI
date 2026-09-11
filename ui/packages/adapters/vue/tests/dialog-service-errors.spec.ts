// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createDialogService } from '../src/services/dialog-service'

let service: ReturnType<typeof createDialogService> | null = null
async function change(fn: () => unknown): Promise<void> {
  await fn()
  await nextTick()
}
async function flush(): Promise<void> {
  await nextTick()
  await nextTick()
}
afterEach(() => {
  service?.dispose()
  service = null
  document.body.innerHTML = ''
})

function buttons(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>('[data-scope="dialog"][data-part="footer"] button')]
}
function message(): string {
  return [...document.querySelectorAll<HTMLElement>('[role="alert"]')].filter(node => !node.hidden).map(node => node.textContent).join('')
}

describe('命令对话框显式异常', () => {
  it.each(['throw', 'reject'])('%s：保留原 cause，显示安全文案，重试先清理异常', async (mode) => {
    const cause = { internal: '不应显示的内部数据' }
    let calls = 0
    const notify = vi.fn()
    await change(() => {
      service = createDialogService({ actionErrorText: '提交失败，请重试' })
    })
    let result!: Promise<boolean>
    await change(() => {
      result = service!.confirm({
        title: '提交',
        onOk: () => {
          calls++
          if (calls === 1) {
            if (mode === 'throw')
              throw cause
            return Promise.reject(cause)
          }
        },
        onActionError: notify,
      })
    })
    await flush()
    await change(() => buttons()[1]!.click())
    await flush()
    expect(service!.actionError?.cause).toBe(cause)
    expect(notify).toHaveBeenCalledExactlyOnceWith({ cause })
    expect(message()).toBe('提交失败，请重试')
    expect(document.body.textContent).not.toContain(cause.internal)
    await change(() => buttons()[1]!.click())
    await expect(result).resolves.toBe(true)
    expect(service!.actionError).toBeNull()
  })

  it('false 仅阻止关闭，不产生异常或失败通知', async () => {
    const notify = vi.fn()
    await change(() => {
      service = createDialogService()
      void service.confirm({ title: '校验', onOk: () => false, onActionError: notify })
    })
    await flush()
    await change(() => buttons()[1]!.click())
    await flush()
    expect(service!.actionError).toBeNull()
    expect(notify).not.toHaveBeenCalled()
    expect(message()).toBe('')
    expect(document.querySelector('[data-scope="dialog"][data-part="content"]')?.getAttribute('data-state')).toBe('open')
  })

  it('通知 handler 拒绝时，所属请求明确 reject 原因', async () => {
    const notificationCause = new Error('失败通知处理器异常')
    let result!: Promise<boolean>
    await change(() => {
      service = createDialogService()
      result = service.confirm({
        title: '提交',
        onOk: () => { throw new Error('动作失败') },
        onActionError: () => Promise.reject(notificationCause),
      })
    })
    await flush()
    const rejection = expect(result).rejects.toBe(notificationCause)
    await change(() => buttons()[1]!.click())
    await rejection
  })

  it('dispose 后旧动作拒绝不得通知或写回已销毁服务', async () => {
    let rejectAction!: (cause: unknown) => void
    const notify = vi.fn()
    let result!: Promise<boolean>
    await change(() => {
      service = createDialogService()
      result = service.confirm({
        title: '旧提交',
        onOk: () => new Promise((_, reject) => { rejectAction = reject }),
        onActionError: notify,
      })
    })
    await flush()
    await change(() => buttons()[1]!.click())
    await change(() => service!.dispose())
    await expect(result).resolves.toBe(false)
    await change(() => rejectAction(new Error('迟到拒绝')))
    await flush()
    expect(notify).not.toHaveBeenCalled()
    expect(service!.actionError).toBeNull()
  })

  it('取消后的旧通知拒绝不得影响下一请求', async () => {
    let rejectNotification!: (cause: unknown) => void
    let first!: Promise<boolean>
    let second!: Promise<boolean>
    await change(() => {
      service = createDialogService()
      first = service.confirm({
        title: '旧请求',
        onOk: () => { throw new Error('动作失败') },
        onActionError: () => new Promise((_, reject) => { rejectNotification = reject }),
      })
    })
    await flush()
    await change(() => buttons()[1]!.click())
    await flush()
    await change(() => {
      buttons()[0]!.click()
      second = service!.confirm({ title: '新请求' })
    })
    await expect(first).resolves.toBe(false)
    await change(async () => {
      await new Promise(resolve => setTimeout(resolve, 280))
    })
    await flush()
    await change(() => rejectNotification(new Error('旧通知失败')))
    await flush()
    expect(document.querySelector('[data-scope="dialog"][data-part="title"]')?.textContent).toBe('新请求')
    expect(service!.actionError).toBeNull()
    await change(() => buttons()[1]!.click())
    await expect(second).resolves.toBe(true)
  })

  it('同一请求重试后旧通知失败不得清除新忙态或拒绝本次动作', async () => {
    let attempts = 0
    let rejectNotification!: (cause: unknown) => void
    let completeAction!: () => void
    let result!: Promise<boolean>
    await change(() => {
      service = createDialogService()
      result = service.confirm({
        title: '重试',
        onOk: () => {
          attempts++
          if (attempts === 1)
            throw new Error('首次失败')
          return new Promise<void>((resolve) => {
            completeAction = resolve
          })
        },
        onActionError: () => new Promise((_, reject) => { rejectNotification = reject }),
      })
    })
    await flush()
    await change(() => buttons()[1]!.click())
    await flush()
    expect(service!.actionError).not.toBeNull()
    await change(() => buttons()[1]!.click())
    expect(service!.actionError).toBeNull()
    await change(() => rejectNotification(new Error('旧通知失败')))
    await flush()
    expect(buttons()[1]!.getAttribute('aria-busy')).toBe('true')
    await change(() => completeAction())
    await expect(result).resolves.toBe(true)
  })

  it('宿主验证失败从首次请求 reject 原 cause，不解析为取消', async () => {
    const holder = document.createElement('div')
    document.body.append(holder)
    const cause = new Error('宿主访问失败')
    Object.defineProperty(holder, 'nodeType', { get: () => {
      throw cause
    } })
    await change(() => {
      service = createDialogService({ target: holder })
    })
    await expect(service!.confirm({ title: '无法展示' })).rejects.toBe(cause)
    expect(service!.actionError).toBeNull()
  })

  it('断开的 target 明确拒绝，不进入不可见的等待', async () => {
    await change(() => {
      service = createDialogService({ target: document.createElement('div') })
    })
    await expect(service!.confirm({ title: '无法展示' })).rejects.toThrow('已连接')
  })

  it('函数正文渲染失败拒绝当前请求并保留宿主原因', async () => {
    const cause = new Error('正文无法渲染')
    let result!: Promise<boolean>
    let rejection!: Promise<void>
    await change(() => {
      service = createDialogService()
      result = service.confirm({ title: '正文失败', content: () => {
        throw cause
      } })
      rejection = expect(result).rejects.toBe(cause)
    })
    await flush()
    await rejection
  })
})
