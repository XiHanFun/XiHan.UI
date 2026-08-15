#!/usr/bin/env node
// 门禁：每个组件都留着 <Comp>Translations 的位，且都在 XhTranslationOverrides 里挂了号。
//
// 位是刻意留的，哪怕组件眼下一句文案都没有。将来它要外露一句读屏文案时，只改自己那个空接口即可，
// 不必回头动这张表、两个适配器的全局配置、以及文档——那时候再补，漏一环就是「配了没生效」。
import { readdir, readFile, stat } from 'node:fs/promises'

const SRC = 'packages/engine/headless/src'
const MAP = `${SRC}/config/translations.ts`

const pascal = kebab => kebab.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('')

const entries = await readdir(SRC)
const comps = []
for (const name of entries) {
  if (name === 'config')
    continue
  if (!(await stat(`${SRC}/${name}`)).isDirectory())
    continue
  try {
    await stat(`${SRC}/${name}/${name}.types.ts`)
    comps.push(name)
  }
  catch {
    // 没有同名 types 文件的目录不是组件
  }
}
comps.sort()

const map = await readFile(MAP, 'utf8')
const listed = new Set([...map.matchAll(/^\s*'([\w-]+)'\?: Partial</gm)].map(hit => hit[1]))

const errors = []

for (const comp of comps) {
  const name = `${pascal(comp)}Translations`
  const types = await readFile(`${SRC}/${comp}/${comp}.types.ts`, 'utf8')
  if (!new RegExp(`\\b(?:interface|type) ${name}\\b`).test(types))
    errors.push(`${comp}：${comp}.types.ts 里没有 ${name}，空接口也要留着`)

  if (!listed.has(comp))
    errors.push(`${comp}：没挂进 XhTranslationOverrides，全局配置到不了它`)
}

for (const comp of listed) {
  if (!comps.includes(comp))
    errors.push(`XhTranslationOverrides 里的 '${comp}' 不是组件`)
}

if (errors.length > 0) {
  console.error('[check-translations-slots] ✗')
  for (const error of errors)
    console.error(`  ${error}`)
  process.exit(1)
}

console.log(`[check-translations-slots] 通过：${comps.length} 个组件都留了文案位、也都挂进了覆盖表`)
