#!/usr/bin/env node
import { emitSwatchRecipe } from '../../packages/design/styles/build/swatch-recipe.mjs'

try {
  const result = await emitSwatchRecipe({ check: true })
  console.log(`[check-swatch-recipe] 通过：${result.sizes} sizes，生成物 ${result.bytes} bytes`)
}
catch (error) {
  console.error(error)
  process.exit(1)
}
