import type {
  FormApi,
  FormErrorPatch,
  FormErrorsChangeDetails,
  FormInvalidDetails,
  FormSchema,
  FormSubmitDetails,
  FormValidateOn,
  FormValues,
  FormValuesChangeDetails,
} from '@xihan-ui/headless'
import { connectForm, formMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席一律翻成 undefined：缺省值的唯一事实源留在机器与 connect 里。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// Lit 自带的 Boolean 转换器判的是 v !== null，写 disabled="false" 反而成了真
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * 字段容器与摘要条目自报的字段名，取作者写的 `value` 属性。
 *
 * 刻意不叫 `name`：那是原生表单控件的属性，落在 div / a 上没有含义，
 * 而且 Vue 侧它会被声明成 prop 而不落进 DOM，两个适配器的快照会当场分叉。
 * 也不自创一个 `field`：宿主基类只观察 value / disabled / aria-disabled 这几个
 * 「作者声明」属性，用别的名字的话，列表复用节点时的原地改名在 WC 侧不会重新接线——
 * 节点上会留着上一个字段的 id 与 data-name，摘要里的链接就此指错人。
 */
function fieldNameOf(el: HTMLElement): string {
  return el.getAttribute('value') ?? ''
}

/**
 * `<xh-form>` —— Light-DOM 行为宿主：作者写 root（必须是原生 `<form>`）与
 * field-group / error-summary / error-summary-item / submit-trigger / reset-trigger 角色节点，
 * 元素跑 form 机器并把 connect 产出打上去。
 *
 * 提交只有一条路：`<form>` 自己的 submit 事件。回车的隐式提交、`type=submit` 按钮、
 * 以及命令式的 `submit()` 全部汇到那里，连接层一律 preventDefault——页面永不刷新，
 * 校验与回调都由组件收口。
 *
 * 值与错误都是「表」：元素不去收割原生控件里的值（那要替作者猜 checkbox / 多选 / 数字的类型），
 * 而是由作者经 `values` 属性或 `setFieldValue()` 写进来。校验函数同样由作者给。
 *
 * 每个字段用一个 field-group 包住并用 `value` 属性自报字段名：错误摘要的链接指向它，
 * 提交失败后的焦点也落进它——落点按**文档序**取第一个出错的字段，而不是错误表的键序。
 *
 * @customElement xh-form
 * @attr {string} validate-on - 校验时机：submit（默认）/ blur / change
 * @attr {boolean} disabled - 整个表单禁用：提交、重置、写值一概不发生，两颗按钮带原生 disabled
 * @attr {boolean} read-only - 只读：写值与重置不发生，但仍可提交
 * @fires values-change - 值表变化；detail 为 `{ values }`
 * @fires errors-change - 错误表变化；detail 为 `{ errors }`
 * @fires submit - 校验通过才派发；detail 为 `{ values }`
 * @fires invalid - 校验不通过时派发；detail 为 `{ errors, values }`
 * @csspart root - 表单根容器，必须是原生 `<form>`（承载 data-state/data-disabled/data-readonly/data-invalid）
 * @csspart field-group - 单个字段的容器，须自带 value 属性标识字段名；带 id 供摘要链接指向
 * @csspart error-summary - role=alert 的错误汇总，提交失败且仍有错误时才显形
 * @csspart error-summary-item - 摘要里的一条，须是原生 `<a>` 且自带 value 属性标识字段名；无对应错误时带 hidden
 * @csspart submit-trigger - 提交键，须是原生 button（连接层写成 type=submit）
 * @csspart reset-trigger - 重置键，须是原生 button（连接层写成 type=reset）
 */
export class XhFormElement extends XhElement {
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
  static override properties = {
    // 四张表与校验函数都是对象/函数，走不了属性；只作为 property 暴露，与 Vue 侧的同名 prop 对齐。
    // values / errors 给了即受控：元素内部的写入只发事件，等宿主自己写回
    values: { attribute: false },
    defaultValues: { attribute: false },
    errors: { attribute: false },
    defaultErrors: { attribute: false },
    validate: { attribute: false },
    validateOn: { converter: STRING_CONVERTER, attribute: 'validate-on' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
  }

  declare values?: FormValues
  declare defaultValues?: FormValues
  declare errors?: FormErrorPatch
  declare defaultErrors?: FormErrorPatch
  declare validate?: FormSchema['props']['validate']
  declare validateOn?: FormValidateOn
  declare disabled?: boolean
  declare readOnly?: boolean

  private readonly notifyValues = (details: FormValuesChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('values-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyErrors = (details: FormErrorsChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('errors-change', { detail: details, bubbles: true, composed: true }))
  }

  // 与原生 submit 撞不上：连接层已经把那条原生事件的冒泡掐断在 <form> 上，
  // 从本元素冒出去的 submit 只可能是这一条（且只在校验通过时才有）
  private readonly notifySubmit = (details: FormSubmitDetails): void => {
    this.dispatchEvent(new CustomEvent('submit', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyInvalid = (details: FormInvalidDetails): void => {
    this.dispatchEvent(new CustomEvent('invalid', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<FormSchema>(
    this,
    formMachine,
    () => this.machineProps(),
    // 落焦与"哪个字段排在前面"都要现查这棵子树，机器因此得拿到那个 <form>。
    // getter 而不是当下的节点：角色节点是作者渲染的，随时可能换一批
    { onBuilt: svc => svc.refs.set('getRootEl', () => this.getPart('root')) },
  )

  private machineProps(): Partial<FormSchema['props']> {
    return {
      values: this.values,
      defaultValues: this.defaultValues,
      errors: this.errors,
      defaultErrors: this.defaultErrors,
      validate: this.validate,
      validateOn: this.validateOn,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      onValuesChange: this.notifyValues,
      onErrorsChange: this.notifyErrors,
      onSubmit: this.notifySubmit,
      onInvalid: this.notifyInvalid,
    }
  }

  /**
   * 命令式入口共用的取法。机器要到进文档（hostConnected）才建：
   * 还没进文档就下命令是调用方的时序问题，明说好过把这条命令静默丢掉。
   */
  private commands(): FormApi {
    if (!this.ctrl.service)
      throw new Error('[xh] <xh-form> 还没进文档，命令式接口此时不可用')
    return connectForm(this.ctrl.service, wcNormalize)
  }

  /** 写一个字段的值；禁用或只读时不动。 */
  setFieldValue(name: string, value: unknown): void {
    this.commands().setFieldValue(name, value)
  }

  /** 写一个字段的错误；不给文案（或给空串）即清掉这一条。 */
  setFieldError(name: string, message?: string): void {
    this.commands().setFieldError(name, message)
  }

  clearErrors(): void {
    this.commands().clearErrors()
  }

  /** 走完整的校验与提交流程，与用户按提交键完全同一条路。 */
  submit(): void {
    this.commands().submit()
  }

  /** 值与错误都回到初始；禁用或只读时不动。 */
  reset(): void {
    this.commands().reset()
  }

  /** 字段容器的 DOM id：作者要把它落到自己的控件上时取这里，别自己拼。 */
  getFieldId(name: string): string {
    return this.commands().getFieldId(name)
  }

  getFieldValue(name: string): unknown {
    return this.commands().getFieldValue(name)
  }

  /** 该字段此刻的错误文案；没错时为 undefined。 */
  getFieldError(name: string): string | undefined {
    return this.commands().getFieldError(name)
  }

  /** 出错的字段名，插入顺序。 */
  get errorNames(): string[] {
    return this.commands().errorNames
  }

  get errorCount(): number {
    return this.commands().errorCount
  }

  /** 错误表非空。与"提交失败过"无关。 */
  get invalid(): boolean {
    return this.commands().invalid
  }

  /** 上一次提交被拦下了：错误摘要据此显形。 */
  get submitFailed(): boolean {
    return this.commands().submitFailed
  }

  protected wire(): void {
    const api = connectForm(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('error-summary', api.getErrorSummaryProps() as Record<string, unknown>)
    put('submit-trigger', api.getSubmitTriggerProps() as Record<string, unknown>)
    put('reset-trigger', api.getResetTriggerProps() as Record<string, unknown>)

    // 字段容器与摘要条目都是多实例 part，逐个打：身份取作者写的 value 属性
    for (const el of this.getParts('field-group'))
      this.spreader.spread(el, api.getFieldGroupProps({ name: fieldNameOf(el) }) as Record<string, unknown>)

    for (const el of this.getParts('error-summary-item')) {
      this.spreader.spread(el, api.getErrorSummaryItemProps({ name: fieldNameOf(el) }) as Record<string, unknown>)
      // Light DOM 常驻，WC 自管可见性：作者层若给条目声明了 display，
      // 会盖过 UA 的 [hidden]{display:none}，光靠 hidden 属性收不起来
      this.setPartHidden(el, api.getFieldError(fieldNameOf(el)) === undefined)
    }

    this.setPartHidden(this.getPart('error-summary'), !(api.submitFailed && api.invalid))
  }
}
