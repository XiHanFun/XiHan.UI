import type { PasswordInputSchema, PasswordInputTranslations, PasswordInputValueChangeDetails, PasswordInputVisibilityChangeDetails } from '@xihan-ui/headless'
import type { ControlVariant, Size, Tone } from '@xihan-ui/kernel'
import { connectPasswordInput, passwordInputAnatomy, passwordInputMachine, passwordInputMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，以此区分受控与非受控。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（用默认值）、="false"=false、其余=true。
// Lit 默认的 Boolean 转换器是 v !== null，受控的 visible 会因此再也表达不了「宿主没管」
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-password-input>` —— Light-DOM 行为宿主：作者写 root/label/control/input/
 * visibility-trigger/caps-lock-indicator 六类角色节点，元素跑 password-input 机器并把 connect 产出打上去。
 *
 * label 的 `for` 恒写向 input 的 id，所以 label 角色节点必须是原生 `<label>`、input 角色节点必须是原生
 * `<input>`；切换钮必须是原生 `<button>`，Enter / Space 的激活由平台负责。
 *
 * 明暗只改 input 的 type：隐藏态 password、显示态 text。切换之后焦点留在按钮上，
 * 框里的光标与选中范围由机器放回原处。
 *
 * 大写锁定靠按键事件里的 getModifierState 判定——平台没有"现在查一下修饰键"的接口，
 * 所以提示要等用户按下第一个键才亮，焦点离开输入框即熄灭。提示节点作者写空壳，
 * 里面的文字由元素写入。
 *
 * @customElement xh-password-input
 * @attr {string} value - 受控值；缺省该属性即非受控
 * @attr {string} default-value - 非受控初值
 * @attr {boolean} visible - 受控的明暗态；缺省该属性即非受控
 * @attr {boolean} default-visible - 非受控的初始明暗态，缺省隐藏
 * @attr {boolean} disabled - 禁用：输入与明暗切换都推不动
 * @attr {boolean} read-only - 只读：值写不进，明暗照切
 * @attr {boolean} required - 必填标注
 * @attr {boolean} invalid - 校验失败标注
 * @attr {string} name - 表单字段名；给了才参与提交
 * @attr {string} placeholder - 占位文案
 * @attr {string} auto-complete - 落到 input 上的 autocomplete，缺省 current-password；注册表单要写 new-password
 * @attr {'outline'|'subtle'|'ghost'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 值变化；detail 为 `{ value: string }`
 * @fires visibility-change - 明暗变化；detail 为 `{ visible: boolean }`
 * @csspart root - 承载三个视觉轴与 data-disabled / data-readonly / data-invalid / data-empty 的容器
 * @csspart label - 标题；`for` 恒写向 input，故须是原生 `<label>` 才点得动
 * @csspart control - 视觉盒：描边、底色与聚焦环画在它身上，框内三件都是透明分段
 * @csspart input - 真正的输入框，须是原生 `<input>`；type 随明暗在 password / text 之间换
 * @csspart visibility-trigger - 明暗切换钮，须是原生 `<button>`；名字随状态换，里面放图标即可
 * @csspart caps-lock-indicator - 大写锁定提示；节点留空即可，文字由元素写入，是 role=status 的活区域
 */
export class XhPasswordInputElement extends XhElement {
  static override partContract = { anatomy: passwordInputAnatomy, meta: passwordInputMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    visible: { converter: BOOLEAN_CONVERTER },
    defaultVisible: { converter: BOOLEAN_CONVERTER, attribute: 'default-visible' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    required: { converter: BOOLEAN_CONVERTER },
    invalid: { converter: BOOLEAN_CONVERTER },
    name: { converter: STRING_CONVERTER },
    placeholder: { converter: STRING_CONVERTER },
    autoComplete: { converter: STRING_CONVERTER, attribute: 'auto-complete' },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
    translations: { attribute: false },
  }

  declare value?: string
  declare defaultValue?: string
  declare visible?: boolean
  declare defaultVisible?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare required?: boolean
  declare invalid?: boolean
  declare name?: string
  declare placeholder?: string
  declare autoComplete?: string
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size
  declare translations?: Partial<PasswordInputTranslations>

  private readonly notifyValue = (details: PasswordInputValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyVisibility = (details: PasswordInputVisibilityChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('visibility-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<PasswordInputSchema>(this, passwordInputMachine, () => this.machineProps())

  private machineProps(): Partial<PasswordInputSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      // 布尔一律原样透传：属性不在即 undefined，把缺省交回 connect
      visible: this.visible,
      defaultVisible: this.defaultVisible,
      disabled: this.disabled,
      readOnly: this.readOnly,
      required: this.required,
      invalid: this.invalid,
      name: this.name,
      placeholder: this.placeholder,
      autoComplete: this.autoComplete,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
      onValueChange: this.notifyValue,
      onVisibilityChange: this.notifyVisibility,
    }
  }

  protected wire(): void {
    const api = connectPasswordInput(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('input', api.getInputProps() as Record<string, unknown>)
    put('visibility-trigger', api.getVisibilityTriggerProps() as Record<string, unknown>)
    put('caps-lock-indicator', api.getCapsLockIndicatorProps() as Record<string, unknown>)
    // 输入框的 value 不必在这里另外回写：spreader 把 value/checked/selected 三个键当 property 写，
    // 属性写法只管初值、盖不住用户输入过的框

    // 提示区的文字归元素写，作者把这个节点留空即可。
    // 只在真的不一样时才写：每一帧都重挂一次同样的文本会让活区域反复播报
    const hint = this.getPart('caps-lock-indicator')
    if (hint && hint.textContent !== api.capsLockMessage)
      hint.textContent = api.capsLockMessage
  }
}
