import { emitCollectionItemRecipe } from '../../packages/design/styles/build/collection-item-recipe.mjs'

try {
  const result = await emitCollectionItemRecipe({ check: true })
  console.log(`[check-collection-item-recipe] 通过：${result.sizes} sizes × ${result.states} states × ${result.columns} columns，生成物 ${result.bytes} bytes`)
}
catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
