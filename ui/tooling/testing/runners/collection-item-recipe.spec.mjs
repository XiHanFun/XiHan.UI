import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { compileCollectionItemRecipe } from '../../../packages/design/styles/build/collection-item-recipe.mjs'

const UI_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const SOURCE = join(UI_ROOT, 'packages/design/styles/recipes/collection-item.recipe.json')
const TOKENS = join(UI_ROOT, 'packages/design/tokens/tokens.json')

const GUARD = ':not([aria-disabled=\'true\'], [aria-busy=\'true\'], [data-error])'

async function source() {
  return JSON.parse(await readFile(SOURCE, 'utf8'))
}

/** 取出某条选择器的规则体；只匹配第一处（forced-colors 段里的同名规则排在后面）。 */
function ruleBody(css, selector) {
  const start = css.indexOf(`${selector} {`)
  if (start === -1)
    throw new Error(`规则不存在：${selector}`)
  return css.slice(start, css.indexOf('}', start))
}

function contextSelector(context, subject, overlay) {
  const suffix = { hover: ':hover', highlight: ':is(:focus-visible, [data-highlighted])', pressed: ':is(:active, [data-pressed])' }
  const base = `[data-xh-collection-item][data-xh-collection-context='${context}'][${subject === 'selected' ? 'aria-selected=\'true\'' : 'data-current'}]${GUARD}`
  return overlay ? `${base}${suffix[overlay]}` : base
}

