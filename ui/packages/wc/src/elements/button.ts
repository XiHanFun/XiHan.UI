import type { ButtonProps } from '@xihan-ui/headless'
import { connectButton } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

// <xh-button> —— 无状态机：宿主属性即 button props，wire 时算 connectButton 打到 root 角色节点。
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
