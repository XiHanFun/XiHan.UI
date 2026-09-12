#!/usr/bin/env node

import { writeComponentTokenArtifacts } from '../../../../tooling/scripts/lib/component-token-manifest.mjs'

async function main() {
  const { manifest } = await writeComponentTokenArtifacts()
  console.log(`[styles] 已生成 components.tokens.json 与 component-tokens.d.ts（${manifest.tokens.length} 项）`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
