export { codeViewAnatomy } from './code-view.anatomy'
export { connectCodeView } from './code-view.connect'
export { createCodeViewHighlighterResource, isCodeViewHighlighterUnavailable } from './code-view.highlighter'
export type { CodeViewHighlighterLoader, CodeViewHighlighterModule, CodeViewHighlighterResource } from './code-view.highlighter'
export { codeViewKeyboard } from './code-view.keyboard'
export { codeViewMeta } from './code-view.meta'
export {
  CODE_VIEW_FALLBACK_LANG,
  CODE_VIEW_MAX_DIGITS,
  CODE_VIEW_MAX_HIGHLIGHT_LINES,
  countCodeViewLines,
  parseLineRanges,
  splitCodeLines,
} from './code-view.types'
export type {
  CodeLine,
  CodeViewApi,
  CodeViewClampToggleDetails,
  CodeViewLineProps,
  CodeViewProps,
  CodeViewTranslations,
} from './code-view.types'
