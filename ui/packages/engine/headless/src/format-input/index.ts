/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 . 模块的公共接口。

export { formatInputAnatomy } from './format-input.anatomy'
export { connectFormatInput, formatInputItemLabelTag, formatInputItemTag, formatInputOptions } from './format-input.connect'
export { formatInputKeyboard } from './format-input.keyboard'
export { FORMAT_INPUT_ANNOUNCE_DELAY, formatInputMachine, formatInputPreviewText, formatInputTranslations, sameFormat } from './format-input.machine'
export { formatInputMeta } from './format-input.meta'
export {
  draftFromFormat,
  emptyFormatDraft,
  FORMAT_INPUT_DATE_PATTERNS,
  FORMAT_INPUT_DECIMALS_MODES,
  formatFromDraft,
  formatPreview,
  formatSample,
  switchDecimalsMode,
  switchFormatKind,
} from './format-input.model'
export type { FormatInputDecimalsMode, FormatInputDraft, FormatInputIssueCode, FormatInputKind, FormatInputResult } from './format-input.model'
export { formatInputStructure } from './format-input.structure'
export type {
  FormatInputApi,
  FormatInputDecimalsField,
  FormatInputKindOption,
  FormatInputOption,
  FormatInputSchema,
  FormatInputTranslations,
  FormatInputValueChangeDetails,
} from './format-input.types'
