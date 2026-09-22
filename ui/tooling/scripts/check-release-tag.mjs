#!/usr/bin/env node
// 门禁：标签写的版本号，必须就是包里实际写着的版本号，也必须与 changesets 的预发布模式
// 是同一回事。
//
// ① 标签号 = 包版本号：标签是发布意图，package.json 的 version 是真正发出去的号。两者对不上
//    时 `changeset publish` 不会报错——它只管把 npm 上还没有的版本发出去，v1.2.0 的标签下发的
//    可能是 1.1.0（忘了 `pnpm run version`），也可能什么都没发（1.1.0 早就在 npm 上）。
//    所有可发布包都在 .changeset/config.json 的 fixed 组里，共享同一个版本号，所以逐包核对。
//
// ② 标签号 ↔ pre 模式：changesets 的 pre 模式记在 .changeset/pre.json 里：处于 pre 时
//    `changeset publish` 会给每个包加上 `--tag <pre.json 的 tag>`，版本号也带 `-alpha.N` 后缀。
//    两件事各自成立，但对不上时不会有任何报错：
//    - 忘了 `changeset pre exit` 就打 v1.0.0 的标签——发出去的其实是 1.0.0-alpha.N，
//      npm 上不会出现你以为的那个正式版，而 1.0.0 这个号只有一次机会；
//    - 退出了 pre 却打 v1.0.0-rc.1 的标签——发出去的是正式版，会直接占掉 latest。
//
// 判据取自标签名（GITHUB_REF_NAME / RELEASE_TAG），不在标签环境里就跳过——本地跑 gate
// 不该因为「现在没在发版」而红。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const PRE_PATH = '.changeset/pre.json'
const PACKAGES_DIR = 'packages'

const tag = process.env.RELEASE_TAG ?? (process.env.GITHUB_REF_TYPE === 'tag' ? process.env.GITHUB_REF_NAME : undefined)

let pre = null
try {
  pre = JSON.parse(await readFile(PRE_PATH, 'utf8'))
}
catch {
  // 没有 pre.json 就是正式模式
}

if (!tag) {
  const mode = pre ? `pre（tag=${pre.tag}）` : '正式'
  console.log(`[check-release-tag] 跳过：不在标签发布环境（当前 changesets 模式：${mode}）`)
  process.exit(0)
}

const version = tag.replace(/^v/, '')
const prerelease = /-([0-9a-z]+)\.\d+$/i.exec(version)?.[1]
const problems = []

// ── ① 标签号 = 包版本号 ────────────────────────────────────────────────────────
/** packages/<角色组>/<包>：两级。收集所有非 private 包的 name / version。 */
async function publishablePackages() {
  const out = []
  for (const group of await readdir(PACKAGES_DIR, { withFileTypes: true })) {
    if (!group.isDirectory())
      continue
    for (const leaf of await readdir(join(PACKAGES_DIR, group.name), { withFileTypes: true })) {
      if (!leaf.isDirectory())
        continue
      let pkg
      try {
        pkg = JSON.parse(await readFile(join(PACKAGES_DIR, group.name, leaf.name, 'package.json'), 'utf8'))
      }
      catch {
        continue
      }
      if (!pkg.private)
        out.push({ name: pkg.name, version: pkg.version })
    }
  }
  return out
}

const packages = await publishablePackages()
const mismatched = packages.filter(p => p.version !== version)
if (mismatched.length) {
  problems.push(
    `标签 ${tag} 要发的是 ${version}，而这些包的 package.json 不是这个号：${mismatched.map(p => `${p.name}@${p.version}`).join('、')}`
    + '——先跑 `pnpm run version` 把版本提到位并合进 main，再在那个提交上打标签。',
  )
}

// ── ② 标签号 ↔ changesets pre 模式 ─────────────────────────────────────────────
if (prerelease == null && pre != null) {
  problems.push(
    `标签 ${tag} 是正式版号，而 ${PRE_PATH} 还在 pre 模式（tag=${pre.tag}）——`
    + `发出去的会是 ${version}-${pre.tag}.N 并被打上 --tag ${pre.tag}，不是你要的正式版。`
    + '先跑 `pnpm changeset pre exit` 与 `pnpm run version`，再打标签。',
  )
}
if (prerelease != null && pre == null) {
  problems.push(
    `标签 ${tag} 带预发布后缀 -${prerelease}，而 ${PRE_PATH} 不存在（正式模式）——`
    + '发出去的会是正式版并直接占掉 npm 的 latest。先跑 `pnpm changeset pre enter '
    + `${prerelease}\` 再打标签。`,
  )
}
if (prerelease != null && pre != null && prerelease !== pre.tag) {
  problems.push(
    `标签 ${tag} 的预发布通道是 ${prerelease}，而 ${PRE_PATH} 里是 ${pre.tag}——`
    + `发出去的会被打上 --tag ${pre.tag}，装的人 \`npm i @xihan-ui/vue@${prerelease}\` 拿不到它。`,
  )
}

if (problems.length) {
  console.error('[check-release-tag] ✗ 标签与包版本 / changesets 模式对不上：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-release-tag] 通过：标签 ${tag} 与 ${packages.length} 个可发布包的版本号、changesets 的${pre ? `pre 模式（tag=${pre.tag}）` : '正式模式'}一致`)
