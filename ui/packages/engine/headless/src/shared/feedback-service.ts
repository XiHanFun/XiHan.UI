/** 带合并计数的反馈标题；Toast 与 Notification 使用同一条显示规则。 */
export interface FeedbackServiceTitleRecord {
  title?: string
  count?: number
}

/** 合并过的条目在标题后追加计数，没并过或没有标题时保持原值。 */
export function resolveFeedbackServiceTitle(record: FeedbackServiceTitleRecord): string | undefined {
  const count = record.count ?? 1
  if (count <= 1 || record.title == null)
    return record.title
  return `${record.title} ×${count}`
}
