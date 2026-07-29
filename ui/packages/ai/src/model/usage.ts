// 结算模型：token 用量与费用，字段均为可选。

export interface TokenUsage {
  readonly inputTokens?: number
  readonly outputTokens?: number
  readonly totalTokens?: number
  readonly reasoningTokens?: number
  readonly cachedInputTokens?: number
}

export interface CostBreakdown {
  /** ISO 4217 货币代码，如 'CNY' / 'USD'。 */
  readonly currency: string
  readonly input?: number
  readonly output?: number
  readonly total?: number
}

/** 一次运行的结算信息，流结束时一次性写入。 */
export interface MessageMetadata {
  readonly usage?: TokenUsage
  readonly cost?: CostBreakdown
  readonly modelId?: string
  readonly finishReason?: string
}
