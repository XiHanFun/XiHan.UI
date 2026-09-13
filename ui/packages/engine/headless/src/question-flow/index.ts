/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 question flow 模块的公共接口。

export { questionFlowAnatomy, questionFlowItemQuery, questionFlowQuestionQuery } from './question-flow.anatomy'
export { connectQuestionFlow } from './question-flow.connect'
export { questionFlowKeyboard } from './question-flow.keyboard'
export { questionFlowMachine } from './question-flow.machine'
export { questionFlowMeta } from './question-flow.meta'
export { canAdvanceQuestion, clampQuestionIndex } from './question-flow.types'
export type {
  QuestionFlowAnswers,
  QuestionFlowAnswersChangeDetails,
  QuestionFlowApi,
  QuestionFlowIndexChangeDetails,
  QuestionFlowItemProps,
  QuestionFlowNotes,
  QuestionFlowNotesChangeDetails,
  QuestionFlowOption,
  QuestionFlowQuestion,
  QuestionFlowQuestionProps,
  QuestionFlowRefs,
  QuestionFlowSchema,
  QuestionFlowSkipDetails,
  QuestionFlowStatus,
  QuestionFlowSubmitDetails,
  QuestionFlowTranslations,
  QuestionFlowType,
  QuestionFlowViewport,
} from './question-flow.types'
