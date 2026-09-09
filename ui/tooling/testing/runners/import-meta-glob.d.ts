// 对拍用例走 vite 的 import.meta.glob 在构建期收集各家适配器的部件源码。
interface ImportMeta {
  glob: <T = unknown>(pattern: string, options?: {
    query?: string
    import?: string
    eager?: boolean
  }) => Record<string, T>
}
