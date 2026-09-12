import type { Service } from '@xihan-ui/core'
import type {
  FormApi,
  FormColumnCount,
  FormColumns,
  FormColumnsByBreakpoint,
  FormControlState,
  FormErrorPatch,
  FormErrorsChangeDetails,
  FormFieldSpan,
  FormInvalidDetails,
  FormPath,
  FormSchema,
  FormSubmitDetails,
  FormValidateOn,
  FormValidationErrorDetails,
  FormValues,
  FormValuesChangeDetails,
} from '@xihan-ui/headless'
import type { FormControlHost } from './form-control-host'
import { connectForm, formAnatomy, formMachine, formMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'
import { FORM_CONTROL_HOST_SELECTOR } from './form-control-host'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// Lit 自带的 Boolean 转换器判的是 v !== null，写 disabled="false" 反而成了真
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 仅限本适配器复合控件的私有服务槽；不用导出函数，避免误变成自定义元素公开 API。
const FORM_SERVICE = Symbol.for('xh.form.service')

/**
 * 列数写整数就是各档同一个列数（`columns="2"`），写 JSON 对象就是逐档的列数
 * （`columns='{"base":1,"md":2}'`）。解析不出对象时当没写：落一个半截对象进去，
 * 缺的那几档会安静地退回一列，而作者看不出是哪里写坏了。
 */
const COLUMNS_CONVERTER = {
  fromAttribute: (v: string | null) => {
    if (v === null)
      return undefined
    if (!v.trimStart().startsWith('{'))
      return Number(v) as FormColumnCount
    try {
      const parsed: unknown = JSON.parse(v)
      return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as FormColumnsByBreakpoint)
        : undefined
    }
    catch {
      return undefined
    }
  },
}

/**
 * 读字段容器自报的跨列：属性缺席或为空时当作没写。
 * 写 full 就是占满整行，写整数就是跨这么多列；取值范围由 connect 判。
 */
function fieldSpanOf(el: HTMLElement): FormFieldSpan | undefined {
  const raw = el.getAttribute('span')
  if (raw == null || raw.trim() === '')
    return undefined
  if (raw.trim() === 'full')
    return 'full'
  const n = Number(raw)
  return Number.isFinite(n) ? (n as FormColumnCount) : undefined
}

/**
 * 字段容器与摘要条目以 `name` 声明字符串路径。数组路径必须是严格 JSON 的
 * `data-path`：不猜点号、不接收逗号拼接，改动又由宿主基类观察并重接线。
 */
function fieldPathOf(el: HTMLElement): FormPath {
  const raw = el.getAttribute('data-path')
  if (raw != null) {
    try {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(segment => typeof segment === 'string' || (typeof segment === 'number' && Number.isFinite(segment))))
        return parsed as FormPath
    }
    catch { /* 在下面给出稳定错误 */ }
    throw new TypeError('[xh] <xh-form> 的 data-path 必须是非空 string/number 数组 JSON')
  }
  return el.getAttribute('name') ?? ''
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
 * 每个字段用一个 field-group 包住并用 `name` 属性自报字符串字段：错误摘要的链接指向它，
 * 提交失败后的焦点也落进它——落点按**文档序**取第一个出错的字段，而不是错误表的键序。
 *
 * @customElement xh-form
 * @attr {string} validate-on - 校验时机：submit（默认）/ blur / change
 * @attr {string} layout - 排布：vertical（默认）/ horizontal（标签左置两列）/ inline（横排一行流）/ grid（等宽列的网格）
 * @attr {number|string} columns - grid 下分几列（1 至 4 的整数），不写或超出范围按一列排；写 JSON 对象则逐档给列数（base / sm / md / lg / xl）
 * @attr {string} label-width - horizontal 下标签列宽（CSS 长度），整表统一对齐
 * @attr {string} label-align - horizontal 下标签对齐缘：end（默认，贴控件）/ start
 * @attr {boolean} disabled - 整个表单禁用：提交、重置、写值一概不发生，两颗按钮带原生 disabled
 * @attr {boolean} read-only - 只读：写值与重置不发生，但仍可提交
 * @fires values-change - 值表变化；detail 为 `{ values }`
 * @fires errors-change - 错误表变化；detail 为 `{ errors }`
 * @fires submit - 校验通过才派发；detail 为 `{ values }`
 * @fires invalid - 校验不通过时派发；detail 为 `{ errors, values }`
 * @fires validation-error - 校验器执行异常；detail 为 `{ cause, values, field }`，field 为 null 表示整表提交
 * @csspart root - 表单根容器，必须是原生 `<form>`（承载 data-state/data-disabled/data-readonly/data-invalid）
 * @csspart field-group - 单个字段的容器，须自带 name 标识字符串字段；数组路径写严格 JSON `data-path`；带 id 供摘要链接指向。
 *   grid 排布下再写个 `span` 属性（1 至 4，或 full 占满整行）就是这一格占多宽，落成 data-span；
 *   运行期改写它不触发重新接线，需作者自行 requestUpdate。
 *   组里的 `<xh-field>` 由表单驱动 invalid/required/disabled，作者显式设的会被顶掉
 * @csspart error-summary - role=alert 的错误汇总（一次提交失败里唯一打断朗读的活区），提交失败且仍有错误时才显形
 * @csspart error-summary-item - 摘要里的一条，须是原生 `<a>` 且用 name 或严格 JSON `data-path` 标识字段；无对应错误时带 hidden
 * @csspart submit-trigger - 提交键，须是原生 button（连接层写成 type=submit）
 * @csspart reset-trigger - 重置键，须是原生 button（连接层写成 type=reset）
 */
