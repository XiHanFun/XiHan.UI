// @xihan-ui/headless —— 无头组件（anatomy + machine + connect，无样式）。

export { buttonAnatomy, buttonKeyboard, buttonMeta, connectButton } from './button'

export type { ButtonApi, ButtonProps } from './button'
export { checkboxAnatomy, checkboxKeyboard, checkboxMachine, checkboxMeta, connectCheckbox } from './checkbox'
export type { CheckboxApi, CheckboxCheckedChangeDetails, CheckboxSchema } from './checkbox'
export { collapsibleAnatomy, collapsibleKeyboard, collapsibleMachine, collapsibleMeta, connectCollapsible } from './collapsible'
export type { CollapsibleApi, CollapsibleOpenChangeDetails, CollapsibleSchema } from './collapsible'
export { connectDialog, dialogAnatomy, dialogKeyboard, dialogMachine, dialogMeta } from './dialog'

export type { DialogApi, DialogOpenChangeDetails, DialogRefs, DialogSchema, DialogTranslations } from './dialog'
export type { ComponentMeta, KeyboardRow, KeyboardTable } from './spec'
export { connectSeparator, separatorAnatomy, separatorKeyboard, separatorMeta } from './separator'
export type { SeparatorApi, SeparatorProps } from './separator'
export { connectSwitch, switchAnatomy, switchKeyboard, switchMachine, switchMeta } from './switch'
export type { SwitchApi, SwitchCheckedChangeDetails, SwitchSchema } from './switch'
export type { HeadlessComponent, NormalizeProps, PropTypes } from './types'
