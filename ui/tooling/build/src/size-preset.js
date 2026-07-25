/**
 * @typedef {object} SizeEntry
 * @property {string} name
 * @property {string} path
 * @property {string} limit
 */

/**
 * 生成 size-limit 条目（gzip 预算门禁）。
 * @param {string} pkg
 * @param {string} limit
 * @param {string} [path]
 * @returns {SizeEntry}
 */
export function sizePreset(pkg, limit, path = 'dist/index.js') {
  return { name: pkg, path: `packages/${pkg}/${path}`, limit }
}
