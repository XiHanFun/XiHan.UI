/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 empty state 类型契约。

import type { PropTypes, Size, Tone } from '@xihan-ui/core'

/** 播报方式：polite 让 root 成为 role=status 活区，off 让它只是个普通容器。 */
export type EmptyStateLive = 'polite' | 'off'

/** 结果页的状态码：找不到、没权限、服务出错。成功 / 警示 / 出错 / 提示这类通用结果走 tone。 */
export type EmptyStateStatus = '404' | '403' | '500'

export interface EmptyStateProps {
  /** 尺寸档位，只改留白与字号，不改语义。 */
  size?: Size
  /** 缺省 polite。 */
  live?: EmptyStateLive
  /** 结果页的状态码，只落成 root 的 data-status；皮肤据它把图标区并进最接近的一族语气色，图标画什么由作者塞进图标槽。 */
  status?: EmptyStateStatus
  /** 语气：brand / neutral / success / warning / danger / info，决定图标区用哪族颜色；与 status 都写时以它为准。不给即维持中性。 */
  tone?: Tone
}

export interface EmptyStateApi<T extends PropTypes = PropTypes> {
  /** 生效的播报方式，缺省补齐后的值。 */
  live: EmptyStateLive
  getRootProps: () => T['element']
  /** 插画槽：按自己的尺寸档量，与字形槽二选一。 */
  getMediaProps: () => T['element']
  getIndicatorProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getActionProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface EmptyStateTranslations {}
