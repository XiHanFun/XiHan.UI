// dev 构建标志（平台中立）。
// Vite/rolldown 会在打包时把 import.meta.env.DEV 替换为常量；其余环境（vanilla/tsdown 直跑）
// 读到 undefined → false，dev 断言自然静默。用 as any 规避 ImportMeta 类型不含 env 的报错。

export function isDev(): boolean {
  try {
    return (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true
  }
  catch {
    return false
  }
}
