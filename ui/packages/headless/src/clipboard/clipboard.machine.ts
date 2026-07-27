import type { Scope } from '@xihan-ui/core'
import type { ClipboardSchema } from './clipboard.types'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'

const { createMachine } = setup<ClipboardSchema>()

/** 复制成功后指示器默认保持的毫秒数。 */
export const CLIPBOARD_TIMEOUT = 3000

/**
 * 停留时长归一。返回 Infinity 表示"不起计时器"：
 * timeout <= 0 或非有限数都按"复制成功后一直保持 copied"处理，这是关掉自动回落的写法。
 */
export function resolveClipboardTimeout(timeout: number | undefined): number {
  const ms = timeout ?? CLIPBOARD_TIMEOUT
  return Number.isFinite(ms) && ms > 0 ? ms : Number.POSITIVE_INFINITY
}

/**
 * 往系统剪贴板写一段文本。
 *
 * 只走 navigator.clipboard.writeText：它要求安全上下文（https / localhost），也可能被权限策略拒绝，
 * 两种情况都以 promise 拒绝表达。接口整个缺席时（非安全上下文里浏览器直接不挂这个对象）
 * 在这里合成一个拒绝，让调用方只需处理"失败"这一种形态，不必再分"没有接口"与"写失败"。
 *
 * 全局对象经 scope 取：跨 iframe / shadow 场景下真正该问的是宿主文档那个 window。
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
 * 写入这件事有真实的失败面，所以它必须有自己的状态（copying）：
 * 只有这样异步写才住在状态副作用里，拿得到拆卸钩子——组件在写入途中被卸载、
 * 或用户又点了一次导致重来时，上一轮兑现的 promise 就被 disposed 标记挡住，
 * 不会往已经停机或已经走远的机器里送事件。写在动作里做不到这一点：动作没有拆卸时机。
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
        // 失败一律回 idle：界面上绝不能留下"已复制"的假象，原因如实交给宿主
        'COPY.ERROR': { target: 'idle', actions: ['invokeCopyError', 'invokeIdle'] },
        // 刻意不接 COPY.TRIGGER：写入还在路上，连点两下不该发两次写请求
      },
    },
    copied: {
      entry: ['invokeCopied'],
      effects: ['trackTimeout'],
      on: {
        'after.timeout': { target: 'idle', actions: ['invokeIdle'] },
        // 停留窗口里再点一次要重新写：值可能已经改了，而且点了就该有反馈
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
        prop('onCopyError')?.({ error: e.error, value: prop('value') ?? '' })
      },
    },
    effects: {
      /**
       * 异步写入。取值在发起那一刻定死，不在兑现时再读一遍 prop：
       * 写进剪贴板的是当时那个值，回调里报另一个值会让宿主对不上账。
       */
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
              send({ type: 'COPY.ERROR', error })
          },
        )

        return () => {
          disposed = true
        }
      },
      trackTimeout: ({ prop, send }) => {
        const ms = resolveClipboardTimeout(prop('timeout'))
        // 不回落：不起计时器（Infinity 送进 setTimeoutEffect 会抛）
        if (!Number.isFinite(ms))
          return undefined
        return setTimeoutEffect(() => send({ type: 'after.timeout' }), ms)
      },
    },
  },
})
