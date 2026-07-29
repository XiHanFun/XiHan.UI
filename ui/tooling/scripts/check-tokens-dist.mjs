#!/usr/bin/env node
// 门禁：packages/system 的令牌产物必须入库（tokens.css / tokens.json / src/generated/tokens.ts）。
// 只查产物是否存在，产物与源是否同步由 CI 重跑 gen 后比对。
import { stat } from 'node:fs/promises'
import { join } from 'node:path'

const SYSTEM_DIR = 'packages/system'
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

if (!(await exists(SYSTEM_DIR))) {
  console.log('[check-tokens-dist] 跳过：packages/system 尚未建立')
  process.exit(0)
}

const missing = []
for (const f of REQUIRED) {
  if (!(await exists(join(SYSTEM_DIR, f))))
    missing.push(f)
}
if (missing.length) {
  console.error(`[check-tokens-dist] ✗ 缺少令牌产物：${missing.join(', ')}（跑 pnpm --filter @xihan-ui/system gen）`)
  process.exit(1)
}
console.log('[check-tokens-dist] 通过：令牌产物齐全')
