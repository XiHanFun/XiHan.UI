// 摄取外部图标集：把任意一个 SVG 目录转成一份 IconRecord 模块。
//
// 与 buildIconSet 的差别只在两处：属性层走宽松模式（外部集普遍带 class / width / height，
// 逐个报错就一枚都进不来，而丢掉它们正是想要的），以及单枚失败不掀桌，收进报告继续跑。
// 标签层仍然严格——图元里出现 use / text / style 意味着它的样子依赖记录表达不了的东西。
import { readdir, readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { exportNameOf } from './emit.mjs'
import { svgToIconRecord } from './to-record.mjs'

/**
 * 文件名归一成图标名：小写、连字符分段、字母打头。
 *
 * 数字打头的名字（Bootstrap Icons 的 `0-circle`、`123`）会派生出不合法的导出标识符，
 * 前缀一个 n 收编。
 */
export function toIconName(input) {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (slug === '')
    return null
  return /^[a-z]/.test(slug) ? slug : `n${slug}`
}

/**
 * 扫一个目录里的 *.svg，产出 { icons, skipped }。
 *
 * icons 逐枚带 name / exportName / record / notes；skipped 是转不了的那些与原因，
 * 由调用方决定是报告还是当作失败——这里不替它做主。
 */
export async function ingestIconDir(dir, { rename = toIconName } = {}) {
  const files = (await readdir(dir)).filter(name => name.endsWith('.svg')).sort()
  const icons = []
  const skipped = []
  const seen = new Map()

  for (const file of files) {
    const name = rename(basename(file, '.svg'))
    if (name === null) {
      skipped.push({ file, reason: '文件名归一之后是空的' })
      continue
    }
    if (seen.has(name)) {
      skipped.push({ file, reason: `图标名 ${name} 与 ${seen.get(name)} 撞了` })
      continue
    }

    try {
      const { record, notes } = svgToIconRecord(await readFile(join(dir, file), 'utf8'), name, file, { lenient: true })
      seen.set(name, file)
      icons.push({ name, exportName: exportNameOf(name), record, notes })
    }
    catch (error) {
      skipped.push({ file, reason: error instanceof Error ? error.message : String(error) })
    }
  }

  return { icons, skipped }
}
