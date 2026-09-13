/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 prompt input 模块的公共接口。

export { promptInputAnatomy } from './prompt-input.anatomy'
export { connectPromptInput } from './prompt-input.connect'
export { promptInputKeyboard } from './prompt-input.keyboard'
export { promptInputMachine } from './prompt-input.machine'
export { promptInputMeta } from './prompt-input.meta'
export type {
  PromptInputApi,
  PromptInputSchema,
  PromptInputState,
  PromptInputSubmitDetails,
  PromptInputSubmitKey,
  PromptInputTranslations,
  PromptInputValueChangeDetails,
} from './prompt-input.types'
