// CommonMark 官方用例包只出 JS，用例里再自行断言成 SpecExample。
declare module 'commonmark-spec' {
  export const tests: unknown[]
}
