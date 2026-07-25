/**
 * 由入口子路径生成 package.json 的 exports 字段（ESM only + types）。
 * gen-exports.mjs 在构建后回写各包 package.json，保证 exports 与实际产物一致。
 */
export function xihanExports(subpaths: string[]): Record<string, unknown> {
  const exportsMap: Record<string, unknown> = {}
  for (const sub of subpaths) {
    const key = sub === 'index' ? '.' : `./${sub}`
    exportsMap[key] = {
      types: `./dist/${sub}.d.ts`,
      import: `./dist/${sub}.js`,
    }
  }
  return exportsMap
}
