import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const TOKENS_DIR = join(ROOT, 'tokens')
const TARGETS = {
  'semantic.base.json': { base: true },
  'semantic.light.json': { theme: 'light' },
  'semantic.dark.json': { theme: 'dark' },
  'semantic.light.more.json': { auxiliary: 'contrast-more' },
  'semantic.dark.more.json': { auxiliary: 'contrast-more' },
  'semantic.transparency.reduce.json': { auxiliary: 'transparency-reduce' },
  'semantic.forced-colors.json': { auxiliary: 'forced-colors' },
  'semantic.print.json': { auxiliary: 'print' },
}

function token(type, value, description) {
  return {
    ...(description ? { $description: description } : {}),
    $type: type,
    $value: value,
  }
}

function background(recipe) {
  if (recipe.background)
    return recipe.background
  if (recipe.alpha === '{alpha.opaque}')
    return recipe.tint
  const match = /^oklch\((.+)\)$/.exec(recipe.tint ?? '')
  if (!match)
    throw new Error(`[material-recipes] 非实体背景必须提供无 alpha 的 oklch tint：${recipe.tint}`)
  return `oklch(${match[1]} / ${recipe.alpha})`
}

function backdrop(value) {
  if (!value)
    return undefined
  const filters = []
  if (value.blur !== '{blur.none}' && value.blur !== '0px')
    filters.push(`blur(${value.blur})`)
  if (value.saturation !== '100%')
    filters.push(`saturate(${value.saturation})`)
  if (value.contrast !== '100%')
    filters.push(`contrast(${value.contrast})`)
  return filters.join(' ') || 'none'
}

function shadow(value) {
  if (!value)
    return undefined
  const layers = ['contact', 'ambient', 'sheet']
    .map(name => value[name])
    .filter(layer => layer && layer !== 'none')
  return layers.join(', ') || 'none'
}

function compact(value) {
  if (!value)
    return undefined
  return {
    ...(value.alpha !== undefined ? { alpha: token('number', value.alpha) } : {}),
    ...(value.backdrop ? { backdrop: token('string', backdrop(value.backdrop)) } : {}),
    ...(value.shadows ? { shadow: token('shadow', shadow(value.shadows)) } : {}),
  }
}

function compileRecipe(value, description, complete) {
  if (complete) {
    return {
      '$description': description,
      ...(value.compact ? { compact: compact(value.compact) } : {}),
      'bg': token('color', background(value)),
      'backdrop': token('string', backdrop(value.backdrop)),
      'border': token('color', value.edge),
      'highlight': token('color', value.highlight),
      'shadow': token('shadow', shadow(value.shadows)),
      'separator': token('color', value.separator),
      'fg': token('color', value.foreground),
      'fg-muted': token('color', value.mutedForeground),
      'focus-surface': token('color', value.focusSurface),
    }
  }

  return {
    ...(value.$description ? { $description: value.$description } : {}),
    ...(value.compact ? { compact: compact(value.compact) } : {}),
    ...((value.background !== undefined || value.tint !== undefined || value.alpha !== undefined)
      ? { bg: token('color', background(value)) }
      : {}),
    ...(value.backdrop ? { backdrop: token('string', backdrop(value.backdrop)) } : {}),
    ...(value.edge !== undefined ? { border: token('color', value.edge) } : {}),
    ...(value.highlight !== undefined ? { highlight: token('color', value.highlight) } : {}),
    ...(value.shadows ? { shadow: token('shadow', shadow(value.shadows)) } : {}),
    ...(value.separator !== undefined ? { separator: token('color', value.separator) } : {}),
    ...(value.foreground !== undefined ? { fg: token('color', value.foreground) } : {}),
    ...(value.mutedForeground !== undefined ? { 'fg-muted': token('color', value.mutedForeground) } : {}),
    ...(value.focusSurface !== undefined ? { 'focus-surface': token('color', value.focusSurface) } : {}),
  }
}

