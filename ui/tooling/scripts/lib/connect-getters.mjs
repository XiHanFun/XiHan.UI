// Headless connect 的 getter 切片：门禁按「某部件的 getter 投影了哪些属性」判家族归属。
//
// 家族配方的入口是 connect 投影的标记（data-xh-action-control / data-xh-collection-item），
// 皮肤只消费。几条门禁都要回答同一个问题：这个组件的这个部件，getter 里写没写某个属性。
// 切法与 check-press-feedback 一致：从 `getXxxProps` 起、到下一个 `getYyyProps` 止。
import { readFile } from 'node:fs/promises'

export const HEADLESS_SRC = 'packages/engine/headless/src'

const cache = new Map()

/** 读某组件的 connect 源码；读不到返回空串。 */
export async function connectSource(comp, root = HEADLESS_SRC) {
  const path = `${root}/${comp}/${comp}.connect.ts`
  if (!cache.has(path))
    cache.set(path, await readFile(path, 'utf8').catch(() => ''))
  return cache.get(path)
}

/** 部件名对应的 getter 名：item-indicator → getItemIndicatorProps。 */
export function getterNameOf(part) {
  return `get${part.split('-').map(value => value[0].toUpperCase() + value.slice(1)).join('')}Props`
}

/** 某部件 getter 的源码切片；没有这个 getter 返回 null。 */
export async function getterBody(comp, part, root = HEADLESS_SRC) {
  const source = await connectSource(comp, root)
  const getter = getterNameOf(part)
  const start = source.search(new RegExp(`${getter}\\s*[:=]`))
  if (start < 0)
    return null
  const next = source.slice(start + getter.length).search(/\bget[A-Z][A-Za-z0-9]*Props\s*[:=]/)
  return source.slice(start, next < 0 ? source.length : start + getter.length + next)
}

/** 某部件的 getter 是否投影了这个属性（写成 `'attr':` 的字典键）。 */
export async function getterProjects(comp, part, attr, root = HEADLESS_SRC) {
  const body = await getterBody(comp, part, root)
  return body != null && body.includes(`'${attr}':`)
}

/**
 * 某部件的 getter 是否投影了这个属性：直接写成字典键，或经 `...helper(…)` 展开——helper 是同一份 connect 里
 * 定义的本地函数（`const press = (part) => ({ 'data-pressed': … })`，浮层多颗按钮按 part 键合成按压通道时
 * 就这样写），它返回的对象字面量里得写着这个键。展开的不是本地函数、或函数体里没有这个键，都不算投影。
 */
export async function getterProjectsOrSpreads(comp, part, attr, root = HEADLESS_SRC) {
  const body = await getterBody(comp, part, root)
  if (body == null)
    return false
  if (body.includes(`'${attr}':`))
    return true
  const source = await connectSource(comp, root)
  for (const m of body.matchAll(/\.\.\.([a-z_$][\w$]*)\(/gi)) {
    const helper = helperBody(source, m[1])
    if (helper != null && helper.includes(`'${attr}':`))
      return true
  }
  return false
}

/** connect 里本地函数 `const name = (…) => { … }` / `function name(…) { … }` 的函数体；没有返回 null。 */
export function helperBody(source, name) {
  const declared = source.search(new RegExp(`(?:const|let|function)\\s+${name}\\s*[=(]`))
  if (declared < 0)
    return null
  const arrow = source.indexOf('=>', declared)
  const open = source.indexOf('{', arrow < 0 ? declared : arrow)
  if (open < 0)
    return null
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{')
      depth++
    else if (source[i] === '}' && --depth === 0)
      return source.slice(open, i + 1)
  }
  return null
}

/** connect 里投影了某属性的全部 getter 名（按出现顺序去重）。 */
export async function gettersProjecting(comp, attr, root = HEADLESS_SRC) {
  const source = await connectSource(comp, root)
  const out = []
  for (const m of source.matchAll(/\b(get[A-Z][A-Za-z0-9]*Props)\s*[:=]/g)) {
    const getter = m[1]
    const next = source.slice(m.index + getter.length).search(/\bget[A-Z][A-Za-z0-9]*Props\s*[:=]/)
    const body = source.slice(m.index, next < 0 ? source.length : m.index + getter.length + next)
    if (body.includes(`'${attr}':`) && !out.includes(getter))
      out.push(getter)
  }
  return out
}

/** getter 名还原成部件名：getItemIndicatorProps → item-indicator。 */
export function partOfGetter(getter) {
  return getter.replace(/^get/, '').replace(/Props$/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}
