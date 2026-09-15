/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 empty state 类型契约。

import type { PropTypes, Size, Tone } from '@xihan-ui/core'

/** 播报方式：polite 使 root 成为 role=status 活区，off 使它只是普通容器。 */
export type EmptyStateLive = 'polite' | 'off'

/** 结果页的状态码：未找到、无权限、服务出错。成功 / 警示 / 出错 / 提示这类通用结果使用 tone。 */
export type EmptyStateStatus = '404' | '403' | '500'

export interface EmptyStateProps {
  /** 尺寸档位，只影响留白与字号，不改变语义。 */
  size?: Size
  /** 默认 polite。 */
  live?: EmptyStateLive
  /** 结果页的状态码，只写为 root 的 data-status；皮肤据此把图标区并入最接近的一族语气色，图标内容由作者放入图标槽。 */
  status?: EmptyStateStatus
  /** 语气：brand / neutral / success / warning / danger / info，决定图标区使用哪族颜色；与 status 都提供时以它为准。未提供时保持中性。 */
  tone?: Tone
}

export interface EmptyStateApi<T extends PropTypes = PropTypes> {
  /** 生效的播报方式，默认值补齐后的结果。 */
  live: EmptyStateLive
  getRootProps: () => T['element']
  /** 插画槽：按自身的尺寸档测量，与字形槽二选一。 */
  getMediaProps: () => T['element']
  getIndicatorProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getActionProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface EmptyStateTranslations {}
