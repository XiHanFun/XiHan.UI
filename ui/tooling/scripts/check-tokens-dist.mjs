#!/usr/bin/env node
// 门禁：packages/design/tokens 的令牌产物必须入库（tokens.css / tokens.json / src/generated/tokens.ts）。
// 只查产物是否存在，产物与源是否同步由 CI 重跑 gen 后比对。
import { stat } from 'node:fs/promises'
import { join } from 'node:path'

const SYSTEM_DIR = 'packages/design/tokens'
const REQUIRED = ['tokens.css', 'tokens.json', 'src/generated/tokens.ts']

async function exists(p) {
  try {
    await stat(p)
    return true
  }
  catch {
    return false
  }
}

// 目录不在就是错，不是跳过。「找不到就放行」会让一次路径写错变成永久空转：
// 门禁照常打印通过，而它其实一个文件都没查。
if (!(await exists(SYSTEM_DIR))) {
  console.error(`[check-tokens-dist] ✗ 找不到 ${SYSTEM_DIR}——包挪了位置就把这里的路径一起改`)
  process.exit(1)
}

const missing = []
for (const f of REQUIRED) {
  if (!(await exists(join(SYSTEM_DIR, f))))
    missing.push(f)
}
if (missing.length) {
  console.error(`[check-tokens-dist] ✗ 缺少令牌产物：${missing.join(', ')}（跑 pnpm --filter @xihan-ui/tokens gen）`)
  process.exit(1)
}
console.log('[check-tokens-dist] 通过：令牌产物齐全')
