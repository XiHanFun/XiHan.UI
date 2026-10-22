#!/usr/bin/env node
// 发完包以后让 npm 的 latest 跟着这一版走，逐个包核到对上为止，全部对上才算成功（退出码 0）。
// 正式版：等 npm 官方源取得到这一版（刚发完个别包会晚二十来分钟），latest 不是这一版就补上；npm 上已有更高的正式版时不动。
// 预发布（.changeset/pre.json 在、版本带后缀）：npm 上还没有正式版的包，latest 也指到这一版；已有正式版的包不动。
// --dry-run 只看一遍 npm 现状、打印要做什么，不等、不改。
// 用法：在 ui/ 运行 node scripts/release/promote-latest.mjs [--dry-run]；改 dist-tag 用 npm 的登录或 NODE_AUTH_TOKEN。
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { pathToFileURL } from 'node:url'

const PRE_PATH = '.changeset/pre.json'
const PACKAGES_DIR = 'packages'
const REGISTRY = 'https://registry.npmjs.org'
const TIMEOUT_MS = 45 * 60_000
const INTERVAL_MS = 30_000
const MAX_TAG_ATTEMPTS = 3

/** 语义化版本比较：主次修订按数字比，带预发布后缀的排在同号正式版之前，后缀逐段比（数字段按数字）。 */
export function compareVersions(a, b) {
  const [coreA, preA] = splitVersion(a)
  const [coreB, preB] = splitVersion(b)
  for (let i = 0; i < 3; i++) {
    if (coreA[i] !== coreB[i])
      return coreA[i] < coreB[i] ? -1 : 1
  }
  if (!preA.length || !preB.length)
    return preA.length === preB.length ? 0 : (preA.length ? -1 : 1)
  for (let i = 0; i < Math.max(preA.length, preB.length); i++) {
    if (preA[i] === undefined || preB[i] === undefined)
      return preA[i] === undefined ? -1 : 1
    if (preA[i] === preB[i])
      continue
    const numA = /^\d+$/.test(preA[i])
    const numB = /^\d+$/.test(preB[i])
    if (numA && numB)
      return Number(preA[i]) < Number(preB[i]) ? -1 : 1
    if (numA !== numB)
      return numA ? -1 : 1
    return preA[i] < preB[i] ? -1 : 1
  }
  return 0
}

function splitVersion(version) {
  const [core, pre = ''] = version.split('+')[0].split(/-(.*)/s)
  return [core.split('.').map(Number), pre ? pre.split('.') : []]
}

/**
 * 一个包这一轮该怎么办：npm 上还取不到这一版就等（wait）；latest 已是这一版（done）；不该动 latest（skip）；
 * 否则把 latest 指过来（tag）。`versions` 与 `latest` 取自 npm 官方源。
 */
export function decide({ version, prerelease, versions, latest }) {
  if (!versions.includes(version))
    return { action: 'wait' }
  if (latest === version)
    return { action: 'done' }
  const stable = versions.filter(item => !item.includes('-')).sort(compareVersions)
  if (prerelease && stable.length)
    return { action: 'skip', reason: `npm 上已有正式版 ${stable.at(-1)}，latest 不动` }
  if (!prerelease && compareVersions(stable.at(-1), version) > 0)
    return { action: 'skip', reason: `npm 上已有更高的正式版 ${stable.at(-1)}，latest 不动` }
  if (prerelease && latest && compareVersions(latest, version) > 0)
    return { action: 'skip', reason: `latest 已是更高的 ${latest}，不往回挪` }
  return { action: 'tag' }
}

/**
 * 逐轮核对：每轮把还没对上的包看一遍，取不到这一版的等下一轮，latest 不对的补上、下一轮再核；
 * 全部对上（或按规则不动）就成功，超时还有没对上的就失败。dry-run 只看一轮、不等不改。
 */
