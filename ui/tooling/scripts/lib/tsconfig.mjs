// 读 tsconfig、按 include/exclude 判一份文件在不在某个 project 里，以及按工作区 glob 列出包目录。
// check-typecheck-scope 与 check-typecheck-coverage 共用这一份。
import { readdir, readFile, stat } from 'node:fs/promises'
import { join, posix } from 'node:path'

/** pnpm-workspace 的两段 glob。 */
export const PACKAGE_GLOBS = ['packages/*/*', 'tooling/*']

/** 去掉 // 与块注释，让带注释的 tsconfig 也能 JSON.parse；字符串里的斜杠星号原样留着。 */
export function stripJsonComments(text) {
  let out = ''
  let inString = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      out += ch
      if (ch === '\\') {
        out += text[++i] ?? ''
        continue
      }
      if (ch === '"')
        inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      out += ch
      continue
    }
    if (ch === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n')
        i++
      out += '\n'
      continue
    }
    if (ch === '/' && text[i + 1] === '*') {
      i += 2
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/'))
        i++
      i++
      continue
    }
    out += ch
  }
  return out
}

export async function readJson(path) {
  return JSON.parse(stripJsonComments(await readFile(path, 'utf8')))
}

export async function exists(path) {
  try {
    await stat(path)
    return true
  }
  catch {
    return false
  }
}

/** tsconfig 的 include/exclude 通配转成正则：** 跨目录，* 与 ? 不跨。 */
export function patternToRegExp(pattern) {
  let body = ''
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i]
    if (ch === '*') {
      if (pattern[i + 1] === '*' && pattern[i + 2] === '/') {
        body += '(?:.*/)?'
        i += 2
      }
      else if (pattern[i + 1] === '*') {
        body += '.*'
        i += 1
      }
      else {
        body += '[^/]*'
      }
    }
    else if (ch === '?') {
      body += '[^/]'
    }
    else if ('.+^${}()|[]\\/'.includes(ch)) {
      body += `\\${ch}`
    }
    else {
      body += ch
    }
  }
  return new RegExp(`^${body}$`)
}

/** tsconfig 里不带扩展名的目录式条目等价于该目录下的全部源文件。 */
export function normalizePattern(pattern) {
  return /\.[^/]*$/.test(pattern) ? pattern : posix.join(pattern, '**/*')
}

export function matchesAny(patterns, relPath) {
  return patterns.some(p => patternToRegExp(normalizePattern(p)).test(relPath))
}

/** 列出目录下全部文件的相对路径（posix 分隔符）。 */
export async function listFiles(dir, base, skipDirs = new Set()) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name))
      continue
    const full = join(dir, entry.name)
    const rel = base ? posix.join(base, entry.name) : entry.name
    if (entry.isDirectory())
      out.push(...await listFiles(full, rel, skipDirs))
    else
      out.push(rel)
  }
  return out
}

/** 按工作区的两段 glob 展开包目录。 */
export async function listPackages() {
  const dirs = []
  for (const glob of PACKAGE_GLOBS) {
    const segments = glob.split('/')
    let level = [segments[0]]
    for (const seg of segments.slice(1)) {
      const next = []
      for (const parent of level) {
        for (const entry of await readdir(parent, { withFileTypes: true })) {
          if (!entry.isDirectory())
            continue
          if (seg !== '*' && seg !== entry.name)
            continue
          next.push(posix.join(parent, entry.name))
        }
      }
      level = next
    }
    for (const dir of level) {
      if (await exists(join(dir, 'package.json')))
        dirs.push(dir)
    }
  }
  return dirs.sort()
}

/** typecheck 脚本里 `-p xxx.json` 点名的那些 project；没写 -p 就是缺省的 tsconfig.json。 */
export function projectsOf(script) {
  if (!script)
    return []
  const named = [...script.matchAll(/-p\s+(\S+)/g)].map(m => m[1])
  return named.length ? named : ['tsconfig.json']
}
