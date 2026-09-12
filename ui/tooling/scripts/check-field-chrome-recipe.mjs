#!/usr/bin/env node

import { emitFieldChromeRecipe } from '../../packages/design/styles/build/field-chrome-recipe.mjs'

try {
  const result = await emitFieldChromeRecipe({ check: true })
  console.log(`[check-field-chrome-recipe] 通过：${result.layouts} layouts × ${result.sizes} sizes × ${result.states} states，生成物 ${result.bytes} bytes`)
}
catch (error) {
  console.error(error)
  process.exit(1)
}
