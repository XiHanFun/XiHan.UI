import type {
  ApprovalDecisionDetails,
  ApprovalNoteChangeDetails,
  ApprovalSchema,
  ApprovalScope,
  ApprovalScopesChangeDetails,
  ApprovalStatus,
  ApprovalTranslations,
} from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import { approvalAnatomy, approvalMachine, approvalMeta, connectApproval } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 给出
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席为 undefined、"false" 为 false、其余为 true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 空串按缺席处理，避免 Number('') 落成 0
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-approval>` —— Light-DOM 行为宿主：危险动作执行前的人在环闸门。
 *
 * 超时一律按拒绝收口，这条由机器结构保证；拒绝这条路永远走得通。
 * 授权项的身份写在作者自己的节点上（`scope-value` 等 `scope-*` 属性），
 * **不用 value**——那是表单属性，写上去会与本组件无关的表单语义搅在一起。
 *
 * @customElement xh-approval
 * @attr {string} request-id - 这一轮请求的身份，变了即重入待决并按新时长重起计时
 * @attr {string} status - 受控判定态：pending / approved / denied / expired
 * @attr {string} default-status - 非受控初值，默认 pending
 * @attr {number} timeout-ms - 多久没人答就按拒绝收口；缺省不起计时器
 * @attr {string} note - 受控的备注文本，随判定载荷一起发出
 * @attr {string} default-note - 备注的非受控初值，默认空串
 * @attr {boolean} loading - 判定在途：只挡重复批准，不挡拒绝
 * @attr {boolean} deny-on-escape - Escape 判为拒绝，默认开
 * @attr {boolean} deny-on-unmount - 卸载时若仍待决就按拒绝派一次，默认关
 * @attr {string} live - 播报档位：polite（默认）或 assertive
 * @attr {string} tone - 语气
 * @attr {string} size - 尺寸：sm / md / lg
 * @fires decision - 判定落定；detail 为 `{ requestId, decision, source, scopes }`
 * @fires granted-scopes-change - 勾选的授权项变化；detail 为 `{ value: string[] }`
 * @fires note-change - 备注变化；detail 为 `{ value: string }`
 * @csspart root - role=group 的闸门本体
 * @csspart title - 闸门标题，给它命名
 * @csspart description - 闸门说明，给它描述
 * @csspart live-region - 可配档位的活区
 * @csspart group - 授权项那一组
 * @csspart item - 一项授权，role=checkbox，只认 Space
 * @csspart item-indicator - 勾选记号，对读屏隐藏
 * @csspart item-text - 授权项文字，排在勾选项内因而构成它的可及名
 * @csspart note - 附在判定上的一句自由文本
 * @csspart timer - 剩余时间，对读屏隐藏
 * @csspart result - 判定落定后才露出的结果条，对读屏隐藏
 * @csspart actions - 排布两颗按钮的动作行
 * @csspart approve-trigger - 批准
 * @csspart deny-trigger - 拒绝
 */
export class XhApprovalElement extends XhElement {
  static override partContract = { anatomy: approvalAnatomy, meta: approvalMeta }

  // 描述符逐个写全，不用对象展开，CEM 分析器的 lit 插件读不了展开元素的名字
  static override properties = {
    requestId: { converter: STRING_CONVERTER, attribute: 'request-id' },
    status: { converter: STRING_CONVERTER },
    defaultStatus: { converter: STRING_CONVERTER, attribute: 'default-status' },
    timeoutMs: { converter: NUMBER_CONVERTER, attribute: 'timeout-ms' },
    note: { converter: STRING_CONVERTER },
    defaultNote: { converter: STRING_CONVERTER, attribute: 'default-note' },
    loading: { converter: BOOLEAN_CONVERTER },
    denyOnEscape: { converter: BOOLEAN_CONVERTER, attribute: 'deny-on-escape' },
    denyOnUnmount: { converter: BOOLEAN_CONVERTER, attribute: 'deny-on-unmount' },
    live: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 数组与对象值走不了 HTML 属性，只作为 property 暴露
    scopes: { attribute: false },
    grantedScopes: { attribute: false },
    defaultGrantedScopes: { attribute: false },
    translations: { attribute: false },
  }

  declare requestId?: string
  declare status?: ApprovalStatus
  declare defaultStatus?: ApprovalStatus
  declare timeoutMs?: number
  declare note?: string
  declare defaultNote?: string
  declare loading?: boolean
  declare denyOnEscape?: boolean
  declare denyOnUnmount?: boolean
  declare live?: 'polite' | 'assertive'
  declare tone?: Tone
  declare size?: Size
  /** 可勾选的授权范围；不给就没有勾选那一段。 */
  declare scopes?: readonly ApprovalScope[]
  declare grantedScopes?: readonly string[]
  declare defaultGrantedScopes?: readonly string[]
  declare translations?: Partial<ApprovalTranslations>

  private readonly emit = (type: string, detail: unknown): void => {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }))
  }

  private readonly notifyDecision = (details: ApprovalDecisionDetails): void => this.emit('decision', details)
  private readonly notifyScopes = (details: ApprovalScopesChangeDetails): void => this.emit('granted-scopes-change', details)
  private readonly notifyNote = (details: ApprovalNoteChangeDetails): void => this.emit('note-change', details)

  private readonly ctrl = new MachineController<ApprovalSchema>(this, approvalMachine, () => ({
    requestId: this.requestId,
    status: this.status,
    defaultStatus: this.defaultStatus,
    timeoutMs: this.timeoutMs,
    scopes: this.scopes,
    grantedScopes: this.grantedScopes,
    defaultGrantedScopes: this.defaultGrantedScopes,
    note: this.note,
    defaultNote: this.defaultNote,
    loading: this.loading,
    denyOnEscape: this.denyOnEscape,
    denyOnUnmount: this.denyOnUnmount,
    live: this.live,
    tone: this.tone,
    size: this.size,
    translations: this.translations,
    onDecision: this.notifyDecision,
    onGrantedScopesChange: this.notifyScopes,
    onNoteChange: this.notifyNote,
  }))

  /** 一项授权的自报家门，全部取自作者写在节点上的 scope-* 属性。 */
  private scopeOf(el: HTMLElement): ApprovalScope {
    return {
      value: el.getAttribute('scope-value') ?? '',
      label: el.getAttribute('scope-label') ?? undefined,
      required: el.hasAttribute('scope-required'),
      disabled: el.hasAttribute('scope-disabled'),
    }
  }

  protected wire(): void {
    const api = connectApproval(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('group', api.getGroupProps() as Record<string, unknown>)
    put('note', api.getNoteProps() as Record<string, unknown>)
    put('timer', api.getTimerProps() as Record<string, unknown>)
    put('result', api.getResultProps() as Record<string, unknown>)
    put('footer', api.getFooterProps() as Record<string, unknown>)
    put('approve-trigger', api.getApproveTriggerProps() as Record<string, unknown>)
    put('deny-trigger', api.getDenyTriggerProps() as Record<string, unknown>)

    const live = this.getPart('live-region')
    if (live) {
      this.spreader.spread(live, api.getLiveRegionProps() as Record<string, unknown>)
      live.textContent = api.announcement
    }

    // 多实例 part 逐个打，授权项有几条打几条
    for (const el of this.getParts('item')) {
      const scope = this.scopeOf(el)
      this.spreader.spread(el, api.getItemProps(scope) as Record<string, unknown>)
      for (const indicator of el.querySelectorAll<HTMLElement>('[data-xh-part="item-indicator"]'))
        this.spreader.spread(indicator, api.getItemIndicatorProps(scope) as Record<string, unknown>)
      for (const label of el.querySelectorAll<HTMLElement>('[data-xh-part="item-text"]'))
        this.spreader.spread(label, api.getItemTextProps(scope) as Record<string, unknown>)
    }
  }
}
