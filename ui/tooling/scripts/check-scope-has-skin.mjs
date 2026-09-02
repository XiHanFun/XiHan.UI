#!/usr/bin/env node
// 门禁：解剖发出去的每一个 scope 都要有同名皮肤接着，每一份组件皮肤也都要有解剖发同名 scope。
//
// scope 的真源是解剖：createAnatomy('<scope>', […]) 把它打进每个部件的 data-scope，
// 开发模式的皮肤在场探测（startSkinCheck）再按它逐个探 --xh-<scope>-skin 标记。
// 发了 scope 而仓里根本没有那份皮肤时，探测会给出一条**永远修不掉**的警告——
// 使用者按提示去 import 也没有那个文件。反过来，皮肤在仓里而没人发同名 scope，
// 那份皮肤的规则一条都不会命中。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const HEADLESS = 'packages/engine/headless/src'
const STYLES_DIR = 'packages/design/styles/css'

/**
 * 不归任何组件管的皮肤，逐份写明它按什么匹配。
 * 每条都要真被用来放行过一次——文件没了、或者它已经有同名解剖了，
 * 这条就成了一张过期的免检通行证，由下面的名单核验报出来。
 */
const SHARED = {
  'layers': '层序单一真源，整份只有一行 @layer 次序声明',
  'overlay-arrow': '浮层箭头的几何，按 [data-part=\'arrow\'] 匹配，六份浮层皮肤共用',
  'reset': '库自己的基线，按 [data-scope] 匹配全部库节点，不挑具体哪一个',
  'tone': '语气层，与组件无关，三视觉轴共用一份',
  'undefined': '自定义元素升级前的形态，按元素名匹配，那一刻 data-scope 还没打上',
  'visually-hidden': '视觉隐藏工具类，按 .xh-visually-hidden 匹配',
}

const problems = []
/** scope → 它的解剖写在哪儿。 */
const scopes = new Map()

for (const entry of (await readdir(HEADLESS, { withFileTypes: true })).filter(d => d.isDirectory()).sort((a, b) => a.name < b.name ? -1 : 1)) {
  const name = entry.name
  const path = `${HEADLESS}/${name}/${name}.anatomy.ts`
  let src
  try {
    src = await readFile(join(HEADLESS, name, `${name}.anatomy.ts`), 'utf8')
  }
  catch {
    continue
  }

  let found = 0
  src.split('\n').forEach((line, i) => {
    if (line.trim().startsWith('//'))
      return
    for (const [, scope] of line.matchAll(/createAnatomy\(\s*'([a-z][a-z0-9-]*)'/g)) {
      found += 1
      const where = `${path}:${i + 1}`
      const prev = scopes.get(scope)
      if (prev)
        problems.push(`${where}  scope '${scope}' 与 ${prev} 重名——一份皮肤只能有一处解剖认领它，改掉其中一个`)
      else
        scopes.set(scope, where)
    }
  })

  if (!found)
    problems.push(`${path}  没读到 createAnatomy('<scope>', […])——scope 的真源是解剖，写成别的形状这道门禁就看不见它`)
}

/** 皮肤名 → 文件路径。 */
const skins = new Map(
  (await readdir(STYLES_DIR))
    .filter(f => f.endsWith('.css'))
    .sort()
    .map(f => [f.replace(/\.css$/, ''), `${STYLES_DIR}/${f}`]),
)

for (const [scope, where] of scopes) {
  if (!skins.has(scope))
    problems.push(`${where}  发了 data-scope='${scope}'，而 ${STYLES_DIR} 里没有 ${scope}.css——皮肤在场探测会报一条修不掉的警告。补上那份皮肤，或者把解剖的 scope 改成已有皮肤的名字`)
}

const sharedSeen = new Set()
for (const [name, file] of skins) {
  if (scopes.has(name))
    continue
  if (name in SHARED) {
    sharedSeen.add(name)
    continue
  }
  problems.push(`${file}  没有任何解剖发 data-scope='${name}'，这份皮肤的规则一条都不会命中——要么让对应组件的解剖 createAnatomy('${name}', […])，要么删掉它；不归组件管的公共皮肤登记进 SHARED`)
}

for (const name of Object.keys(SHARED)) {
  if (!sharedSeen.has(name))
    problems.push(`${name} 登记在 SHARED 里，但 ${STYLES_DIR} 里已经没有 ${name}.css，或者它已经有同名解剖了——名单过期，删掉这条`)
}

if (problems.length) {
  console.error('[check-scope-has-skin] ✗ scope 与皮肤对不上：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

console.log(`[check-scope-has-skin] 通过：${scopes.size} 个解剖 scope 与 ${skins.size - sharedSeen.size} 份组件皮肤一一对上（另有不归组件管的公共皮肤 ${sharedSeen.size} 份）`)
