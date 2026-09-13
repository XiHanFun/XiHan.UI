// 定义代码文件版权头、功能注释与幂等迁移规则。
import { basename, dirname, extname } from 'node:path'

export const COPYRIGHT_TEXT = 'Copyright (c) 2021-Present XiHanFun and contributors.'
export const LICENSE_TEXT = 'Licensed under the MIT License. See LICENSE in the project root for license information.'

const BLOCK_HEADER_RE = /^\/\*\r?\n \* Copyright \(c\) 2021-Present XiHanFun and contributors\.\r?\n \* Licensed under the MIT License\. See LICENSE in the project root for license information\.\r?\n \*\/\r?\n?/
const MARKUP_HEADER_RE = /^<!--\r?\n {2}Copyright \(c\) 2021-Present XiHanFun and contributors\.\r?\n {2}Licensed under the MIT License\. See LICENSE in the project root for license information\.\r?\n-->\r?\n?/
const HASH_HEADER_RE = /^# Copyright \(c\) 2021-Present XiHanFun and contributors\.\r?\n# Licensed under the MIT License\. See LICENSE in the project root for license information\.\r?\n?/

const MARKUP_EXTENSIONS = new Set(['.html', '.vue'])
const HASH_EXTENSIONS = new Set(['.ps1', '.sh', '.yaml', '.yml'])

function styleOf(path) {
  const extension = extname(path).toLowerCase()
  if (MARKUP_EXTENSIONS.has(extension))
    return 'markup'
  if (HASH_EXTENSIONS.has(extension))
    return 'hash'
  return 'block'
}

function renderHeader(style, newline) {
  if (style === 'markup')
    return `<!--${newline}  ${COPYRIGHT_TEXT}${newline}  ${LICENSE_TEXT}${newline}-->`
  if (style === 'hash')
    return `# ${COPYRIGHT_TEXT}${newline}# ${LICENSE_TEXT}`
  return `/*${newline} * ${COPYRIGHT_TEXT}${newline} * ${LICENSE_TEXT}${newline} */`
}

function wordsOf(path) {
  const file = basename(path, extname(path))
  const parent = basename(dirname(path))
  const raw = /^(?:index|main|mod)$/.test(file) ? parent : file
  return raw
    .replace(/\.(?:anatomy|connect|keyboard|machine|meta|types|spec|test|config)$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim()
}

function describe(path) {
  const normalized = path.replaceAll('\\', '/')
  const subject = wordsOf(path) || '模块'
  if (normalized.includes('/tests/') || /\.(?:spec|test)\.[^.]+$/i.test(normalized))
    return `验证 ${subject} 相关行为。`
  if (normalized.includes('/docs/.vitepress/demos/'))
    return `展示 ${basename(dirname(path))} 的 ${subject} 示例。`
  if (normalized.includes('/tooling/scripts/check-') || basename(path).startsWith('check-'))
    return `检查 ${subject.replace(/^check\s+/, '')} 约束。`
  if (/(?:^|[-.])(?:gen|emit|build)(?:[-.]|$)/i.test(basename(path)) || normalized.includes('/build/'))
    return `生成 ${subject} 相关产物。`
  if (extname(path).toLowerCase() === '.css')
    return `定义 ${subject} 样式。`
  if (/config/i.test(basename(path)))
    return `配置 ${subject}。`
  if (/types?/i.test(basename(path)))
    return `定义 ${subject} 类型契约。`
  if (/^(?:index|main|mod)\./i.test(basename(path)))
    return `导出 ${subject} 模块的公共接口。`
  return `提供 ${subject} 相关实现。`
}

function renderBrief(style, brief) {
  if (style === 'markup')
    return `<!-- ${brief} -->`
  if (style === 'hash')
    return `# ${brief}`
  if (style === 'block' && brief.startsWith('定义 ') && brief.endsWith('样式。'))
    return `/* ${brief} */`
  return `// ${brief}`
}

function hasBrief(style, source) {
  const body = source.trimStart()
  if (style === 'markup')
    return body.startsWith('<!--')
  if (style === 'hash')
    return body.startsWith('#')
  if (body.startsWith('//'))
    return !/^\/\/\s*@(?:jest|jsx|ts|vitest)\b/.test(body)
  if (body.startsWith('/*'))
    return !/^\/\*\s*eslint-(?:disable|enable)/.test(body)
  return false
}

function splitShebang(source) {
  let prefix = ''
  let body = source
  if (body.startsWith('\uFEFF')) {
    prefix = '\uFEFF'
    body = body.slice(1)
  }
  if (!body.startsWith('#!'))
    return { prefix, body }
  const end = body.indexOf('\n')
  if (end === -1)
    return { prefix: `${prefix}${body}`, body: '' }
  return { prefix: `${prefix}${body.slice(0, end + 1)}`, body: body.slice(end + 1) }
}

export function stripFileHeader(source) {
  const { prefix, body } = splitShebang(source)
  const stripped = body.replace(BLOCK_HEADER_RE, '').replace(MARKUP_HEADER_RE, '').replace(HASH_HEADER_RE, '')
  return `${prefix}${stripped.replace(/^\r?\n/, '')}`
}

export function removeFileHeader(path, source) {
  const newline = source.includes('\r\n') ? '\r\n' : '\n'
  const style = styleOf(path)
  const split = splitShebang(source)
  let prefix = split.prefix
  let body = split.body
  const withoutHeader = body
    .replace(BLOCK_HEADER_RE, '')
    .replace(MARKUP_HEADER_RE, '')
    .replace(HASH_HEADER_RE, '')
  if (withoutHeader === body)
    return source

  body = withoutHeader.replace(/^\r?\n/, '')
  if (body.startsWith('\uFEFF')) {
    if (!prefix.startsWith('\uFEFF'))
      prefix = `\uFEFF${prefix}`
    body = body.slice(1)
  }
  const generatedBrief = renderBrief(style, describe(path))
  const briefPrefix = `${generatedBrief}${newline}${newline}`
  if (body.startsWith(briefPrefix))
    body = body.slice(briefPrefix.length)
  return `${prefix}${body}`
}

export function applyFileHeader(path, source) {
  const newline = source.includes('\r\n') ? '\r\n' : '\n'
  const style = styleOf(path)
  const split = splitShebang(source)
  let prefix = split.prefix
  let body = split.body
    .replace(BLOCK_HEADER_RE, '')
    .replace(MARKUP_HEADER_RE, '')
    .replace(HASH_HEADER_RE, '')
    .replace(/^\r?\n/, '')
  if (body.startsWith('\uFEFF')) {
    if (!prefix.startsWith('\uFEFF'))
      prefix = `\uFEFF${prefix}`
    body = body.slice(1)
  }
  const header = renderHeader(style, newline)
  const brief = hasBrief(style, body) ? '' : `${renderBrief(style, describe(path))}${newline}${newline}`
  return `${prefix}${header}${newline}${newline}${brief}${body}`
}
