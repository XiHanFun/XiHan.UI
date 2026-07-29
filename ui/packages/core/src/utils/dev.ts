// dev 构建标志：读 import.meta.env.DEV，读不到即视为 false。

export function isDev(): boolean {
  try {
    return (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true
  }
  catch {
    return false
  }
}
