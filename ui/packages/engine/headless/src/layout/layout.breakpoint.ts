import type { EffectParams } from '@xihan-ui/core'
import type { LayoutBreakpoint, LayoutSchema } from './layout.types'

interface Binding {
  readonly tier: LayoutBreakpoint
  readonly width: string
  readonly query: MediaQueryList
  readonly dispose: () => void
  matched: boolean | undefined
}

/** 单错保持身份，多错按主异常、清理异常的顺序报告。 */
function throwErrors(errors: unknown[]): void {
  if (errors.length === 1)
    throw errors[0]
  if (errors.length > 1)
    throw new AggregateError(errors, '[xh] Layout 断点同步与清理失败', { cause: errors[0] })
}

/** 根 effect 独占媒体查询；属性换代与事件通知复用同一同步入口。 */
export function trackSiderBreakpoint({ prop, context, send, scope, track }: EffectParams<LayoutSchema>): () => void {
  let binding: Binding | null = null
  let disposed = false
  let syncing = false
  let pending = false
  let presentation: LayoutSchema['props']['siderPresentation']

  const release = (): void => {
    const previous = binding
    binding = null
    previous?.dispose()
  }

  function acquire(tier: LayoutBreakpoint, width: string): Binding {
    const win = scope.getWin()
    if (typeof win.matchMedia !== 'function')
      throw new Error('[xh] Layout 断点需要所属 Window.matchMedia')
    const query = win.matchMedia(`(min-width: ${width})`)
    let active = true
    const candidate: Binding = {
      tier,
      width,
      query,
      matched: undefined,
      dispose() {
        if (!active)
          return
        active = false
        query.removeEventListener('change', notify)
      },
    }
    function notify(): void {
      if (active && !disposed && binding === candidate && prop('siderBreakpoint') === tier)
        sync()
    }
    // 先持有 remover，覆盖宿主先添加监听再抛错的情况。
    try {
      query.addEventListener('change', notify)
    }
    catch (error) {
      const errors = [error]
      try {
        candidate.dispose()
      }
      catch (cleanupError) {
        errors.push(cleanupError)
      }
      throwErrors(errors)
    }
    return candidate
  }

  function reconcile(): void {
    const tier = prop('siderBreakpoint')
    const nextPresentation = prop('siderPresentation')
    const isCurrent = (): boolean => !disposed
      && prop('siderBreakpoint') === tier
      && prop('siderPresentation') === nextPresentation
    if (tier === undefined) {
      release()
      if (!isCurrent()) {
        pending = !disposed
        return
      }
      presentation = nextPresentation
      context.set('siderNarrow', false)
      return
    }

    const width = scope.getComputedStyle(scope.getDoc().documentElement)
      .getPropertyValue(`--xh-breakpoint-${tier}`)
      .trim()
    if (!width)
      throw new Error(`[xh] Layout 缺少断点令牌 --xh-breakpoint-${tier}`)
    if (!isCurrent()) {
      pending = !disposed
      return
    }
    if (!binding || binding.tier !== tier || binding.width !== width) {
      const next = acquire(tier, width)
      if (disposed) {
        next.dispose()
        return
      }
      const previous = binding
      binding = next
      previous?.dispose()
    }
    if (!isCurrent()) {
      pending = !disposed
      return
    }
    const current = binding
    if (!current)
      return
    const matched = current.query.matches
    if (!isCurrent()) {
      pending = !disposed
      return
    }
    const changed = current.matched !== matched
    const enteredSheet = presentation !== 'sheet' && nextPresentation === 'sheet'
    current.matched = matched
    presentation = nextPresentation
    context.set('siderNarrow', !matched)
    if (!isCurrent()) {
      pending = !disposed
      return
    }
    if (changed)
      prop('onSiderBreakpoint')?.({ matched })
    if (!isCurrent()) {
      pending = !disposed
      return
    }
    if (nextPresentation === 'sheet' && (changed || enteredSheet))
      send(matched ? { type: 'SIDER.EXPAND' } : { type: 'SIDER.COLLAPSE' })
  }

  function sync(): void {
    if (disposed)
      return
    pending = true
    if (syncing)
      return
    syncing = true
    try {
      // disposed 可由业务回调同步清理置位。
      // eslint-disable-next-line no-unmodified-loop-condition
      while (pending && !disposed) {
        pending = false
        reconcile()
      }
    }
    catch (error) {
      pending = false
      const errors = [error]
      // 无效的新配置不能继续驱动旧查询；失败后由下一次有效属性更新重新建立。
      try {
        release()
      }
      catch (cleanupError) {
        errors.push(cleanupError)
      }
      throwErrors(errors)
    }
    finally {
      syncing = false
    }
  }

  const dispose = (): void => {
    if (disposed)
      return
    disposed = true
    pending = false
    release()
  }
  try {
    track([() => prop('siderBreakpoint'), () => prop('siderPresentation')], sync)
    sync()
  }
  catch (error) {
    const errors = [error]
    try {
      dispose()
    }
    catch (cleanupError) {
      errors.push(cleanupError)
    }
    throwErrors(errors)
  }
  return dispose
}
