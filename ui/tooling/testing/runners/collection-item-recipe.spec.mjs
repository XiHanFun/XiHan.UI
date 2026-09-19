import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { compileCollectionItemRecipe } from '../../../packages/design/styles/build/collection-item-recipe.mjs'

const UI_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const SOURCE = join(UI_ROOT, 'packages/design/styles/recipes/collection-item.recipe.json')
const TOKENS = join(UI_ROOT, 'packages/design/tokens/tokens.json')

const GUARD = ':not([aria-disabled=\'true\'], [data-disabled], [aria-busy=\'true\'], [data-error])'

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

const PRESSED = ':is(:active, [data-pressed])'
const HIGHLIGHT = ':is(:focus-visible, [data-highlighted])'
/** nav 覆盖的基础态与 terminal 不带主体：与基础态规则同形只多一段 context。 */
const BASE_SUFFIX = { 'rest': '', 'hover': `${GUARD}:hover`, 'keyboard-highlight': `${GUARD}${HIGHLIGHT}`, 'pressed': `${GUARD}${PRESSED}`, 'open-path': '[data-in-path]' }

function contextSelector(context, subject, overlay) {
  const suffix = { hover: ':hover', highlight: HIGHLIGHT, pressed: PRESSED }
  const item = `[data-xh-collection-item][data-xh-collection-context='${context}']`
  if (subject in BASE_SUFFIX)
    return `${item}${BASE_SUFFIX[subject]}`
  if (subject === 'terminal')
    return `${item}[data-current][data-xh-collection-terminal]`
  // selected 主体兼认 aria-selected 与分支行的 data-selected；current 只读 data-current
  const base = `${item}${subject === 'selected' ? ':is([aria-selected=\'true\'], [data-selected])' : '[data-current]'}${GUARD}`
  return overlay ? `${base}${suffix[overlay]}` : base
}

/** 某条规则体里某支私有槽的兜底值（var(--xh-collection-<slot>-<state>, <fallback>) 的第二参）。 */
function fallbackOf(body, slot) {
  return body.match(new RegExp(`--xh-_collection-${slot}: var\\(--xh-collection-${slot}-[\\w-]+, (.+)\\);`))[1]
}

