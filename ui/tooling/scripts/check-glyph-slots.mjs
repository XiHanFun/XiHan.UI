#!/usr/bin/env node
// 门禁：皮肤里的字形一律走 --xh-glyph-mark-* 令牌槽，不许再写字面字符。
//
// 同一个勾号曾散在 8 份皮肤里各写一遍，换一套图形要逐份改、漏一份就长歪一处；
// 而使用者想换掉它时也无处下手——伪元素的 content 既没有槽位也接不了节点。
// 收进令牌后两件事同时成立：改一处全库跟着走；使用者在任意子树上重声明即可换，
// 置 none 就是「这里我自己放节点」。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'
const TOKENS_CSS = 'packages/design/tokens/tokens.css'

/** 数据本身的语法字符，不是视觉标记：换掉它渲染出来的就不是那个数据格式了。 */
const NOT_A_MARK = new Map([
  ['json-viewer.css', new Set(['\':\''])],
])

/** 整条值就是一个引号串的 content 声明。复合值（attr() 拼接）与空串不在此列。 */
const LITERAL_CONTENT = /content:\s*('[^']*'|"[^"]*")\s*;/g

const tokensCss = await readFile(TOKENS_CSS, 'utf8')
const declared = new Set(
  [...tokensCss.matchAll(/^\s*(--xh-glyph-mark-[a-z0-9-]+)\s*:/gm)].map(m => m[1]),
)
if (declared.size === 0) {
  console.error('[check-glyph-slots] ✗ 令牌产物里一个 --xh-glyph-mark-* 都没有，令牌源或产物路径变了')
  process.exit(1)
}

const files = (await readdir(STYLES_DIR)).filter(name => name.endsWith('.css')).sort()
const literals = []
const used = new Set()

for (const file of files) {
  const source = await readFile(join(STYLES_DIR, file), 'utf8')
  const exempt = NOT_A_MARK.get(file) ?? new Set()

  source.split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(LITERAL_CONTENT)) {
      const raw = m[1]
      // 空串是纯几何用的伪元素（画方框、画箭头），不是字形
      if (raw === '\'\'' || raw === '""' || exempt.has(raw))
        continue
      literals.push(`${file}:${i + 1}  content: ${raw}`)
    }
    for (const m of line.matchAll(/var\(\s*(--xh-glyph-mark-[a-z0-9-]+)/g))
      used.add(m[1])
  })
}

const unknown = [...used].filter(name => !declared.has(name))
const dead = [...declared].filter(name => !used.has(name))

if (literals.length) {
  console.error('[check-glyph-slots] ✗ 皮肤里还有写死的字形，改走 var(--xh-glyph-mark-<名字>)：')
  for (const at of literals)
    console.error(`  ${at}`)
  console.error(`名字在 ${TOKENS_CSS} 里，缺哪个就先去 tokens/semantic.base.json 的 glyph 组加一条。`)
}
if (unknown.length) {
  console.error('[check-glyph-slots] ✗ 皮肤引用了没有声明的字形槽：')
  for (const name of unknown)
    console.error(`  ${name}`)
}
if (dead.length) {
  console.error('[check-glyph-slots] ✗ 下列字形槽声明了却没人用，删掉它：')
  for (const name of dead)
    console.error(`  ${name}`)
}
if (literals.length || unknown.length || dead.length)
  process.exit(1)

console.log(`[check-glyph-slots] 通过：${declared.size} 个字形槽，${files.length} 份皮肤里没有写死的字形`)
