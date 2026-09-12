import { Buffer } from 'node:buffer'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SOURCE = join(ROOT, 'recipes', 'field-chrome.recipe.json')
const OUTPUT = join(ROOT, 'family', 'field-chrome.css')

const SIZES = ['sm', 'md', 'lg']
const LAYOUTS = ['single-line', 'textarea', 'multi-tag']
const STATES = ['rest', 'hover', 'focus', 'invalid', 'readOnly', 'disabled', 'loading']
const SIZE_FIELDS = ['controlHeight', 'paddingInline', 'gap', 'fontSize', 'glyphSize']
const LAYOUT_FIELDS = ['alignItems', 'blockSize', 'minBlockSize', 'paddingBlock', 'flexWrap']
const STATE_FIELDS = ['backgroundColor', 'color', 'borderColor', 'shadow', 'cursor']
const NATIVE_FIELDS = ['placeholderColor', 'autofillBackground', 'autofillForeground', 'textareaPaddingBlock', 'ime']
const FORCED_FIELDS = ['backgroundColor', 'color', 'borderColor', 'outlineColor']
const STATE_SLOT = {
  backgroundColor: 'bg',
  color: 'fg',
  borderColor: 'border',
  shadow: 'shadow',
  cursor: 'cursor',
}
const CSS_PROPERTY = {
  backgroundColor: 'background-color',
  color: 'color',
  borderColor: 'border-color',
  shadow: 'box-shadow',
  cursor: 'cursor',
}

const kebab = value => value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)

function assertRecord(value, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`[field-chrome-recipe] ${path} 必须是对象`)
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
    `[field-chrome-recipe] ${path} 键集合不完整`
    + `${unknown.length ? `；未知：${unknown.join(', ')}` : ''}`
    + `${missing.length ? `；缺少：${missing.join(', ')}` : ''}`,
  )
}

function assertString(value, path) {
  if (typeof value !== 'string' || value.trim().length === 0)
    throw new Error(`[field-chrome-recipe] ${path} 必须是非空字符串`)
}

function assertList(value, expected, path) {
  if (!Array.isArray(value))
    throw new Error(`[field-chrome-recipe] ${path} 必须是数组`)
  value.forEach((entry, index) => assertString(entry, `${path}[${index}]`))
  if (new Set(value).size !== value.length)
    throw new Error(`[field-chrome-recipe] ${path} 不能重复`)
  if (value.join(',') !== expected.join(','))
    throw new Error(`[field-chrome-recipe] ${path} 必须严格为 ${expected.join(', ')}`)
}

function assertFields(value, fields, path) {
  assertExactKeys(value, fields, path)
  fields.forEach(field => assertString(value[field], `${path}.${field}`))
}

export function assertFieldChromeRecipe(source) {
  assertExactKeys(source, [
    '$description',
    'version',
    'sizes',
    'layouts',
    'states',
    'sizeValues',
    'layoutValues',
    'stateValues',
    'nativeInput',
    'motion',
    'compact',
    'direction',
    'forcedColors',
  ], 'root')
  assertString(source.$description, 'root.$description')
  if (source.version !== 1)
    throw new Error('[field-chrome-recipe] root.version 必须为 1')
  assertList(source.sizes, SIZES, 'root.sizes')
  assertList(source.layouts, LAYOUTS, 'root.layouts')
  assertList(source.states, STATES, 'root.states')

  assertExactKeys(source.sizeValues, SIZES, 'root.sizeValues')
  for (const size of SIZES)
    assertFields(source.sizeValues[size], SIZE_FIELDS, `sizeValues.${size}`)

  assertExactKeys(source.layoutValues, LAYOUTS, 'root.layoutValues')
  for (const layout of LAYOUTS)
    assertFields(source.layoutValues[layout], LAYOUT_FIELDS, `layoutValues.${layout}`)

  assertExactKeys(source.stateValues, STATES, 'root.stateValues')
  for (const state of STATES) {
    const fields = state === 'focus' || state === 'invalid' ? [...STATE_FIELDS, 'ringColor'] : STATE_FIELDS
    assertFields(source.stateValues[state], fields, `stateValues.${state}`)
  }

  assertFields(source.nativeInput, NATIVE_FIELDS, 'root.nativeInput')
  if (source.nativeInput.ime !== 'preserve-native-composition')
    throw new Error('[field-chrome-recipe] nativeInput.ime 必须为 preserve-native-composition')
  assertFields(source.motion, ['duration', 'easing'], 'root.motion')
  assertExactKeys(source.compact, ['strategy', 'tokens'], 'root.compact')
  if (source.compact.strategy !== 'semantic-token-remap')
    throw new Error('[field-chrome-recipe] compact.strategy 必须为 semantic-token-remap')
  if (!Array.isArray(source.compact.tokens) || source.compact.tokens.length === 0 || new Set(source.compact.tokens).size !== source.compact.tokens.length)
    throw new Error('[field-chrome-recipe] compact.tokens 必须是非空、无重复的令牌列表')
  source.compact.tokens.forEach((token, index) => {
    if (typeof token !== 'string' || !/^--xh-[a-z0-9-]+$/.test(token))
      throw new Error(`[field-chrome-recipe] compact.tokens[${index}] 不是合法令牌名`)
  })
  assertFields(source.direction, ['axis', 'flow'], 'root.direction')
  if (source.direction.axis !== 'logical' || source.direction.flow !== 'row')
    throw new Error('[field-chrome-recipe] direction 只能声明 logical/row')

  assertExactKeys(source.forcedColors, STATES, 'root.forcedColors')
  for (const state of STATES)
    assertFields(source.forcedColors[state], FORCED_FIELDS, `forcedColors.${state}`)
}

