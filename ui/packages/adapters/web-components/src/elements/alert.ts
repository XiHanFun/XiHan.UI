import type { AlertOpenChangeDetails, AlertSchema } from '@xihan-ui/headless'
import { alertAnatomy, alertMachine, alertMeta, connectAlert } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/**
 * `<xh-alert>` —— Light-DOM 行为宿主，把 alert 机器打到 root/icon/title/description/close-trigger
 * 角色节点，收起时用内联 style.display 隐藏 root。
 *
 * @customElement xh-alert
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气，决定实时区级别与配色
 * @attr {boolean} closable - 关闭按钮是否可用，缺省为真
 * @attr {boolean} open - 受控显隐；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始显隐，缺省为显示
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 提示根容器（实时区所在）
 * @csspart icon - 语气图标（对读屏隐藏）
 * @csspart title - 标题（root 的 aria-labelledby 指向它）
 * @csspart description - 说明（root 的 aria-describedby 指向它）
 * @csspart close-trigger - 关闭按钮
 */
export class XhAlertElement extends XhElement {
  static override partContract = { anatomy: alertAnatomy, meta: alertMeta }

  // 三个布尔都用三态转换器：属性缺席翻成 undefined，缺省值由机器与 connect 决定；
  // 用 Lit 自带的 Boolean 转换器的话，缺省为真的 closable / default-open 永远关不掉
  static override properties = {
    tone: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    closable: { converter: { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') } },
    open: { converter: { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') } },
    defaultOpen: {
      attribute: 'default-open',
      converter: { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') },
    },
    // 文案是对象，只能走 property
    translations: { attribute: false },
  }

  declare tone?: string
  declare closable?: boolean
  declare open?: boolean
  declare defaultOpen?: boolean
  declare translations?: AlertSchema['props']['translations']

  private readonly notify = (details: AlertOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<AlertSchema>(
    this,
    alertMachine,
    () => this.machineProps(),
  )

  private machineProps(): Partial<AlertSchema['props']> {
    return {
      tone: this.tone,
      closable: this.closable,
      open: this.open,
      defaultOpen: this.defaultOpen,
      translations: this.translations,
      onOpenChange: this.notify,
    }
  }

  protected wire(): void {
    const api = connectAlert(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('icon', api.getIconProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('close-trigger', api.getCloseTriggerProps() as Record<string, unknown>)

    // 收起时用内联 display 隐藏整块提示
    this.setPartHidden(this.getPart('root'), !api.open)
  }
}
