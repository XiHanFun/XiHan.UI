#!/usr/bin/env node
// CI 的改动范围：这一轮的改动是不是全落在 Markdown 正文上。是，就不跑单测与浏览器态。
//
// 单测与浏览器态是整轮最贵的两组（十几台 runner、十几分钟），而正文改动碰不到它们读的任何东西：
// 用例不读文档页，示例代码、主题与生成器都不是 .md。静态门禁、构建与产物、文档站照跑，文档数字、
// 死链与站点构建仍由它们兜住。
//
// 不算正文的 .md：
//   · docs/components/ 下的组件页：由 gen:docs 从源码生成，生成物变了说明源码或生成器变了；
//   · tests/ 与 __fixtures__/ 下的：那是用例读的夹具。
// 判不出比较基点（新分支的首次推送、强推后旧提交取不到）时跑全套，不猜。
//
// 用法：node tooling/scripts/ci-changes.mjs --base=<提交> --head=<提交>
// 结果写进 $GITHUB_OUTPUT 的 code=true|false（true 表示要跑全套），并打一行说明。
import { spawnSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

/** 仓库根相对路径是否只是 Markdown 正文。 */
export function isProse(path) {
  if (!path.endsWith('.md'))
    return false
  if (path.startsWith('docs/components/'))
    return false
  return !/(?:^|\/)(?:tests?|__fixtures__)\//.test(path)
}

/** 这批改动要不要跑全套：空列表也跑（判不出改了什么时不跳）。 */
export function needsFullSuite(paths) {
  const blockers = paths.filter(path => !isProse(path))
  return { full: paths.length === 0 || blockers.length > 0, blockers }
}

function changedFiles(base, head) {
  if (!base || /^0+$/.test(base) || !head)
    return null
  // 三点：只看 head 一侧自分叉点以来的改动；--no-renames 让改名的两端都列出来
  const result = spawnSync('git', ['diff', '--name-only', '--no-renames', `${base}...${head}`], { encoding: 'utf8' })
  if (result.status !== 0)
    return null
  return result.stdout.split('\n').map(line => line.trim()).filter(Boolean)
}

function main() {
  const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=')
    return [key, rest.join('=')]
  }))
  const files = changedFiles(args.base, args.head)
  let full
  let note
  if (files === null) {
    full = true
    note = `取不到比较基点（base=${args.base || '空'}），跑全套`
  }
  else {
    const verdict = needsFullSuite(files)
    full = verdict.full
    note = files.length === 0
      ? '没有改动的文件，跑全套'
      : verdict.full
        ? `${files.length} 个文件里有 ${verdict.blockers.length} 个不是 Markdown 正文，跑全套：${verdict.blockers.slice(0, 10).join('、')}${verdict.blockers.length > 10 ? ' 等' : ''}`
        : `${files.length} 个文件全是 Markdown 正文，跳过单测与浏览器态`
  }
  console.log(`[ci-changes] ${note}`)
  if (process.env.GITHUB_OUTPUT)
    appendFileSync(process.env.GITHUB_OUTPUT, `code=${full}\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main()
