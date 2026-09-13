/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 示例用例走 vite 的 import.meta.glob 在构建期读源码。
interface ImportMeta {
  glob: <T = unknown>(pattern: string, options?: {
    query?: string
    import?: string
    eager?: boolean
  }) => Record<string, T>
}
