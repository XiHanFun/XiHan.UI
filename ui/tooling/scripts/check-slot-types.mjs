#!/usr/bin/env node
// 门禁：带载荷的插槽必须写下类型，且声明不许撒谎。
//
// 同一条契约在两个适配器上是两种介质：
//   Vue  —— `slots: Object as SlotsType<{ … }>`，键可选、值写成函数类型
//   React —— 载荷插槽是函数式 children，类型由 Props 上的 SlotChildren<P> 表达，
//            取值走 runtime/slot-content.ts 的 renderSlot(children, payload)
// Web Components 不在其列：那一侧的插槽是原生 <slot>，作者递进来的是 Light DOM 节点，
// 没有「把载荷交给作者」这回事，也就没有可声明的类型。
//
// Vue 侧四条判据分别对应一种会静默出错的写法：
//   缺声明   → 消费方拿到 any，插槽名与载荷键名拼错都不报
//   键非可选 → slots.x ? A : B 这类守卫在类型上恒为真，而它承载着 collection 的默认铺开行为
//   值非函数 → 走 Slot<T> 包装，零参调用变非法
//   声明未用 → 写进 SlotsType 却从不渲染，消费方合法传进来的 #slot 被静默吞掉
//
// React 侧对位的四条：
//   缺声明   → renderSlot 取了载荷，Props 上却没这个名字，作者不知道能传函数
//   类型不对 → 不是 SlotChildren<P>：裸函数类型禁掉了静态 children，裸 ReactNode 丢掉了载荷
//   键非可选 → 同上，存在性守卫在类型上恒为真
//   声明未用 → 标了 SlotChildren 却从不 renderSlot，作者传进来的函数会被当成 React 子节点直接渲染
//
// React 正在按批次铺开：只核 react-coverage.json 里已铺的组件，没铺到的跳过并在收尾行报出进度。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ADAPTERS, reactCovered, reactProgress } from './lib/adapters.mjs'

/** Web Components 没有对应物：原生 <slot> 递的是节点，不携带载荷，这张门禁不看它。 */
const WC_NOT_APPLICABLE = 'Web Components 不在其列：原生 <slot> 递的是 Light DOM 节点，没有载荷可声明'

async function walk(dir, extensions) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      out.push(...await walk(path, extensions))
    else if (extensions.some(ext => entry.name.endsWith(ext)))
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
let vueDeclared = 0
let reactDeclared = 0

// —— Vue：SlotsType 声明 ——
for (const file of await walk(ADAPTERS.vue.components, ['.ts'])) {
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
    // 反向判据的引用集：名字出现即算「用过」——slots.item 整体传给 helper 的裸引用也算，
    // 只有调用形态会漏掉 collection 族把插槽按引用透传的用法
    const referenced = new Set([...section.matchAll(/slots\.(\w+)/g)].map(m => m[1]))

    const declared = declarationOf(section, 0)
    if (declared === null) {
      if (used.size > 0)
        errors.push(`${ADAPTERS.vue.label} ${file} ${name}：给插槽 ${[...used].join(' / ')} 传了载荷，却没有 slots: Object as SlotsType<…> 声明`)
      continue
    }
    if (used.size === 0 && referenced.size === 0)
      continue

    // 逐键校验：形如 `key?: (props: T) => VNode[]`
    const keys = new Map()
    for (const entry of declared.body.matchAll(/^[^\S\n]*(\w+)(\??):[^\S\n]*(\S.*)$/gm))
      keys.set(entry[1], { optional: entry[2] === '?', type: entry[3].trim() })
    vueDeclared += keys.size

    for (const key of used) {
      if (!keys.has(key))
        errors.push(`${ADAPTERS.vue.label} ${file} ${name}：插槽 ${key} 有载荷但没写进 SlotsType`)
    }
    for (const [key, meta] of keys) {
      if (!meta.optional)
        errors.push(`${ADAPTERS.vue.label} ${file} ${name}：插槽 ${key} 的键要带 ?，非可选会让 slots.${key} 的存在性守卫在类型上恒为真`)
      if (!meta.type.includes('=>'))
        errors.push(`${ADAPTERS.vue.label} ${file} ${name}：插槽 ${key} 的值要写成函数类型（如 (props: T) => VNode[]），裸类型会走 Slot<T> 包装`)
      if (!referenced.has(key))
        errors.push(`${ADAPTERS.vue.label} ${file} ${name}：插槽 ${key} 写进了 SlotsType 但组件从不碰它——消费方传 #${key} 会被静默吞掉，别让声明撒谎`)
    }
  }
}