function compileTheme(source, theme) {
  const material = { $description: source.$description }
  for (const name of source.order) {
    if (name === 'solid')
      continue
    const profile = source.profiles[name]
    material[name] = compileRecipe(profile[theme], `${profile.id} · ${profile.description}`, true)
  }
  return material
}

function compileBase(source) {
  const profile = source.profiles.solid
  return {
    $description: `${profile.id} 是主题无关的语义别名；引用在最终消费作用域解析。`,
    solid: compileRecipe(profile.light, `${profile.id} · ${profile.description}`, true),
  }
}

function compileAuxiliary(source, name) {
  const material = {}
  const values = source.auxiliary[name]
  for (const profileName of source.order) {
    const value = values[profileName]
    const recipe = compileRecipe(value, undefined, false)
    if (Object.keys(recipe).length > 0)
      material[profileName] = recipe
  }
  return material
}

function assertRecord(value, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`[material-recipes] ${path} 必须是对象`)
}

function rejectUnknown(value, allowed, path) {
  assertRecord(value, path)
  const unknown = Object.keys(value).filter(name => !allowed.includes(name))
  if (unknown.length > 0)
    throw new Error(`[material-recipes] ${path} 含未知键：${unknown.join(', ')}`)
}

function assertBackdrop(value, path) {
  rejectUnknown(value, ['blur', 'saturation', 'contrast'], path)
  for (const field of ['blur', 'saturation', 'contrast']) {
    if (typeof value[field] !== 'string' || value[field].length === 0)
      throw new Error(`[material-recipes] ${path} 缺少字符串 ${field}`)
  }
}

function assertShadows(value, path) {
  rejectUnknown(value, ['contact', 'ambient', 'sheet'], path)
  for (const field of ['contact', 'ambient', 'sheet']) {
    if (typeof value[field] !== 'string' || value[field].length === 0)
      throw new Error(`[material-recipes] ${path} 缺少字符串 ${field}`)
  }
}

function assertCompact(value, path, complete) {
  rejectUnknown(value, ['alpha', 'backdrop', 'shadows'], path)
  if (complete && !('alpha' in value && 'backdrop' in value && 'shadows' in value))
    throw new Error(`[material-recipes] ${path} 必须完整声明 alpha/backdrop/shadows`)
  if ('alpha' in value && (typeof value.alpha !== 'string' || value.alpha.length === 0))
    throw new Error(`[material-recipes] ${path}.alpha 必须是非空字符串`)
  if ('backdrop' in value)
    assertBackdrop(value.backdrop, `${path}.backdrop`)
  if ('shadows' in value)
    assertShadows(value.shadows, `${path}.shadows`)
}

function assertRecipe(value, path, complete) {
  const fields = ['background', 'tint', 'alpha', 'backdrop', 'edge', 'highlight', 'shadows', 'separator', 'foreground', 'mutedForeground', 'focusSurface', 'compact', '$description']
  rejectUnknown(value, fields, path)
  if ('background' in value && ('tint' in value || 'alpha' in value))
    throw new Error(`[material-recipes] ${path} 不能同时声明 background 与 tint/alpha`)
  if (complete) {
    const required = ['tint', 'alpha', 'backdrop', 'edge', 'highlight', 'shadows', 'separator', 'foreground', 'mutedForeground', 'focusSurface']
    for (const field of required) {
      if (value[field] === undefined)
        throw new Error(`[material-recipes] ${path} 缺少原子通道 ${field}`)
    }
  }
  if (('tint' in value) !== ('alpha' in value))
    throw new Error(`[material-recipes] ${path} 的 tint 与 alpha 必须成对声明`)
  for (const field of ['background', 'tint', 'alpha', 'edge', 'highlight', 'separator', 'foreground', 'mutedForeground', 'focusSurface', '$description']) {
    if (field in value && (typeof value[field] !== 'string' || value[field].length === 0))
      throw new Error(`[material-recipes] ${path}.${field} 必须是非空字符串`)
  }
  if ('backdrop' in value)
    assertBackdrop(value.backdrop, `${path}.backdrop`)
  if ('shadows' in value)
    assertShadows(value.shadows, `${path}.shadows`)
  if ('compact' in value)
    assertCompact(value.compact, `${path}.compact`, complete)
}