function stateValue(source, state, field) {
  return `var(--xh-field-${STATE_SLOT[field]}-${kebab(state)}, ${source.stateValues[state][field]})`
}

function stateDeclarations(source, state) {
  const value = source.stateValues[state]
  const base = source.stateValues.rest
  const fields = state === 'rest' ? STATE_FIELDS : STATE_FIELDS.filter(field => value[field] !== base[field])
  return fields.map(field => `    ${CSS_PROPERTY[field]}: ${stateValue(source, state, field)};`).join('\n')
}

function forcedDeclarations(source, state, extra = []) {
  const value = source.forcedColors[state]
  const base = source.forcedColors.rest
  const fields = state === 'rest'
    ? ['backgroundColor', 'color', 'borderColor']
    : ['backgroundColor', 'color', 'borderColor'].filter(field => value[field] !== base[field])
  return [
    ...fields.map(field => `      ${CSS_PROPERTY[field]}: ${value[field]};`),
    ...(state === 'rest' ? ['      box-shadow: none;', '      opacity: 1;'] : []),
    ...extra,
  ].join('\n')
}

export function compileFieldChromeRecipe(source) {
  assertFieldChromeRecipe(source)
  const selectors = new Set()
  const chunks = []
  const rule = (selector, body, context = 'root', target = chunks, indent = '  ') => {
    for (const branch of selector.split(',').map(value => value.trim())) {
      const key = `${context}\n${branch}`
      if (selectors.has(key))
        throw new Error(`[field-chrome-recipe] 生成了重复选择器：${branch} (${context})`)
      selectors.add(key)
    }
    target.push(`${indent}${selector} {\n${body}\n${indent}}`)
  }

  rule('[data-xh-field-chrome]', [
    '    display: inline-flex;',
    '    box-sizing: border-box;',
    `    flex-direction: ${source.direction.flow};`,
    '    align-items: center;',
    '    flex-wrap: nowrap;',
    '    gap: var(--xh-field-control-gap, var(--xh-_field-size-gap));',
    '    min-inline-size: min(var(--xh-field-control-min-inline-size, var(--xh-control-min-w)), 100%);',
    '    block-size: var(--xh-field-control-height, var(--xh-_field-size-control-height));',
    '    min-block-size: var(--xh-field-control-height, var(--xh-_field-size-control-height));',
    '    padding-inline: var(--xh-field-control-padding-inline, var(--xh-_field-size-padding-inline));',
    '    padding-block: 0;',
    '    --xh-icon-size: var(--xh-field-glyph-size, var(--xh-_field-size-glyph-size));',
    `    border: var(--xh-stroke-thin) solid ${stateValue(source, 'rest', 'borderColor')};`,
    '    border-radius: var(--xh-field-control-radius, var(--xh-shape-control));',
    `    background-color: ${stateValue(source, 'rest', 'backgroundColor')};`,
    `    color: ${stateValue(source, 'rest', 'color')};`,
    `    box-shadow: ${stateValue(source, 'rest', 'shadow')};`,
    `    cursor: ${stateValue(source, 'rest', 'cursor')};`,
    '    transition:',
    `      background-color ${source.motion.duration} ${source.motion.easing},`,
    `      border-color ${source.motion.duration} ${source.motion.easing},`,
    `      box-shadow ${source.motion.duration} ${source.motion.easing};`,
  ].join('\n'))

  for (const size of SIZES) {
    const value = source.sizeValues[size]
    rule(`[data-xh-field-chrome][data-xh-field-size='${size}']`, SIZE_FIELDS.map(field =>
      `    --xh-_field-size-${kebab(field)}: ${value[field]};`,
    ).join('\n'))
  }

  for (const layout of LAYOUTS) {
    const value = source.layoutValues[layout]
    const selector = `[data-xh-field-chrome][data-xh-field-layout='${layout}'],\n  [data-xh-field-chrome]:has([data-xh-field-input][data-xh-field-layout='${layout}'])`
    rule(selector, [
      `    align-items: ${value.alignItems};`,
      `    flex-wrap: ${value.flexWrap};`,
      `    block-size: ${value.blockSize};`,
      `    min-block-size: ${value.minBlockSize};`,
      `    padding-block: ${value.paddingBlock};`,
    ].join('\n'))
  }

  rule('[data-xh-field-chrome]:not([data-disabled]):not([data-readonly]):not([data-invalid]):not([data-loading]):hover', stateDeclarations(source, 'hover'))
  rule('[data-xh-field-chrome]:focus-within:not([data-disabled])', [
    stateDeclarations(source, 'focus'),
    `    outline: var(--xh-ring-width) solid var(--xh-field-ring-focus, ${source.stateValues.focus.ringColor});`,
    '    outline-offset: var(--xh-ring-offset);',
  ].filter(Boolean).join('\n'))
  rule('[data-xh-field-chrome][data-readonly]', stateDeclarations(source, 'readOnly'))
  rule('[data-xh-field-chrome][data-loading]', stateDeclarations(source, 'loading'))
  rule('[data-xh-field-chrome][data-invalid]', stateDeclarations(source, 'invalid'))
  rule('[data-xh-field-chrome][data-invalid]:focus-within:not([data-disabled])', [
    `    outline-color: var(--xh-field-ring-invalid, ${source.stateValues.invalid.ringColor});`,
  ].join('\n'))
  rule('[data-xh-field-chrome][data-disabled]', stateDeclarations(source, 'disabled'))

  rule('[data-xh-field-affix]', [
    '    display: inline-flex;',
    '    flex: none;',
    '    align-items: center;',
    '    color: var(--xh-field-affix-fg, var(--xh-fg-muted));',
    '    font-size: var(--xh-field-affix-font-size, var(--xh-_field-size-font-size));',
    '    line-height: var(--xh-leading-none);',
    '    white-space: nowrap;',
  ].join('\n'))
  rule('[data-xh-field-affix][data-disabled]', '    color: var(--xh-field-affix-fg-disabled, var(--xh-fg-disabled));')

  rule('[data-xh-field-input]', [
    '    flex: 1 1 auto;',
    '    box-sizing: border-box;',
    '    min-inline-size: 0;',
    '    block-size: 100%;',
    '    padding: 0;',
    '    border: 0;',
    '    border-radius: 0;',
    '    appearance: none;',
    '    background: transparent;',
    '    box-shadow: none;',
    '    color: var(--xh-field-input-fg, var(--xh-fg-default));',
    '    font-family: inherit;',
    '    font-size: var(--xh-field-input-font-size, var(--xh-_field-size-font-size));',
    '    line-height: var(--xh-leading-normal);',
    '    text-align: start;',
  ].join('\n'))
  rule('[data-xh-field-input]:focus-visible', '    outline: none;')
  rule('[data-xh-field-input][data-disabled]', '    color: var(--xh-field-input-fg-disabled, var(--xh-fg-disabled));')
  rule('[data-xh-field-input]::placeholder', `    color: var(--xh-field-placeholder-fg, ${source.nativeInput.placeholderColor});`)
  rule('[data-xh-field-input][data-xh-field-layout=\'textarea\']', [
    '    block-size: auto;',
    '    max-inline-size: 100%;',
    `    padding-block: var(--xh-field-textarea-padding-block, ${source.nativeInput.textareaPaddingBlock});`,
    '    overflow: auto;',
    '    resize: vertical;',
  ].join('\n'))
  rule('[data-xh-field-input][data-xh-field-layout=\'textarea\'][data-xh-field-auto-size]', '    overflow: hidden;\n    resize: none;')
  rule('[data-xh-field-input]:autofill', [
    `    box-shadow: inset 0 0 0 100vmax var(--xh-field-autofill-bg, ${source.nativeInput.autofillBackground});`,
    `    -webkit-text-fill-color: var(--xh-field-autofill-fg, ${source.nativeInput.autofillForeground});`,
  ].join('\n'))
  rule('[data-xh-field-input]:-webkit-autofill', [
    `    box-shadow: inset 0 0 0 100vmax var(--xh-field-autofill-bg, ${source.nativeInput.autofillBackground});`,
    `    -webkit-text-fill-color: var(--xh-field-autofill-fg, ${source.nativeInput.autofillForeground});`,
  ].join('\n'))

  const reduced = []
  rule('[data-xh-field-chrome]', '      transition: none;', 'reduced-motion', reduced, '    ')
  chunks.push(`  @media (prefers-reduced-motion: reduce) {\n${reduced.join('\n')}\n  }`)
  rule(':where([data-motion=\'reduce\']) [data-xh-field-chrome]', '    transition: none;')

  const forced = []
  const forcedRule = (selector, state, extra = []) => rule(
    selector,
    forcedDeclarations(source, state, extra),
    'forced-colors',
    forced,
    '    ',
  )
  forcedRule('[data-xh-field-chrome]', 'rest')
  forcedRule('[data-xh-field-chrome]:not([data-disabled]):not([data-readonly]):not([data-invalid]):not([data-loading]):hover', 'hover')
  forcedRule('[data-xh-field-chrome]:focus-within:not([data-disabled])', 'focus', [`      outline-color: ${source.forcedColors.focus.outlineColor};`])
  forcedRule('[data-xh-field-chrome][data-readonly]', 'readOnly')
  forcedRule('[data-xh-field-chrome][data-loading]', 'loading', ['      border-style: dashed;'])
  forcedRule('[data-xh-field-chrome][data-invalid]', 'invalid')
  forcedRule('[data-xh-field-chrome][data-disabled]', 'disabled')
  rule('[data-xh-field-input]::placeholder', '      color: GrayText;', 'forced-colors', forced, '    ')
  rule('[data-xh-field-input]:autofill', '      box-shadow: inset 0 0 0 100vmax Canvas;\n      -webkit-text-fill-color: CanvasText;', 'forced-colors', forced, '    ')
  rule('[data-xh-field-input]:-webkit-autofill', '      box-shadow: inset 0 0 0 100vmax Canvas;\n      -webkit-text-fill-color: CanvasText;', 'forced-colors', forced, '    ')
  chunks.push(`  @media (forced-colors: active) {\n${forced.join('\n\n')}\n  }`)

  return `/* AUTO-GENERATED by build/field-chrome-recipe.mjs — do not edit. */\n@layer xihan.components {\n${chunks.join('\n\n')}\n}\n`
}

export async function emitFieldChromeRecipe(options = {}) {
  const sourcePath = options.sourcePath ?? SOURCE
  const outputPath = options.outputPath ?? OUTPUT
  const source = JSON.parse(await readFile(sourcePath, 'utf8'))
  const css = compileFieldChromeRecipe(source)
  if (options.check) {
    const actual = await readFile(outputPath, 'utf8').catch(() => null)
    if (actual !== css)
      throw new Error(`[field-chrome-recipe] 生成物漂移：${outputPath}`)
  }
  else {
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, css, 'utf8')
  }
  return { bytes: Buffer.byteLength(css), layouts: LAYOUTS.length, sizes: SIZES.length, states: STATES.length }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  emitFieldChromeRecipe()
    .then(result => console.log(`[field-chrome-recipe] ${result.layouts} layouts × ${result.sizes} sizes × ${result.states} states -> ${result.bytes} bytes`))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
