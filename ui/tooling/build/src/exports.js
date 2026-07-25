/**
 * 由入口子路径生成 package.json 的 exports 字段（ESM only + types）。
 * @param {string[]} subpaths
 * @returns {Record<string, unknown>}
 */
export function xihanExports(subpaths) {
  /** @type {Record<string, unknown>} */
  const exportsMap = {}
  for (const sub of subpaths) {
    const key = sub === 'index' ? '.' : `./${sub}`
    exportsMap[key] = { types: `./dist/${sub}.d.ts`, import: `./dist/${sub}.js` }
  }
  return exportsMap
}
