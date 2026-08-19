import type { ButtonProps } from '@xihan-ui/headless'
import type { ActionVariant, Size, Tone } from '@xihan-ui/kernel'
import { buttonAnatomy, buttonMeta, connectButton } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-button>` —— 按钮行为宿主，无状态机，宿主属性即 button props。
 *
 * @customElement xh-button
 * @attr {'button'|'submit'|'reset'} type - 原生按钮类型，默认 button
 * @attr {boolean} disabled - 禁用（原生 disabled，丢焦点）
 * @attr {boolean} icon-only - 只有图标：左右内距清零、宽高相等；作者须自行给可及名
 * @attr {boolean} full-width - 撑满行宽
 * @attr {boolean} loading - 加载中（aria-disabled，保留焦点并拦截点击）
 * @attr {'solid'|'subtle'|'outline'|'ghost'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @csspart root - 承载 data-scope/data-part/data-* 的原生 button
 */
export class XhButtonElement extends XhElement {
  static override partContract = { anatomy: buttonAnatomy, meta: buttonMeta }

  static override properties = {
    type: {},
    disabled: { type: Boolean },
    iconOnly: { type: Boolean, attribute: 'icon-only' },
    fullWidth: { type: Boolean, attribute: 'full-width' },
    loading: { type: Boolean },
    variant: {},
    tone: {},
    size: {},
  }

  declare type?: 'button' | 'submit' | 'reset'
  declare disabled?: boolean
  declare iconOnly?: boolean
  declare fullWidth?: boolean
  declare loading?: boolean
  declare variant?: ActionVariant
  declare tone?: Tone
  declare size?: Size

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return
    const api = connectButton(this as unknown as ButtonProps, wcNormalize)
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // label / prefix / suffix / indicator 都是可选角色节点，作者写了才接
    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('prefix', api.getPrefixProps() as Record<string, unknown>)
    put('suffix', api.getSuffixProps() as Record<string, unknown>)
    put('indicator', api.getIndicatorProps() as Record<string, unknown>)
  }
}
