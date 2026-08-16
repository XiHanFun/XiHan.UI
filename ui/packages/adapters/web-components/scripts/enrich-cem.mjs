#!/usr/bin/env node
// CEM 补全:cssProperties(皮肤覆盖槽)与 events type(事件 detail 类型)。
//
// analyzer 自己吐不出这两样:cssProperties 的事实源在 @xihan-ui/styles 的皮肤里,
// events 的 detail 类型在元素源码的 notify 函数签名上。这个脚本在 cem analyze 之后
// 就地补写,gate:cem 的 git diff 校验把它钉进流水线——改皮肤或改事件类型而不重跑,
// 门禁当场失败。
//
// 只加不删:拿掉这里不会改的字段只由 analyzer 负责,脚本补的两块之外一律原样保留。
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const CEM_PATH = 'custom-elements.json'
const STYLES_DIR = join('..', '..', 'design', 'styles', 'css')

const manifest = JSON.parse(await readFile(CEM_PATH, 'utf8'))

/**
 * 皮肤里的 --xh-<scope>-* 覆盖槽:它们只在 var(--xh-x-y, 默认值) 的引用位出现,
 * 皮肤自身只声明 --xh-<scope>-skin 在场标记与 --xh-_ 私有槽。所以从 var() 引用位提取,
 * 私有槽(名字里带 --xh-_)与在场标记(声明而不被引用)自然排除。
 */
async function cssPropertiesOf(scope) {
  const path = join(STYLES_DIR, `${scope}.css`)
  let css
  try {
    css = await readFile(path, 'utf8')
  }
  catch {
    return [] // 没有独立皮肤的元素(xh-background 之类)没有覆盖槽
  }
  const names = new Set()
  // 正则字面量里不能做模板插值,走构造器;scope 里的连字符(avatar-group)转义成字面量
  const slotRe = new RegExp(`var\\(--xh-${scope.replace(/-/g, '\\-')}-[\\w-]*`, 'g')
  for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(slotRe)) {
    const name = m[0].slice('var('.length)
    if (name.includes('--xh-_'))
      continue
    names.add(name)
  }
  return [...names].sort().map(name => ({ name }))
}

/** 元素源码里事件名与 detail 类型的配对:notify 函数签名 + CustomEvent 调用。 */
async function eventTypesOf(sourcePath) {
  const source = await readFile(sourcePath, 'utf8')
  const map = new Map()
  // 形态一:notify = (details: FooDetails) => ... new CustomEvent('foo-change', ...)
  for (const m of source.matchAll(/details:\s*(\w+Details)\b[\s\S]+?new CustomEvent\('([\w-]+)'/g))
    map.set(m[2], m[1])
  // 形态二:new CustomEvent<FooDetails>('foo-change', ...)
  for (const m of source.matchAll(/new CustomEvent<(\w+)>\('([\w-]+)'/g))
    map.set(m[2], m[1])
  // 形态三:emit 中转——notify = (details: FooDetails) => this.emit('foo-change', details)。
  // 窗口限 300 字符:notify 函数都是单行或两三行,再远就该是下一处声明了
  for (const m of source.matchAll(/details:\s*(\w+Details)\b[\s\S]{1,300}?\.emit\('([\w-]+)'/g))
    map.set(m[2], m[1])
  return map
}

let cssPropsCount = 0
let eventTypesCount = 0

for (const mod of manifest.modules ?? []) {
  if (!mod.path)
    continue
  for (const decl of mod.declarations ?? []) {
    if (decl.kind !== 'class' || !decl.tagName)
      continue
    const scope = decl.tagName.replace(/^xh-/, '')

    const cssProperties = await cssPropertiesOf(scope)
    if (cssProperties.length > 0) {
      decl.cssProperties = cssProperties
      cssPropsCount += cssProperties.length
    }

    const types = await eventTypesOf(mod.path)
    if (types.size === 0)
      continue
    for (const event of decl.events ?? []) {
      if (event.type || !types.has(event.name))
        continue
      event.type = { text: types.get(event.name) }
      eventTypesCount++
    }
  }
}

await writeFile(CEM_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
console.log(`[enrich-cem] cssProperties ${cssPropsCount} 条 · events type ${eventTypesCount} 条`)