export async function promoteLatest({
  packages,
  preMode,
  view,
  addTag,
  dryRun = false,
  timeoutMs = TIMEOUT_MS,
  intervalMs = INTERVAL_MS,
  wait = ms => sleep(ms),
  now = () => Date.now(),
  log = console.log,
}) {
  const versions = new Set(packages.map(pkg => pkg.version))
  if (versions.size !== 1)
    throw new Error(`库包版本不一致：${[...versions].join('、')}，锁步发版被打破`)
  const [version] = versions
  const suffixed = version.includes('-')
  if (suffixed && !preMode)
    throw new Error(`${version} 带预发布后缀，却没有 ${PRE_PATH}`)
  const prerelease = suffixed
  const pending = new Set(packages.map(pkg => pkg.name))
  const attempts = new Map()
  const start = now()
  log(`[promote-latest] ${prerelease ? '预发布' : '正式版'} ${version}，核对 ${pending.size} 个包的 latest${dryRun ? '（dry-run）' : ''}`)
  for (;;) {
    for (const name of [...pending]) {
      const state = view(name)
      const verdict = decide({ version, prerelease, ...state })
      if (verdict.action === 'wait') {
        if (dryRun) {
          log(`[promote-latest] ${name}：npm 上还取不到 ${version}（dry-run，不等）`)
          pending.delete(name)
        }
        continue
      }
      if (verdict.action === 'done') {
        log(`[promote-latest] ${name}：latest 是 ${version}`)
        pending.delete(name)
        continue
      }
      if (verdict.action === 'skip') {
        log(`[promote-latest] ${name}：${verdict.reason}`)
        pending.delete(name)
        continue
      }
      if (dryRun) {
        log(`[promote-latest] ${name}：会把 latest 从 ${state.latest ?? '（无）'} 改到 ${version}（dry-run，没改）`)
        pending.delete(name)
        continue
      }
      const tried = attempts.get(name) ?? 0
      if (tried >= MAX_TAG_ATTEMPTS)
        continue
      attempts.set(name, tried + 1)
      addTag(name, version)
      log(`[promote-latest] ${name}：latest 从 ${state.latest ?? '（无）'} 改到 ${version}，下一轮再核`)
    }
    if (!pending.size)
      return { ok: true, version, pending: [] }
    if (now() - start >= timeoutMs) {
      log(`[promote-latest] 等了 ${Math.round(timeoutMs / 60_000)} 分钟，这些包的 latest 还没对上：${[...pending].join('、')}`)
      return { ok: false, version, pending: [...pending] }
    }
    await wait(intervalMs)
  }
}

/** packages/<角色组>/<包>：两级，收集所有非 private 包。 */
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
  if (!out.length)
    throw new Error(`${PACKAGES_DIR}/ 下一个公开包都没扫到，目录层级变了就把这里的遍历一起改`)
  return out
}

/** npm 命令拼成一行交给 shell：Windows 上 npm 是 .cmd，要经 shell 才找得到；参数都是包名、版本号与地址，不含要转义的字符。 */
function npm(args, { capture = false } = {}) {
  for (const arg of args) {
    if (!/^[\w@+=:,./-]+$/.test(arg))
      throw new Error(`npm 参数里有要转义的字符：${arg}`)
  }
  return execSync(['npm', ...args].join(' '), { stdio: capture ? 'pipe' : 'inherit', encoding: 'utf8' })
}

function viewOnRegistry(name) {
  let json
  try {
    json = JSON.parse(npm(['view', name, 'versions', 'dist-tags', '--json', '--prefer-online', `--registry=${REGISTRY}`], { capture: true }) || 'null')
  }
  catch {
    // 包还没发过（npm 报 404）或这一次没取到：当作取不到，下一轮再看
    return { versions: [], latest: undefined }
  }
  return { versions: [json?.versions ?? []].flat(), latest: json?.['dist-tags']?.latest }
}

function addLatestTag(name, version) {
  npm(['dist-tag', 'add', `${name}@${version}`, 'latest', `--registry=${REGISTRY}`])
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await promoteLatest({
    packages: await publishablePackages(),
    preMode: existsSync(PRE_PATH),
    view: viewOnRegistry,
    addTag: addLatestTag,
    dryRun: process.argv.includes('--dry-run'),
  })
  if (!result.ok)
    process.exit(1)
}
