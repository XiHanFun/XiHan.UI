/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 approval 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

export type ApprovalStatus = 'pending' | 'approved' | 'denied' | 'expired'

/** 一项可勾选的授权范围。 */
export interface ApprovalScope {
  value: string
  label?: string
  /** 必选项：未全部勾选时不能批准。 */
  required?: boolean
  disabled?: boolean
}

export interface ApprovalDecisionDetails {
  requestId?: string
  /**
   * 只有两个取值。超时不是第三种判定：它落为 denied，`expired` 只是显示态。
   * 类型层封闭之后，没有任何路径能让超时产出批准。
   */
  decision: 'approved' | 'denied'
  source: 'user' | 'timeout' | 'escape' | 'unmount' | 'api'
  /** 判定时刻已勾选的授权项。勾选与判定是原子的，不存在已批准但范围尚未同步的窗口。 */
  scopes: string[]
  /** 判定时刻备注中的文字。备注为空时不带该字段。 */
  note?: string
}

export interface ApprovalScopesChangeDetails {
  value: string[]
}

export interface ApprovalNoteChangeDetails {
  value: string
}

/**
 * 拒绝按钮的选择器，供 dialog 的 initialFocus 使用。
 * 两条并列：Vue 侧首帧即有 data-part，Web Components 侧作者书写的 data-xh-part 一开始即存在。
 */
export const APPROVAL_DENY_SELECTOR
  = '[data-scope="approval"][data-part="deny-trigger"],[data-xh-part="deny-trigger"]'

/** 接了按压通道的三种部件：两颗判定钮各一把键，授权项按 value 记。 */
export type ApprovalPressedKey = 'approve' | 'deny' | `item:${string}`

export interface ApprovalSchema extends MachineSchema {
  props: {
    /** 本轮请求的身份。变化即重新进入待决，并按新时长重新计时。 */
    requestId?: string
    /** 提供即受控。 */
    status?: ApprovalStatus
    defaultStatus?: ApprovalStatus
    /**
     * 超时无人应答时按拒绝收口。默认不提供默认值：替宿主决定安全策略比不决定更危险。
     * 非有限值或非正数同样不启动计时器，既不按 0ms 立即到期，也不视为无限期放行。
     */
    timeoutMs?: number
    scopes?: readonly ApprovalScope[]
    grantedScopes?: readonly string[]
    defaultGrantedScopes?: readonly string[]
    /**
     * 附在判定上的一段自由文本。提供即受控。
     * 它只随判定载荷发出，不参与必选项是否全部勾选的判断。
     */
    note?: string
    defaultNote?: string
    /** 判定在途：只阻止重复批准，不阻止拒绝。 */
    loading?: boolean
    /** Escape 判为拒绝，默认开启。 */
    denyOnEscape?: boolean
    /**
     * 卸载时若仍待决则按拒绝派发一次，默认关闭。
     * 机制成立不等于默认值成立：列表更换 key、路由切换、热更新的任何一次重挂，
     * 都会替用户发出未做过的判定。
     */
    denyOnUnmount?: boolean
    /** 播报档位，默认 polite。 */
    live?: 'polite' | 'assertive'
    /** 形态：outline 描边、subtle 底色分区、ghost 无壳内联。默认 outline。 */
    variant?: ControlVariant
    tone?: Tone
    size?: Size
    translations?: Partial<ApprovalTranslations>
    onDecision?: (details: ApprovalDecisionDetails) => void
    onGrantedScopesChange?: (details: ApprovalScopesChangeDetails) => void
    onNoteChange?: (details: ApprovalNoteChangeDetails) => void
  }
  context: {
    grantedScopes: string[]
    note: string
    /**
     * 按压通道：正被 Space / Enter 或触屏手指按住的那一个（授权项只认 Space），该部件投影 data-pressed。
     * 抬起、失焦、指针取消，或判定落定、转入挂起时撤下；与勾选、判定互相独立。
     */
    pressed: ApprovalPressedKey | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: ApprovalStatus
  event:
    | { type: 'APPROVE' }
    | { type: 'DENY', source: ApprovalDecisionDetails['source'] }
    | { type: 'SCOPE.TOGGLE', value: string }
    | { type: 'SCOPE.SET', value: string[] }
    | { type: 'NOTE.SET', value: string }
    /** 到期。只声明在待决态上，迟到的定时事件落地即静默丢弃。 */
    | { type: 'after.timeout' }
    // 受控回写：宿主改 status 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.PENDING' }
    | { type: 'CONTROLLED.APPROVE' }
    | { type: 'CONTROLLED.DENY' }
    | { type: 'CONTROLLED.EXPIRE' }
    /** 更换了一轮请求。 */
    | { type: 'REQUEST.RESET' }
    /**
     * 按压通道：某个部件被 Space / Enter 或触屏按住。disabled 是授权项自身的禁用事实，由 connect 判定后随事件带入；
     * 判定在途与必选项未勾满由守卫按 props 与 context 判。
     */
    | { type: 'PRESS.START', key: ApprovalPressedKey, disabled?: boolean }
    /** 按住的部件抬起、失焦或指针取消；只松开 key 对应的那一个。 */
    | { type: 'PRESS.END', key: ApprovalPressedKey }
  tag: never
  guard: 'isStatusControlled' | 'canApprove' | 'isEditable' | 'canApproveControlled' | 'canPress'
  action:
    | 'invokeApprove'
    | 'invokeDeny'
    | 'invokeExpire'
    | 'toggleScope'
    | 'setScopes'
    | 'resetScopes'
    | 'setNote'
    | 'resetNote'
    | 'denyIfPending'
    | 'resetRequest'
    | 'syncStatus'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseWhenInert'
  effect: 'trackTimeout'
}

export interface ApprovalApi<T extends PropTypes = PropTypes> {
  status: ApprovalStatus
  /** 已判定：两个按钮都收起出口。 */
  settled: boolean
  loading: boolean
  grantedScopes: string[]
  /** 备注中的文字；未填写时为空串。 */
  note: string
  /** 必选项是否全部勾选。 */
  canApprove: boolean
  /** 按 status 选出的播报文本；关闭 announce 时作者不渲染该部件即可。 */
  announcement: string
  approve: () => void
  deny: () => void
  setGrantedScopes: (next: string[]) => void
  setNote: (next: string) => void
  isScopeGranted: (value: string) => boolean
  getRootProps: () => T['element']
  /** 待决时的呼吸点：判过即收，对读屏隐藏。 */
  getStatusIndicatorProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getLiveRegionProps: () => T['element']
  getGroupProps: () => T['element']
  getItemProps: (scope: ApprovalScope) => T['element']
  getItemIndicatorProps: (scope: ApprovalScope) => T['element']
  getItemTextProps: (scope: ApprovalScope) => T['element']
  getNoteProps: () => T['input']
  getTimerProps: () => T['element']
  getResultProps: () => T['element']
  getFooterProps: () => T['element']
  getApproveTriggerProps: () => T['button']
  getDenyTriggerProps: () => T['button']
}

export interface ApprovalTranslations {
  approve: string
  deny: string
  /** 授权项分组的名字。 */
  scopes: string
  /** 备注字段的名字。 */
  note: string
  /** 备注字段的占位文字；未提供时不产出 placeholder。 */
  notePlaceholder: string
  pending: string
  approved: string
  denied: string
  expired: string
}

/** 必选项是否全部勾选。没有必选项时恒为真。 */
export function canApproveScopes(scopes: readonly ApprovalScope[] | undefined, granted: readonly string[]): boolean {
  if (!scopes)
    return true
  return scopes.every(scope => scope.required !== true || granted.includes(scope.value))
}