function assertSource(source) {
  rejectUnknown(source, ['$description', 'order', 'profiles', 'auxiliary'], 'root')
  if (typeof source.$description !== 'string' || !Array.isArray(source.order))
    throw new Error('[material-recipes] root 必须声明 $description 与 order')
  assertRecord(source.profiles, 'profiles')
  assertRecord(source.auxiliary, 'auxiliary')
  const profileNames = Object.keys(source.profiles).sort()
  const orderedNames = [...source.order].sort()
  if (new Set(source.order).size !== source.order.length || profileNames.join(',') !== orderedNames.join(','))
    throw new Error('[material-recipes] order 必须且只能各列出 profiles 一次')
  const ids = []
  for (const name of source.order) {
    const profile = source.profiles[name]
    rejectUnknown(profile, ['id', 'description', 'light', 'dark'], `profiles.${name}`)
    if (typeof profile.id !== 'string' || typeof profile.description !== 'string')
      throw new Error(`[material-recipes] profiles.${name} 必须声明 id 与 description`)
    ids.push(profile.id)
    for (const theme of ['light', 'dark']) {
      assertRecipe(profile[theme], `profiles.${name}.${theme}`, true)
    }
  }
  if (JSON.stringify(source.profiles.solid.light) !== JSON.stringify(source.profiles.solid.dark))
    throw new Error('[material-recipes] M0 必须保持主题无关，不能在 mode 边界复制实体配方')
  // order 只决定生成 JSON 与 CSS 的稳定序列，不能被解释成 M0→M4 的等级顺序。
  if (ids.join(',') !== 'M4,M3,M0,M1,M2')
    throw new Error(`[material-recipes] 输出兼容序必须是 M4,M3,M0,M1,M2，当前为 ${ids.join(',')}`)
  const modes = ['contrast-more', 'transparency-reduce', 'forced-colors', 'print']
  if (Object.keys(source.auxiliary).sort().join(',') !== [...modes].sort().join(','))
    throw new Error(`[material-recipes] auxiliary 必须且只能声明：${modes.join(', ')}`)
  for (const mode of modes) {
    const values = source.auxiliary[mode]
    rejectUnknown(values, source.order, `auxiliary.${mode}`)
    if (Object.keys(values).sort().join(',') !== [...source.order].sort().join(','))
      throw new Error(`[material-recipes] auxiliary.${mode} 必须显式列出全部 profile；空对象表示继承基础配方`)
    for (const [name, value] of Object.entries(values))
      assertRecipe(value, `auxiliary.${mode}.${name}`, false)
  }
}

export function compileMaterialRecipes(source) {
  assertSource(source)
  return Object.fromEntries(Object.entries(TARGETS).map(([file, target]) => [
    file,
    target.base ? compileBase(source) : target.theme ? compileTheme(source, target.theme) : compileAuxiliary(source, target.auxiliary),
  ]))
}

export function attachMaterialRecipes(document, material, file) {
  if ('material' in document)
    throw new Error(`[material-recipes] ${file} 仍含 material 副本；材质只能来自 material.recipes.json`)
  return { ...document, material }
}

export async function emitMaterialRecipes(tokensDir = TOKENS_DIR) {
  const source = JSON.parse(await readFile(join(tokensDir, 'material.recipes.json'), 'utf8'))
  return {
    fragments: compileMaterialRecipes(source),
    recipes: source.order.length,
    targets: Object.keys(TARGETS).length,
  }
}
