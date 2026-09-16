/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toast 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { ToastApi, ToastSchema, ToastStatus } from './toast.types'
import { dataAttr } from '@xihan-ui/core'
import { toastAnatomy } from './toast.anatomy'
import { resolveToastDuration, resolveToastId } from './toast.machine'

const parts = toastAnatomy.build()

/** 内部子态收敛成对外的三段式：running / paused 都是"还在台上"。 */
function toStatus(state: ToastSchema['state']): ToastStatus {
  if (state === 'dismissing' || state === 'unmounted')
    return state
  return 'visible'
}

export function connectToast<T extends PropTypes>(
  service: Service<ToastSchema>,
  normalize: NormalizeProps<T>,
): ToastApi<T> {
  const { state, prop, send, context, scope } = service
  const ids = scope.ids('toast', 'title', 'description')

  const status = toStatus(state.get())
  const paused = state.matches('visible.paused')
  // 语气直接落到全库共用的语气层上，配色不由这里另写一套；加载中另有一位，字形与不自动消失都跟它走
  const tone = prop('tone') ?? 'info'
  const loading = !!prop('loading')
  const closable = prop('closable') ?? true
  const id = resolveToastId(prop('id'), scope)
  const unmounted = status === 'unmounted'
  const duration = resolveToastDuration(loading, prop('duration'))
  const autoDismiss = Number.isFinite(duration)

  return {
    id,
    status,
    tone,
    loading,
    title: prop('title'),
    description: prop('description'),
    paused,
    closable,
    duration,
    remaining: context.get('remaining'),
    dismiss: () => send({ type: 'TOAST.DISMISS' }),
    pause: () => send({ type: 'TOAST.PAUSE', src: 'api' }),
    resume: () => send({ type: 'TOAST.RESUME', src: 'api' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 出错要打断当前朗读（alert + assertive），其余排队等空隙（status + polite）。
      // 两者都显式写：role 隐含的 live 值各家读屏并不一致。
      'role': tone === 'danger' ? 'alert' : 'status',
      'aria-live': tone === 'danger' ? 'assertive' : 'polite',
      // 整条一起念，否则用户会听到半截话
      'aria-atomic': 'true',
      'aria-labelledby': ids.title,
      'aria-describedby': prop('description') ? ids.description : undefined,
      // 不报 aria-busy：这一块本身就是活区，busy 会让读屏把「正在上传」这句压到完事才念
      'data-loading': dataAttr(loading),
      // 语气轴只挂在 root 上，子部件靠继承拿到语气槽
      'data-tone': tone,
      'data-state': status,
      'data-paused': dataAttr(paused),
      // 退场窗口走完只收起、不卸载，何时把这条从队列里删掉是宿主的决定
      'hidden': unmounted || undefined,
      // 指针停在条子上就把计时按住；pointerenter / pointerleave 不冒泡，只认本条这块区域。
      'onPointerEnter': () => send({ type: 'TOAST.PAUSE', src: 'pointer' }),
      'onPointerLeave': () => send({ type: 'TOAST.RESUME', src: 'pointer' }),
      'onFocusIn': () => send({ type: 'TOAST.PAUSE', src: 'focus' }),
      'onFocusOut': (event: FocusEvent) => {
        // 焦点在本条内部换节点也会派 focusout，判据取焦点是不是真的离开了本条
        const next = event.relatedTarget as Node | null
        const root = event.currentTarget as Element | null
        if (next && root?.contains(next))
          return
        send({ type: 'TOAST.RESUME', src: 'focus' })
      },
    }),

    // 语气这枚图形读屏念出来是重复信息：它表达的意思标题里已经写了
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': true,
      'data-loading': dataAttr(loading),
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
    }),

    getTitleProps: () => normalize.element({
      ...parts.title.attrs,
      id: ids.title,
    }),

    getDescriptionProps: () => normalize.element({
      ...parts.description.attrs,
      id: ids.description,
    }),

    // 进入退场后机器不再接这两个事件，按钮点了也不会有第二次退场
    getActionTriggerProps: () => normalize.button({
      ...parts['action-trigger'].attrs,
      'type': 'button',
      // 带文案的离散动作钮：盒、悬停 / 按下与按压、焦点环由 Action Control 家族按这几位给。
      // 非 Button 的触发器缺省中性描边，取 text outline 档；Toast 没有 size 轴，固定 sm
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-variant': 'outline',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'sm',
      'onClick': () => send({ type: 'TOAST.ACTION' }),
    }),

    // 倒计时条：时长交给皮肤的时长槽，走一遍就到头，按住计时时由皮肤停住动画。
    // 不自动消失的那些没有可走的计时，整条收起
    getProgressProps: () => normalize.element({
      ...parts.progress.attrs,
      'aria-hidden': true,
      'data-state': status,
      'hidden': !autoDismiss || undefined,
      'style': { '--xh-toast-progress-duration': autoDismiss ? `${duration}ms` : '' },
    }),

    getCloseTriggerProps: () => normalize.button({
      ...parts['close-trigger'].attrs,
      'type': 'button',
      'aria-label': prop('translations')?.close ?? 'Close',
      // 只有字形的离散动作钮：盒、悬停 / 按下与按压、粗指针热区、焦点环、禁用面由 Action Control 家族按这几位给。
      // 取 icon ghost 档；那颗叉排在单行短消息里，走行级动作钮的 xs（24px）。
      // 显隐不走家族的 hover-focus（那一档用 visibility 收起，这颗叉占 Tab 位，收起后键盘够不到），
      // 由皮肤按 root 的悬停 / 焦点只压 opacity
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'xs',
      // 单体控件用原生 disabled：不可聚焦、也不占 Tab 位；家族按 data-disabled 给禁用面
      'disabled': !closable || undefined,
      'data-disabled': dataAttr(!closable),
      // 不可关闭时连按钮一起收起，不留一个按不动的叉
      'hidden': !closable || undefined,
      'onClick': () => {
        // 作者把这份 props 摊到非按钮节点上时原生 disabled 不生效，守卫得自己带
        if (!closable)
          return
        send({ type: 'TOAST.DISMISS' })
      },
    }),
  }
}
