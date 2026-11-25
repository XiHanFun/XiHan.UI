/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 focus trap 类型契约。

import type { Cleanup, Layer, MachineSchema, PropTypes, RuntimeConfig } from '@xihan-ui/core'

export interface FocusTrapSchema extends MachineSchema {
  props: {
    /** 是否陷住焦点，缺省 true。由 true 变 false 时停用，按 restoreFocus 归还焦点。 */
    active?: boolean
    /** Tab 走过最后一个可聚焦元素时回到第一个、Shift+Tab 反之，缺省 true；false 时停在两端。 */
    loop?: boolean
    /**
     * 激活时把焦点移进来，缺省 true：落到第一个可聚焦元素，一个都没有时落到根上。
     * false 时焦点留在原处，等它进来再陷住。
     */
    autoFocus?: boolean
    /** 停用或卸载时把焦点还给激活前的持有者，缺省 true。 */
    restoreFocus?: boolean
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: {
    /** 运行时配置：层栈与焦点域都从这里取；无 DOM 环境为 null，机器照常转移、不挂副作用。 */
    config: RuntimeConfig | null
    /** 适配器给的层登记函数：激活期间在层栈里占一层，好让开在里面的浮层与压在上面的对话框暂停它。 */
    registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
    /** 根节点，每次现取。 */
    getRootEl: () => HTMLElement | null
  }
  state: 'inactive' | 'active'
  event:
    | { type: 'ACTIVATE' }
    | { type: 'DEACTIVATE' }
  tag: never
  guard: never
  action: 'syncActive'
  effect: 'trapFocus'
}

export interface FocusTrapApi<T extends PropTypes = PropTypes> {
  /** 此刻是否陷住焦点。 */
  active: boolean
  getRootProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface FocusTrapTranslations {}
