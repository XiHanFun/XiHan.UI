import type { Service } from '@xihan-ui/core'
import type {
  EditableActivationMode,
  EditableEditChangeDetails,
  EditableSchema,
  EditableSubmitMode,
  EditableValueChangeDetails,
  EditableValueCommitDetails,
  EditableValueRevertDetails,
} from '@xihan-ui/headless'
import { connectEditable, editableAnatomy, editableMachine, editableMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，以此区分受控与非受控。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（用默认值）、="false"=false、其余=true。
// Lit 默认的 Boolean 转换器是 v !== null，缺省为真的开关（select-on-focus）会因此永远关不掉
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-editable>` —— Light-DOM 行为宿主：作者写 root/label/control/preview/input
 * 与三颗按钮的角色节点，元素跑 editable 机器并把 connect 产出打上去。
 *
 * 预览态显示 preview、编辑态显示 input，另一个带 hidden 收起而不卸载：两边都是作者写的节点，
 * 替他删掉他就再也拿不回来，输入法状态与他挂在节点上的东西也一并没了。
 *
 * preview 的文字默认由元素填（值，或值为空时的 placeholder）；作者自己写了内容就归作者，
 * 元素不再改写——首次见到该节点时定，之后不回读（读到的会是自己上一帧写的）。
 *
 * label 的 `for` 恒写向 input 的 id，所以 label 角色节点必须是原生 `<label>`、
 * input 角色节点必须是原生 `<input>`：任一边换成 `<div>`，读屏就念不出这个控件的名字。
 *
 * @customElement xh-editable
 * @attr {string} value - 受控值；缺省该属性即非受控
 * @attr {string} default-value - 非受控初值
 * @attr {boolean} edit - 受控编辑态；缺省该属性即非受控
 * @attr {boolean} default-edit - 非受控初始即编辑态（挂载后焦点搬进输入框）
 * @attr {string} placeholder - 值为空时预览区显示它，输入框也拿它当占位
 * @attr {boolean} disabled - 禁用：进不了编辑态，输入框带原生 disabled
 * @attr {boolean} read-only - 只读：进不了编辑态，但已在编辑态时仍能退出
 * @attr {boolean} invalid - 校验失败标注
 * @attr {number} max-length - 字符数上限；同时落成原生 maxlength 与机器侧截断
 * @attr {string} name - 表单字段名；给了输入框才参与提交
 * @attr {'blur'|'enter'|'both'|'none'} submit-mode - 编辑态怎么收尾，默认 both
 * @attr {'click'|'dblclick'|'focus'|'none'} activation-mode - 预览区怎么进编辑态，默认 click
 * @attr {boolean} select-on-focus - 进编辑态时全选，默认开；写 select-on-focus="false" 关掉
 * @attr {boolean} auto-resize - 输入框宽度跟着内容走（落成原生 size）
 * @fires value-change - 编辑途中的值变化；detail 为 `{ value: string }`
 * @fires value-commit - 提交；detail 为 `{ value: string, previousValue: string }`
 * @fires value-revert - 撤销；detail 为 `{ value: string, discardedValue: string }`
 * @fires edit-change - 编辑态变化；detail 为 `{ edit: boolean }`
 * @csspart root - role=group 容器，承载 data-state / data-disabled / data-readonly / data-invalid / data-empty
 * @csspart label - 标题；`for` 恒写向 input，故须是原生 `<label>`
 * @csspart preview - 预览态的文字；留空即由元素填入显示值，作者写了内容则归作者
 * @csspart input - 编辑态的输入框，须是原生 `<input>`；键盘交互全在它身上
 * @csspart control - 预览区、输入框与三颗按钮的共同落点，预览与输入轮流上场
 * @csspart edit-trigger - 进编辑态的按钮；编辑态收起，不可编辑时置灰
 * @csspart submit-trigger - 提交按钮；预览态收起
 * @csspart cancel-trigger - 撤销按钮；预览态收起
 */
export class XhEditableElement extends XhElement {
  static override partContract = { anatomy: editableAnatomy, meta: editableMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    edit: { converter: BOOLEAN_CONVERTER },
    defaultEdit: { converter: BOOLEAN_CONVERTER, attribute: 'default-edit' },
    placeholder: { converter: STRING_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    maxLength: { converter: NUMBER_CONVERTER, attribute: 'max-length' },
    name: { converter: STRING_CONVERTER },
    submitMode: { converter: STRING_CONVERTER, attribute: 'submit-mode' },
    activationMode: { converter: STRING_CONVERTER, attribute: 'activation-mode' },
    selectOnFocus: { converter: BOOLEAN_CONVERTER, attribute: 'select-on-focus' },
    autoResize: { converter: BOOLEAN_CONVERTER, attribute: 'auto-resize' },
  }

  declare value?: string
  declare defaultValue?: string
  declare edit?: boolean
  declare defaultEdit?: boolean
  declare placeholder?: string
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare maxLength?: number
  declare name?: string
  declare submitMode?: EditableSubmitMode
  declare activationMode?: EditableActivationMode
  declare selectOnFocus?: boolean
  declare autoResize?: boolean

  /** preview 的文字是否归元素填：首次见到该节点时定，之后不再回读。 */
  private readonly ownsPreviewText = new WeakMap<HTMLElement, boolean>()

  private readonly notifyValue = (details: EditableValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyCommit = (details: EditableValueCommitDetails): void => {
    this.dispatchEvent(new CustomEvent('value-commit', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyRevert = (details: EditableValueRevertDetails): void => {
    this.dispatchEvent(new CustomEvent('value-revert', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyEdit = (details: EditableEditChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('edit-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<EditableSchema>(
    this,
    editableMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<EditableSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      edit: this.edit,
      defaultEdit: this.defaultEdit ?? false,
      placeholder: this.placeholder,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      invalid: this.invalid ?? false,
      maxLength: this.maxLength,
      name: this.name,
      submitMode: this.submitMode,
      activationMode: this.activationMode,
      selectOnFocus: this.selectOnFocus,
      autoResize: this.autoResize ?? false,
      onValueChange: this.notifyValue,
      onValueCommit: this.notifyCommit,
      onValueRevert: this.notifyRevert,
      onEditChange: this.notifyEdit,
    }
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  // 交的是 getter 不是当下的节点：焦点搬运推迟一帧才跑，那时才现取真在 DOM 里的那个。
  private injectRefs(svc: Service<EditableSchema>): void {
    svc.refs.set('getInputEl', () => this.getPart('input'))
    svc.refs.set('getPreviewEl', () => this.getPart('preview'))
  }

  /**
   * 角色节点提前发现一次：default-edit 时机器在 hostConnected 当场进编辑态并排下焦点搬运，
   * 而常规发现要等首次 updated——那一刻 partMap 还空着，输入框取不到，焦点就再也搬不进去。
   */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /**
   * 预览区的文字由元素填（值，或值为空时的 placeholder）。
   * 作者若自己写了内容（自定义渲染），首次见到时就定为归作者，之后一概不碰——
   * 每帧回读分不清"作者写的"还是"上一帧自己写的"，一旦写过就再也让不回去。
   */
  private fillPreviewText(el: HTMLElement, text: string): void {
    let owned = this.ownsPreviewText.get(el)
    if (owned === undefined) {
      owned = (el.textContent ?? '').trim() === ''
      this.ownsPreviewText.set(el, owned)
    }
    if (!owned || el.textContent === text)
      return
    el.textContent = text
  }

  protected wire(): void {
    const api = connectEditable(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('preview', api.getPreviewProps() as Record<string, unknown>)
    put('input', api.getInputProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('edit-trigger', api.getEditTriggerProps() as Record<string, unknown>)
    put('submit-trigger', api.getSubmitTriggerProps() as Record<string, unknown>)
    put('cancel-trigger', api.getCancelTriggerProps() as Record<string, unknown>)
    // 输入框的 value 不必在这里另外回写：spreader 把 value 当 property 写
    // （dom/spread.ts 的 PROP_KEYS），属性写法只管初值、盖不住用户输入过的框

    const preview = this.getPart('preview')
    if (preview)
      this.fillPreviewText(preview, api.displayValue)

    // 收起只写 hidden 属性是不够的：作者层给这些 part 声明的任何一条 display
    // 都会盖过 UA 的 [hidden]{display:none}，只有内联 style.display 压得住
    this.setPartHidden(preview, api.editing)
    this.setPartHidden(this.getPart('input'), !api.editing)
    this.setPartHidden(this.getPart('edit-trigger'), api.editing)
    this.setPartHidden(this.getPart('submit-trigger'), !api.editing)
    this.setPartHidden(this.getPart('cancel-trigger'), !api.editing)
  }
}
