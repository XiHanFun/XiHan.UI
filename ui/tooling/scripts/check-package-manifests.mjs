#!/usr/bin/env node
// 门禁：每个发布包必须有 README.md，且每一张按名字列包的清单都要与 packages/ 下的实际发布包一一对上。
//
// 「清单」指的是仓里逐个写死包名的那些地方：锁步发版的 fixed 组、提交 scope 表、体积限额表、
// 两份仓库 README 的包表、packages 的角色分组图，以及三个平台的 issue / PR 模板。
// 判据双向：清单里少一个包（新包发出去了没人登记）判失败，多一个包（包退役了名字还挂着）同样判失败。
//
// README 不写进 package.json 的 files 也照样发到 npm，缺它的包在 npm 页面上只剩一句 description。
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const uiRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const repoRoot = join(uiRoot, '..')

const readUi = path => readFile(join(uiRoot, path), 'utf8')
const readRepo = path => readFile(join(repoRoot, path), 'utf8')

/** 清单里允许出现、但不是发布包的名字：私有包与工程 / 跨切领域。 */
const NON_PACKAGE = new Set([
  'tooling',
  'turbo',
  'vite',
  'build',
  'scripts',
  'tsconfig',
  'eslint-config',
  'stylelint-config',
  'testing',
  'benchmark',
  'ci',
  'deps',
  'release',
  'repo',
  'a11y',
  'test',
])

/** packages/<角色组>/<包> 里 private 不为 true 的包名（去掉 @xihan-ui/ 前缀）。 */
async function publicPackages() {
  const out = []
  for (const group of (await readdir(join(uiRoot, 'packages'), { withFileTypes: true })).filter(d => d.isDirectory())) {
    for (const leaf of (await readdir(join(uiRoot, 'packages', group.name), { withFileTypes: true })).filter(d => d.isDirectory())) {
      const dir = `packages/${group.name}/${leaf.name}`
      const pkg = JSON.parse(await readUi(`${dir}/package.json`).catch(() => '{}'))
      if (pkg.name && !pkg.private)
        out.push({ dir, short: pkg.name.replace('@xihan-ui/', ''), name: pkg.name })
    }
  }
  return out.sort((a, b) => a.short.localeCompare(b.short))
}

/** 源码里 <开始标记> 与 <结束标记> 之间的那一段。 */
function section(source, from, to) {
  const start = source.indexOf(from)
  if (start === -1)
    return null
  const end = source.indexOf(to, start + from.length)
  return end === -1 ? null : source.slice(start + from.length, end)
}

/** 一段文本里全角括号内的名字：`结构原语（kernel）`、`构建 / 工程（tooling / turbo / vite）`。 */
function parenNames(text) {
  const out = []
  for (const [, inner] of text.matchAll(/（([^）]+)）/g)) {
    for (const token of inner.split('/')) {
      const name = token.trim()
      if (/^[a-z0-9-]+$/.test(name))
        out.push(name)
    }
  }
  return out
}

/** 一段文本里以 `/` 分隔的名字，每段取末尾那个西文词：`浮层定位 position / 动效引擎 motion`。 */
function slashNames(text) {
  const out = []
  for (const token of text.split('/')) {
    const hit = token.match(/([a-z0-9-]+)\s*$/)
    if (hit)
      out.push(hit[1])
  }
  return out
}

