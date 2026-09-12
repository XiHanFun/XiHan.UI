import { Buffer } from 'node:buffer'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SOURCE = join(ROOT, 'recipes', 'collection-item.recipe.json')
const OUTPUT = join(ROOT, 'family', 'collection-item.css')

const SIZES = ['sm', 'md', 'lg']
const COLUMNS = ['prefix', 'text', 'description', 'shortcut', 'suffix', 'indicator']
const STATES = ['rest', 'hover', 'keyboard-highlight', 'selected', 'selected+highlight', 'open-path', 'checked', 'disabled', 'loading', 'error']
const SIZE_FIELDS = ['blockPadding', 'inlinePadding', 'gap', 'fontSize', 'glyphSize']
const STATE_FIELDS = ['backgroundColor', 'color', 'descriptionColor', 'indicatorColor', 'outlineColor', 'fontWeight', 'cursor', 'opacity']
const FORCED_FIELDS = ['backgroundColor', 'color', 'outlineColor']
const STATE_SLOT = {
  backgroundColor: 'bg',
  color: 'fg',
  descriptionColor: 'description-fg',
  indicatorColor: 'indicator-fg',
  outlineColor: 'outline',
  fontWeight: 'font-weight',
  cursor: 'cursor',
  opacity: 'opacity',
}

const stateName = state => state.replace('+', '-')

function fail(message) {
  throw new Error(`[collection-item-recipe] ${message}`)
}

function assertRecord(value, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    fail(`${path} 必须是对象`)
}

function assertExactKeys(value, expected, path) {
  assertRecord(value, path)
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (actual.join(',') === wanted.join(','))
    return
  const unknown = actual.filter(name => !wanted.includes(name))
  const missing = wanted.filter(name => !actual.includes(name))
  fail(
    `${path} 键集合不完整`
    + `${unknown.length ? `；未知：${unknown.join(', ')}` : ''}`
    + `${missing.length ? `；缺少：${missing.join(', ')}` : ''}`,
  )
}

function assertString(value, path) {
  if (typeof value !== 'string' || value.trim().length === 0)
    fail(`${path} 必须是非空字符串`)
}

function assertList(value, expected, path) {
  if (!Array.isArray(value))
    fail(`${path} 必须是数组`)
  value.forEach((entry, index) => assertString(entry, `${path}[${index}]`))
  if (new Set(value).size !== value.length)
    fail(`${path} 不能重复`)
  if (value.join(',') !== expected.join(','))
    fail(`${path} 必须严格为 ${expected.join(', ')}`)
}

function assertFields(value, fields, path) {
  assertExactKeys(value, fields, path)
  for (const field of fields)
    assertString(value[field], `${path}.${field}`)
}

export function assertCollectionItemRecipe(source) {
  assertExactKeys(source, [
    '$description',
    'version',
    'sizes',
    'columns',
    'states',
    'sizeValues',
    'stateValues',
    'separator',
    'motion',
    'direction',
    'forcedColors',
  ], 'root')
  assertString(source.$description, 'root.$description')
  if (source.version !== 1)
    fail('root.version 必须为 1')
  assertList(source.sizes, SIZES, 'root.sizes')
  assertList(source.columns, COLUMNS, 'root.columns')
  assertList(source.states, STATES, 'root.states')

  assertExactKeys(source.sizeValues, SIZES, 'root.sizeValues')
  for (const size of SIZES)
    assertFields(source.sizeValues[size], SIZE_FIELDS, `sizeValues.${size}`)

  assertExactKeys(source.stateValues, STATES, 'root.stateValues')
  for (const state of STATES)
    assertFields(source.stateValues[state], STATE_FIELDS, `stateValues.${state}`)

  assertFields(source.separator, ['blockMargin', 'inlineMargin', 'color'], 'root.separator')
  if (/^-/.test(source.separator.blockMargin) || /^-/.test(source.separator.inlineMargin))
    fail('separator margin 不允许使用负值')
  assertFields(source.motion, ['duration', 'easing'], 'root.motion')
  assertExactKeys(source.direction, ['axis', 'flow'], 'root.direction')
  if (source.direction.axis !== 'logical' || source.direction.flow !== 'row')
    fail('root.direction 必须使用 logical row')

  assertExactKeys(source.forcedColors, STATES, 'root.forcedColors')
  for (const state of STATES)
    assertFields(source.forcedColors[state], FORCED_FIELDS, `forcedColors.${state}`)
}

