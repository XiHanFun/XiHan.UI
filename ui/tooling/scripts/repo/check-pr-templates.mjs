#!/usr/bin/env node
// 门禁：三个平台的 PR 模板逐字一致。
//
// GitHub / Gitee / GitCode 是三个平等镜像，从哪一边提 PR 拿到的清单都该是同一份。
// 模板里「门禁看不住的改动」那一节写的正是脚本拦不住、只能靠人读的那几类改动——
// 一份改了另外两份没跟上，另外两个平台的贡献者就永远读不到这几条。
//
// 逐字比对全文，只把行尾差异（CRLF / LF）归一后再比，其余一个字都不许分叉。
import { readFile } from 'node:fs/promises'

// 仓库根在 ui/ 的上一级
const TEMPLATES = [
  '../.github/PULL_REQUEST_TEMPLATE.md',
  '../.gitee/PULL_REQUEST_TEMPLATE.md',
  '../.gitcode/PULL_REQUEST_TEMPLATE.md',
]

/** 行尾归一：平台目录里的文件可能是 CRLF，行尾不算分叉。 */
function normalize(text) {
  return text.replace(/\r\n/g, '\n')
}

/** 第一处不同的行号与两边的原文。 */
function firstDiff(a, b) {
  const left = a.split('\n')
  const right = b.split('\n')
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    if (left[i] !== right[i])
      return { line: i + 1, left: left[i] ?? '（到此为止，本文件更短）', right: right[i] ?? '（到此为止，本文件更短）' }
  }
  return null
}

const [spec, ...mirrors] = TEMPLATES
const specText = normalize(await readFile(spec, 'utf8').catch(() => {
  console.error(`[check-pr-templates] ✗ 基准模板 ${spec} 不存在`)
  process.exit(1)
}))

const problems = []
for (const mirror of mirrors) {
  let text
  try {
    text = normalize(await readFile(mirror, 'utf8'))
  }
  catch {
    problems.push(`${mirror} 不存在——三个平台各要一份`)
    continue
  }
  const diff = firstDiff(specText, text)
  if (diff) {
    problems.push(
      `${mirror} 与 ${spec} 第 ${diff.line} 行起分叉：\n`
      + `      ${spec}：${diff.left}\n`
      + `      ${mirror}：${diff.right}`,
    )
  }
}

if (problems.length > 0) {
  console.error('[check-pr-templates] ✗ 三平台 PR 模板不一致：')
  for (const p of problems) console.error(`  ${p}`)
  console.error('  改完一份，另外两份一起同步')
  process.exit(1)
}

const lines = specText.split('\n').length
console.log(`[check-pr-templates] 通过：${TEMPLATES.length} 份 PR 模板逐字一致（${lines} 行）`)
