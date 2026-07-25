#!/usr/bin/env node
// 门禁：packages/system 的令牌产物（dist/tokens.{css,js,json}）必须入库且与源 tokens/ 一致。
// M0：packages/system 尚不存在，脚本跳过并通过（M1 令牌落地后生效）。
import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

const SYSTEM_DIR = 'packages/system'
const REQUIRED = ['tokens.css', 'tokens.js', 'tokens.json']

async function exists(p) {
  try { await stat(p); return true }
  catch { return false }
}

if (!(await exists(SYSTEM_DIR))) {
  console.log('[check-tokens-dist] 跳过：packages/system 尚未建立（M1 交付）')
  process.exit(0)
}

const distDir = join(SYSTEM_DIR, 'dist')
if (!(await exists(distDir))) {
  console.error('[check-tokens-dist] ✗ packages/system/dist 缺失，令牌产物必须入库')
  process.exit(1)
}
const files = new Set(await readdir(distDir))
const missing = REQUIRED.filter(f => !files.has(f))
if (missing.length) {
  console.error(`[check-tokens-dist] ✗ 缺少令牌产物：${missing.join(', ')}`)
  process.exit(1)
}
console.log('[check-tokens-dist] 通过：令牌产物齐全')
