/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 全局配置的类型：Provider 与纯合并函数共用，单独成文件免得两者互相引用。
import type { VisualEnvironmentControllerOptions } from '@xihan-ui/core/visual-environment'
import type { XhConfigBase, XhTranslationOverrides } from '@xihan-ui/headless'

export type { XhTranslationOverrides }

type BindVisualRoot<T> = T extends unknown ? Omit<T, 'parent' | 'root'> & { root: Element } : never
export type XhVisualEnvironmentConfig = BindVisualRoot<VisualEnvironmentControllerOptions>

export interface XhConfig extends XhConfigBase {
  /**
   * 浮层默认挂载的容器；返回 null 即挂载到 body。
   * 应用级默认，实例上写了容器时以实例为准。
   */
  portalContainer?: () => Element | null
  /** 本 Provider 的八轴视觉环境；root 必须显式给出，不推测 DOM 边界。 */
  visualEnvironment?: XhVisualEnvironmentConfig
}
