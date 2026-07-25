export interface SizeEntry {
  name: string
  path: string
  limit: string
}

/**
 * 生成 size-limit 条目（gzip 预算门禁）。
 * 各包在 .size-limit.json 里引用其产物路径与预算，M1 填入基线值后作棘轮门禁。
 */
export function sizePreset(pkg: string, limit: string, path = 'dist/index.js'): SizeEntry {
  return {
    name: pkg,
    path: `packages/${pkg}/${path}`,
    limit,
  }
}
