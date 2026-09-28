/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 alert 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { AlertApi, AlertSchema } from './alert.types'
import { dataAttr } from '@xihan-ui/core'
import { pressHandlers } from '../shared/press'
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
  const { state, prop, send, scope, context } = service
  const open = state.get() === 'open'
  // 按压通道：真源在机器 context，跟踪器只把 Space / Enter 与触屏按住翻成事件；指针按住由 :active 表出
  const pressed = context.get('pressed')
  const press = pressHandlers(service)
  const tone = prop('tone') ?? 'info'
  const closable = prop('closable') ?? true
  const banner = !!prop('banner')
  const ids = scope.ids('alert', 'title', 'description')
  const stateAttr = open ? 'open' : 'closed'
  // 收起后先播完退场（淡出、再收起占位）才藏起：这几帧里根还留着，但已不接交互
  const exiting = !open && context.get('rendered')
  const exitBlockSize = context.get('exitBlockSize')
  const { role, live } = liveOf(tone)

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  return {
    open,
    tone,
    closable,
    banner,
    setOpen,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': role,
      'aria-live': live,
      // 整条一起念，否则用户会听到半截话
      'aria-atomic': 'true',
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      // 机器按 id 找到它：收起前量高度，并等它的退场动画播完再藏起
      'id': scope.partId('alert', 'root'),
      // 语气轴只挂在 root 上，子部件靠继承拿到语气槽
      'data-tone': tone,
      // 横幅是贴边铺满的页面通栏：皮肤据此撤掉圆角与另外三条边，只留朝向页面内容的块尾描边
      'data-banner': dataAttr(banner),
      'data-state': stateAttr,
      // 退场动画播完才写 hidden
      'hidden': (!open && !exiting) || undefined,
      // 退场途中的关闭钮与作者操作不再可点、可聚焦
      'inert': exiting || undefined,
      // 退场收占位的起点：收起那一刻量下的整块高度
      'style': {
        '--xh-_alert-exit-block-size': exiting && exitBlockSize != null ? `${exitBlockSize}px` : '',
      },
    }),

    // 图标只是把语气再画一遍，读屏念出来是重复信息
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': true,
    }),

    // 文本列只圈出标题与说明这一列，可及名字仍由 root 的 labelledby / describedby 指向两者
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

    // 操作槽只圈出按钮区，按钮本身的语义归作者（或 Button 组件）
    getActionProps: () => normalize.element({
      ...parts.action.attrs,
    }),

    getCloseTriggerProps: () => normalize.button({
      ...parts['close-trigger'].attrs,
      'type': 'button',
      'aria-label': prop('translations')?.close ?? 'Close',
      // 只有字形的离散动作钮：盒、悬停 / 按下与按压、粗指针热区、焦点环、禁用面由 Action Control 家族按这几位给。
      // 取 icon ghost 档（静息透明、白底承载 hover 100 → pressed 200）；Alert 没有 size 轴，固定 sm（32px 正方盒）
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'sm',
      // 单体控件用原生 disabled：不可聚焦、也不占 Tab 位；家族按 data-disabled 给禁用面
      'disabled': !closable || undefined,
      'data-disabled': dataAttr(!closable),
      // 不可关闭时连按钮一起收起，不留一个按不动的叉
      'hidden': !closable || undefined,
      // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active；提示收起由机器撤下
      'data-pressed': dataAttr(pressed),
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': press.onPointerDown,
      'onPointerUp': press.onPointerUp,
      'onPointerCancel': press.onPointerCancel,
      'onClick': () => {
        // 作者把这份 props 摊到非按钮节点上时原生 disabled 不生效，守卫得自己带
        if (!closable)
          return
        send({ type: 'CLOSE' })
      },
    }),
  }
}
