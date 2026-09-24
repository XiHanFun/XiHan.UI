#!/usr/bin/env node
// 门禁：浏览器态用例的「声明」与「实体」必须成对。
//
// 根上的 pnpm test:browser 是 turbo run test:browser，它按包里的 test:browser 脚本分发。
// 这条链上有两个静默口子，本脚本各堵一个：
//   1. 包声明了 test:browser，--config 指的那份文件却不存在——脚本一跑就报错退出，
//      而这个包的浏览器态判据从来没跑过；
//   2. 包有 tests/browser/ 目录却没声明 test:browser——用例躺在库里，turbo 分发不到它，
//      写了等于没写。
// 顺带核第三件：声明了脚本、config 也在，但 tests/browser/ 目录不存在，
// 那份 config 的 include 指向空处，同样是一条跑不出用例的链。
import { readdir, readFile, stat } from 'node:fs/promises'
import { join, posix } from 'node:path'
import process from 'node:process'

const PACKAGE_GLOBS = ['packages/*/*', 'tooling/*']
const SCRIPT = 'test:browser'
const TESTS_DIR = 'tests/browser'

/** 免检名单：键是包目录相对路径，值是理由。名单条目必须真实用得上，否则一并判红。 */
const EXEMPT = {}

async function exists(path) {
  try {
    await stat(path)
    return true
  }
  catch {
    return false
  }
}

/** 按 pnpm-workspace 的两段 glob 展开包目录。 */
async function listPackages() {
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

/** 从命令行里取 --config 的取值，支持 `--config x` 与 `--config=x` 两种写法。 */
function configArgOf(command) {
  const equals = command.match(/--config=(\S+)/)
  if (equals)
    return equals[1].replace(/^['"]|['"]$/g, '')
  const spaced = command.match(/--config\s+(\S+)/)
  if (spaced)
    return spaced[1].replace(/^['"]|['"]$/g, '')
  return null
}

const problems = []
const seenExempt = new Set()
let declared = 0
let withTests = 0
let checkedPackages = 0

for (const dir of await listPackages()) {
  const pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'))
  const command = pkg.scripts?.[SCRIPT]
  const hasTests = await exists(join(dir, TESTS_DIR))

  if (dir in EXEMPT) {
    seenExempt.add(dir)
    continue
  }
  checkedPackages++

  if (command) {
    declared++
    const config = configArgOf(command)
    if (!config) {
      problems.push(`${dir} 声明了 ${SCRIPT} 却没有 --config：${command}——认不出它跑的是哪份配置`)
    }
    else if (!await exists(join(dir, config))) {
      problems.push(`${dir} 的 ${SCRIPT} 指向 ${config}，这份文件不存在——脚本一跑就报错退出，这个包的浏览器态判据从来没跑过`)
    }
    if (!hasTests)
      problems.push(`${dir} 声明了 ${SCRIPT} 却没有 ${TESTS_DIR}/ 目录——配置的 include 指向空处，跑不出用例`)
  }

  if (hasTests) {
    withTests++
    if (!command)
      problems.push(`${dir} 有 ${TESTS_DIR}/ 目录却没声明 ${SCRIPT}——turbo 分发不到它，这些用例从来没跑过`)
  }
}

// 免检名单自身的保鲜：包没了或理由空着，放行就落空
for (const [dir, why] of Object.entries(EXEMPT)) {
  if (!seenExempt.has(dir))
    problems.push(`EXEMPT 里的 ${dir} 已不是工作区里的包，清掉这条`)
  else if (!why?.trim())
    problems.push(`EXEMPT 里的 ${dir} 没写理由`)
}

if (checkedPackages === 0)
  problems.push(`一个包都没扫到，目录层级变了：${PACKAGE_GLOBS.join(' ')}`)

if (problems.length > 0) {
  console.error('[check-browser-config] ✗')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(
  `[check-browser-config] 通过：${checkedPackages} 个包里 ${declared} 个声明了 ${SCRIPT}，`
  + `${withTests} 个有 ${TESTS_DIR}/，声明与实体一一对上`,
)
