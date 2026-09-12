import { Buffer } from 'node:buffer'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SOURCE = join(ROOT, 'recipes', 'action-control.recipe.json')
const OUTPUT = join(ROOT, 'family', 'action-control.css')

const PROFILES = ['text', 'icon', 'field-inset', 'floating']
const SIZES = ['xs', 'sm', 'md', 'lg']
const DISPLAYS = ['always', 'has-value', 'hover-focus']
const STATES = ['rest', 'hover', 'pressed', 'focus-visible', 'disabled', 'loading']
const SIZE_FIELDS = ['visualSize', 'paddingInline', 'gap', 'glyphSize', 'fontSize']
const STATE_FIELDS = ['backgroundColor', 'color', 'borderColor', 'highlight', 'shadow', 'opacity', 'cursor', 'scale']
const FORCED_FIELDS = ['backgroundColor', 'color', 'borderColor', 'outlineColor']
const STATE_SLOT = {
  backgroundColor: 'bg',
  color: 'fg',
  borderColor: 'border',
  highlight: 'highlight',
  shadow: 'shadow',
  opacity: 'opacity',
  cursor: 'cursor',
  scale: 'scale',
}
const CSS_PROPERTY = {
  backgroundColor: 'background-color',
  color: 'color',
  borderColor: 'border-color',
  shadow: 'box-shadow',
  opacity: 'opacity',
  cursor: 'cursor',
  scale: 'scale',
}

function assertRecord(value, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`[action-control-recipe] ${path} 必须是对象`)
}

function assertExactKeys(value, expected, path) {
  assertRecord(value, path)
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (actual.join(',') === wanted.join(','))
    return
  const unknown = actual.filter(name => !wanted.includes(name))
  const missing = wanted.filter(name => !actual.includes(name))
  throw new Error(
    `[action-control-recipe] ${path} 键集合不完整`
    + `${unknown.length ? `；未知：${unknown.join(', ')}` : ''}`
    + `${missing.length ? `；缺少：${missing.join(', ')}` : ''}`,
  )
}

function assertString(value, path) {
  if (typeof value !== 'string' || value.trim().length === 0)
    throw new Error(`[action-control-recipe] ${path} 必须是非空字符串`)
}

function assertList(value, expected, path) {
  if (!Array.isArray(value))
    throw new Error(`[action-control-recipe] ${path} 必须是数组`)
  value.forEach((entry, index) => assertString(entry, `${path}[${index}]`))
  if (new Set(value).size !== value.length)
    throw new Error(`[action-control-recipe] ${path} 不能重复`)
  if (value.join(',') !== expected.join(','))
    throw new Error(`[action-control-recipe] ${path} 必须严格为 ${expected.join(', ')}`)
}

function assertFields(value, fields, path) {
  assertExactKeys(value, fields, path)
  fields.forEach(field => assertString(value[field], `${path}.${field}`))
}

