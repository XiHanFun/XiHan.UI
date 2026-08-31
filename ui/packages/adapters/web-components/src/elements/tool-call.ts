import type { ToolCallOpenChangeDetails, ToolCallPhase, ToolCallProps, ToolCallSchema, ToolCallTranslations } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import { connectToolCall, isToolCallRunning, toolCallAnatomy, toolCallMachine, toolCallMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 给出
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席为 undefined、"false" 为 false、其余为 true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-tool-call>` —— Light-DOM 行为宿主：跑 tool-call 机器，把 connect 产出打到作者写的
 * 角色节点上。跑起来自动展开、结束自动收起；用户手动开合过一次即永久停用自动开合。
 *
 * 参数与结果的内容一律由作者写，元素不替作者生成节点。
 *
 * @customElement xh-tool-call
 * @attr {string} phase - 走到哪一步：input-streaming / input-available / awaiting-approval / output-available / output-error
 * @attr {boolean} open - 受控开合，缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初值
 * @attr {boolean} auto-disclosure - 跟着阶段自动开合，默认开；写 auto-disclosure="false" 关掉
 * @attr {boolean} disabled - 禁用折叠开关
 * @attr {string} tone - 语气
 * @attr {string} size - 尺寸：sm / md / lg
 * @fires open-change - 开合变化；detail 为 `{ open: boolean, source: 'user' | 'auto' | 'api' }`
 * @csspart root - 外壳，承载 data-state / data-phase / data-running
 * @csspart trigger - 折叠开关，承载 aria-expanded / aria-controls
 * @csspart indicator - 纯装饰指示，对读屏隐藏
 * @csspart name - 工具名，排在开关内因而计入它的可访问名
 * @csspart status - 阶段文字，同上
 * @csspart approval - 审批闸门的常驻位，只在等人批准时显示
 * @csspart content - 详情区，role=region 且由开关命名
 * @csspart input - 调用参数
 * @csspart output - 调用结果
 * @csspart error - 错误信息，出错时开关的 aria-describedby 指向它
 */
export class XhToolCallElement extends XhElement {
  static override partContract = { anatomy: toolCallAnatomy, meta: toolCallMeta }

  // 描述符逐个写全，不用对象展开，CEM 分析器的 lit 插件读不了展开元素的名字
  static override properties = {
    phase: { converter: STRING_CONVERTER },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { converter: BOOLEAN_CONVERTER, attribute: 'default-open' },
    autoDisclosure: { converter: BOOLEAN_CONVERTER, attribute: 'auto-disclosure' },
    disabled: { converter: BOOLEAN_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 对象值走不了 HTML 属性，只作为 property 暴露
    translations: { attribute: false },
  }

  declare phase?: ToolCallPhase
  declare open?: boolean
  declare defaultOpen?: boolean
  declare autoDisclosure?: boolean
  declare disabled?: boolean
  declare tone?: Tone
  declare size?: Size
  /** 各阶段的状态文案。 */
  declare translations?: Partial<ToolCallTranslations>

  private readonly notify = (details: ToolCallOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<ToolCallSchema>(this, toolCallMachine, () => ({
    // 作者只写 phase，跑不跑由纯函数折出来交给机器
    running: isToolCallRunning(this.phase ?? 'input-available'),
    open: this.open,
    defaultOpen: this.defaultOpen,
    autoDisclosure: this.autoDisclosure,
    disabled: this.disabled,
    onOpenChange: this.notify,
  }))

  /** 视图属性另走一路：本族两个组件共用一台机器，走机器 props 的话文案会全取到 tool-call 那一格。 */
  private viewProps(): ToolCallProps {
    return {
      phase: this.phase,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
    }
  }

  protected wire(): void {
    const api = connectToolCall(this.ctrl.service, this.configured('tool-call', this.viewProps()), wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('indicator', api.getIndicatorProps() as Record<string, unknown>)
    put('name', api.getNameProps() as Record<string, unknown>)
    put('status', api.getStatusProps() as Record<string, unknown>)
    put('approval', api.getApprovalProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('input', api.getInputProps() as Record<string, unknown>)
    put('output', api.getOutputProps() as Record<string, unknown>)
    put('error', api.getErrorProps() as Record<string, unknown>)
  }
}
