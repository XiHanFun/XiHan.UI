#!/usr/bin/env node
// 门禁：Vue 组件凡是给插槽传了载荷，就必须声明 SlotsType，且键可选、值写成函数类型。
//
// 三条判据分别对应一种会静默出错的写法：
//   缺声明   → 消费方拿到 any，插槽名与载荷键名拼错都不报
//   键非可选 → slots.x ? A : B 这类守卫在类型上恒为真，而它承载着 collection 的默认铺开行为
//   值非函数 → 走 Slot<T> 包装，零参调用变非法
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = 'packages/adapters/vue/src/components'

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      out.push(...await walk(path))
    else if (entry.name.endsWith('.ts'))
      out.push(path)
  }
  return out
}

/** 从 `slots: Object as SlotsType<{ ... }>` 里取出声明块。 */
function declarationOf(source, from) {
  const marker = source.indexOf('slots: Object as SlotsType<', from)
  if (marker === -1)
    return null
  const open = source.indexOf('{', marker)
  if (open === -1)
    return null
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') {
      depth++
    }
    else if (source[i] === '}') {
      depth--
      if (depth === 0)
        return { start: marker, body: source.slice(open + 1, i) }
    }
  }
  return null
}

const errors = []

for (const file of await walk(ROOT)) {
  const source = await readFile(file, 'utf8')

  // 组件区段：从一个 defineComponent 到下一个
  const heads = [...source.matchAll(/export const (Xh[A-Za-z0-9]+)\s*=\s*defineComponent\(/g)]
  for (let i = 0; i < heads.length; i++) {
    const head = heads[i]
    const begin = head.index
    const end = i + 1 < heads.length ? heads[i + 1].index : source.length
    const section = source.slice(begin, end)
    const name = head[1]

    // 带载荷的插槽调用：?.( 、!( 、裸( 三种形态，实参不是右括号
    const used = new Set()
    for (const call of section.matchAll(/slots\.(\w+)(?:\s*(?:\?\.|!))?\s*\(/g)) {
      const rest = section.slice(call.index + call[0].length)
      if (!rest.trimStart().startsWith(')'))
        used.add(call[1])
    }
    if (used.size === 0)
      continue

    const declared = declarationOf(section, 0)
    if (declared === null) {
      errors.push(`${file} ${name}：给插槽 ${[...used].join(' / ')} 传了载荷，却没有 slots: Object as SlotsType<…> 声明`)
      continue
    }

    // 逐键校验：形如 `key?: (props: T) => VNode[]`
    const keys = new Map()
    for (const entry of declared.body.matchAll(/^[^\S\n]*(\w+)(\??):[^\S\n]*(\S.*)$/gm))
      keys.set(entry[1], { optional: entry[2] === '?', type: entry[3].trim() })

    for (const key of used) {
      if (!keys.has(key))
        errors.push(`${file} ${name}：插槽 ${key} 有载荷但没写进 SlotsType`)
    }
    for (const [key, meta] of keys) {
      if (!meta.optional)
        errors.push(`${file} ${name}：插槽 ${key} 的键要带 ?，非可选会让 slots.${key} 的存在性守卫在类型上恒为真`)
      if (!meta.type.includes('=>'))
        errors.push(`${file} ${name}：插槽 ${key} 的值要写成函数类型（如 (props: T) => VNode[]），裸类型会走 Slot<T> 包装`)
    }
  }
}

if (errors.length > 0) {
  console.error('[check-slot-types] ✗')
  for (const error of errors)
    console.error(`  ${error}`)
  process.exit(1)
}

console.log('[check-slot-types] 通过：带载荷的插槽都有 SlotsType 声明，键可选、值为函数类型')
