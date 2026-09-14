import { Buffer } from 'node:buffer'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyFileHeader } from '../../../../tooling/file-header.mjs'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SOURCE = join(ROOT, 'recipes', 'swatch.recipe.json')
const OUTPUT = join(ROOT, 'family', 'swatch.css')

const SIZES = ['sm', 'md', 'lg']
const SIZE_FIELDS = ['boxSize', 'checkerTile']
const SURFACE_FIELDS = ['radius', 'borderColor', 'checkerBase', 'checkerColor']

function fail(message) {
  throw new Error(`[swatch-recipe] ${message}`)
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

function assertFields(value, fields, path) {
  assertExactKeys(value, fields, path)
  for (const field of fields)
    assertString(value[field], `${path}.${field}`)
}

export function assertSwatchRecipe(source) {
  assertExactKeys(source, ['$description', 'version', 'sizes', 'sizeValues', 'surface', 'print', 'forcedColors'], 'root')
  assertString(source.$description, 'root.$description')
  if (source.version !== 1)
    fail('version 只支持 1')
  if (!Array.isArray(source.sizes) || source.sizes.join(',') !== SIZES.join(','))
    fail(`sizes 必须严格为 ${SIZES.join(', ')}`)
  assertExactKeys(source.sizeValues, SIZES, 'root.sizeValues')
  for (const size of SIZES)
    assertFields(source.sizeValues[size], SIZE_FIELDS, `sizeValues.${size}`)
  assertFields(source.surface, SURFACE_FIELDS, 'root.surface')
  assertFields(source.print, ['strategy'], 'root.print')
  if (source.print.strategy !== 'exact-color')
    fail('print.strategy 必须为 exact-color：色块画的就是颜色本身，打印时不能被抽掉底色')
  assertFields(source.forcedColors, ['borderColor'], 'root.forcedColors')
}

export function compileSwatchRecipe(source) {
  assertSwatchRecipe(source)
  const selectors = new Set()
  const chunks = []
  const rule = (selector, body, context = 'root', target = chunks, indent = '  ') => {
    for (const branch of selector.split(',').map(value => value.trim())) {
      const key = `${context}\n${branch}`
      if (selectors.has(key))
        fail(`生成了重复选择器：${branch} (${context})`)
      selectors.add(key)
    }
    target.push(`${indent}${selector} {\n${body}\n${indent}}`)
  }

  const md = source.sizeValues.md
  const checker = `var(--xh-swatch-checker, ${source.surface.checkerColor})`
  rule('[data-xh-swatch]', [
    `    --xh-_swatch-size: ${md.boxSize};`,
    `    --xh-_swatch-checker-tile: ${md.checkerTile};`,
    // 颜色由连接层经内联自定义属性写进来（含透明度）；没写时整块只剩棋盘格
    '    --xh-_swatch-color: transparent;',
    '',
    '    display: inline-block;',
    '    flex: none;',
    '    box-sizing: border-box;',
    '    inline-size: var(--xh-swatch-size, var(--xh-_swatch-size));',
    '    block-size: var(--xh-swatch-size, var(--xh-_swatch-size));',
    `    border: var(--xh-stroke-thin) solid var(--xh-swatch-border, ${source.surface.borderColor});`,
    `    border-radius: var(--xh-swatch-radius, ${source.surface.radius});`,
    // 颜色层铺在棋盘格上面：半透明色透出格子，读得出「这是带透明度的颜色」而不是与页面底色混成另一种颜色
    `    background-color: var(--xh-swatch-checker-base, ${source.surface.checkerBase});`,
    '    background-image:',
    '      linear-gradient(var(--xh-_swatch-color), var(--xh-_swatch-color)),',
    `      linear-gradient(45deg, ${checker} 25%, transparent 25%),`,
    `      linear-gradient(-45deg, ${checker} 25%, transparent 25%),`,
    `      linear-gradient(45deg, transparent 75%, ${checker} 75%),`,
    `      linear-gradient(-45deg, transparent 75%, ${checker} 75%);`,
    '    background-position:',
    '      0 0,',
    '      0 0,',
    '      0 var(--xh-_swatch-checker-tile),',
    '      var(--xh-_swatch-checker-tile) calc(-1 * var(--xh-_swatch-checker-tile)),',
    '      calc(-1 * var(--xh-_swatch-checker-tile)) 0;',
    '    background-size:',
    '      100% 100%,',
    '      calc(var(--xh-_swatch-checker-tile) * 2) calc(var(--xh-_swatch-checker-tile) * 2),',
    '      calc(var(--xh-_swatch-checker-tile) * 2) calc(var(--xh-_swatch-checker-tile) * 2),',
    '      calc(var(--xh-_swatch-checker-tile) * 2) calc(var(--xh-_swatch-checker-tile) * 2),',
    '      calc(var(--xh-_swatch-checker-tile) * 2) calc(var(--xh-_swatch-checker-tile) * 2);',
    '    background-clip: padding-box;',
    // 色块画的就是颜色本身：打印与省墨模式都不能把它抽成白块
    '    print-color-adjust: exact;',
  ].join('\n'))

  for (const size of SIZES) {
    if (size === 'md')
      continue
    const value = source.sizeValues[size]
    rule(`[data-xh-swatch][data-xh-swatch-size='${size}']`, [
      `    --xh-_swatch-size: ${value.boxSize};`,
      `    --xh-_swatch-checker-tile: ${value.checkerTile};`,
    ].join('\n'))
  }

  // 高对比档：色块画的就是颜色，被系统换掉之后就不再是那个颜色。退出强制着色保住原色，
  // 描边换成系统前景色把它从背景里框出来
  const forced = []
  rule('[data-xh-swatch]', [
    '      forced-color-adjust: none;',
    `      border-color: ${source.forcedColors.borderColor};`,
  ].join('\n'), 'forced-colors', forced, '    ')
  chunks.push(`  @media (forced-colors: active) {\n${forced.join('\n\n')}\n  }`)

  return applyFileHeader(OUTPUT, `/* AUTO-GENERATED by build/swatch-recipe.mjs — do not edit. */\n@layer xihan.components {\n${chunks.join('\n\n')}\n}\n`)
}

export async function emitSwatchRecipe(options = {}) {
  const sourcePath = options.sourcePath ?? SOURCE
  const outputPath = options.outputPath ?? OUTPUT
  const source = JSON.parse(await readFile(sourcePath, 'utf8'))
  const css = compileSwatchRecipe(source)
  if (options.check) {
    const actual = await readFile(outputPath, 'utf8').catch(() => null)
    if (actual !== css)
      throw new Error(`[swatch-recipe] 生成物漂移：${outputPath}`)
  }
  else {
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, css, 'utf8')
  }
  return { bytes: Buffer.byteLength(css), sizes: SIZES.length }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  emitSwatchRecipe()
    .then(result => console.log(`[swatch-recipe] ${result.sizes} sizes -> ${result.bytes} bytes`))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
