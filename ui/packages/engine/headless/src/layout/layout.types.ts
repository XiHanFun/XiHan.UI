/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 layout 类型契约。

import type { MachineSchema, PropTypes, RuntimeConfig } from '@xihan-ui/core'

/** 侧栏挂在行首还是行尾。 */
export type LayoutSiderPlacement = 'start' | 'end'

/** 断点档位名，与栅格、瀑布流同一套，逐字对应断点令牌。 */
export type LayoutBreakpoint = 'sm' | 'md' | 'lg' | 'xl'

/** 侧栏的呈现形态：inline 在骨架中占一列；sheet 移出画外、展开时覆盖在内容之上。 */
export type LayoutSiderPresentation = 'inline' | 'sheet'

export interface LayoutSiderCollapsedChangeDetails {
  collapsed: boolean
}

export interface LayoutSiderBreakpointDetails {
  /** 视口宽度是否已达到 siderBreakpoint 档；为假即窄屏，侧栏已按折叠宽显示。 */
  matched: boolean
}

/** 适配器在状态机挂载前注入的宿主运行时。 */
export interface LayoutRefs {
  /** Escape 层级判断所用的 Scope 与 LayerRegistry，二者必须属于状态机 Scope 的同一 Document。 */
  config: RuntimeConfig | null
}

export interface LayoutSchema extends MachineSchema {
  props: {
    /** 受控折叠态：提供后由宿主决定。 */
    siderCollapsed?: boolean
    /** 非受控初始折叠态。 */
    defaultSiderCollapsed?: boolean
    /** 展开时侧栏的宽度，任意 CSS 长度；未提供时使用皮肤中的档位。 */
    siderWidth?: string
    /** 折叠时侧栏的宽度，任意 CSS 长度；未提供时使用皮肤中的档位。 */
    siderCollapsedWidth?: string
    /** 侧栏挂在行首还是行尾，默认 start。 */
    siderPlacement?: LayoutSiderPlacement
    /**
     * 侧栏的自适应断点：视口窄于该档时侧栏按折叠宽显示。
     * 只切换宽度不改变折叠态：折叠态归 siderCollapsed 通道，两者互不干扰。
     * 运行期更换档位会重新绑定媒体查询；需要所属 Window.matchMedia 与对应断点令牌。
     */
    siderBreakpoint?: LayoutBreakpoint
    /**
     * 侧栏呈现形态，默认 inline（在骨架中占一列）。
     *
     * sheet 是覆盖档：侧栏移出画外，展开时覆盖在内容之上并铺一层遮罩，内容因此占满整宽。
     * 同时提供 siderBreakpoint 时它只在未达该档时成立：宽屏仍占一列，窄屏才覆盖，
     * 且跨档时侧栏随之开合（进入覆盖档收起、回到占位档展开），经 siderCollapsed 通道。
     *
     * 覆盖档不锁定焦点、不把背后的内容标记为惰性：它是骨架中的一段，不是模态浮层。
     */
    siderPresentation?: LayoutSiderPresentation
    /** 头部吸顶：滚动时头部固定在滚动容器的上沿。只写标记，固定的实现归皮肤。 */
    headerFixed?: boolean
    /** 侧栏吸附：滚动时侧栏固定在滚动容器的上沿，头部也吸顶时让开头部的高度。只写标记，固定的实现归皮肤。 */
    siderFixed?: boolean
    /** 在头部、侧栏、脚部与内容之间绘制分隔线。 */
    bordered?: boolean
    /** 折叠态变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onSiderCollapsedChange?: (details: LayoutSiderCollapsedChangeDetails) => void
    /**
     * 跨过断点时发出一次，挂载或更换档位时也发出一次当前值。
     * 窄屏需要把侧栏换成抽屉时接入该回调：组件自身只切换宽度。
     */
    onSiderBreakpoint?: (details: LayoutSiderBreakpointDetails) => void
  }
  context: {
    /** 视口是否窄于 siderBreakpoint 档；未提供断点时恒为 false。 */
    siderNarrow: boolean
  }
  computed: Record<string, never>
  refs: LayoutRefs
  state: 'expanded' | 'collapsed'
  event:
    | { type: 'SIDER.COLLAPSE' }
    | { type: 'SIDER.EXPAND' }
    | { type: 'SIDER.TOGGLE' }
    // 受控回写：宿主改 siderCollapsed 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.COLLAPSE' }
    | { type: 'CONTROLLED.EXPAND' }
  tag: never
  guard: 'isSiderCollapsedControlled'
  action: 'invokeOnCollapse' | 'invokeOnExpand' | 'syncSiderCollapsed'
  effect: 'trackSiderBreakpoint' | 'dismissSiderSheet'
}

export interface LayoutApi<T extends PropTypes = PropTypes> {
  /** 侧栏当前是否折叠。 */
  siderCollapsed: boolean
  /** 已解析的侧栏呈现形态：提供断点时，覆盖档只在未达该档时成立。 */
  siderPresentation: LayoutSiderPresentation
  setSiderCollapsed: (next: boolean) => void
  getRootProps: () => T['element']
  getHeaderProps: () => T['element']
  /**
   * 覆盖档铺在内容之上的遮罩：点击它收起侧栏。
   * 占位档下它带 hidden，不占位也不接收指针。渲染时排在侧栏之前：两层同一个层号，覆盖顺序按文档序。
   */
  getSiderBackdropProps: () => T['element']
  getSiderProps: () => T['element']
  getContentProps: () => T['element']
  getFooterProps: () => T['element']
  getSiderTriggerProps: () => T['button']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface LayoutTranslations {}
