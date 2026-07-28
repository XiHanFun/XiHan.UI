// @vitest-environment jsdom
import type { ClipboardCopyErrorDetails, ClipboardSchema, ClipboardStatusChangeDetails } from '../src/clipboard'
import { createCounterIdGenerator, createScope, normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
// 直接指到组件目录：包主入口的导出由接线一并补，测试不等它
import { CLIPBOARD_TIMEOUT, clipboardMachine, connectClipboard, resolveClipboardTimeout, writeToClipboard } from '../src/clipboard'

type Props = ClipboardSchema['props']
type Dict = Record<string, unknown>

/**
 * 装一个假的 navigator.clipboard。
 * jsdom 默认压根没有这个对象——这既是"接口缺席"那条路的真实现场，
 * 也意味着成功路径必须自己把接口装上去。返回值负责拆干净，免得漏给下一条用例。
 */
function installClipboard(writeText: (text: string) => Promise<void>): () => void {
  Object.defineProperty(window.navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
  return () => {
    Reflect.deleteProperty(window.navigator, 'clipboard')
  }
}

const teardowns: Array<() => void> = []

afterEach(() => {
  while (teardowns.length) teardowns.pop()!()
  vi.useRealTimers()
})

function makeClipboard(initial: Props = {}) {
  const props: Props = { ...initial }
  const runtime = createVanillaRuntime()
  // 每次展开成新对象：props 身份变了，解释器的归一化缓存才会失效，改 prop 才看得见
  const service = createService(clipboardMachine, {
    props: () => ({ ...props }),
    runtime,
    scope: createScope(document.body, createCounterIdGenerator()),
  })
  runtime.start()
  return {
    service,
    state: () => service.state.get(),
    setProps: (next: Props) => Object.assign(props, next),
    api: () => connectClipboard(service, normalizeProps),
    stop: () => runtime.stop(),
  }
}

/** 等 writeText 的 promise 兑现并让机器把事件消化掉。 */
async function settleWrite(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

function fire(props: Dict, key: string, event: unknown): void {
  (props[key] as (e: unknown) => void)(event)
}

describe('resolveClipboardTimeout', () => {
  it('缺省 3 秒，给了就按给的算', () => {
    expect(resolveClipboardTimeout(undefined)).toBe(CLIPBOARD_TIMEOUT)
    expect(resolveClipboardTimeout(120)).toBe(120)
  })

  it('<=0 与非有限数一律表示不自动回落', () => {
    // 0 是假值，用 `timeout ||` 判会让"不回落"这条写法整个失效
    expect(resolveClipboardTimeout(0)).toBe(Number.POSITIVE_INFINITY)
    expect(resolveClipboardTimeout(-1)).toBe(Number.POSITIVE_INFINITY)
    expect(resolveClipboardTimeout(Number.NaN)).toBe(Number.POSITIVE_INFINITY)
    expect(resolveClipboardTimeout(Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY)
  })
})

describe('writeToClipboard', () => {
  it('接口在场时把文本原样交给 writeText', async () => {
    const writeText = vi.fn(async () => {})
    teardowns.push(installClipboard(writeText))
    const scope = createScope(document.body, createCounterIdGenerator())

    await expect(writeToClipboard(scope, '要复制的')).resolves.toBeUndefined()
    expect(writeText).toHaveBeenCalledWith('要复制的')
  })

  it('接口缺席时给出一个拒绝，而不是抛同步异常', async () => {
    const scope = createScope(document.body, createCounterIdGenerator())
    // jsdom 默认没有 navigator.clipboard，这就是非安全上下文的真实形状
    await expect(writeToClipboard(scope, 'x')).rejects.toBeInstanceOf(Error)
  })

  it('writeText 同步抛也翻成拒绝：调用方只需处理"失败"一种形态', async () => {
    teardowns.push(installClipboard(() => {
      throw new Error('boom')
    }))
    const scope = createScope(document.body, createCounterIdGenerator())
    await expect(writeToClipboard(scope, 'x')).rejects.toThrow('boom')
  })
})

describe('clipboardMachine 复制流程', () => {
  it('起步 idle；点一下进 copying，写成功才落 copied', async () => {
    teardowns.push(installClipboard(async () => {}))
    const c = makeClipboard({ value: 'abc' })
    expect(c.state()).toBe('idle')

    c.service.send({ type: 'COPY.TRIGGER' })
    // 关键：还没兑现之前不许乐观地跳到 copied
    expect(c.state()).toBe('copying')

    await settleWrite()
    expect(c.state()).toBe('copied')
  })

  it('写进剪贴板的是当下的 value', async () => {
    const writeText = vi.fn(async () => {})
    teardowns.push(installClipboard(writeText))
    const c = makeClipboard({ value: '第一版' })

    c.service.send({ type: 'COPY.TRIGGER' })
    await settleWrite()
    expect(writeText).toHaveBeenCalledWith('第一版')

    c.setProps({ value: '第二版' })
    c.api().copy()
    await settleWrite()
    expect(writeText).toHaveBeenLastCalledWith('第二版')
  })

  it('没给 value 时复制空串，不是 undefined', async () => {
    const writeText = vi.fn(async () => {})
    teardowns.push(installClipboard(writeText))
    makeClipboard().service.send({ type: 'COPY.TRIGGER' })
    await settleWrite()
    expect(writeText).toHaveBeenCalledWith('')
  })

  it('写失败：回 idle 并带原因通知，绝不停在 copied', async () => {
    const reason = new Error('permission denied')
    teardowns.push(installClipboard(async () => {
      throw reason
    }))
    const onCopyError = vi.fn<(d: ClipboardCopyErrorDetails) => void>()
    const c = makeClipboard({ value: 'abc', onCopyError })

    c.service.send({ type: 'COPY.TRIGGER' })
    await settleWrite()

    expect(c.state()).toBe('idle')
    expect(onCopyError).toHaveBeenCalledWith({ error: reason, value: 'abc' })
  })

  it('环境根本没有剪贴板接口时同样落回 idle 并报错', async () => {
    // 不装 clipboard：非安全上下文（http 页面）里就是这个样子
    const onCopyError = vi.fn<(d: ClipboardCopyErrorDetails) => void>()
    const c = makeClipboard({ value: 'abc', onCopyError })

    c.service.send({ type: 'COPY.TRIGGER' })
    await settleWrite()

    expect(c.state()).toBe('idle')
    expect(onCopyError).toHaveBeenCalledTimes(1)
    expect(onCopyError.mock.calls[0]![0].error).toBeInstanceOf(Error)
  })

  it('停留窗口到点自动回 idle', async () => {
    vi.useFakeTimers()
    teardowns.push(installClipboard(async () => {}))
    const c = makeClipboard({ value: 'abc', timeout: 100 })

    c.service.send({ type: 'COPY.TRIGGER' })
    await vi.advanceTimersByTimeAsync(0)
    expect(c.state()).toBe('copied')

    vi.advanceTimersByTime(99)
    expect(c.state()).toBe('copied')
    vi.advanceTimersByTime(1)
    expect(c.state()).toBe('idle')
  })

  it('timeout<=0 即关掉自动回落，一直停在 copied', async () => {
    vi.useFakeTimers()
    teardowns.push(installClipboard(async () => {}))
    const c = makeClipboard({ value: 'abc', timeout: 0 })

    c.service.send({ type: 'COPY.TRIGGER' })
    await vi.advanceTimersByTimeAsync(0)
    expect(c.state()).toBe('copied')

    vi.advanceTimersByTime(60_000)
    expect(c.state()).toBe('copied')
  })

  it('写入在途时再点不发第二次写请求', async () => {
    const writeText = vi.fn(async () => {})
    teardowns.push(installClipboard(writeText))
    const c = makeClipboard({ value: 'abc' })

    c.service.send({ type: 'COPY.TRIGGER' })
    c.service.send({ type: 'COPY.TRIGGER' })
    c.service.send({ type: 'COPY.TRIGGER' })
    expect(writeText).toHaveBeenCalledTimes(1)

    await settleWrite()
    expect(c.state()).toBe('copied')
  })

  it('停留窗口里再点会重新写一遍，计时也重新开始', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn(async () => {})
    teardowns.push(installClipboard(writeText))
    const c = makeClipboard({ value: 'abc', timeout: 100 })

    c.service.send({ type: 'COPY.TRIGGER' })
    await vi.advanceTimersByTimeAsync(0)
    vi.advanceTimersByTime(80)
    expect(c.state()).toBe('copied')

    c.service.send({ type: 'COPY.TRIGGER' })
    expect(c.state()).toBe('copying')
    await vi.advanceTimersByTimeAsync(0)
    expect(writeText).toHaveBeenCalledTimes(2)

    // 上一轮已经走掉 80ms；计时若没重来，这里 20ms 就会掉回 idle
    vi.advanceTimersByTime(80)
    expect(c.state()).toBe('copied')
    vi.advanceTimersByTime(20)
    expect(c.state()).toBe('idle')
  })

  it('上一轮写入迟到兑现时被丢掉，不会替新一轮盖章', async () => {
    // 两次写各自留一个手动开关：模拟第一次请求慢，用户已经开始了第二次
    const pending: Array<() => void> = []
    teardowns.push(installClipboard(() => new Promise<void>((resolve) => {
      pending.push(resolve)
    })))
    const c = makeClipboard({ value: 'abc' })

    c.service.send({ type: 'COPY.TRIGGER' })
    // 第一次失败（权限被拒），回 idle —— 此刻第一个 promise 还挂着没兑现
    c.service.send({ type: 'COPY.ERROR', error: new Error('slow one denied') })
    expect(c.state()).toBe('idle')

    c.service.send({ type: 'COPY.TRIGGER' })
    expect(c.state()).toBe('copying')

    // 迟到的第一次这才兑现：没有 disposed 标记就会当场落 copied，
    // 而第二次写其实还在路上——界面会拿上一轮的结果替这一轮盖章
    pending[0]!()
    await settleWrite()
    expect(c.state()).toBe('copying')

    pending[1]!()
    await settleWrite()
    expect(c.state()).toBe('copied')
  })

  it('写入途中卸载：兑现后不再往停机的机器里送事件', async () => {
    // 兑现回调里若还有别的抛错，落在 promise 里只会变成未处理拒绝，
    // 不会让断言变红——所以这里自己盯着未处理拒绝
    const rejections: unknown[] = []
    const onUnhandled = (reason: unknown): void => {
      rejections.push(reason)
    }
    process.on('unhandledRejection', onUnhandled)

    let resolveWrite: (() => void) | undefined
    teardowns.push(installClipboard(() => new Promise<void>((resolve) => {
      resolveWrite = resolve
    })))
    const c = makeClipboard({ value: 'abc' })

    c.service.send({ type: 'COPY.TRIGGER' })
    expect(c.state()).toBe('copying')

    c.stop()
    resolveWrite!()
    await settleWrite()
    // 未处理拒绝是在事件循环转一圈之后才派发的，等一拍宏任务
    await new Promise<void>(r => setTimeout(r, 0))
    process.off('unhandledRejection', onUnhandled)

    expect(rejections).toEqual([])
    expect(c.state()).toBe('copying')
  })
})

describe('clipboard 状态通知', () => {
  it('挂载那一刻不通知；copying → copied → idle 各通知一次', async () => {
    vi.useFakeTimers()
    teardowns.push(installClipboard(async () => {}))
    const seen: ClipboardStatusChangeDetails[] = []
    const c = makeClipboard({ value: 'abc', timeout: 50, onStatusChange: d => seen.push(d) })
    // 初始态是"没发生过任何事"，通知它等于开局就骚扰宿主一次
    expect(seen).toEqual([])

    c.service.send({ type: 'COPY.TRIGGER' })
    expect(seen).toEqual([{ status: 'copying' }])

    await vi.advanceTimersByTimeAsync(0)
    expect(seen).toEqual([{ status: 'copying' }, { status: 'copied' }])

    vi.advanceTimersByTime(50)
    expect(seen).toEqual([{ status: 'copying' }, { status: 'copied' }, { status: 'idle' }])
  })

  it('失败时先报原因再报状态落位', async () => {
    teardowns.push(installClipboard(async () => {
      throw new Error('nope')
    }))
    const order: string[] = []
    const c = makeClipboard({
      value: 'abc',
      onStatusChange: d => order.push(`status:${d.status}`),
      onCopyError: () => order.push('error'),
    })

    c.service.send({ type: 'COPY.TRIGGER' })
    await settleWrite()
    // 先说清为什么失败，再说落到哪儿；反过来宿主拿到 idle 时还不知道出了事
    expect(order).toEqual(['status:copying', 'error', 'status:idle'])
  })
})

describe('connectClipboard 结构与标注', () => {
  it('root 带 anatomy 标记与状态位', () => {
    const root = makeClipboard().api().getRootProps() as Dict
    expect(root['data-scope']).toBe('clipboard')
    expect(root['data-part']).toBe('root')
    expect(root['data-state']).toBe('idle')
    expect(root['data-copied']).toBeUndefined()
  })

  it('label 的 for 指向 input 自己的 id，input 反手 aria-labelledby 指回 label', () => {
    const api = makeClipboard().api()
    const label = api.getLabelProps() as Dict
    const input = api.getInputProps() as Dict
    expect(label.for).toBe(input.id)
    expect(input['aria-labelledby']).toBe(label.id)
    // 撞名会让 label 与 input 抢同一个 IDREF
    expect(label.id).not.toBe(input.id)
  })

  it('input 只读而不禁用：仍可聚焦、仍选得中', () => {
    const input = makeClipboard({ value: 'token-123' }).api().getInputProps() as Dict
    expect(input.type).toBe('text')
    expect(input.value).toBe('token-123')
    expect(input.readonly).toBe(true)
    // 加了 disabled 就既不可聚焦也选不中，键盘用户的 Ctrl/Cmd+C 那条路当场断掉
    expect(input.disabled).toBeUndefined()
  })

  it('聚焦输入框即全选', () => {
    const el = document.createElement('input')
    el.value = 'token-123'
    document.body.appendChild(el)
    const select = vi.spyOn(el, 'select')

    fire(makeClipboard({ value: 'token-123' }).api().getInputProps() as Dict, 'onFocus', { currentTarget: el })
    expect(select).toHaveBeenCalled()
    el.remove()
  })

  it('trigger 是原生按钮且带 type=button，点一下走复制', () => {
    teardowns.push(installClipboard(async () => {}))
    const c = makeClipboard({ value: 'abc' })
    const trigger = c.api().getTriggerProps() as Dict
    // 漏了 type，按钮落在 form 里会变成 submit，Enter 直接提交表单
    expect(trigger.type).toBe('button')

    fire(trigger, 'onClick', {})
    expect(c.state()).toBe('copying')
  })

  it('copied 期间 root 与 trigger 一起出 data-copied', async () => {
    teardowns.push(installClipboard(async () => {}))
    const c = makeClipboard({ value: 'abc' })
    c.service.send({ type: 'COPY.TRIGGER' })
    await settleWrite()

    const api = c.api()
    expect(api.copied).toBe(true)
    expect((api.getRootProps() as Dict)['data-copied']).toBe('')
    expect((api.getRootProps() as Dict)['data-state']).toBe('copied')
    expect((api.getTriggerProps() as Dict)['data-copied']).toBe('')
    expect((api.getControlProps() as Dict)['data-state']).toBe('copied')
  })

  it('两个指示器按状态互斥显隐，且都不卸载', async () => {
    teardowns.push(installClipboard(async () => {}))
    const c = makeClipboard({ value: 'abc' })

    const idleIcon = () => c.api().getIndicatorProps({ copied: false }) as Dict
    const copiedIcon = () => c.api().getIndicatorProps({ copied: true }) as Dict

    expect(idleIcon().hidden).toBeUndefined()
    expect(copiedIcon().hidden).toBe(true)
    // 声明侧的 data-copied 恒等于调用方自报的那一侧，与当前状态无关
    expect(idleIcon()['data-copied']).toBeUndefined()
    expect(copiedIcon()['data-copied']).toBe('')

    c.service.send({ type: 'COPY.TRIGGER' })
    // 写入在途时仍是"未复制"那一侧在台前：还没成功就不该先亮对钩
    expect(idleIcon().hidden).toBeUndefined()
    expect(copiedIcon().hidden).toBe(true)

    await settleWrite()
    expect(idleIcon().hidden).toBe(true)
    expect(copiedIcon().hidden).toBeUndefined()
    expect(copiedIcon()['data-state']).toBe('copied')
  })

  it('api.value 在没给 value 时是空串', () => {
    expect(makeClipboard().api().value).toBe('')
    expect(makeClipboard({ value: 'x' }).api().value).toBe('x')
  })
})
