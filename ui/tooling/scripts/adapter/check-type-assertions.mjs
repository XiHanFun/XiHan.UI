#!/usr/bin/env node
// 门禁：三个适配器源码里的类型断言只减不增。
//
// 连接层的 getter 按 PropTypes 出类型，缺省就是 Record<string, unknown>（core 的 Dict）；
// 适配器里逐个写的 `as Record<string, unknown>` 绝大多数是空转换，掩盖不了什么，只会把真需要断言的那几处
// 淹在几千处同样的写法里，类型也就不再从 connect 一路传到适配器。React 侧的 `as never` 同理。
// 清掉之后留下的才是真需要的；这里数两种写法，数量只许往下走：
//   - 比登记的多：新写了断言，先确认类型真的接不上，再连同理由一起 `pnpm assertions:update`；
//   - 比登记的少：又清掉了一些，跑 `pnpm assertions:update` 把登记收紧，棘轮不留余量。
//
// 登记表 tooling/scripts/type-assertions.json 由 `pnpm assertions:update` 生成并入库。
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

import { ADAPTERS } from '../lib/adapters.mjs'

const TABLE = 'tooling/scripts/type-assertions.json'
const UPDATE = process.argv.includes('--update')

/** 数的两种写法：键是登记表里的名字。 */
const PATTERNS = {
  'as Record<string, unknown>': /\bas Record<string, unknown>/g,
  'as never': /\bas never\b/g,
}

/** 适配器名 → 源码目录（src/）。 */
const SOURCES = Object.fromEntries(Object.entries(ADAPTERS).map(([name, adapter]) => [name, join(adapter.root, 'src')]))

async function files(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      out.push(...await files(path))
    else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts'))
      out.push(path)
  }
  return out
}

/** 每个适配器两种写法各有多少处，另记每个文件的数目，超出时报出最多的那几份。 */
async function count() {
  const totals = {}
  const perFile = {}
  for (const [adapter, dir] of Object.entries(SOURCES)) {
    totals[adapter] = Object.fromEntries(Object.keys(PATTERNS).map(name => [name, 0]))
    for (const file of await files(dir)) {
      const src = await readFile(file, 'utf8')
      for (const [name, re] of Object.entries(PATTERNS)) {
        const hits = src.match(re)?.length ?? 0
        totals[adapter][name] += hits
        if (hits > 0)
          (perFile[`${adapter} ${name}`] ??= []).push([file, hits])
      }
    }
  }
  return { totals, perFile }
}

const { totals, perFile } = await count()

if (UPDATE) {
  const table = {
    $comment: '由 tooling/scripts/adapter/check-type-assertions.mjs --update 生成：三个适配器 src/ 里两种类型断言的处数，只减不增。',
    ...totals,
  }
  await writeFile(TABLE, `${JSON.stringify(table, null, 2)}\n`)
  console.log(`[assertions:update] 已写入 ${TABLE}：${Object.entries(totals).map(([a, t]) => `${a} ${Object.entries(t).map(([n, c]) => `${n} ${c}`).join(' · ')}`).join('；')}`)
  process.exit(0)
}

const table = JSON.parse(await readFile(TABLE, 'utf8'))
const problems = []
for (const [adapter, counts] of Object.entries(totals)) {
  for (const [name, now] of Object.entries(counts)) {
    const was = table[adapter]?.[name]
    if (was === undefined) {
      problems.push(`${adapter} 的 ${name} 没有登记：跑 pnpm assertions:update`)
      continue
    }
    if (now > was) {
      const top = (perFile[`${adapter} ${name}`] ?? []).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([file, hits]) => `${file.replaceAll('\\', '/')} ${hits}`)
      problems.push(`${adapter} 的 ${name} 从 ${was} 涨到 ${now}：先看类型能不能从 connect 接过来；真接不上再 pnpm assertions:update。处数最多的几份：${top.join('，')}`)
    }
    else if (now < was) {
      problems.push(`${adapter} 的 ${name} 从 ${was} 降到 ${now}：跑 pnpm assertions:update 把登记收紧`)
    }
  }
}

if (problems.length > 0) {
  console.error('[check-type-assertions] ✗ 适配器的类型断言与登记对不上：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

console.log(`[check-type-assertions] 通过：${Object.entries(totals).map(([a, t]) => `${a} ${Object.entries(t).map(([n, c]) => `${n} ${c}`).join(' · ')}`).join('；')}，与登记一致`)