describe('collection Item recipe', () => {
  it('固定三尺寸、六内容列、三上下文、九个基础态与上下文态', async () => {
    const recipe = await source()
    const css = compileCollectionItemRecipe(recipe)
    expect(recipe.sizes).toEqual(['sm', 'md', 'lg'])
    expect(recipe.columns).toEqual(['prefix', 'text', 'description', 'shortcut', 'suffix', 'indicator'])
    expect(recipe.contexts).toEqual(['overlay', 'page', 'nav'])
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
      nav: ['rest', 'hover', 'keyboard-highlight', 'pressed', 'open-path', 'current', 'current+hover', 'current+highlight', 'current+pressed', 'terminal'],
    })
    for (const size of recipe.sizes)
      expect(css).toContain(`[data-xh-collection-item][data-xh-collection-size='${size}']`)
    for (const column of recipe.columns)
      expect(css).toContain(`[data-xh-collection-slot='${column}']`)
    expect(css).toContain(contextSelector('overlay', 'selected', 'highlight'))
    expect(css).toContain(contextSelector('page', 'selected'))
    expect(css).toContain(contextSelector('page', 'current'))
    expect(css).toContain(contextSelector('nav', 'rest'))
    expect(css).toContain(contextSelector('nav', 'current', 'pressed'))
    expect(css).toContain(contextSelector('nav', 'terminal'))
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

  it('nav 语境自带白底承载阶梯：rest 透明面 + muted 字，hover 100 → pressed 200，open-path 与 hover 同档', async () => {
    const css = compileCollectionItemRecipe(await source())
    const rest = ruleBody(css, contextSelector('nav', 'rest'))
    expect(fallbackOf(rest, 'bg')).toBe('transparent')
    expect(fallbackOf(rest, 'fg')).toBe('var(--xh-fg-muted)')
    expect(fallbackOf(rest, 'font-weight')).toBe('var(--xh-font-weight-regular)')
    const hover = ruleBody(css, contextSelector('nav', 'hover'))
    expect(fallbackOf(hover, 'bg')).toBe('var(--xh-bg-subtle)')
    expect(fallbackOf(hover, 'fg')).toBe('var(--xh-fg-default)')
    const pressed = ruleBody(css, contextSelector('nav', 'pressed'))
    expect(fallbackOf(pressed, 'bg')).toBe('var(--xh-bg-subtle-hover)')
    expect(pressed).toContain('transition-duration: var(--xh-motion-duration-press);')
    expect(pressed).toContain('transition-timing-function: var(--xh-motion-ease-press);')
    expect(pressed).not.toMatch(/scale|translate|transform/)
    expect(fallbackOf(ruleBody(css, contextSelector('nav', 'open-path')), 'bg')).toBe(fallbackOf(hover, 'bg'))
    // 覆盖基础态的源序与基础态一致：hover → highlight → pressed（同为 (0,4,0)）
    expect(css.indexOf(contextSelector('nav', 'keyboard-highlight'))).toBeGreaterThan(css.indexOf(contextSelector('nav', 'hover')))
    expect(css.indexOf(contextSelector('nav', 'pressed'))).toBeGreaterThan(css.indexOf(contextSelector('nav', 'keyboard-highlight')))
    // nav 各态都排在对应基础态之后，同特指度下不会被基础态盖掉
    expect(css.indexOf(contextSelector('nav', 'rest'))).toBeGreaterThan(css.indexOf(`[data-xh-collection-item]${GUARD}${PRESSED} {`))
  })

  it('nav 当前页 = 透明面 + 品牌深字 + medium，叠加 hover 100 / pressed 200；不读 aria-selected', async () => {
    const css = compileCollectionItemRecipe(await source())
    const current = ruleBody(css, contextSelector('nav', 'current'))
    expect(fallbackOf(current, 'bg')).toBe('transparent')
    expect(fallbackOf(current, 'fg')).toBe('var(--xh-fg-brand-strong)')
    expect(fallbackOf(current, 'font-weight')).toBe('var(--xh-font-weight-medium)')
    expect(fallbackOf(ruleBody(css, contextSelector('nav', 'current', 'hover')), 'bg')).toBe('var(--xh-bg-subtle)')
    expect(fallbackOf(ruleBody(css, contextSelector('nav', 'current', 'pressed')), 'bg')).toBe('var(--xh-bg-subtle-hover)')
    expect(fallbackOf(ruleBody(css, contextSelector('nav', 'current', 'highlight')), 'outline')).toBe('var(--xh-ring-focus)')
    // Tabs trigger 自带 aria-selected：nav 段不能把它判成页内选中
    const navRules = [...css.matchAll(/\[data-xh-collection-context='nav'\][^{]*\{/g)].map(m => m[0])
    expect(navRules.length).toBeGreaterThan(0)
    expect(navRules.some(selector => selector.includes('aria-selected'))).toBe(false)
  })

  it('nav terminal（不可点当前页）不带交互守卫：透明面 + --xh-fg-default + medium + cursor default', async () => {
    const css = compileCollectionItemRecipe(await source())
    const selector = contextSelector('nav', 'terminal')
    expect(selector).not.toContain(':not(')
    const terminal = ruleBody(css, selector)
    expect(fallbackOf(terminal, 'bg')).toBe('transparent')
    expect(fallbackOf(terminal, 'fg')).toBe('var(--xh-fg-default)')
    expect(fallbackOf(terminal, 'font-weight')).toBe('var(--xh-font-weight-medium)')
    expect(fallbackOf(terminal, 'cursor')).toBe('default')
    // 光标直接写回：pointer.css 给 [aria-disabled='true'] 的 not-allowed 是 (0,3,0)，基础块的 cursor (0,1,0) 压不过，
    // 而不可点的当前页同时带 aria-disabled，只有 terminal 这条 (0,4,0) 自己写 cursor 才落得到 default
    expect(terminal).toContain('cursor: var(--xh-_collection-cursor);')
    // 没有 terminal 叠加态：hover / pressed 不会点亮不可点的当前页
    expect(css).not.toContain(`${selector}:hover`)
    expect(css).not.toContain(`${selector}${PRESSED}`)
    // terminal 只属于 nav，且排在家族禁用面之前也无妨：(0,4,0) 压过 [aria-disabled='true'] 的 (0,2,0)
    expect(css).not.toMatch(/context='(?:overlay|page)'\]\[data-current\]\[data-xh-collection-terminal\]/)
  })

  it('每类标记有 forced-colors 映射，指示条只在 page', async () => {
    const css = compileCollectionItemRecipe(await source())
    const forced = css.slice(css.indexOf('@media (forced-colors: active)'))
    expect(ruleBody(forced, '[data-xh-collection-item]')).toContain('--xh-_collection-indicator-fg: ButtonText;')
    expect(ruleBody(forced, contextSelector('overlay', 'selected'))).toContain('--xh-_collection-indicator-fg: Highlight;')
    expect(ruleBody(forced, contextSelector('page', 'selected'))).toContain('--xh-_collection-indicator-fg: HighlightText;')
    expect(ruleBody(forced, contextSelector('page', 'current'))).toContain('--xh-_collection-indicator-fg: HighlightText;')
    // 导航当前页 forced = ButtonText（§7.3）：字重与组件自己的滑动 indicator 承担非颜色通道
    expect(ruleBody(forced, contextSelector('nav', 'current'))).toContain('--xh-_collection-indicator-fg: ButtonText;')
    expect(ruleBody(forced, contextSelector('nav', 'terminal'))).toContain('--xh-_collection-indicator-fg: ButtonText;')
    expect(ruleBody(forced, contextSelector('nav', 'hover'))).toContain('--xh-_collection-bg: Highlight;')
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
    ['nav 写了 selected', (recipe) => {
      recipe.contextStates.nav.push('selected')
      recipe.contextValues.nav.selected = { ...recipe.contextValues.overlay.selected }
      recipe.forcedContextColors.nav.selected = { ...recipe.forcedContextColors.overlay.selected }
    }],
    ['page 写了 terminal', (recipe) => {
      recipe.contextStates.page.push('terminal')
      recipe.contextValues.page.terminal = { ...recipe.contextValues.nav.terminal }
      recipe.forcedContextColors.page.terminal = { ...recipe.forcedContextColors.nav.terminal }
    }],
    ['nav 缺 terminal', (recipe) => {
      recipe.contextStates.nav.pop()
      delete recipe.contextValues.nav.terminal
      delete recipe.forcedContextColors.nav.terminal
    }],
    ['version 仍为 2', (recipe) => { recipe.version = 2 }],
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