// —— React：Props 上的 SlotChildren<P> ——
// 取值那一处是 renderSlot(<名字>, 载荷)；名字要在 Props 上以 SlotChildren<P> 声明，
// 反过来标了 SlotChildren 的名字也必须真的经 renderSlot 取值——直接当子节点渲染，
// 作者传进来的函数会被 React 当成非法子节点。
const covered = await reactCovered()
const reactSkipped = new Set()
let reactScanned = 0
// 进度的分母取全量那一侧的组件数：Vue 的 components 下一个条目就是一个组件
const componentTotal = (await readdir(ADAPTERS.vue.components)).length
for (const entry of await readdir(ADAPTERS.react.components, { withFileTypes: true }).catch(() => [])) {
  if (!entry.isDirectory())
    continue
  if (!covered.has(entry.name)) {
    reactSkipped.add(entry.name)
    continue
  }
  reactScanned++
  for (const file of await walk(join(ADAPTERS.react.components, entry.name), ['.ts', '.tsx'])) {
    const source = await readFile(file, 'utf8')

    // 接口成员：名字 → 是否可选与类型文本（缩进两格那一层）
    const members = new Map()
    for (const hit of source.matchAll(/^ {2}(\w+)(\??):[^\S\n]*(\S.*)$/gm))
      members.set(hit[1], { optional: hit[2] === '?', type: hit[3].trim() })

    const used = new Set([...source.matchAll(/renderSlot\(\s*(?:props\.)?(\w+)/g)].map(m => m[1]))

    for (const key of used) {
      const meta = members.get(key)
      if (!meta) {
        errors.push(`${ADAPTERS.react.label} ${file}：renderSlot 取了 ${key} 的载荷，Props 上却没有这个名字——作者不知道这里能传函数`)
        continue
      }
      if (!meta.type.includes('SlotChildren')) {
        errors.push(`${ADAPTERS.react.label} ${file}：插槽 ${key} 有载荷，类型要写成 SlotChildren<P>——裸函数类型禁掉了静态 children，裸 ReactNode 则丢掉载荷`)
        continue
      }
      if (!meta.optional)
        errors.push(`${ADAPTERS.react.label} ${file}：插槽 ${key} 的键要带 ?，非可选会让 ${key} 的存在性守卫在类型上恒为真`)
    }

    for (const [key, meta] of members) {
      if (!meta.type.includes('SlotChildren'))
        continue
      reactDeclared++
      if (!used.has(key))
        errors.push(`${ADAPTERS.react.label} ${file}：${key} 标成了 SlotChildren 却从不经 renderSlot 取值——作者传进来的函数会被当成 React 子节点直接渲染，别让声明撒谎`)
    }
  }
}

if (errors.length > 0) {
  console.error('[check-slot-types] ✗')
  for (const error of errors)
    console.error(`  ${error}`)
  process.exit(1)
}

console.log(`[check-slot-types] 通过：带载荷的插槽都写下了类型——Vue ${vueDeclared} 个 SlotsType 键 / React ${reactDeclared} 个 SlotChildren prop（扫了 ${reactScanned} 个已铺组件），键可选、值为函数形态`)
console.log(`  ${WC_NOT_APPLICABLE}；${reactProgress(covered, componentTotal)}，React 侧还没铺的 ${reactSkipped.size} 个目录这一轮跳过`)
