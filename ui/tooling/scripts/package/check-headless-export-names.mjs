// headless 只有一个总导出，三千多个名字落在同一个命名空间里：每个名字都要看得出属于哪个组件。
// 判据：从 `./<组件>` 转出的名字里要带组件名（PascalCase、camelCase 或 UPPER_CASE 写法皆可），
// 或带下面登记过的短前缀（码制、领域名这类比组件名更通行的叫法）。
// 只给 connect 内部用的纯函数不进总导出：组件目录自己的 index 照旧导出，测试从那里取。

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const INDEX = `${ROOT}packages/engine/headless/src/index.ts`

/** 不是组件的目录：基础类型、元数据契约、语言包与跨组件共享件。 */
const INFRA = new Set(['types', 'spec', 'shared', 'locale'])

/** 组件名之外认可的前缀：比组件名更通行、读者一看就知道属于谁的叫法。 */
const ALIASES = {
  'approval': ['Approve'],
  'bar-code': ['Bar'],
  'date-field': ['Date'],
  'diff-view': ['Diff', 'Patch'],
  'file-upload': ['File'],
  'filter-builder': ['Filter'],
  'image-cropper': ['Crop'],
  'json-viewer': ['Json'],
  'log': ['Ansi'],
  'markdown-stream': ['Markdown'],
  'matrix-code': ['Qr', 'Dm', 'Pdf417', 'Aztec'],
  'pagination': ['Page'],
  'signature-pad': ['Signature'],
  'splitter': ['Panel'],
  'steps': ['Step'],
  'text-field': ['Textarea'],
  'time-field': ['Time'],
}

const pascal = stem => stem.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')
const upper = stem => stem.toUpperCase().replace(/-/g, '_')

function stemsOf(dir) {
  const base = [dir, dir.replace(/-chart$/, ''), dir.replace(/-view$/, '')]
  return [...new Set([...base.map(pascal), ...(ALIASES[dir] ?? [])])]
}

/** 名字里带不带这个词：Pascal 写法出现在任意位置，camel 写法在开头，UPPER 写法作为一节。 */
function carries(name, stem) {
  const camel = stem[0].toLowerCase() + stem.slice(1)
  const shout = upper(stem.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase())
  return name.includes(stem) || name.startsWith(camel) || new RegExp(`(^|_)${shout}(_|$)`).test(name)
}

const text = readFileSync(INDEX, 'utf8')
const problems = []
let checked = 0
for (const match of text.matchAll(/export (?:type )?\{([^}]*)\} from '\.\/([a-z0-9-]+)'/g)) {
  const dir = match[2]
  if (INFRA.has(dir))
    continue
  const stems = stemsOf(dir)
  for (const raw of match[1].split(',').map(s => s.trim()).filter(Boolean)) {
    const name = raw.split(/\s+as\s+/).pop()
    checked++
    if (!stems.some(stem => carries(name, stem)))
      problems.push(`  ${dir}: ${name}（要带 ${stems.join(' / ')} 之一）`)
  }
}

if (problems.length) {
  console.error(`[check-headless-export-names] ✗ headless 总导出里有 ${problems.length} 个看不出属于哪个组件的名字：`)
  console.error(problems.join('\n'))
  console.error('  —— 改成带组件名的名字；只给 connect 内部用的纯函数从总导出收回，组件目录的 index 照旧导出')
  process.exit(1)
}
console.log(`[check-headless-export-names] 通过：headless 总导出 ${checked} 个组件名字都带组件名或登记的短前缀`)
