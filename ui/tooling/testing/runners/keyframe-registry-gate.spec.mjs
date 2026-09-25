// check-keyframe-registry 的同物异名判据：同一段动画换个写法、换个名字都拦得住，
// 退役的旧名回来也拦得住；写法不同且确实不等价的帧不误伤。
//
// 夹具复制门禁读的输入（皮肤、家族文件、登记表），在副本上新建一份 demo.css，
// 先按作者的做法跑 --update 把新名字登进表，再跑门禁本身。
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const GATE = join(ROOT, 'tooling/scripts/motion/check-keyframe-registry.mjs')
const TABLE = 'tooling/scripts/keyframe-registry.json'
/** 每条用例都要复制皮肤再 spawn 两次门禁，显式给超时，不依赖 vitest 默认 5s。 */
const SPAWN_TIMEOUT = 20_000

const temporaryRoots = []

afterEach(() => {
  for (const root of temporaryRoots.splice(0))
    rmSync(root, { recursive: true, force: true })
})

function createFixture() {
  const root = mkdtempSync(join(tmpdir(), 'xihan-keyframe-registry-'))
  temporaryRoots.push(root)
  cpSync(join(ROOT, 'packages/design/styles/css'), join(root, 'packages/design/styles/css'), { recursive: true })
  cpSync(join(ROOT, 'packages/design/styles/family'), join(root, 'packages/design/styles/family'), { recursive: true })
  mkdirSync(join(root, 'tooling/scripts'), { recursive: true })
  cpSync(join(ROOT, TABLE), join(root, TABLE))
  return root
}

function run(root, ...args) {
  return spawnSync(process.execPath, [GATE, ...args], { cwd: root, encoding: 'utf8' })
}

/** 新建一份只放关键帧的 demo 皮肤，登进表后跑门禁。 */
function gateWith(frames) {
  const root = createFixture()
  writeFileSync(join(root, 'packages/design/styles/css/demo.css'), `@layer xihan.motion {\n${frames}\n}\n`, 'utf8')
  const update = run(root, '--update')
  expect(update.status, String(update.stderr)).toBe(0)
  return run(root)
}

describe('check-keyframe-registry 的同物异名判据', () => {
  it('当前仓库放行', () => {
    const result = run(createFixture())
    expect(result.status, String(result.stderr)).toBe(0)
    expect(result.stdout).toContain('同一段动画只有一个名字')
  }, SPAWN_TIMEOUT)

  it('transform: rotate(360deg) 与共享的 rotate: 1turn 是同一段动画，判红并指向共享名', () => {
    const result = gateWith('  @keyframes xh-demo-spin { to { transform: rotate(360deg); } }')
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('xh-demo-spin / xh-spin 是同一段动画')
    expect(result.stderr).toContain('改引共享关键帧 xh-spin')
  }, SPAWN_TIMEOUT)

  it('0% / 100% 与 from / to 同义：写成百分比的淡入也撞上 xh-fade-in', () => {
    const result = gateWith('  @keyframes xh-demo-reveal { 0% { opacity: 0; } 100% { opacity: 1; } }')
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('xh-demo-reveal / xh-fade-in 是同一段动画')
  }, SPAWN_TIMEOUT)

  it('两个专属名字同物，判红并要求只留一个名字', () => {
    const result = gateWith([
      '  @keyframes xh-demo-a { to { letter-spacing: 0; } }',
      '  @keyframes xh-demo-b { to { letter-spacing: 0; } }',
    ].join('\n'))
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('xh-demo-a / xh-demo-b 是同一段动画')
    expect(result.stderr).toContain('只留一个名字')
  }, SPAWN_TIMEOUT)

  it('省略起点的帧从当前值出发，与写全两端的帧不算同一段动画', () => {
    const result = gateWith('  @keyframes xh-demo-settle { to { opacity: 1; } }')
    expect(result.status, String(result.stderr)).toBe(0)
  }, SPAWN_TIMEOUT)

  it('退役的旧名重新定义判红', () => {
    const result = gateWith('  @keyframes xh-dialog-in { to { letter-spacing: 0; } }')
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('xh-dialog-in 已退役')
  }, SPAWN_TIMEOUT)
})
