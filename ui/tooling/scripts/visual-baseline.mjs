#!/usr/bin/env node
// 像素基线的容器运行器：在与 CI 同一个 Linux 镜像里跑浏览器态的截图用例。
//
// 为什么非要进容器。基线比的是逐像素的位图，字体、字形栅格化与子像素抹平在 Windows 与
// Linux 上不是一回事，在开发机上出的基线在 CI 上一张都对不上。CI 跑的是 ubuntu-latest 上的
// Playwright Chromium，本运行器用的是同版本的官方镜像，两边的渲染栈一致。
//
// 镜像默认的 sans-serif 解析成 WenQuanYi Zen Hei，而库里 53 处皮肤写的是 font-family: inherit，
// 字体最终取环境默认值。容器内与 CI 都装 fonts-dejavu-core 把这个默认值钉成 DejaVu Sans。
//
// 真正的执行步骤在 visual-baseline.container.sh 里，本文件只负责组装 docker 参数与挂载。
import { spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const IMAGE = 'mcr.microsoft.com/playwright:v1.62.0-noble'
// 卷里同时放 pnpm store、corepack 缓存与容器自己的工作副本，重复运行不重装依赖。
const VOLUME = 'xihan-ui-visual-baseline'
const DEFAULT_SPEC = 'tests/browser/visual-baseline.spec.ts'

const uiRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const vuePkg = join(uiRoot, 'packages/adapters/vue')
const shotsDir = join(vuePkg, 'tests/browser/__screenshots__')
const attachDir = join(vuePkg, '.vitest-attachments')

const argv = process.argv.slice(2)

if (argv.includes('--help') || argv.includes('-h')) {
  console.log(`
像素基线运行器（容器内跑，宿主平台不影响结果）

  pnpm visual:baseline            校验：截图与库里的基线逐像素比对
  pnpm visual:baseline --update   生成 / 更新基线并写回库里
  pnpm visual:baseline --all      跑全部浏览器态用例，不只截图那一份
  pnpm visual:baseline --spec <相对 packages/adapters/vue 的路径>

默认只跑 ${DEFAULT_SPEC}。
校验失败时差异图落在 packages/adapters/vue/.vitest-attachments 下。
`.trim())
  process.exit(0)
}

const update = argv.includes('--update')
const all = argv.includes('--all')
const specIndex = argv.indexOf('--spec')
if (specIndex !== -1 && argv[specIndex + 1] == null) {
  console.error('[visual-baseline] ✗ --spec 后面要跟一个相对 packages/adapters/vue 的路径')
  process.exit(1)
}
const spec = all ? '' : specIndex !== -1 ? argv[specIndex + 1] : DEFAULT_SPEC

// Docker Desktop 认得盘符加正斜杠的写法；反斜杠会被 docker 的参数解析当成转义。
const mountPath = path => path.replaceAll('\\', '/')

/** docker 在不在、镜像拉没拉，比让 docker run 自己报错更早也更好懂。 */
function preflight() {
  const version = spawnSync('docker', ['version', '--format', '{{.Server.Version}}'], { encoding: 'utf8' })
  if (version.error || version.status !== 0) {
    console.error('[visual-baseline] ✗ 调不到 docker。装上 Docker 并确认守护进程在跑。')
    process.exit(1)
  }
  const image = spawnSync('docker', ['image', 'inspect', IMAGE], { stdio: 'ignore' })
  if (image.status !== 0) {
    console.error(`[visual-baseline] ✗ 本机没有镜像 ${IMAGE}`)
    console.error(`  先拉下来：docker pull ${IMAGE}`)
    console.error('  镜像版本与 pnpm-workspace.yaml 里 playwright 的版本必须对上，浏览器二进制才配套。')
    process.exit(1)
  }
}

preflight()

mkdirSync(attachDir, { recursive: true })
if (update)
  mkdirSync(shotsDir, { recursive: true })

const args = [
  'run',
  '--rm',
  '--init',
  // 无头 Chromium 的共享内存默认 64MB 不够，画面一大就整页崩
  '--shm-size=1g',
  '-v',
  `${mountPath(uiRoot)}:/host:ro`,
  '-v',
  `${VOLUME}:/cache`,
  '-v',
  `${mountPath(attachDir)}:/diff`,
]

// 基线目录只在更新模式挂进去：校验模式下容器根本写不到库里的基线，
// 「跑一次校验把基线洗了」这条路从挂载上就堵死。
if (update) {
  args.push('-v', `${mountPath(shotsDir)}:/out`)
}

args.push('-e', `XH_UPDATE=${update ? '1' : '0'}`, '-e', `XH_SPEC=${spec}`)

// 校验模式对齐 CI：vitest 在 CI 下把 updateSnapshot 收成 none，缺基线时不再顺手补一张，
// 而是直接判失败。没有这一条，「基线忘了提交」在本机是绿的、到 CI 才红。
if (!update) {
  args.push('-e', 'CI=true')
}

// 宿主是 Linux 时，容器以 root 写出的文件宿主改不动，把 uid/gid 带进去交还所有权。
if (process.getuid && process.getgid) {
  args.push('-e', `HOST_UID=${process.getuid()}`, '-e', `HOST_GID=${process.getgid()}`)
}

args.push(IMAGE, 'bash', '/host/tooling/scripts/visual-baseline.container.sh')

console.log(`[visual-baseline] ${update ? '更新基线' : '校验基线'}：${spec || '全部浏览器态用例'}`)
console.log(`[visual-baseline] 镜像 ${IMAGE}，缓存卷 ${VOLUME}`)

const run = spawnSync('docker', args, {
  stdio: 'inherit',
  // Git Bash 会把 docker 参数里的 /host、/cache 这类绝对路径改写成 Windows 路径，
  // 改写之后容器内的挂载点就不存在了。
  env: { ...process.env, MSYS_NO_PATHCONV: '1' },
})

if (run.error) {
  console.error(`[visual-baseline] ✗ 起不来容器：${run.error.message}`)
  process.exit(1)
}

if (run.status !== 0) {
  process.exit(run.status ?? 1)
}

console.log('')
if (update) {
  console.log('[visual-baseline] ✓ 基线已写回 packages/adapters/vue/tests/browser/__screenshots__')
  console.log('  基线的改动是无声的：git diff 只显示二进制文件变了，看不出变成了什么样。')
  console.log('  提交前逐张打开看过，并在 PR 里说明每张为什么该变。')
}
else {
  console.log('[visual-baseline] ✓ 与库里的基线逐像素一致')
}
