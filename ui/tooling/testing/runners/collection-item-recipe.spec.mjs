import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { compileCollectionItemRecipe } from '../../../packages/design/styles/build/collection-item-recipe.mjs'

const UI_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const SOURCE = join(UI_ROOT, 'packages/design/styles/recipes/collection-item.recipe.json')

async function source() {
  return JSON.parse(await readFile(SOURCE, 'utf8'))
}

describe('Collection Item recipe', () => {
  it('固定三尺寸、六内容列与十个独立状态', async () => {
    const recipe = await source()
    const css = compileCollectionItemRecipe(recipe)
    expect(recipe.sizes).toEqual(['sm', 'md', 'lg'])
    expect(recipe.columns).toEqual(['prefix', 'text', 'description', 'shortcut', 'suffix', 'indicator'])
    expect(recipe.states).toEqual([
      'rest',
      'hover',
      'keyboard-highlight',
      'selected',
      'selected+highlight',
      'open-path',
      'checked',
      'disabled',
      'loading',
      'error',
    ])
    for (const size of recipe.sizes)
      expect(css).toContain(`[data-xh-collection-item][data-xh-collection-size='${size}']`)
    for (const column of recipe.columns)
      expect(css).toContain(`[data-xh-collection-slot='${column}']`)
    expect(css).toContain("[data-xh-collection-item][aria-selected='true']:is(:focus-visible, [data-highlighted])")
    expect(css).toContain('[data-xh-collection-item][data-in-path]')
    expect(css).toContain("[data-xh-collection-item][data-state='checked'] {")
    expect(css).toContain("[data-state='checked'] [data-xh-collection-slot='indicator']")
    expect(css).toContain("[data-xh-collection-item][aria-disabled='true']")
    expect(css).toContain("[data-xh-collection-item][aria-busy='true']")
    expect(css).toContain('[data-xh-collection-item][data-error]')
  })

  it('路径与选择不依赖字重或宽度变化，separator 不使用负 margin', async () => {
    const recipe = await source()
    const css = compileCollectionItemRecipe(recipe)
    expect(css).toContain('font-weight: var(--xh-_collection-font-weight)')
    expect(css).not.toMatch(/font-weight:\s*(?:bold|[5-9]00)/)
    expect(css).not.toMatch(/margin-(?:block|inline)(?:-start|-end)?:\s*-\d/)
    expect(css).toContain('[data-xh-collection-separator]')
  })

  it('reduce、forced-colors 与 data-xh 命名空间都有显式输出', async () => {
    const css = compileCollectionItemRecipe(await source())
    expect(css).toContain(":where([data-motion='reduce']) [data-xh-collection-item]")
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).not.toMatch(/^\s*\[data-(?!xh-collection)[^\]]+\][^{]*\{/m)
  })

  it.each([
    ['未知根键', recipe => { recipe.extra = true }],
    ['缺少状态', recipe => { delete recipe.stateValues.error }],
    ['列顺序漂移', recipe => { recipe.columns.reverse() }],
    ['负 separator margin', recipe => { recipe.separator.blockMargin = '-1px' }],
    ['非逻辑方向', recipe => { recipe.direction.axis = 'physical' }],
  ])('%s 会失败', async (_, mutate) => {
    const recipe = await source()
    mutate(recipe)
    expect(() => compileCollectionItemRecipe(recipe)).toThrow(/\[collection-item-recipe\]/)
  })

  it('Select 单皮肤递归带入 Collection Item，full 入口仍只有一个 Select 入口', async () => {
    const selectCss = await readFile(join(UI_ROOT, 'packages/design/styles/css/select.css'), 'utf8')
    const indexCss = await readFile(join(UI_ROOT, 'packages/design/styles/index.css'), 'utf8')
    expect(selectCss).toContain("@import '../family/collection-item.css';")
    expect(indexCss.match(/@import '\.\/css\/select\.css';/g)).toHaveLength(1)
  })
})
