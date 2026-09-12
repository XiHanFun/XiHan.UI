#!/usr/bin/env node
// CEM 补全:cssProperties(皮肤覆盖槽)与 events type(事件 detail 类型)。
//
// analyzer 自己吐不出这两样：cssProperties 读取由 @xihan-ui/styles 的皮肤生成的组件令牌 manifest，
// events 的 detail 类型在元素源码的 notify 函数签名上。这个脚本在 cem analyze 之后
// 就地补写,gate:cem 的 git diff 校验把它钉进流水线——改皮肤或改事件类型而不重跑,
// 门禁当场失败。
//
// 只加不删:拿掉这里不会改的字段只由 analyzer 负责,脚本补的两块之外一律原样保留。
import { readFile, writeFile } from 'node:fs/promises'
import { componentTokensByComponent, readComponentTokenManifest } from '../../../../tooling/scripts/lib/component-token-manifest.mjs'

const CEM_PATH = 'custom-elements.json'

const manifest = JSON.parse(await readFile(CEM_PATH, 'utf8'))
const tokenEntries = componentTokensByComponent(await readComponentTokenManifest())

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

    const cssProperties = (tokenEntries.get(scope) ?? []).map(token => ({ name: token.name }))
    if (cssProperties.length > 0) {
      decl.cssProperties = cssProperties
      cssPropsCount += cssProperties.length
    }
    else {
      delete decl.cssProperties
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
