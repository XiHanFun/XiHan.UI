// HighlighterPort：代码着色端口的类型契约，默认实现在 @xihan-ui/code-highlight。

/**
 * 记号种类。**刻意只有这几种**：这是一套粗粒度词法着色，
 * 不区分类型名、函数名、属性名这些要靠语法树才分得出的东西。
 * 想要那种精度就把 Shiki 之类接到本端口上，别往这个联合里加成员。
 */
export type CodeTokenKind = 'plain' | 'comment' | 'string' | 'number' | 'keyword' | 'punctuation'

export interface CodeToken {
  readonly text: string
  readonly kind: CodeTokenKind
}

export interface HighlighterPort {
  /**
   * 把一段代码切成记号。
   *
   * 返回 null 表示这一次不着色（语言不认识、代码太长、实现还没就绪），
   * 调用方据此原样渲染纯文本——**不着色是合法结果，不是错误**。
   *
   * 必须是同步纯函数：连接层在渲染期求值，不能等 Promise。实现若需要异步加载
   * 资产（典型是 Shiki 的 WASM 与语法文件），由宿主自己在就绪前返回 null、
   * 就绪后触发一次重渲。
   */
  highlight: (code: string, lang: string) => readonly CodeToken[] | null
}
