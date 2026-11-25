/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 container 类型契约。

import type { PropTypes } from '@xihan-ui/core'

/** 版心的最大宽度档：与断点同名同宽；full 不限宽。 */
export type ContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ContainerProps {
  /** 最大宽度档，缺省 lg。 */
  maxWidth?: ContainerMaxWidth
}

export interface ContainerApi<T extends PropTypes = PropTypes> {
  /** 解析后的最大宽度档。 */
  maxWidth: ContainerMaxWidth
  getRootProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface ContainerTranslations {}
