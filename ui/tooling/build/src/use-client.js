import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

// 判定 React 适配器里哪些模块要带 'use client'。
//
// React Server Components 里，服务端模块从 'use client' 模块导入的每个值都换成客户端引用：
// 只能当元素类型渲染（<X /> 或 createElement(X)），不能调用、不能读属性。所以一个模块标
// 'use client'，当且仅当：
//   一、它直接用了只在客户端成立的 React 能力：调用 hook、createContext、任何 react-dom 导入；或
//   二、它对已判为客户端的模块的导出做了渲染以外的事（调用、读属性、当值传递）。
// 第二条沿模块图迭代到不动点：withXhConfig 这类名字不带 use 的内部 hook 由它兜住。
// 其余模块留在服务端可用：语言包、纯合并函数、只渲染客户端组件的外壳。

const DIRECT_CLIENT = [
  /\buse[A-Z]\w*\s*[<(]/,
  /\bcreateContext\s*[<(]/,
  /\bfrom\s*['"]react-dom(?:\/[\w-]+)?['"]/,
]

const SOURCE = /\.(?:ts|tsx)$/
const RESOLVE_SUFFIXES = ['.ts', '.tsx', '/index.ts', '/index.tsx']
// 子句里不会出现引号，借此把匹配限制在一条 import 语句之内
const RELATIVE_IMPORT = /^import(?!\s+type\s)([^'";]*)\bfrom\s*['"](\.{1,2}\/[^'"]+)['"]/gm
const ANY_IMPORT = /^import\b[^'";]*['"][^'"]*['"];?/gm

const toKey = path => resolve(path).replaceAll('\\', '/')

function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/.*$/gm, '$1')
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      walk(path, out)
    else if (SOURCE.test(entry.name) && !entry.name.endsWith('.d.ts'))
      out.push(toKey(path))
  }
  return out
}

function resolveImport(from, specifier) {
  const base = resolve(dirname(from), specifier.replace(/\.js$/, ''))
  for (const suffix of RESOLVE_SUFFIXES) {
    if (existsSync(base + suffix))
      return toKey(base + suffix)
  }
  return null
}

/** import 子句里引入的值绑定（跳过 type 修饰的条目）。 */
function boundNames(clause) {
  const names = []
  const named = clause.match(/\{([\s\S]*)\}/)
  if (named) {
    for (const part of named[1].split(',')) {
      const item = part.trim()
      if (!item || item.startsWith('type '))
        continue
      names.push(item.split(/\s+as\s+/).pop().trim())
    }
  }
  const head = clause.replace(/\{[\s\S]*\}/, '').split(',').map(s => s.trim()).filter(Boolean)
  for (const item of head)
    names.push(item.startsWith('* as ') ? item.slice(5).trim() : item)
  return names
}

const escape = name => name.replace(/\$/g, '\\$')

/** 这个绑定在模块里是否有渲染以外的用法。属性名位置（obj.name）与 typeof 不算。 */
function usedBeyondRendering(body, name) {
  const n = escape(name)
  const all = body.match(new RegExp(`(?<![\\w.$])${n}(?![\\w$])`, 'g'))?.length ?? 0
  const rendered = (body.match(new RegExp(`</?${n}(?=[\\s/>])`, 'g'))?.length ?? 0)
    + (body.match(new RegExp(`\\bcreateElement\\(\\s*${n}(?![\\w$.])`, 'g'))?.length ?? 0)
    + (body.match(new RegExp(`\\btypeof\\s+${n}(?![\\w$])`, 'g'))?.length ?? 0)
  return all > rendered
}

/**
 * 给出 srcDir 下要带 'use client' 的模块（绝对路径，正斜杠）。
 * @param {string} srcDir
 * @returns {Set<string>}
 */
export function clientModules(srcDir) {
  const files = walk(srcDir)
  const known = new Set(files)
  const modules = new Map()
  for (const file of files) {
    const code = stripComments(readFileSync(file, 'utf8'))
    const imports = []
    for (const match of code.matchAll(RELATIVE_IMPORT)) {
      const target = resolveImport(file, match[2])
      if (target && known.has(target))
        imports.push({ target, names: boundNames(match[1]) })
    }
    const body = code.replace(ANY_IMPORT, '')
    modules.set(file, { code, body, imports })
  }

  const client = new Set(files.filter(file => DIRECT_CLIENT.some(re => re.test(modules.get(file).code))))
  let changed = true
  while (changed) {
    changed = false
    for (const file of files) {
      if (client.has(file))
        continue
      const { body, imports } = modules.get(file)
      if (imports.some(({ target, names }) => client.has(target) && names.some(name => usedBeyondRendering(body, name)))) {
        client.add(file)
        changed = true
      }
    }
  }
  return client
}

/** 产物文件头是否是 'use client' 指令。 */
export function hasUseClientDirective(code) {
  return /^\s*(['"])use client\1/.test(code)
}

/**
 * 给按模块产出（unbundle）的 React 包加 'use client' 指令，判定见 clientModules。
 * 指令走 banner 钩子写在每个产物最前面，sourcemap 的行偏移由打包器一并处理。
 * @param {{ srcDir?: string }} [options] 源码目录，默认 src
 */
export function useClientDirective(options = {}) {
  const srcDir = options.srcDir ?? 'src'
  let client = new Set()
  return {
    name: 'xihan:use-client',
    buildStart() {
      client = clientModules(srcDir)
    },
    banner(chunk) {
      if (!chunk.fileName.endsWith('.js'))
        return ''
      const id = chunk.facadeModuleId ?? (chunk.moduleIds.length === 1 ? chunk.moduleIds[0] : null)
      return id && client.has(toKey(id)) ? '\'use client\';' : ''
    },
  }
}