export class XhFormElement extends XhElement {
  static override partContract = { anatomy: formAnatomy, meta: formMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 四张表与校验函数都是对象/函数，走不了属性；只作为 property 暴露，与 Vue 侧的同名 prop 对齐。
    // values / errors 给了即受控：元素内部的写入只发事件，等宿主自己写回
    values: { attribute: false },
    defaultValues: { attribute: false },
    errors: { attribute: false },
    defaultErrors: { attribute: false },
    validate: { attribute: false },
    rules: { attribute: false },
    validateMessages: { attribute: false },
    validateOn: { converter: STRING_CONVERTER, attribute: 'validate-on' },
    layout: { converter: STRING_CONVERTER },
    columns: { converter: COLUMNS_CONVERTER },
    labelWidth: { converter: STRING_CONVERTER, attribute: 'label-width' },
    labelAlign: { converter: STRING_CONVERTER, attribute: 'label-align' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
  }

  declare values?: FormValues
  declare defaultValues?: FormValues
  declare errors?: FormErrorPatch
  declare defaultErrors?: FormErrorPatch
  declare validate?: FormSchema['props']['validate']
  /** 声明式校验规则；对象进不了属性，只作为 property 暴露。 */
  declare rules?: FormSchema['props']['rules']
  declare validateMessages?: FormSchema['props']['validateMessages']
  declare validateOn?: FormValidateOn
  declare layout?: FormSchema['props']['layout']
  declare columns?: FormColumns
  declare labelWidth?: string
  declare labelAlign?: FormSchema['props']['labelAlign']
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

  private readonly notifyValidationError = (details: FormValidationErrorDetails): void => {
    this.dispatchEvent(new CustomEvent('validation-error', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<FormSchema>(
    this,
    formMachine,
    () => this.machineProps(),
    // 落焦与"哪个字段排在前面"都要现查这棵子树，机器因此得拿到那个 <form>。
    // getter 而不是当下的节点：角色节点是作者渲染的，随时可能换一批
    {
      onBuilt: (svc) => {
        const host = this as unknown as { [FORM_SERVICE]?: Service<FormSchema> }
        host[FORM_SERVICE] = svc
        svc.refs.set('getRootEl', () => this.getPart('root'))
      },
    },
  )

  private machineProps(): Partial<FormSchema['props']> {
    return {
      values: this.values,
      defaultValues: this.defaultValues,
      errors: this.errors,
      defaultErrors: this.defaultErrors,
      validate: this.validate,
      rules: this.rules,
      validateMessages: this.validateMessages,
      validateOn: this.validateOn,
      layout: this.layout,
      columns: this.columns,
      labelWidth: this.labelWidth,
      labelAlign: this.labelAlign,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      onValuesChange: this.notifyValues,
      onErrorsChange: this.notifyErrors,
      onSubmit: this.notifySubmit,
      onInvalid: this.notifyInvalid,
      onValidationError: this.notifyValidationError,
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
  setFieldValue(name: FormPath, value: unknown): void {
    this.commands().setFieldValue(name, value)
  }

  /** 写一个字段的错误；不给文案（或给空串）即清掉这一条。 */
  setFieldError(name: FormPath, message?: string): void {
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
  getFieldId(name: FormPath): string {
    return this.commands().getFieldId(name)
  }

  getFieldValue(name: FormPath): unknown {
    return this.commands().getFieldValue(name)
  }

  /** 该字段此刻的错误文案；没错时为 undefined。 */
  getFieldError(name: FormPath): string | undefined {
    return this.commands().getFieldError(name)
  }

  /** 出错的字段名，插入顺序。 */
  get errorNames(): FormPath[] {
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

  /** 最近一次有效校验的执行异常；没有异常时为 null。 */
  get validationError(): FormValidationErrorDetails | null {
    return this.commands().validationError
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

    // 字段容器与摘要条目都是多实例 part，逐个打：身份取 name 或严格 data-path。
    for (const el of this.getParts('field-group')) {
      const name = fieldPathOf(el)
      this.spreader.spread(el, api.getFieldGroupProps({ name, span: fieldSpanOf(el) }) as Record<string, unknown>)
      const state: FormControlState = {
        disabled: api.disabled,
        readOnly: api.readOnly,
        required: api.isFieldRequired(name),
        invalid: api.isFieldInvalid(name),
      }
      // 表单只发现 Light-DOM 控件并交出最近状态；实例优先级与实际交互都由控件机器处理。
      for (const control of el.querySelectorAll<FormControlHost>(`xh-field, ${FORM_CONTROL_HOST_SELECTOR}`)) {
        // Field 自己会再把已合并状态交给其内的控件，避免 Form 越过 Field 覆盖最近继承源。
        if (control.tagName !== 'XH-FIELD' && control.closest('xh-field'))
          continue
        control.setFormControlState(state)
      }
    }

    for (const el of this.getParts('error-summary-item')) {
      const name = fieldPathOf(el)
      this.spreader.spread(el, api.getErrorSummaryItemProps({ name }) as Record<string, unknown>)
      // Light DOM 常驻，WC 自管可见性：作者层若给条目声明了 display，
      // 会盖过 UA 的 [hidden]{display:none}，光靠 hidden 属性收不起来
      this.setPartHidden(el, api.getFieldError(name) === undefined)
    }

    this.setPartHidden(this.getPart('error-summary'), !(api.submitFailed && api.invalid))
  }
}
