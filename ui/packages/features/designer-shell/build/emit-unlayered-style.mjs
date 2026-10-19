// 从 style.css 产出拆掉层壳的 dist/style.unlayered.css，配无层组件皮肤 @xihan-ui/styles/index.unlayered.css 用。
//
// style.css 整份在 @layer xihan.components 里，与有层皮肤同层，外壳覆盖库组件部件的规则靠特指度与源序胜出。
// 宿主改引无层皮肤时，无层规则不论特指度都压过有层规则，外壳与皮肤写在同一元素上的同一属性一律输掉
// （JSON 编辑框的定高塌成两行、等宽字体退回正文字体）。这一份内容与 style.css 相同，只是没有层壳，
// 与无层皮肤一起按特指度与源序竞争，结果与两份有层产物相同。
//
// 用法：node build/emit-unlayered-style.mjs（包的 build 脚本在 tsdown 之后调用）

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = path.join(pkgRoot, 'style.css')
const OUT = path.join(pkgRoot, 'dist', 'style.unlayered.css')
const OPEN = '@layer xihan.components {'

const css = fs.readFileSync(SOURCE, 'utf8')
const start = css.indexOf(OPEN)
if (start < 0 || css.includes(OPEN, start + 1))
  throw new Error(`[emit-unlayered-style] style.css 里要恰好有一个「${OPEN}」层壳`)
const close = css.lastIndexOf('}')
const head = css.slice(0, start)
const tail = css.slice(close + 1)
if (/[{}]/.test(head.replace(/\/\*[\s\S]*?\*\//g, '')) || tail.trim() !== '')
  throw new Error('[emit-unlayered-style] style.css 的规则要全部写在层壳里，层壳前后只能有注释')

const body = css.slice(start + OPEN.length, close).replace(/^ {2}/gm, '').trim()
const note = '/* 本文件由 build/emit-unlayered-style.mjs 从 style.css 生成，不要手改：内容相同，只是拆掉了 @layer xihan.components 的层壳，配无层组件皮肤用。 */'
fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, `${head.replace(/\/\* @xihan-ui\/designer-shell 的样式[^\n]*\*\/\n*/, '')}${note}\n\n${body}\n`)
console.log(`已生成 ${path.relative(pkgRoot, OUT)}`)
