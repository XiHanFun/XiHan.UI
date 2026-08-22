#!/usr/bin/env node
// 门禁：要发的版本号与 changesets 的预发布模式必须是同一回事。
//
// changesets 的 pre 模式记在 .changeset/pre.json 里：处于 pre 时 `changeset publish` 会给
// 每个包加上 `--tag <pre.json 的 tag>`，版本号也带 `-alpha.N` 后缀。两件事各自成立，
// 但对不上时不会有任何报错：
// ① 忘了 `changeset pre exit` 就打 v1.0.0 的标签——发出去的其实是 1.0.0-alpha.N，
//    npm 上不会出现你以为的那个正式版，而 1.0.0 这个号只有一次机会；
// ② 退出了 pre 却打 v1.0.0-rc.1 的标签——发出去的是正式版，会直接占掉 latest。
//
// 判据取自标签名（GITHUB_REF_NAME / RELEASE_TAG），不在标签环境里就跳过——本地跑 gate
// 不该因为「现在没在发版」而红。
import { readFile } from 'node:fs/promises'

const PRE_PATH = '.changeset/pre.json'

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
  console.error('[check-release-tag] ✗ 标签与 changesets 模式对不上：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(`[check-release-tag] 通过：标签 ${tag} 与 changesets 的${pre ? `pre 模式（tag=${pre.tag}）` : '正式模式'}一致`)
