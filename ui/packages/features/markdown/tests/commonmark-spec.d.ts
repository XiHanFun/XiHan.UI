/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// CommonMark 官方用例包只出 JS，用例里再自行断言成 SpecExample。
declare module 'commonmark-spec' {
  export const tests: unknown[]
}
