// vitest 把 CDPSession 声明成空接口，由浏览器提供方的类型包填。仓里没装那个包，
// 用例只用到 send 一个方法，就地补上。
declare module 'vitest/internal/browser' {
  interface CDPSession {
    send: (method: string, params?: Record<string, unknown>) => Promise<unknown>
  }
}

export {}
