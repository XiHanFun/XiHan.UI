/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 download trigger 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { DownloadTriggerApi, DownloadTriggerSchema } from './download-trigger.types'
import { dataAttr } from '@xihan-ui/core'
import { pressHandlers } from '../shared/press'
import { downloadTriggerAnatomy } from './download-trigger.anatomy'
import { resolveDownloadFileName } from './download-trigger.machine'

const parts = downloadTriggerAnatomy.build()

export function connectDownloadTrigger<T extends PropTypes>(
  service: Service<DownloadTriggerSchema>,
  normalize: NormalizeProps<T>,
): DownloadTriggerApi<T> {
  const { state, context, prop, send } = service

  const status = state.get()
  const preparing = status === 'preparing'
  const disabled = !!prop('disabled')
  // 与副作用里写进 download 属性的是同一份算法，界面上报的文件名不会与实际写出的那份对不上
  const fileName = resolveDownloadFileName(prop('fileName'))
  // 缺省中性淡底（真源 §7.2 第 2 条：只有 Button 缺省品牌实心）
  const variant = prop('variant') ?? 'subtle'
  // 键盘 / 触屏按住期间的按压面；指针按住由 :active 表出，皮肤两者同一档
  const press = pressHandlers(service)

  return {
    status,
    preparing,
    disabled,
    fileName,
    // 禁用与在途两道守卫都在机器里，这里只把意图递进去
    download: () => send({ type: 'DOWNLOAD.TRIGGER' }),

    getRootProps: () => normalize.button({
      ...parts.root.attrs,
      // 不给 type 会在 form 里变成 submit，Enter 直接提交表单
      'type': 'button',
      // 单体原生控件用原生 disabled：它本就不该被聚焦，也不该派 click
      'disabled': disabled || undefined,
      // 取数在途时按钮仍可聚焦、仍留在原位，只把"正在忙"如实报给读屏
      'aria-disabled': preparing ? 'true' : undefined,
      'aria-busy': preparing ? 'true' : undefined,
      // 按钮里只放一个图标时没有可见文字，可及名字只能由这里给。
      // 不给缺省值：按钮里多半写着「导出 CSV」这类可见文字，凭空盖一个名字上去
      // 会让读屏念的与屏幕上写的对不上
      'aria-label': prop('translations')?.trigger,
      'data-variant': variant,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-state': status,
      'data-disabled': dataAttr(disabled),
      'data-loading': dataAttr(preparing),
      // 定尺的独立动作按钮：盒型、四态面与 0.97 按压由家族配方按 data-xh-action-variant 给出
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-display': 'always',
      'data-xh-action-size': prop('size') ?? 'md',
      'data-xh-action-variant': variant,
      'data-pressed': dataAttr(context.get('pressed')),
      'onClick': () => {
        if (!disabled)
          send({ type: 'DOWNLOAD.TRIGGER' })
      },
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': press.onPointerDown,
      'onPointerUp': press.onPointerUp,
      'onPointerCancel': press.onPointerCancel,
    }),
  }
}
