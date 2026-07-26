// @xihan-ui/headless —— 无头组件（anatomy + machine + connect，无样式）。

export { buttonAnatomy, buttonKeyboard, buttonMeta, connectButton } from './button'

export type { ButtonApi, ButtonProps } from './button'
export { connectDialog, dialogAnatomy, dialogKeyboard, dialogMachine, dialogMeta } from './dialog'

export type { DialogApi, DialogOpenChangeDetails, DialogRefs, DialogSchema, DialogTranslations } from './dialog'
export type { ComponentMeta, KeyboardRow, KeyboardTable } from './spec'
export type { HeadlessComponent, NormalizeProps, PropTypes } from './types'
