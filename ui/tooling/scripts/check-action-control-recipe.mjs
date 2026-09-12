#!/usr/bin/env node

import { emitActionControlRecipe } from '../../packages/design/styles/build/action-control-recipe.mjs'

try {
  const result = await emitActionControlRecipe({ check: true })
  console.log(`[check-action-control-recipe] 通过：${result.profiles} profiles × ${result.states} states，生成物 ${result.bytes} bytes`)
}
catch (error) {
  console.error(error)
  process.exit(1)
}
