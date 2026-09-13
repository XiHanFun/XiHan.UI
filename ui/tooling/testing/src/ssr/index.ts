/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 服务端直出子入口，跑在没有 document 的 node 宿主里，故与主入口分开。
export { vueSsrExempt } from './known'
export type { SsrExemptions } from './known'
export { scanScopedTags } from './markup'
export type { ScopedTag } from './markup'
export { runSsrConformance } from './run'
export type { SsrHarness, SsrRunOptions } from './run'
