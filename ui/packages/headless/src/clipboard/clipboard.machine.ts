import type { Scope } from '@xihan-ui/kernel'
import type { ClipboardSchema } from './clipboard.types'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'

const { createMachine } = setup<ClipboardSchema>()

/** 复制成功后指示器默认保持的毫秒数。 */
export const CLIPBOARD_TIMEOUT = 3000

/** 停留时长归一；timeout <= 0 或非有限数返回 Infinity，表示不自动回落。 */
export function resolveClipboardTimeout(timeout: number | undefined): number {
  const ms = timeout ?? CLIPBOARD_TIMEOUT
  return Number.isFinite(ms) && ms > 0 ? ms : Number.POSITIVE_INFINITY
}

/**
 * 往系统剪贴板写一段文本。
 *
 * 只走 navigator.clipboard.writeText（要求安全上下文）；接口缺席时合成一个拒绝，
 * 失败一律以 promise 拒绝表达。全局对象经 scope 取，跨 iframe / shadow 时须问宿主文档的 window。
 */
export function writeToClipboard(scope: Scope, text: string): Promise<void> {
  try {
    const clipboard = scope.getWin().navigator?.clipboard
    if (typeof clipboard?.writeText !== 'function')
      return Promise.reject(new Error('[xh] 当前环境不提供 navigator.clipboard.writeText（需要安全上下文）'))
    // 保留 this：拆出 writeText 再裸调会在部分实现上抛 Illegal invocation
    return Promise.resolve(clipboard.writeText(text))
  }
  catch (error) {
    // 无 document 的纯逻辑环境里 getWin 会抛；个别实现的 writeText 也会同步抛
    return Promise.reject(error)
  }
}

/**
 * 剪贴板机器。
 *
 * 异步写入住在 copying 的状态副作用里，靠拆卸钩子挡掉已过期的 promise 回送。
 */
export const clipboardMachine = createMachine({
  name: 'clipboard',
  initialState: () => 'idle',
  states: {
    idle: {
      on: {
        'COPY.TRIGGER': { target: 'copying' },
      },
    },
    copying: {
      entry: ['invokeCopying'],
      effects: ['writeValue'],
      on: {
        'COPY.SUCCESS': { target: 'copied' },
        // 失败一律回 idle，不留下"已复制"的假象
        'COPY.ERROR': { target: 'idle', actions: ['invokeCopyError', 'invokeIdle'] },
        // 不接 COPY.TRIGGER：写入在途，连点不重复发写请求
      },
    },
    copied: {
      entry: ['invokeCopied'],
      effects: ['trackTimeout'],
      on: {
        'after.timeout': { target: 'idle', actions: ['invokeIdle'] },
        // 停留窗口里再点一次重新写
        'COPY.TRIGGER': { target: 'copying' },
      },
    },
  },
  implementations: {
    actions: {
      invokeCopying: ({ prop }) => prop('onStatusChange')?.({ status: 'copying' }),
      invokeCopied: ({ prop }) => prop('onStatusChange')?.({ status: 'copied' }),
      invokeIdle: ({ prop }) => prop('onStatusChange')?.({ status: 'idle' }),
      invokeCopyError: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'COPY.ERROR')
          return
        // 取事件带来的那份，不重读 prop：写入途中宿主改了 value，报出去的就不是实际写入的那一份
        prop('onCopyError')?.({ error: e.error, value: e.value })
      },
    },
    effects: {
      /** 异步写入。取值在发起那一刻定死，不在兑现时重读 prop。 */
      writeValue: ({ prop, scope, send }) => {
        let disposed = false
        const value = prop('value') ?? ''

        writeToClipboard(scope, value).then(
          () => {
            if (!disposed)
              send({ type: 'COPY.SUCCESS' })
          },
          (error: unknown) => {
            if (!disposed)
              send({ type: 'COPY.ERROR', error, value })
          },
        )

        return () => {
          disposed = true
        }
      },
      trackTimeout: ({ prop, send }) => {
        const ms = resolveClipboardTimeout(prop('timeout'))
        // Infinity 送进 setTimeoutEffect 会抛，不回落时不起计时器
        if (!Number.isFinite(ms))
          return undefined
        return setTimeoutEffect(() => send({ type: 'after.timeout' }), ms)
      },
    },
  },
})
