#!/usr/bin/env node
// 门禁：浮层落点只有一个，适配器不许自己往 body 上贴宿主。
//
// 全库的浮层都 Teleport 到 ensurePortalRoot(document) 给出的那一个容器；命令式服务
// （对话框 / 消息条 / 加载条）却是自己 createElement 再 document.body.appendChild。
// 后果不是「多了个 div」：模态浮层开启时 hideOutside 会沿 body 的直子节点逐个施加 inert，
// 贴在 body 上、既不在目标链上又没有豁免标记的宿主会被整片罩住——加载条就这么在
// 对话框打开期间从无障碍树里消失过。落点统一之后，谁该豁免由 DATA_INERT_EXEMPT 显式说了算。
import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const ADAPTERS = 'packages/adapters'

/**
 * 允许直接贴 body 的地方，各带理由。键是相对仓库根的 posix 路径，
 * 必须落在下面扫描的目录里、且那份文件真的写了贴 body 的调用——
 * 两条有一条不成立，这条放行就永远走不到，由下面的名单核验报出来。
 */
const ALLOWED = {}

const OFFENDER = /document\.body\.(?:appendChild|append|insertBefore|prepend)\s*\(/

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'tests')
      continue
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      yield* walk(full)
    else if (['.ts', '.tsx'].includes(extname(entry.name)))
      yield full
  }
}

const problems = []
/** 真的用来放行过的文件。 */
const usedAllowed = new Set()
let scanned = 0

for await (const file of walk(ADAPTERS)) {
  scanned += 1
  const posix = file.split('\\').join('/')
  const src = (await readFile(file, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  src.split('\n').forEach((line, i) => {
    if (line.trim().startsWith('//'))
      return
    if (!OFFENDER.test(line))
      return
    // 放行只在真扫到贴 body 的调用时记账：登记了却没有这么一行，那条登记就是死的
    if (posix in ALLOWED) {
      usedAllowed.add(posix)
      return
    }
    problems.push(`${posix}:${i + 1}  ${line.trim()}`)
  })
}

for (const path of Object.keys(ALLOWED)) {
  if (!usedAllowed.has(path))
    problems.push(`${path} 登记在 ALLOWED 里却没被扫到——名单过期了`)
}

if (problems.length) {
  console.error('[check-portal-target] ✗ 适配器自己往 body 上贴宿主：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  console.error('\n改成 ensurePortalRoot(document).appendChild(…)：落点唯一，模态失活时谁豁免才说得清。')
  process.exit(1)
}

console.log(`[check-portal-target] 通过：扫描 ${scanned} 个适配器源文件，浮层宿主都挂在唯一落点上（放行 ${usedAllowed.size} 处）`)
