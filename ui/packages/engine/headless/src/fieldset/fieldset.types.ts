import type { PropTypes } from '@xihan-ui/core'

export interface FieldsetProps {
  /**
   * 整组禁用。root 是原生 `<fieldset>`，这一条落成原生 disabled 属性，
   * 浏览器会把组内每个表单控件一并停掉（首个 `<legend>` 里的控件按 HTML 规范除外）。
   */
  disabled?: boolean
  /** 校验失败态：root 上落 data-invalid，错误文案接入描述链并显出。 */
  invalid?: boolean
  /**
   * 必填标记：落成 data-required，供皮肤给组标题加星号，校验仍归宿主。
   * 不产出 aria-required —— 该属性在 group 角色上不被支持，写了也不进无障碍树。
   */
  required?: boolean
  /** 文案覆盖。本组件当前没有外露文案，位先留着，接全局配置的通道由适配器铺好。 */
  translations?: Partial<FieldsetTranslations>
}

export interface FieldsetApi<T extends PropTypes = PropTypes> {
  disabled: boolean
  invalid: boolean
  required: boolean
  getRootProps: () => T['element']
  getLegendProps: () => T['element']
  getDescriptionProps: () => T['element']
  getErrorTextProps: () => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface FieldsetTranslations {}