/** 每张清单：名字、读法、从源码里抽出包名的取法。 */
const MANIFESTS = [
  {
    file: 'ui/.changeset/config.json',
    how: 'fixed 组里的包名',
    async names() {
      const cfg = JSON.parse(await readUi('.changeset/config.json'))
      return (cfg.fixed ?? []).flat().map(n => n.replace('@xihan-ui/', ''))
    },
  },
  {
    file: 'ui/.changeset/README.md',
    how: '开头那句「N 个公开包」后面的名单',
    async names() {
      const source = await readUi('.changeset/README.md')
      const list = section(source, '个公开包**', '经 `fixed` 组')
      if (list == null)
        throw new Error('找不到「N 个公开包」后面的名单')
      return slashNames(list.replace(/[（）\n]/g, ' '))
    },
  },
  {
    file: 'ui/commitlint.config.js',
    how: 'scope-enum 里「库包」那一段',
    async names() {
      const block = section(await readUi('commitlint.config.js'), '—— 库包', '—— 工程 ——')
      if (block == null)
        throw new Error('找不到 scope-enum 的「库包」段')
      return [...block.matchAll(/'([a-z0-9-]+)'/g)].map(m => m[1])
    },
  },
  {
    file: 'ui/.size-limit.json',
    how: '每条限额的 path 落在哪个包目录下',
    async names() {
      const entries = JSON.parse(await readUi('.size-limit.json'))
      const out = new Set()
      for (const entry of entries) {
        const hit = String(entry.path ?? '').match(/^packages\/[a-z0-9-]+\/([a-z0-9-]+)\//)
        if (hit)
          out.add(hit[1])
      }
      return [...out]
    },
  },
  {
    file: 'ui/packages/README.md',
    how: '开头那张角色分组图里逐行列出的包名',
    async names() {
      const source = await readUi('packages/README.md')
      const out = []
      for (const [, list] of source.matchAll(/^ {2}(?:adapters|design|features|engine)\/([^←\n]+)←/gm))
        out.push(...list.trim().split(/\s+/))
      if (out.length === 0)
        throw new Error('找不到角色分组图')
      return out
    },
  },
  {
    file: 'ui/README.md',
    how: '包表里的 `@xihan-ui/*` 行',
    async names() {
      return [...(await readUi('README.md')).matchAll(/^\| `@xihan-ui\/([a-z0-9-]+)` \|/gm)].map(m => m[1])
    },
  },
  {
    file: 'ui/README_cn.md',
    how: '包表里的 `@xihan-ui/*` 行',
    async names() {
      return [...(await readUi('README_cn.md')).matchAll(/^\| `@xihan-ui\/([a-z0-9-]+)` \|/gm)].map(m => m[1])
    },
  },
  ...['.github/ISSUE_TEMPLATE/bug_report.yml', '.github/ISSUE_TEMPLATE/feature_request.yml', '.gitee/ISSUE_TEMPLATE/bug.yml', '.gitee/ISSUE_TEMPLATE/feature.yml'].map(file => ({
    file,
    how: '「影响范围」下拉框的选项',
    async names() {
      const block = section(await readRepo(file), 'label: 影响范围', '    validations:')
      if (block == null)
        throw new Error('找不到「影响范围」的 options 段')
      return parenNames(block)
    },
  })),
  ...['.github/PULL_REQUEST_TEMPLATE.md', '.gitee/PULL_REQUEST_TEMPLATE.md', '.gitcode/PULL_REQUEST_TEMPLATE.md'].map(file => ({
    file,
    how: '「影响范围」注释里的包名单',
    async names() {
      const block = section(await readRepo(file), '<!-- 包 / 领域：', '-->')
      if (block == null)
        throw new Error('找不到「包 / 领域」注释')
      return slashNames(block.replaceAll('\n', ' '))
    },
  })),
  ...['.gitcode/ISSUE_TEMPLATE/bug_report.md', '.gitcode/ISSUE_TEMPLATE/feature_request.md'].map(file => ({
    file,
    how: '「影响范围」注释里的包名单',
    async names() {
      const block = section(await readRepo(file), '## 影响范围', '-->')
      if (block == null)
        throw new Error('找不到「影响范围」注释')
      return slashNames(block.replaceAll('\n', ' '))
    },
  })),
]

const packages = await publicPackages()
const expected = new Set(packages.map(p => p.short))
const problems = []

for (const { dir, name } of packages) {
  const readme = await readUi(`${dir}/README.md`).catch(() => null)
  if (readme == null)
    problems.push(`${dir}/README.md  缺 README——${name} 在 npm 上只会剩一句 description`)
  else if (!readme.includes(name))
    problems.push(`${dir}/README.md  正文里没提到 ${name}，落地页写的不是这个包`)
}

for (const manifest of MANIFESTS) {
  let listed
  try {
    listed = new Set((await manifest.names()).filter(n => !NON_PACKAGE.has(n)))
  }
  catch (error) {
    problems.push(`${manifest.file}  取不到包名单（${manifest.how}）：${error.message}`)
    continue
  }
  const missing = [...expected].filter(n => !listed.has(n))
  const stale = [...listed].filter(n => !expected.has(n))
  if (missing.length)
    problems.push(`${manifest.file}  少了 ${missing.join(' / ')}（${manifest.how}）`)
  if (stale.length)
    problems.push(`${manifest.file}  多了 ${stale.join(' / ')}——packages/ 下没有这个发布包（${manifest.how}）`)
}

if (problems.length) {
  console.error(`[check-package-manifests] ✗ 发布包与包清单对不上（${problems.length} 处）：`)
  for (const problem of problems)
    console.error(`  ${problem}`)
  console.error('\n新增发布包时这几张清单要一起加；退役一个包时要一起删。名字不是包的（工程 / 私有包）写进本脚本的 NON_PACKAGE。')
  process.exit(1)
}

console.log(`[check-package-manifests] 通过：${packages.length} 个发布包各有 README，${MANIFESTS.length} 张包清单与实际包一一对上`)
