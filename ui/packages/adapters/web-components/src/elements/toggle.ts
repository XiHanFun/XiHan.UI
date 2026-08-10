import type { TogglePressedChangeDetails, ToggleSchema } from '@xihan-ui/headless'
import type { ActionVariant, Size, Tone } from '@xihan-ui/kernel'
import { connectToggle, toggleAnatomy, toggleMachine, toggleMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/**
 * `<xh-toggle>` —— Light-DOM 行为宿主，跑 toggle 机器并把 connect 产出打到 root 角色节点。
 *
 * @customElement xh-toggle
 * @attr {boolean} pressed - 受控按下态；缺省该属性即非受控
 * @attr {boolean} default-pressed - 非受控初始为按下
 * @attr {boolean} disabled - 禁用
 * @attr {'solid'|'subtle'|'outline'|'ghost'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires pressed-change - pressed 状态变化；detail 为 `{ pressed: boolean }`
 * @csspart root - role=button 的按钮（承载 aria-pressed / data-state）
 */
export class XhToggleElement extends XhElement {
  static override partContract = { anatomy: toggleAnatomy, meta: toggleMeta }

  static override properties = {
    pressed: { converter: { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') } },
    defaultPressed: { type: Boolean, attribute: 'default-pressed' },
    disabled: { type: Boolean },
    variant: {},
    tone: {},
    size: {},
  }

  declare pressed?: boolean
  declare defaultPressed?: boolean
  declare disabled?: boolean
  declare variant?: ActionVariant
  declare tone?: Tone
  declare size?: Size

  private readonly notify = (details: TogglePressedChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('pressed-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<ToggleSchema>(this, toggleMachine, () => this.machineProps())

  private machineProps(): Partial<ToggleSchema['props']> {
    return {
      pressed: this.pressed,
      defaultPressed: this.defaultPressed ?? false,
      disabled: this.disabled ?? false,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      onPressedChange: this.notify,
    }
  }

  protected wire(): void {
    const api = connectToggle(this.ctrl.service, wcNormalize)
    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
