import type {
  TagsInputBlurBehavior,
  TagsInputInputValueChangeDetails,
  TagsInputItemProps,
  TagsInputSchema,
  TagsInputValueChangeDetails,
} from '@xihan-ui/headless'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { connectTagsInput, tagsInputAnatomy, tagsInputMachine, tagsInputMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，以此区分受控与非受控。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、="false"=false、其余=true。
// Lit 默认的 Boolean 转换器是 v !== null，缺省为真的开关会因此永远关不掉
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 标签集合写进属性时一律按逗号拆（属性表达不了数组）。
// 用别的 delimiter 时请走 property（`el.value = ['a;b']`）：转换器看不见同一元素上的另一个属性
const ARRAY_CONVERTER = {
  fromAttribute: (v: string | null) => (v == null ? undefined : v.split(',').map(s => s.trim()).filter(s => s !== '')),
}

/**
 * `<xh-tags-input>` —— Light-DOM 行为宿主：作者写 root/label/control/input/item 一族与
 * clear-trigger/hidden-input 角色节点，元素跑 tags-input 机器并把 connect 产出打上去。
 *
 * 标签节点由作者按当前值渲染（每个标签一个 item，身份取节点上的 value 属性）；
 * 元素自己不生成结构，值变了要由作者那一侧增删节点，改完 MutationObserver 会自动重新接线。
 *
 * label 的 `for` 恒写向 input 的 id，所以 label 必须是原生 `<label>`、input 必须是原生 `<input>`。
 * 就地编辑框（item-input）与预览（item-preview）互斥收起而不是卸载，作者写的节点不会被替他删掉。
 *
 * @customElement xh-tags-input
 * @attr {string} value - 受控标签集合，按逗号拆；缺省该属性即非受控，别的分隔符请用 property
 * @attr {string} default-value - 非受控初始标签集合，同样按逗号拆
 * @attr {string} input-value - 受控输入文本
 * @attr {string} default-input-value - 非受控初始输入文本
 * @attr {number} max - 最多几个标签；写 0 即一个也不许加
 * @attr {boolean} allow-overflow - 允许越过 max，越过后打出 data-overflow
 * @attr {boolean} disabled - 禁用：输入框与各按钮都不可用
 * @attr {boolean} read-only - 只读：仍可聚焦与复制，加删改都走不通
 * @attr {boolean} invalid - 校验失败标注
 * @attr {string} name - 表单字段名；给了 hidden-input 才参与提交（按 delimiter 拼成一串）
 * @attr {string} placeholder - 输入框占位文案
 * @attr {string} delimiter - 断词符，默认逗号；显式写空串即关掉断词
 * @attr {boolean} add-on-paste - 粘贴时按 delimiter 拆成多个标签
 * @attr {boolean} editable - 允许双击标签就地改
 * @attr {'add'|'clear'} blur-behavior - 焦点离开整个组件时怎么处置残留文本
 * @fires value-change - 标签集合变化；detail 为 `{ value: string[] }`
 * @fires input-value-change - 输入文本变化；detail 为 `{ inputValue: string }`
 * @csspart root - 承载 data-disabled / data-readonly / data-invalid / data-empty / data-at-max / data-overflow
 * @csspart label - 标题；`for` 恒写向 input，故须是原生 `<label>` 才点得动
 * @csspart control - role=group 的框，点它的空白处即聚焦输入框
 * @csspart input - 真正的输入框，须是原生 `<input>`；键盘交互全在它身上
 * @csspart item - 一个标签一个，须自带 value 属性标识身份
 * @csspart item-preview - 标签平常那一套（文本 + 删除按钮）；就地编辑时收起
 * @csspart item-text - 标签文本
 * @csspart item-delete-trigger - 删除按钮，须是原生 `<button>`；不占 Tab 位，自带 aria-label
 * @csspart item-input - 就地编辑框，须是原生 `<input>`；不编辑时收起
 * @csspart clear-trigger - 清空按钮；没东西可清时置灰
 * @csspart hidden-input - type=hidden 的表单出口，值是按 delimiter 拼好的整串
 */
export class XhTagsInputElement extends XhElement {
  static override partContract = { anatomy: tagsInputAnatomy, meta: tagsInputMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: ARRAY_CONVERTER },
    defaultValue: { converter: ARRAY_CONVERTER, attribute: 'default-value' },
    inputValue: { converter: STRING_CONVERTER, attribute: 'input-value' },
    defaultInputValue: { converter: STRING_CONVERTER, attribute: 'default-input-value' },
    max: { converter: NUMBER_CONVERTER },
    allowOverflow: { converter: BOOLEAN_CONVERTER, attribute: 'allow-overflow' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    name: { converter: STRING_CONVERTER },
    placeholder: { converter: STRING_CONVERTER },
    delimiter: { converter: STRING_CONVERTER },
    addOnPaste: { converter: BOOLEAN_CONVERTER, attribute: 'add-on-paste' },
    editable: { converter: BOOLEAN_CONVERTER },
    blurBehavior: { converter: STRING_CONVERTER, attribute: 'blur-behavior' },
  }

  declare value?: string[]
  declare defaultValue?: string[]
  declare inputValue?: string
  declare defaultInputValue?: string
  declare max?: number
  declare allowOverflow?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare name?: string
  declare placeholder?: string
  declare delimiter?: string
  declare addOnPaste?: boolean
  declare editable?: boolean
  declare blurBehavior?: TagsInputBlurBehavior | null

  private readonly notifyValue = (details: TagsInputValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyInputValue = (details: TagsInputInputValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('input-value-change', { detail: details, bubbles: true, composed: true }))
  }

  // 机器只有一个聚焦副作用（自己经 scope 取节点），不需要 config/layer/定位引擎，
  // 故 controller 只带 props。
  private readonly ctrl = new MachineController<TagsInputSchema>(this, tagsInputMachine, () => this.machineProps())

  private machineProps(): Partial<TagsInputSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      inputValue: this.inputValue,
      defaultInputValue: this.defaultInputValue,
      max: this.max,
      allowOverflow: this.allowOverflow ?? false,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      invalid: this.invalid ?? false,
      name: this.name,
      placeholder: this.placeholder,
      delimiter: this.delimiter,
      addOnPaste: this.addOnPaste ?? false,
      editable: this.editable ?? false,
      blurBehavior: this.blurBehavior,
      onValueChange: this.notifyValue,
      onInputValueChange: this.notifyInputValue,
    }
  }

  /**
   * 承载焦点的标签被移出 DOM 时浏览器不派 focusout（Chrome 如此），机器读不到这件事：
   * 就地编辑框会连同标签一起消失，机器却还停在 editing，光标锚点指着一个已经不存在的标签，
   * 从此既进不了编辑框、也回不到输入框。这里替 DOM 把焦点离场如实上报。
   *
   * 判据在这一侧只能按锚点值判，不能按"当下正持有焦点"：回调是在节点已经离开文档之后调的，
   * 那时 activeElement 早退回 body 了。Vue 那一侧有 onBeforeUnmount（节点还在），故按焦点判。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    const focusedValue = context.get('focusedValue')
    if (focusedValue == null)
      return
    // data-value 只写在 item 上，标签内的文本、按钮与编辑框离场不会误判
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'ITEM.FOCUS_LOST' })
  }

  // 标签内的子部件：getParts 收的是整个元素范围，按子树过滤才归得对。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectTagsInput(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('input', api.getInputProps() as Record<string, unknown>)
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)
    // 输入框的 value 不必另外回写：spreader 把 value/checked/selected 三个键当 property 写
    // （dom/spread.ts 的 PROP_KEYS），属性写法只管初值、盖不住用户输入过的框

    // 标签是多实例 part，逐个打：身份取作者写在节点上的 value
    for (const el of this.getParts('item')) {
      const item: TagsInputItemProps = { value: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      const editing = api.editedValue === item.value
      for (const preview of this.partsIn(el, 'item-preview')) {
        this.spreader.spread(preview, api.getItemPreviewProps(item) as Record<string, unknown>)
        // 只写 hidden 属性是不够的：作者层给这个 part 声明的任何一条 display
        // 都会盖过 UA 的 [hidden]{display:none}，只有内联 style.display 压得住
        this.setPartHidden(preview, editing)
      }
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
      for (const trigger of this.partsIn(el, 'item-delete-trigger'))
        this.spreader.spread(trigger, api.getItemDeleteTriggerProps(item) as Record<string, unknown>)
      for (const input of this.partsIn(el, 'item-input')) {
        this.spreader.spread(input, api.getItemInputProps(item) as Record<string, unknown>)
        this.setPartHidden(input, !editing)
      }
    }
  }
}
