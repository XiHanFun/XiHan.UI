// check-focus-outline-reset 各证两件事：一处 `:focus:not(:focus-visible)` 下的 outline 复位会红，
// 不复位 outline 的同选择器规则与当前仓库放行。
// 写法照 scroll-surface-gate.spec.mjs：在临时根下铺出脚本读的皮肤目录，把脚本当子进程跑。
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const GATE = join(ROOT, 'tooling/scripts/check-focus-outline-reset.mjs')
const SKINS = 'packages/design/styles/css'
/** 要复制整目录皮肤再 spawn 一次门禁，显式给超时，不依赖 vitest 默认 5s。 */
const SPAWN_TIMEOUT = 20_000

const temporaryRoots = []

afterEach(() => {
  for (const root of temporaryRoots.splice(0))
    rmSync(root, { recursive: true, force: true })
})

function write(root, path, contents) {
  const target = join(root, path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, contents, 'utf8')
}

/** 只铺一份 demo 皮肤的临时根；`real` 为 true 时改为复制当前仓库的全部皮肤。 */
function createFixture({ css, real = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'xihan-focus-outline-reset-'))
  temporaryRoots.push(root)
  if (real)
    cpSync(join(ROOT, SKINS), join(root, SKINS), { recursive: true })
  else
    mkdirSync(join(root, SKINS), { recursive: true })
  if (css !== undefined)
    write(root, `${SKINS}/demo.css`, css)
  return root
}

function run(cwd) {
  return spawnSync(process.execPath, [GATE], { cwd, encoding: 'utf8' })
}

const LAYER = css => `@layer xihan.components {\n${css}\n}\n`

describe('check-focus-outline-reset.mjs', () => {
  it('当前仓库放行', () => {
    const result = run(createFixture({ real: true }))
    expect(result.status, String(result.stderr)).toBe(0)
    expect(result.stdout).toContain('通过')
  }, SPAWN_TIMEOUT)

  it('`:focus:not(:focus-visible)` 下的 outline 简写复位判红，报出文件与选择器', () => {
    const root = createFixture({
      css: LAYER(`
  [data-scope='demo'][data-part='item']:focus:not(:focus-visible) {
    outline: none;
  }`),
    })
    const result = run(root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('demo.css')
    expect(result.stderr).toContain(`[data-scope='demo'][data-part='item']:focus:not(:focus-visible)`)
    expect(result.stderr).toContain('currentColor')
  }, SPAWN_TIMEOUT)

  it('多分支选择器里只要有一支带该选择器、声明了 outline 分量就判红，空白差异不论', () => {
    const root = createFixture({
      css: LAYER(`
  [data-scope='demo'][data-part='link']:hover,
  [data-scope='demo'][data-part='link']:focus:not( :focus-visible ) {
    outline-color: transparent;
  }`),
    })
    const result = run(root)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('outline-color')
    expect(result.stderr).not.toContain(`[data-part='link']:hover`)
  }, SPAWN_TIMEOUT)

  it('同选择器下不碰 outline 的声明放行', () => {
    const root = createFixture({
      css: LAYER(`
  [data-scope='demo'][data-part='item']:focus:not(:focus-visible) {
    background: var(--xh-demo-item-bg-hover, var(--xh-bg-subtle));
  }`),
    })
    const result = run(root)
    expect(result.status, String(result.stderr)).toBe(0)
  }, SPAWN_TIMEOUT)
})