function stateVars(source, state, indent = '    ') {
  return STATE_FIELDS
    .map(field => `${indent}--xh-_collection-${STATE_SLOT[field]}: var(--xh-collection-${STATE_SLOT[field]}-${stateName(state)}, ${source.stateValues[state][field]});`)
    .join('\n')
}

function forcedStateVars(source, state, indent = '      ') {
  return FORCED_FIELDS
    .map(field => `${indent}--xh-_collection-${STATE_SLOT[field]}: ${source.forcedColors[state][field]};`)
    .join('\n')
}

function sizeVars(source, size) {
  const value = source.sizeValues[size]
  return [
    `    --xh-_collection-block-padding: ${value.blockPadding};`,
    `    --xh-_collection-inline-padding: ${value.inlinePadding};`,
    `    --xh-_collection-gap: ${value.gap};`,
    `    --xh-_collection-font-size: ${value.fontSize};`,
    `    --xh-_collection-glyph-size: ${value.glyphSize};`,
  ].join('\n')
}

export function compileCollectionItemRecipe(source) {
  assertCollectionItemRecipe(source)
  const rest = stateVars(source, 'rest')
  const output = `/* AUTO-GENERATED by build/collection-item-recipe.mjs — do not edit. */
@layer xihan.components {
  [data-xh-collection-item] {
${sizeVars(source, 'md')}
${rest}

    --xh-icon-size: var(--xh-collection-glyph-size, var(--xh-_collection-glyph-size));

    display: grid;
    grid-template-columns:
      [prefix] max-content
      [text] minmax(0, 1fr)
      [shortcut] max-content
      [suffix] max-content
      [indicator] max-content;
    grid-template-rows: auto auto;
    align-items: center;
    min-inline-size: 0;
    padding-block: var(--xh-collection-block-padding, var(--xh-_collection-block-padding));
    padding-inline: var(--xh-collection-inline-padding, var(--xh-_collection-inline-padding));
    border-radius: var(--xh-collection-radius, var(--xh-shape-control));
    outline: var(--xh-ring-width) solid var(--xh-_collection-outline);
    outline-offset: calc(-1 * var(--xh-ring-width));
    background-color: var(--xh-_collection-bg);
    color: var(--xh-_collection-fg);
    font-size: var(--xh-collection-font-size, var(--xh-_collection-font-size));
    font-weight: var(--xh-_collection-font-weight);
    line-height: var(--xh-leading-normal);
    cursor: var(--xh-_collection-cursor);
    opacity: var(--xh-_collection-opacity);
    transition:
      background-color ${source.motion.duration} ${source.motion.easing},
      color ${source.motion.duration} ${source.motion.easing},
      outline-color ${source.motion.duration} ${source.motion.easing};
  }

${SIZES.map(size => `  [data-xh-collection-item][data-xh-collection-size='${size}'] {
${sizeVars(source, size)}
  }`).join('\n\n')}

  [data-xh-collection-slot='prefix'] {
    grid-column: prefix;
    grid-row: 1 / span 2;
    margin-inline-end: var(--xh-collection-gap, var(--xh-_collection-gap));
  }

  [data-xh-collection-slot='text'] {
    grid-column: text;
    grid-row: 1;
    min-inline-size: 0;
  }

  [data-xh-collection-slot='description'] {
    grid-column: text;
    grid-row: 2;
    min-inline-size: 0;
    color: var(--xh-_collection-description-fg);
    font-size: var(--xh-collection-description-font-size, var(--xh-control-caption-md));
  }

  [data-xh-collection-slot='shortcut'] {
    grid-column: shortcut;
  }

  [data-xh-collection-slot='suffix'] {
    grid-column: suffix;
  }

  [data-xh-collection-slot='indicator'] {
    grid-column: indicator;
    color: var(--xh-_collection-indicator-fg);
    visibility: hidden;
  }

  [data-xh-collection-slot='shortcut'],
  [data-xh-collection-slot='suffix'],
  [data-xh-collection-slot='indicator'] {
    grid-row: 1 / span 2;
    margin-inline-start: var(--xh-collection-gap, var(--xh-_collection-gap));
  }

  [data-xh-collection-item][aria-selected='true'] {
${stateVars(source, 'selected')}
  }

  [data-xh-collection-item][data-in-path] {
${stateVars(source, 'open-path')}
  }

  [data-xh-collection-item]:not([aria-disabled='true'], [aria-busy='true'], [data-error]):hover {
${stateVars(source, 'hover')}
  }

  [data-xh-collection-item]:not([aria-disabled='true'], [aria-busy='true'], [data-error]):is(:focus-visible, [data-highlighted]) {
${stateVars(source, 'keyboard-highlight')}
  }

  [data-xh-collection-item][aria-selected='true']:is(:focus-visible, [data-highlighted]) {
${stateVars(source, 'selected+highlight')}
  }

  [data-xh-collection-item][data-state='checked'] {
    --xh-_collection-indicator-fg: var(--xh-collection-indicator-fg-checked, ${source.stateValues.checked.indicatorColor});
  }

  [data-xh-collection-item][data-state='checked'] [data-xh-collection-slot='indicator'] {
    visibility: visible;
  }

  [data-xh-collection-item][aria-disabled='true'] {
${stateVars(source, 'disabled')}
  }

  [data-xh-collection-item][aria-busy='true'] {
${stateVars(source, 'loading')}
  }

  [data-xh-collection-item][data-error] {
${stateVars(source, 'error')}
  }

  [data-xh-collection-separator] {
    block-size: var(--xh-stroke-thin);
    margin-block: var(--xh-collection-separator-block-margin, ${source.separator.blockMargin});
    margin-inline: var(--xh-collection-separator-inline-margin, ${source.separator.inlineMargin});
    border: 0;
    background-color: var(--xh-collection-separator-color, ${source.separator.color});
  }

  [data-xh-collection-item][hidden],
  [data-xh-collection-separator][hidden] {
    display: none;
  }

  :where([data-motion='reduce']) [data-xh-collection-item] {
    transition: none;
  }

  @media (prefers-reduced-motion: reduce) {
    [data-xh-collection-item] {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    [data-xh-collection-item] {
${forcedStateVars(source, 'rest')}
    }

    [data-xh-collection-item][aria-selected='true'] {
${forcedStateVars(source, 'selected')}
    }

    [data-xh-collection-item][data-in-path] {
${forcedStateVars(source, 'open-path')}
    }

    [data-xh-collection-item]:not([aria-disabled='true'], [aria-busy='true'], [data-error]):hover {
${forcedStateVars(source, 'hover')}
    }

    [data-xh-collection-item]:not([aria-disabled='true'], [aria-busy='true'], [data-error]):is(:focus-visible, [data-highlighted]) {
${forcedStateVars(source, 'keyboard-highlight')}
    }

    [data-xh-collection-item][aria-selected='true']:is(:focus-visible, [data-highlighted]) {
${forcedStateVars(source, 'selected+highlight')}
    }

    [data-xh-collection-item][data-state='checked'] {
      --xh-_collection-indicator-fg: ${source.forcedColors.checked.color};
    }

    [data-xh-collection-item][aria-disabled='true'] {
${forcedStateVars(source, 'disabled')}
    }

    [data-xh-collection-item][aria-busy='true'] {
${forcedStateVars(source, 'loading')}
    }

    [data-xh-collection-item][data-error] {
${forcedStateVars(source, 'error')}
    }

    [data-xh-collection-separator] {
      background-color: CanvasText;
    }
  }
}
`
  if (/font-weight:\s*(?:bold|[5-9]00)/.test(output))
    fail('open-path / selected 不能通过加粗表达')
  if (/margin-(?:block|inline)(?:-start|-end)?:\s*-/.test(output))
    fail('separator 与列节奏不允许负 margin')
  return output
}

export async function emitCollectionItemRecipe(options = {}) {
  const sourcePath = options.sourcePath ?? SOURCE
  const outputPath = options.outputPath ?? OUTPUT
  const source = JSON.parse(await readFile(sourcePath, 'utf8'))
  const css = compileCollectionItemRecipe(source)
  if (options.check) {
    const current = await readFile(outputPath, 'utf8').catch(() => '')
    if (current !== css)
      fail(`${outputPath} 不是由 ${sourcePath} 生成的最新产物`)
  }
  else {
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, css)
  }
  return {
    bytes: Buffer.byteLength(css),
    columns: source.columns.length,
    sizes: source.sizes.length,
    states: source.states.length,
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = await emitCollectionItemRecipe()
  console.log(`[collection-item-recipe] 已生成 ${result.sizes} sizes × ${result.states} states × ${result.columns} columns，${result.bytes} bytes`)
}