export function assertActionControlRecipe(source) {
  assertExactKeys(source, [
    '$description',
    'version',
    'order',
    'sizes',
    'displays',
    'profiles',
    'states',
    'coarsePointer',
    'motion',
    'compact',
    'direction',
    'forcedColors',
  ], 'root')
  assertString(source.$description, 'root.$description')
  if (source.version !== 1)
    throw new Error('[action-control-recipe] root.version 必须为 1')
  assertList(source.order, PROFILES, 'root.order')
  assertList(source.sizes, SIZES, 'root.sizes')
  assertList(source.displays, DISPLAYS, 'root.displays')

  assertExactKeys(source.profiles, PROFILES, 'root.profiles')
  for (const profile of PROFILES) {
    const value = source.profiles[profile]
    assertExactKeys(value, ['description', 'layout', 'sizes'], `profiles.${profile}`)
    assertString(value.description, `profiles.${profile}.description`)
    assertExactKeys(value.layout, ['square', 'radius'], `profiles.${profile}.layout`)
    if (typeof value.layout.square !== 'boolean')
      throw new Error(`[action-control-recipe] profiles.${profile}.layout.square 必须是布尔值`)
    assertString(value.layout.radius, `profiles.${profile}.layout.radius`)
    assertExactKeys(value.sizes, SIZES, `profiles.${profile}.sizes`)
    for (const size of SIZES) {
      const entry = value.sizes[size]
      assertFields(entry, SIZE_FIELDS, `profiles.${profile}.sizes.${size}`)
      const literal = /^(\d+(?:\.\d+)?)px$/.exec(entry.visualSize)
      if (literal && Number(literal[1]) < 24)
        throw new Error(`[action-control-recipe] profiles.${profile}.sizes.${size}.visualSize 不能小于 24px`)
    }
  }

  assertExactKeys(source.states, STATES, 'root.states')
  for (const state of STATES)
    assertFields(source.states[state], state === 'focus-visible' ? [...STATE_FIELDS, 'ringColor'] : STATE_FIELDS, `states.${state}`)
  assertExactKeys(source.forcedColors, STATES, 'root.forcedColors')
  for (const state of STATES)
    assertFields(source.forcedColors[state], FORCED_FIELDS, `forcedColors.${state}`)

  assertFields(source.coarsePointer, ['minimumTarget'], 'root.coarsePointer')
  const minimumTarget = /^(\d+(?:\.\d+)?)px$/.exec(source.coarsePointer.minimumTarget)
  if (!minimumTarget || Number(minimumTarget[1]) < 44)
    throw new Error('[action-control-recipe] coarsePointer.minimumTarget 必须是至少 44px 的静态命中区')
  assertFields(source.motion, ['duration', 'easing', 'pressEasing'], 'root.motion')
  assertExactKeys(source.compact, ['strategy', 'tokens'], 'root.compact')
  if (source.compact.strategy !== 'semantic-token-remap')
    throw new Error('[action-control-recipe] compact.strategy 必须为 semantic-token-remap')
  if (!Array.isArray(source.compact.tokens) || source.compact.tokens.length === 0 || new Set(source.compact.tokens).size !== source.compact.tokens.length)
    throw new Error('[action-control-recipe] compact.tokens 必须是非空、无重复的令牌列表')
  source.compact.tokens.forEach((token, index) => {
    if (typeof token !== 'string' || !/^--xh-[a-z0-9-]+$/.test(token))
      throw new Error(`[action-control-recipe] compact.tokens[${index}] 不是合法令牌名`)
  })
  assertFields(source.direction, ['axis', 'flow'], 'root.direction')
  if (source.direction.axis !== 'logical' || source.direction.flow !== 'row')
    throw new Error('[action-control-recipe] direction 只能声明 logical/row；物理方向不属于 Action Control')
}

function stateValue(source, state, field) {
  return `var(--xh-action-${STATE_SLOT[field]}-${state}, ${source.states[state][field]})`
}

function stateDeclarations(source, state, focus = false) {
  const value = source.states[state]
  // 默认值相同不代表状态槽可以省略：组件可能只覆盖 hover/focus/loading 某一档。
  // 每个状态都完整发出桥接声明，保证 recipe JSON 中登记的状态槽全部真实可消费。
  const lines = STATE_FIELDS.map((field) => {
    const property = field === 'highlight' ? '--xh-_action-current-highlight' : CSS_PROPERTY[field]
    return `    ${property}: ${stateValue(source, state, field)};`
  })
  if (focus)
    lines.push(`    --xh-_ring-color: var(--xh-action-ring-color-focus-visible, ${value.ringColor});`)
  return lines.join('\n')
}

function forcedDeclarations(source, state, extra = []) {
  const value = source.forcedColors[state]
  const base = source.forcedColors.rest
  const fields = state === 'rest'
    ? ['backgroundColor', 'color', 'borderColor']
    : ['backgroundColor', 'color', 'borderColor'].filter(field => value[field] !== base[field])
  return [
    ...fields.map(field => `      ${CSS_PROPERTY[field]}: ${value[field]};`),
    ...(state === 'rest' ? ['      background-image: none;', '      box-shadow: none;', '      opacity: 1;'] : []),
    ...extra,
  ].join('\n')
}

