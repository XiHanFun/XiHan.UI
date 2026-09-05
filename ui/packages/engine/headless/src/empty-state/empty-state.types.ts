import type { PropTypes, Size } from '@xihan-ui/core'

/** 播报方式：polite 让 root 成为 role=status 活区，off 让它只是个普通容器。 */
export type EmptyStateLive = 'polite' | 'off'

/** 结果类型：三个 HTTP 状态码与四种通用结果。 */
export type EmptyStateStatus = '404' | '403' | '500' | 'success' | 'warning' | 'error' | 'info'

export interface EmptyStateProps {
  /** 尺寸档位，只改留白与字号，不改语义。 */
  size?: Size
  /** 缺省 polite。 */
  live?: EmptyStateLive
  /** 结果类型，只落成 root 的 data-status；图标画什么由作者塞进图标槽。 */
  status?: EmptyStateStatus
}

export interface EmptyStateApi<T extends PropTypes = PropTypes> {
  /** 生效的播报方式，缺省补齐后的值。 */
  live: EmptyStateLive
  getRootProps: () => T['element']
  getIndicatorProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getActionProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface EmptyStateTranslations {}
