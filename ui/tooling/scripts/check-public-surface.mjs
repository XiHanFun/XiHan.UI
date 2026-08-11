#!/usr/bin/env node
// 门禁：公开面只增不减。
//
// 拿入库的 tooling/public-surface.json 当基线，重新采集一遍当前的，逐项比对。
// **只咬「基线里有而当前没有」**——那意味着某个名字被删了或改名了，而使用者写下过它。
// 新增一律放行：加一个组件、加一个 prop、加一档语气都是 minor，不该被拦。
//
// 这是「改名 = major」唯一能兑现的机制。仓里其余门禁全是「重新生成 + git diff」形态，
// 只能发现「改了源忘了跑生成」；改名会在同一个提交里同时改源与产物，diff 干净、CI 全绿。
// 实测把 switch 的 thumb 改名 knob，12 道 gate 加 boundaries 全部通过，没有一条响。
//
// 真要删或改名时（那是 major），跑 `pnpm surface:update` 把基线推上去，
// 并在 changeset 里说清。门禁拦的是「无意中删掉」，不是「有意的破坏性变更」。
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const BASELINE = 'tooling/public-surface.json'

const baseline = JSON.parse(await readFile(BASELINE, 'utf8'))

// 重新采集当前的。走子进程是为了让采集逻辑只有一份。
execFileSync(process.execPath, ['tooling/scripts/build-public-surface.mjs'], { stdio: 'pipe' })
const current = JSON.parse(await readFile(BASELINE, 'utf8'))

// 采集会覆盖基线文件，比对完把基线原样写回，免得门禁自己把证据改掉
const { writeFile } = await import('node:fs/promises')
await writeFile(BASELINE, `${JSON.stringify(baseline, null, 2)}\n`)

const missing = []

/** 一维名单：基线里有、当前没有的。 */
function diffList(label, before, after) {
  const now = new Set(after ?? [])
  for (const name of before ?? []) {
    if (!now.has(name))
      missing.push(`${label}: ${name}`)
  }
}

/** 键值都要比：键没了算整条没了，键还在就比它的名单。 */
function diffMap(label, before, after, inner) {
  for (const [key, value] of Object.entries(before ?? {})) {
    const next = (after ?? {})[key]
    if (next === undefined) {
      missing.push(`${label}: ${key}（整个没了）`)
      continue
    }
    inner(`${label} ${key}`, value, next)
  }
}

diffMap('包子入口', baseline.packages, current.packages, diffList)
diffMap('导出名', baseline.exports, current.exports, diffList)
diffMap('解剖部件', baseline.anatomy, current.anatomy, diffList)
diffMap('组件 prop', baseline.componentProps, current.componentProps, diffList)
diffList('data-* 属性', baseline.dataAttributes, current.dataAttributes)
diffList('data-state 取值', baseline.dataStateValues, current.dataStateValues)
diffList('令牌', baseline.tokens, current.tokens)
diffList('@layer 名', baseline.cssLayers, current.cssLayers)
diffList('组件覆盖槽', baseline.cssSlots, current.cssSlots)
diffMap('自定义元素', baseline.elements, current.elements, (label, before, after) => {
  diffList(`${label} attribute`, before.attributes, after.attributes)
  diffList(`${label} 事件`, before.events, after.events)
})

if (missing.length > 0) {
  console.error(`[check-public-surface] ✗ 公开面少了 ${missing.length} 项——删除或改名是破坏性变更：`)
  for (const m of missing.slice(0, 40))
    console.error(`  ${m}`)
  if (missing.length > 40)
    console.error(`  …另有 ${missing.length - 40} 项`)
  console.error('  确实要改（那就是 major）：跑 pnpm surface:update 推基线，并在 changeset 里说清。')
  console.error('  分档与判据见 docs/guide/versioning.md。')
  process.exit(1)
}

const total = baseline.tokens.length + baseline.dataAttributes.length + baseline.cssSlots.length
  + Object.values(baseline.exports).reduce((n, v) => n + v.length, 0)
  + Object.values(baseline.anatomy).reduce((n, v) => n + v.length, 0)
  + Object.values(baseline.componentProps ?? {}).reduce((n, v) => n + v.length, 0)
console.log(`[check-public-surface] 通过：基线里的 ${total} 个名字一个都没少`)