export function compileActionControlRecipe(source) {
  assertActionControlRecipe(source)
  const selectors = new Set()
  const chunks = []
  const rule = (selector, body, context = 'root', target = chunks, indent = '  ') => {
    for (const branch of selector.split(',').map(value => value.trim())) {
      const key = `${context}\n${branch}`
      if (selectors.has(key))
        throw new Error(`[action-control-recipe] 生成了重复选择器：${branch} (${context})`)
      selectors.add(key)
    }
    target.push(`${indent}${selector} {\n${body}\n${indent}}`)
  }

  rule('[data-xh-action-control]', [
    `    --xh-_action-current-highlight: ${stateValue(source, 'rest', 'highlight')};`,
    '',
    '    position: relative;',
    '    display: inline-flex;',
    `    flex-direction: ${source.direction.flow};`,
    '    align-items: center;',
    '    justify-content: center;',
    '    gap: var(--xh-action-gap, var(--xh-_action-profile-gap));',
    '    block-size: var(--xh-action-visual-size, var(--xh-_action-profile-visual-size));',
    '    min-inline-size: var(--xh-action-min-inline-size, var(--xh-_action-profile-visual-size));',
    '    padding-inline: var(--xh-action-padding-inline, var(--xh-_action-profile-padding-inline));',
    `    border: var(--xh-stroke-thin) solid ${stateValue(source, 'rest', 'borderColor')};`,
    '    border-radius: var(--xh-action-radius, var(--xh-_action-profile-radius));',
    `    background-color: ${stateValue(source, 'rest', 'backgroundColor')};`,
    '    background-image: linear-gradient(',
    '      to bottom,',
    '      var(--xh-_action-current-highlight) 0 var(--xh-stroke-thin),',
    '      transparent var(--xh-stroke-thin)',
    '    );',
    `    color: ${stateValue(source, 'rest', 'color')};`,
    `    box-shadow: ${stateValue(source, 'rest', 'shadow')};`,
    '    font-size: var(--xh-action-font-size, var(--xh-_action-profile-font-size));',
    '    line-height: var(--xh-leading-none);',
    '    white-space: nowrap;',
    `    cursor: ${stateValue(source, 'rest', 'cursor')};`,
    `    opacity: ${stateValue(source, 'rest', 'opacity')};`,
    '    user-select: none;',
    '    transition:',
    `      background-color ${source.motion.duration} ${source.motion.easing},`,
    `      border-color ${source.motion.duration} ${source.motion.easing},`,
    `      box-shadow ${source.motion.duration} ${source.motion.easing},`,
    `      opacity ${source.motion.duration} ${source.motion.easing},`,
    `      scale ${source.motion.duration} ${source.motion.pressEasing};`,
  ].join('\n'))

  /* text 是尺寸基线；icon 共用其光学档，field/floating 只覆写真正不同的通道。 */
  for (const size of SIZES) {
    const value = source.profiles.text.sizes[size]
    rule(`[data-xh-action-control][data-xh-action-size='${size}']`, SIZE_FIELDS.map(field =>
      `    --xh-_action-profile-${field.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}: ${value[field]};`,
    ).join('\n'))
  }

  for (const profile of PROFILES) {
    const value = source.profiles[profile]
    const commonFields = SIZE_FIELDS.filter(field =>
      SIZES.every(size => value.sizes[size][field] === value.sizes[SIZES[0]][field]),
    )
    rule(`[data-xh-action-control][data-xh-action-profile='${profile}']`, [
      `    --xh-_action-profile-radius: ${value.layout.radius};`,
      ...commonFields.map(field =>
        `    --xh-_action-profile-${field.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}: ${value.sizes.xs[field]};`,
      ),
      ...(value.layout.square
        ? ['    flex: none;', '    inline-size: var(--xh-action-visual-size, var(--xh-_action-profile-visual-size));']
        : []),
    ].join('\n'))
    if (profile === 'text')
      continue
    for (const size of SIZES) {
      const different = SIZE_FIELDS.filter(field =>
        !commonFields.includes(field) && value.sizes[size][field] !== source.profiles.text.sizes[size][field],
      )
      if (different.length === 0)
        continue
      rule(`[data-xh-action-control][data-xh-action-profile='${profile}'][data-xh-action-size='${size}']`, different.map(field =>
        `    --xh-_action-profile-${field.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}: ${value.sizes[size][field]};`,
      ).join('\n'))
    }
  }

  rule('[data-xh-action-control]:focus-visible', stateDeclarations(source, 'focus-visible', true))
  rule('[data-xh-action-control]:not([data-disabled]):not([data-loading]):hover', stateDeclarations(source, 'hover'))
  rule('[data-xh-action-control]:not([data-disabled]):not([data-loading]):active', stateDeclarations(source, 'pressed'))
  rule('[data-xh-action-control][data-disabled]', stateDeclarations(source, 'disabled'))
  rule('[data-xh-action-control][data-loading][aria-disabled=\'true\']', stateDeclarations(source, 'loading'))

  rule('[data-xh-action-control][data-xh-action-display=\'always\']', '    visibility: visible;')
  rule('[data-xh-action-control][data-xh-action-display=\'has-value\']:not([data-xh-action-has-value])', '    visibility: hidden;\n    pointer-events: none;')
  rule('[data-xh-action-control][data-xh-action-display=\'has-value\'][data-xh-action-has-value]', '    visibility: visible;')
  rule('[data-xh-action-control][data-xh-action-display=\'hover-focus\']', '    visibility: visible;')

  const fine = []
  rule('[data-xh-action-control][data-xh-action-display=\'hover-focus\']', '      visibility: hidden;\n      opacity: 0;\n      pointer-events: none;', 'fine', fine, '    ')
  rule(
    ':where([data-xh-action-owner]:hover, [data-xh-action-owner]:focus-within) [data-xh-action-control][data-xh-action-display=\'hover-focus\'],\n    [data-xh-action-control][data-xh-action-display=\'hover-focus\']:focus-visible',
    '      visibility: visible;\n      opacity: 1;\n      pointer-events: auto;',
    'fine',
    fine,
    '    ',
  )
  chunks.push(`  @media (hover: hover) and (pointer: fine) {\n${fine.join('\n\n')}\n  }`)

  const coarse = []
  rule('[data-xh-action-control][data-xh-action-profile=\'text\']::after', [
    '      content: \'\';',
    '      position: absolute;',
    '      inset-block-start: 50%;',
    '      inset-inline-start: 50%;',
    `      min-block-size: ${source.coarsePointer.minimumTarget};`,
    '      inline-size: 100%;',
    '      block-size: 100%;',
    '      translate: -50% -50%;',
  ].join('\n'), 'coarse', coarse, '    ')
  rule('[data-xh-action-control]:is([data-xh-action-profile=\'icon\'], [data-xh-action-profile=\'field-inset\'], [data-xh-action-profile=\'floating\'])::after', [
    '      content: \'\';',
    '      position: absolute;',
    '      inset-block-start: 50%;',
    '      inset-inline-start: 50%;',
    `      min-inline-size: ${source.coarsePointer.minimumTarget};`,
    `      min-block-size: ${source.coarsePointer.minimumTarget};`,
    '      inline-size: 100%;',
    '      block-size: 100%;',
    '      translate: -50% -50%;',
  ].join('\n'), 'coarse', coarse, '    ')
  chunks.push(`  @media (pointer: coarse) {\n${coarse.join('\n')}\n  }`)

  const forced = []
  const forcedRule = (selector, state, extra = []) => rule(
    selector,
    forcedDeclarations(source, state, extra),
    'forced-colors',
    forced,
    '    ',
  )
  forcedRule('[data-xh-action-control]', 'rest')
  forcedRule('[data-xh-action-control]:focus-visible', 'focus-visible', [`      outline-color: ${source.forcedColors['focus-visible'].outlineColor};`])
  forcedRule('[data-xh-action-control]:not([data-disabled]):not([data-loading]):hover', 'hover')
  forcedRule('[data-xh-action-control]:not([data-disabled]):not([data-loading]):active', 'pressed')
  forcedRule('[data-xh-action-control][data-disabled]', 'disabled')
  forcedRule('[data-xh-action-control][data-loading][aria-disabled=\'true\']', 'loading', ['      border-style: dashed;'])
  chunks.push(`  @media (forced-colors: active) {\n${forced.join('\n\n')}\n  }`)

  return `/* AUTO-GENERATED by build/action-control-recipe.mjs — do not edit. */\n@layer xihan.components {\n${chunks.join('\n\n')}\n}\n`
}

export async function emitActionControlRecipe(options = {}) {
  const sourcePath = options.sourcePath ?? SOURCE
  const outputPath = options.outputPath ?? OUTPUT
  const source = JSON.parse(await readFile(sourcePath, 'utf8'))
  const css = compileActionControlRecipe(source)
  if (options.check) {
    const actual = await readFile(outputPath, 'utf8').catch(() => null)
    if (actual !== css)
      throw new Error(`[action-control-recipe] 生成物漂移：${outputPath}`)
  }
  else {
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, css, 'utf8')
  }
  return { bytes: Buffer.byteLength(css), profiles: PROFILES.length, states: STATES.length }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  emitActionControlRecipe()
    .then(result => console.log(`[action-control-recipe] ${result.profiles} profiles × ${result.states} states -> ${result.bytes} bytes`))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