describe('collection Item recipe', () => {
  it('固定三尺寸、六内容列、两上下文、九个基础态与上下文态', async () => {
    const recipe = await source()
    const css = compileCollectionItemRecipe(recipe)
    expect(recipe.sizes).toEqual(['sm', 'md', 'lg'])
    expect(recipe.columns).toEqual(['prefix', 'text', 'description', 'shortcut', 'suffix', 'indicator'])
    expect(recipe.contexts).toEqual(['overlay', 'page'])
    expect(recipe.states).toEqual([
      'rest',
      'hover',
      'keyboard-highlight',
      'pressed',
      'open-path',
      'checked',
      'disabled',
      'loading',
      'error',
    ])
    expect(recipe.contextStates).toEqual({
      overlay: ['selected', 'selected+hover', 'selected+highlight', 'selected+pressed'],
      page: ['selected', 'selected+hover', 'selected+highlight', 'selected+pressed', 'current', 'current+hover', 'current+highlight', 'current+pressed'],
    })
    for (const size of recipe.sizes)
      expect(css).toContain(`[data-xh-collection-item][data-xh-collection-size='${size}']`)
    for (const column of recipe.columns)
      expect(css).toContain(`[data-xh-collection-slot='${column}']`)
    expect(css).toContain(contextSelector('overlay', 'selected', 'highlight'))
    expect(css).toContain(contextSelector('page', 'selected'))
    expect(css).toContain(contextSelector('page', 'current'))
    expect(css).toContain('[data-xh-collection-item][data-in-path]')
    expect(css).toContain('[data-xh-collection-item][data-state=\'checked\'] {')
    expect(css).toContain(':is([aria-selected=\'true\'], [data-state=\'checked\']) [data-xh-collection-slot=\'indicator\']')
    expect(css).toContain('[data-xh-collection-item][aria-disabled=\'true\']')
    expect(css).toContain('[data-xh-collection-item][aria-busy=\'true\']')
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
    expect(css).toContain(':where([data-motion=\'reduce\']) [data-xh-collection-item]')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).not.toMatch(/^\s*\[data-(?!xh-collection)[^\]]+\][^{]*\{/m)
  })

  it('换面走统一点击时间线：释放 200ms，按下 120ms，pressed 面排在 hover 与高亮之后', async () => {
    const css = compileCollectionItemRecipe(await source())
    expect(css).toContain('background-color var(--xh-motion-duration-release) var(--xh-motion-ease-release)')
    // 按压面同时认指针 :active 与 Headless 投影的 data-pressed（键盘 / 触屏），同一档
    const pressed = css.match(/\[data-error\]\):is\(:active, \[data-pressed\]\) \{([^}]*)\}/)[1]
    expect(css).not.toMatch(/\[data-error\]\):active \{/)
    expect(pressed).toContain('transition-duration: var(--xh-motion-duration-press);')
    expect(pressed).toContain('transition-timing-function: var(--xh-motion-ease-press);')
    expect(pressed).toContain('--xh-_collection-bg: var(--xh-collection-bg-pressed, var(--xh-bg-subtle-hover));')
    expect(pressed).not.toMatch(/scale|translate|transform/)
    // 三条同为 (0,3,0)：pressed 若排在前面会被 hover / 高亮盖掉，永远不可见
    expect(css.indexOf('[data-error]):is(:active, [data-pressed]) {')).toBeGreaterThan(css.indexOf('[data-highlighted]) {'))
    expect(css.indexOf('[data-highlighted]) {')).toBeGreaterThan(css.indexOf('[data-error]):hover {'))
  })

  it('overlay 选中透明底、page 选中品牌淡底，selected+hover/pressed 走 20%/28%', async () => {
    const css = compileCollectionItemRecipe(await source())
    expect(ruleBody(css, contextSelector('overlay', 'selected'))).toContain('--xh-collection-bg-selected, transparent)')
    const pageSelected = ruleBody(css, contextSelector('page', 'selected'))
    expect(pageSelected).toContain('var(--xh-bg-brand-subtle))')
    expect(pageSelected).toContain('var(--xh-fg-on-brand-subtle))')
    expect(ruleBody(css, contextSelector('page', 'selected', 'hover'))).toContain('--xh-bg-brand-subtle-hover')
    expect(ruleBody(css, contextSelector('page', 'selected', 'pressed'))).toContain('--xh-bg-brand-subtle-active')
    expect(ruleBody(css, contextSelector('page', 'current'))).toContain('var(--xh-bg-brand-subtle))')
    expect(css).not.toContain('[data-xh-collection-context=\'overlay\'][data-current]')
    // 上下文叠加态的源序与基础态一致：hover → highlight → pressed
    for (const context of ['overlay', 'page']) {
      expect(css.indexOf(contextSelector(context, 'selected', 'highlight'))).toBeGreaterThan(css.indexOf(contextSelector(context, 'selected', 'hover')))
      expect(css.indexOf(contextSelector(context, 'selected', 'pressed'))).toBeGreaterThan(css.indexOf(contextSelector(context, 'selected', 'highlight')))
    }
  })

  it('open-path 与 hover 同档', async () => {
    const css = compileCollectionItemRecipe(await source())
    const fallback = body => body.match(/--xh-_collection-bg: var\(--xh-collection-bg-[\w-]+, ([^)]+\))\);/)[1]
    expect(fallback(ruleBody(css, '[data-xh-collection-item][data-in-path]'))).toBe('var(--xh-bg-subtle)')
    expect(fallback(ruleBody(css, `[data-xh-collection-item]${GUARD}:hover`))).toBe('var(--xh-bg-subtle)')
  })

  it('每类标记有 forced-colors 映射，指示条只在 page', async () => {
    const css = compileCollectionItemRecipe(await source())
    const forced = css.slice(css.indexOf('@media (forced-colors: active)'))
    expect(ruleBody(forced, '[data-xh-collection-item]')).toContain('--xh-_collection-indicator-fg: ButtonText;')
    expect(ruleBody(forced, contextSelector('overlay', 'selected'))).toContain('--xh-_collection-indicator-fg: Highlight;')
    expect(ruleBody(forced, contextSelector('page', 'selected'))).toContain('--xh-_collection-indicator-fg: HighlightText;')
    expect(ruleBody(forced, contextSelector('page', 'current'))).toContain('--xh-_collection-indicator-fg: HighlightText;')
    const bars = [...css.matchAll(/\[data-current\]::before/g)]
    expect(bars).toHaveLength(1)
    const bar = ruleBody(css, '[data-xh-collection-item][data-xh-collection-context=\'page\'][data-current]::before')
    expect(bar).toContain('inset-inline-start: 0;')
    expect(bar).toContain('inline-size: var(--xh-stroke-thick);')
    expect(bar).toContain('background-color: var(--xh-_collection-indicator-fg);')
  })

  it('配方引用的令牌都已声明（family CSS 不在 check-token-refs 扫描面）', async () => {
    const recipe = await source()
    const tokens = new Set(Object.keys(JSON.parse(await readFile(TOKENS, 'utf8'))))
    const referenced = new Set()
    const collect = (value) => {
      if (typeof value === 'string') {
        for (const match of value.matchAll(/var\((--xh-[\w-]+)/g)) {
          if (!match[1].startsWith('--xh-collection-'))
            referenced.add(match[1])
        }
      }
      else if (value && typeof value === 'object') {
        Object.values(value).forEach(collect)
      }
    }
    collect(recipe)
    expect(referenced.size).toBeGreaterThan(0)
    expect(referenced.has('--xh-fg-on-brand-subtle')).toBe(true)
    const missing = [...referenced].filter(name => !tokens.has(name))
    expect(missing).toEqual([])
  })

  it.each([
    ['未知根键', (recipe) => { recipe.extra = true }],
    ['缺少状态', (recipe) => { delete recipe.stateValues.error }],
    ['列顺序漂移', (recipe) => { recipe.columns.reverse() }],
    ['负 separator margin', (recipe) => { recipe.separator.blockMargin = '-1px' }],
    ['非逻辑方向', (recipe) => { recipe.direction.axis = 'physical' }],
    ['overlay 写了 current', (recipe) => { recipe.contextValues.overlay.current = { ...recipe.contextValues.page.current } }],
    ['缺少上下文', (recipe) => { delete recipe.contextValues.page }],
    ['forced 缺 markerColor', (recipe) => { delete recipe.forcedColors.pressed.markerColor }],
    ['version 仍为 1', (recipe) => { recipe.version = 1 }],
  ])('%s 会失败', async (_, mutate) => {
    const recipe = await source()
    mutate(recipe)
    expect(() => compileCollectionItemRecipe(recipe)).toThrow(/\[collection-item-recipe\]/)
  })

  it('select 单皮肤递归带入 Collection Item，full 入口仍只有一个 Select 入口', async () => {
    const selectCss = await readFile(join(UI_ROOT, 'packages/design/styles/css/select.css'), 'utf8')
    const indexCss = await readFile(join(UI_ROOT, 'packages/design/styles/index.css'), 'utf8')
    expect(selectCss).toContain('@import \'../family/collection-item.css\';')
    expect(indexCss.match(/@import '\.\/css\/select\.css';/g)).toHaveLength(1)
  })
})
