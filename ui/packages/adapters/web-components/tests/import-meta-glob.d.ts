// 示例用例走 vite 的 import.meta.glob 在构建期读源码。
interface ImportMeta {
  glob: <T = unknown>(pattern: string, options?: {
    query?: string
    import?: string
    eager?: boolean
  }) => Record<string, T>
}
