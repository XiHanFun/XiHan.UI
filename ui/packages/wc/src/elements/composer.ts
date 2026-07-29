import type {
  ComposerRunStatus,
  ComposerSchema,
  ComposerSubmitDetails,
  ComposerTranslations,
  ComposerValueChangeDetails,
} from '@xihan-ui/headless'
import { composerMachine, connectComposer } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席一律翻成 undefined：受控与非受控的分界就在这个 undefined 上。
// Lit 自带的转换器会把缺席落成 null，那样 value="" 与"没写 value"就分不开了
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（用默认值）、="false"=false、其余=true。
// Lit 默认的 Boolean 转换器是 v !== null，缺省为真的开关（submit-on-enter）会因此永远关不掉
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-composer>` —— Light-DOM 行为宿主：作者写 root/input/submit-trigger 三类角色节点，
 * 元素跑 composer 机器并把 connect 产出打上去。
 *
 * input 角色节点必须是原生 `<textarea>`：值经 property 写、禁用走原生 disabled，
 * 换成 `<div contenteditable>` 这两条都落空。
 *
 * 发送按钮在流式期间**原位**变"停止"，只换 `data-mode` 与 `aria-label`，DOM 位置一动不动——
 * 拆成两个节点就意味着一个卸载、另一个挂载，正按着它的键盘用户会按空。
 * 什么时候算流式由宿主经 `run-status` 说了算，元素自己不猜。
 *
 * Enter 提交那一路的判定全在 connect 里：IME 组合态一律放行（拼音选词的回车不是发送的回车），
 * Shift+Enter 原样交给浏览器插换行。
 *
 * @customElement xh-composer
 * @attr {string} value - 受控值；缺省该属性即非受控
 * @attr {string} default-value - 非受控初值
 * @attr {boolean} disabled - 禁用：输入框带原生 disabled，发送与停止一并吃掉
 * @attr {'ready'|'streaming'} run-status - 宿主运行态的投影，默认 ready；streaming 时发送按钮原位变停止
 * @attr {boolean} submit-on-enter - Enter 直接提交，默认 true；写 submit-on-enter="false" 关掉，只留按钮
 * @fires value-change - 值变化；detail 为 `{ value: string }`
 * @fires submit - 提交（Enter 或按下发送）；detail 为 `{ value: string }`，清空发生在派发之后。
 *   与原生表单提交同名，故**不冒泡**：请直接在 `<xh-composer>` 元素上监听
 * @fires stop - 流式期间按下停止；无 detail
 * @csspart root - 承载 data-disabled / data-status 的容器
 * @csspart input - 真正的输入框，须是原生 `<textarea>`；IME 与 Enter 的判定都落在它身上
 * @csspart submit-trigger - 发送 / 停止按钮（原位换身份，皮肤按 data-mode 换图标）
 */
export class XhComposerElement extends XhElement {
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    disabled: { converter: BOOLEAN_CONVERTER },
    runStatus: { converter: STRING_CONVERTER, attribute: 'run-status' },
    submitOnEnter: { converter: BOOLEAN_CONVERTER, attribute: 'submit-on-enter' },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
    translations: { attribute: false },
  }

  declare value?: string
  declare defaultValue?: string
  declare disabled?: boolean
  declare runStatus?: ComposerRunStatus
  declare submitOnEnter?: boolean
  /** 输入框与发送/停止按钮的无障碍名；connect 每帧重写，作者写在节点上会被盖掉，只能从这里给。 */
  declare translations?: Partial<ComposerTranslations>

  private readonly emit = (type: string, detail: unknown, bubbles = true): void => {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles, composed: bubbles }))
  }

  private readonly notifyValue = (details: ComposerValueChangeDetails): void => this.emit('value-change', details)
  // submit 与原生表单提交同名，所以这一条不冒泡：一旦冒出去，祖先链上任意 <form>
  // 会把它当成自己的提交跑一遍校验与导航，而表单组件的 stopPropagation 又反过来
  // 把这条吞掉——用户消息就这么静默丢了。作者与测试都在元素本身监听，不冒泡不影响它们
  private readonly notifySubmit = (details: ComposerSubmitDetails): void => this.emit('submit', details, false)
  // 停止没有载荷：该停哪一轮由宿主自己清楚，组件只报"用户按了停"
  private readonly notifyStop = (): void => this.emit('stop', null)

  // composer 机器没有效应（IME 与 Enter 全在 connect 的事件处理器里）：
  // 不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<ComposerSchema>(this, composerMachine, () => this.machineProps())

  private machineProps(): Partial<ComposerSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      // 布尔属性经三态转换器进来：不在即 undefined，把缺省交回机器
      disabled: this.disabled,
      runStatus: this.runStatus,
      submitOnEnter: this.submitOnEnter,
      translations: this.translations,
      onValueChange: this.notifyValue,
      onSubmit: this.notifySubmit,
      onStop: this.notifyStop,
    }
  }

  protected wire(): void {
    const api = connectComposer(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('input', api.getInputProps() as Record<string, unknown>)
    put('submit-trigger', api.getSubmitTriggerProps() as Record<string, unknown>)
    // 输入框的 value 不必在这里另外回写：spreader 把 value/checked/selected 三个键
    // 当 property 写（dom/spread.ts 的 PROP_KEYS），属性写法只管初值、盖不住用户敲过的框
  }
}
