import type { ToastActionDetails, ToastSchema, ToastStatusChangeDetails, ToastTranslations, ToastType } from '@xihan-ui/headless'
import { connectToast, toastAnatomy, toastMachine, toastMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 空串也当缺席：duration="" 经 Number() 会变成 0，而 0 在这里是"关掉自动消失"的意思
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（用缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（closable）只有三态才关得掉——Lit 默认的 Boolean 转换器是 v !== null，
// 写 closable="false" 照样是真，"这条不许关"在 HTML 里就说不出口
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-toast>` —— Light-DOM 行为宿主：作者写 root/title/action-trigger/close-trigger
 * 角色节点，元素跑 toast 机器并把 connect 产出打上去。
 *
 * root 承载 role 与 aria-live：默认 status + polite（排队等读屏的空隙），
 * type="error" 换成 alert + assertive（打断当前朗读）。指针停在条子上、
 * 或焦点落进条子内部都会把倒计时按住，离开才接着走剩下的那一段。
 *
 * 退场窗口走完只把 root 收起、不删节点：作者写在里面的内容归作者，
 * 什么时候把这条从队列里删掉是全局服务的事（它收本元素冒泡上去的 status-change）。
 *
 * @customElement xh-toast
 * @attr {string} id - 队列身份，全局服务按它寻址；不给就用实例自己的 scope id
 * @attr {string} title - 标题文案；作者没在 title 部件里写内容时由元素填入
 * @attr {'info'|'success'|'warning'|'error'|'loading'} type - 语气，默认 info；loading 不自动消失
 * @attr {number} duration - 停留毫秒，默认 5000；<=0 即关掉自动消失
 * @attr {number} remove-delay - 退场窗口毫秒，默认 200，留给退场动画
 * @attr {boolean} closable - 是否给可用的关闭按钮，默认 true；写 closable="false" 关掉
 * @attr {boolean} pause-on-page-idle - 页面切到后台时按住计时，默认关
 * @fires status-change - 生命周期落位；detail 为 `{ id: string, status: 'dismissing'|'unmounted' }`
 * @fires action - 操作按钮被按下；detail 为 `{ id: string }`
 * @csspart root - role=status（error 时 alert）的容器，承载 data-type / data-tone / data-state / data-paused
 * @csspart title - 标题，aria-labelledby 的目标
 * @csspart action-trigger - 操作按钮：先发 action 再进入退场
 * @csspart close-trigger - 关闭按钮；closable=false 时转原生 disabled 并收起
 */
export class XhToastElement extends XhElement {
  static override partContract = { anatomy: toastAnatomy, meta: toastMeta }

  // 字段名与属性名分家的两处都是躲原生访问器：HTMLElement 的 id 与 title 都是原生反射属性，
  // 同名声明会盖掉它们（`el.id` 从此不再是 DOM id）。属性名保持与 Vue 侧的 prop 同名。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    toastId: { converter: STRING_CONVERTER, attribute: 'id' },
    titleText: { converter: STRING_CONVERTER, attribute: 'title' },
    type: { converter: STRING_CONVERTER },
    duration: { converter: NUMBER_CONVERTER },
    removeDelay: { converter: NUMBER_CONVERTER, attribute: 'remove-delay' },
    closable: { converter: BOOLEAN_CONVERTER },
    pauseOnPageIdle: { converter: BOOLEAN_CONVERTER, attribute: 'pause-on-page-idle' },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
    translations: { attribute: false },
  }

  declare toastId?: string
  declare titleText?: string
  declare type?: ToastType
  declare duration?: number
  declare removeDelay?: number
  declare closable?: boolean
  declare pauseOnPageIdle?: boolean
  declare translations?: Partial<ToastTranslations>

  private readonly notifyStatus = (details: ToastStatusChangeDetails): void => {
    // 必须冒泡：外层的队列宿主就靠这条事件知道该把记录删掉了
    this.dispatchEvent(new CustomEvent('status-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyAction = (details: ToastActionDetails): void => {
    this.dispatchEvent(new CustomEvent('action', { detail: details, bubbles: true, composed: true }))
  }

  // toast 机器的副作用只有计时器与 visibilitychange，都由机器自己经 scope 拿，
  // 不需要 config/layer/定位引擎，故 controller 只带 props。
  private readonly ctrl = new MachineController<ToastSchema>(this, toastMachine, () => this.machineProps())

  private machineProps(): Partial<ToastSchema['props']> {
    return {
      id: this.toastId,
      title: this.titleText,
      type: this.type,
      duration: this.duration,
      removeDelay: this.removeDelay,
      closable: this.closable,
      pauseOnPageIdle: this.pauseOnPageIdle,
      translations: this.translations,
      onStatusChange: this.notifyStatus,
      onAction: this.notifyAction,
    }
  }

  /** 这个部件的文字归不归作者：头一回见到它时定案，之后不再改口。 */
  private readonly authorOwnsText = new WeakMap<HTMLElement, boolean>()

  /**
   * 作者没往部件里写内容时，用 props 上的文案填进去。
   *
   * 归属只判一次：判完本轮就会把文字写进去，再回读分不清是作者写的还是自己写的，
   * 从那以后 title 属性改了也再刷不动（Vue 侧是响应式渲染，会跟着改，两侧就此分叉）。
   */
  private fillText(el: HTMLElement | null, text: string | undefined): void {
    if (!el)
      return
    let authored = this.authorOwnsText.get(el)
    if (authored === undefined) {
      // 头一回见到这个节点：此刻里面的东西只可能是作者写的（本轮写入尚未发生）。
      // 元素子节点也算数——只放了个图标、文字留给 props 的标题同样是作者写过的，
      // 只看文字会把那个图标当空白冲掉
      authored = el.childElementCount > 0 || (el.textContent ?? '').trim() !== ''
      this.authorOwnsText.set(el, authored)
    }
    if (authored)
      return
    const next = text ?? ''
    // 比一次再写：写文本节点会命中宿主的变动观察器，值没变就别去惊动它
    if (el.textContent !== next)
      el.textContent = next
  }

  protected wire(): void {
    const api = connectToast(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('action-trigger', api.getActionTriggerProps() as Record<string, unknown>)
    put('close-trigger', api.getCloseTriggerProps() as Record<string, unknown>)

    this.fillText(this.getPart('title'), api.title)

    // connect 已经置了 hidden，但作者层给 [data-part=root] 写的任何一条 display
    // 都盖得过 UA 的 [hidden]{display:none}；内联 style.display 优先级更高，压得住。
    // 关闭按钮同理：不可关闭时留一个按不动的叉，比压根没有叉更让人困惑
    this.setPartHidden(this.getPart('root'), api.status === 'unmounted')
    this.setPartHidden(this.getPart('close-trigger'), !api.closable)
  }
}
