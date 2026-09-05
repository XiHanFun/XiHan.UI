import { createAnatomy } from '@xihan-ui/core'

// root 是外壳；trigger 是折叠开关，icon/indicator/label/duration 是它里面的排版位；
// content 是思考正文。label 与 duration 排在 trigger 之内，
// 「思考过程，用时 12 秒」整句自然构成开关的可访问名，不再另发 aria-label。
// icon 与 indicator 是两个图形位：前者跟着在不在想换色，后者随开合转向。
export const reasoningAnatomy = createAnatomy('reasoning', ['root', 'trigger', 'icon', 'indicator', 'label', 'duration', 'content'])
