/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 editable 模块的公共接口。

export { editableAnatomy } from './editable.anatomy'
export { connectEditable } from './editable.connect'
export { editableKeyboard } from './editable.keyboard'
export {
  clampEditableValue,
  EDITABLE_DEFAULT_ACTIVATION_MODE,
  EDITABLE_DEFAULT_SUBMIT_MODE,
  editableInputSize,
  editableMachine,
  submitsOnEnter,
  submitsOnLeave,
} from './editable.machine'
export { editableMeta } from './editable.meta'
export type { EditableActivationMode, EditableApi, EditableEditChangeDetails, EditablePressedPart, EditableRefs, EditableSchema, EditableSubmitMode, EditableTranslations, EditableValueChangeDetails, EditableValueCommitDetails, EditableValueRevertDetails } from './editable.types'
