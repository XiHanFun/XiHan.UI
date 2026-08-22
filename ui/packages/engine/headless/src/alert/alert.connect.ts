import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { AlertApi, AlertSchema } from './alert.types'
import { dataAttr } from '@xihan-ui/kernel'
import { alertAnatomy } from './alert.anatomy'

const parts = alertAnatomy.build()

/**
 * 语气到实时区语义的映射。
 *
 * 依据 W3C APG：Alert 模式（patterns/alert）说 role="alert" 隐含 aria-live="assertive"
 * 且 aria-atomic="true"，用于"需要用户立即知道"的信息；Status 的 role="status" 隐含
 * aria-live="polite"，等读屏念完手头的内容再插播。
 * 出错与警告属于前者，一般信息与成功回执属于后者。
 * live 值仍显式写出：role 隐含的 live 各家读屏落实并不一致。
 */
function liveOf(tone: string): { role: 'alert' | 'status', live: 'assertive' | 'polite' } {
  return tone === 'danger' || tone === 'warning'
    ? { role: 'alert', live: 'assertive' }
    : { role: 'status', live: 'polite' }
}

export function connectAlert<T extends PropTypes>(
  service: Service<AlertSchema>,
  normalize: NormalizeProps<T>,
): AlertApi<T> {
  const { state, prop, send, scope } = service
  const open = state.get() === 'open'
  const tone = prop('tone') ?? 'info'
  const closable = prop('closable') ?? true
  const ids = scope.ids('alert', 'title', 'description')
  const stateAttr = open ? 'open' : 'closed'
  const { role, live } = liveOf(tone)

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  return {
    open,
    tone,
    closable,
    setOpen,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': role,
      'aria-live': live,
      // 整条一起念，否则用户会听到半截话
      'aria-atomic': 'true',
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      // 语气轴只挂在 root 上，子部件靠继承拿到语气槽
      'data-tone': tone,
      'data-state': stateAttr,
      'hidden': !open || undefined,
    }),

    // 图标只是把语气再画一遍，读屏念出来是重复信息
    getIconProps: () => normalize.element({
      ...parts.icon.attrs,
      'aria-hidden': true,
    }),

    getTitleProps: () => normalize.element({
      ...parts.title.attrs,
      id: ids.title,
    }),

    getDescriptionProps: () => normalize.element({
      ...parts.description.attrs,
      id: ids.description,
    }),

    getCloseTriggerProps: () => normalize.button({
      ...parts['close-trigger'].attrs,
      'type': 'button',
      'aria-label': prop('translations')?.close ?? 'Close',
      // 单体控件用原生 disabled：不可聚焦、也不占 Tab 位
      'disabled': !closable || undefined,
      'data-disabled': dataAttr(!closable),
      // 不可关闭时连按钮一起收起，不留一个按不动的叉
      'hidden': !closable || undefined,
      'onClick': () => {
        // 作者把这份 props 摊到非按钮节点上时原生 disabled 不生效，守卫得自己带
        if (!closable)
          return
        send({ type: 'CLOSE' })
      },
    }),
  }
}
