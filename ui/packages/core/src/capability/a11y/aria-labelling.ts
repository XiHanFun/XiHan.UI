// resolveLabelling：只在 title/description 真被渲染时才输出 id。
// 用计数器而非布尔：退出动画期间可能短暂同时存在两个 Title 实例。

export interface LabellingInput {
  labelId?: string
  labelCount: number
  descriptionId?: string
  descriptionCount: number
  ariaLabel?: string
  ariaDescribedby?: string
}

export interface LabellingResult {
  'aria-labelledby'?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

export function resolveLabelling(input: LabellingInput): LabellingResult {
  const result: LabellingResult = {}

  // 标签：优先用渲染出来的 Title（labelledby），否则用显式 aria-label。
  if (input.labelCount > 0 && input.labelId)
    result['aria-labelledby'] = input.labelId
  else if (input.ariaLabel)
    result['aria-label'] = input.ariaLabel

  // 描述：合并渲染出来的 Description 与显式 aria-describedby。
  const describedby = [
    input.descriptionCount > 0 ? input.descriptionId : undefined,
    input.ariaDescribedby,
  ].filter(Boolean).join(' ')
  if (describedby)
    result['aria-describedby'] = describedby

  return result
}
