import type { ButtonProps } from '@xihan-ui/headless'
import { connectButton } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-button>` —— Light-DOM 行为宿主，无状态机：宿主属性即 button props，
 * wire 时算 connectButton 打到 `[data-xh-part="root"]` 角色节点。
 *
 * @customElement xh-button
 * @attr {'button'|'submit'|'reset'} type - 原生按钮类型，默认 button
 * @attr {boolean} disabled - 禁用（原生 disabled，丢焦点）
 * @attr {boolean} loading - 加载中（aria-disabled，保留焦点并拦截点击）
 * @attr {'solid'|'subtle'|'outline'|'ghost'} variant - 视觉变体
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @csspart root - 承载 data-scope/data-part/data-* 的原生 button
 */
export class XhButtonElement extends XhElement {
  static override properties = {
    type: {},
    disabled: { type: Boolean },
    loading: { type: Boolean },
    variant: {},
    size: {},
  }

  declare type?: 'button' | 'submit' | 'reset'
  declare disabled?: boolean
  declare loading?: boolean
  declare variant?: string
  declare size?: string

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return
    const api = connectButton(this as unknown as ButtonProps, wcNormalize)
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
