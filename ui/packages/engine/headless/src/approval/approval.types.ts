import type { PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

export type ApprovalStatus = 'pending' | 'approved' | 'denied' | 'expired'

/** 一项可勾选的授权范围。 */
export interface ApprovalScope {
  value: string
  label?: string
  /** 必选项：没勾满就批不了。 */
  required?: boolean
  disabled?: boolean
}

export interface ApprovalDecisionDetails {
  requestId?: string
  /**
   * 只有两个取值。**超时不是第三种判定**：它落成 denied，`expired` 只是显示态。
   * 类型层封死之后，没有任何路径能让超时产出批准。
   */
  decision: 'approved' | 'denied'
  source: 'user' | 'timeout' | 'escape' | 'unmount' | 'api'
  /** 判定那一刻已勾选的授权项。勾选与判定是原子的，不存在「已批准但范围还没同步」的窗口。 */
  scopes: string[]
  /** 判定那一刻备注里的文字。备注为空时不带这一格。 */
  note?: string
}

export interface ApprovalScopesChangeDetails {
  value: string[]
}

export interface ApprovalNoteChangeDetails {
  value: string
}

/**
 * 拒绝按钮的选择器，供 dialog 的 initialFocus 用。
 * 两条并列：Vue 侧首帧就有 data-part，Web Components 侧作者写的 data-xh-part 一开始就在。
 */
export const APPROVAL_DENY_SELECTOR
  = '[data-scope="approval"][data-part="deny-trigger"],[data-xh-part="deny-trigger"]'

export interface ApprovalSchema extends MachineSchema {
  props: {
    /** 这一轮请求的身份。变了即重入待决，并按新时长重起计时。 */
    requestId?: string
    /** 给定即受控。 */
    status?: ApprovalStatus
    defaultStatus?: ApprovalStatus
    /**
     * 多久没人答就按拒绝收口。**缺省不给默认值**——替宿主定安全策略比不定更危险。
     * 非有限值或非正数同样不起计时器，既不当 0ms 立刻到期，也绝不当成无限期放行。
     */
    timeoutMs?: number
    scopes?: readonly ApprovalScope[]
    grantedScopes?: readonly string[]
    defaultGrantedScopes?: readonly string[]
    /**
     * 附在判定上的一句自由文本。给定即受控。
     * 它只随判定载荷发出，不参与「必选项勾满了没有」的判断。
     */
    note?: string
    defaultNote?: string
    /** 判定在途：只挡重复批准，不挡拒绝。 */
    busy?: boolean
    /** Escape 判为拒绝，默认开。 */
    denyOnEscape?: boolean
    /**
     * 卸载时若仍待决就按拒绝派发一次，**默认关**。
     * 机理成立不等于默认值成立：列表换 key、路由切换、热更新任何一次重挂，
     * 都会替用户发出他没做过的判定。
     */
    denyOnUnmount?: boolean
    /** 播报档位，默认 polite。 */
    live?: 'polite' | 'assertive'
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
    /** 到点。只声明在待决态上，迟到的定时事件落地即静默丢弃。 */
    | { type: 'after.timeout' }
    // 受控回写：宿主改 status 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.PENDING' }
    | { type: 'CONTROLLED.APPROVE' }
    | { type: 'CONTROLLED.DENY' }
    | { type: 'CONTROLLED.EXPIRE' }
    /** 换了一轮请求。 */
    | { type: 'REQUEST.RESET' }
  tag: never
  guard: 'isStatusControlled' | 'canApprove' | 'isEditable' | 'canApproveControlled'
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
  effect: 'trackTimeout'
}

export interface ApprovalApi<T extends PropTypes = PropTypes> {
  status: ApprovalStatus
  /** 已经判过了：两颗按钮都收起出口。 */
  settled: boolean
  busy: boolean
  grantedScopes: string[]
  /** 备注里的文字；没写过是空串。 */
  note: string
  /** 必选项是不是都勾满了。 */
  canApprove: boolean
  /** 按 status 选出的那一句播报文本；announce 关掉时作者不渲那个部件即可。 */
  announcement: string
  approve: () => void
  deny: () => void
  setGrantedScopes: (next: string[]) => void
  setNote: (next: string) => void
  isScopeGranted: (value: string) => boolean
  getRootProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getAnnouncementProps: () => T['element']
  getScopeGroupProps: () => T['element']
  getScopeItemProps: (scope: ApprovalScope) => T['element']
  getScopeIndicatorProps: (scope: ApprovalScope) => T['element']
  getScopeLabelProps: (scope: ApprovalScope) => T['element']
  getNoteProps: () => T['input']
  getTimerProps: () => T['element']
  getResultProps: () => T['element']
  getActionsProps: () => T['element']
  getApproveTriggerProps: () => T['button']
  getDenyTriggerProps: () => T['button']
}

export interface ApprovalTranslations {
  approve: string
  deny: string
  /** 授权项那一组的名字。 */
  scopes: string
  /** 备注那一格的名字。 */
  note: string
  /** 备注那一格的占位文字；不给就不产出 placeholder。 */
  notePlaceholder: string
  pending: string
  approved: string
  denied: string
  expired: string
}

/** 必选项是不是都勾满了。没有必选项时恒真。 */
export function canApproveScopes(scopes: readonly ApprovalScope[] | undefined, granted: readonly string[]): boolean {
  if (!scopes)
    return true
  return scopes.every(scope => scope.required !== true || granted.includes(scope.value))
}
